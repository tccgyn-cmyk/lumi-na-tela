const { spawn } = require('child_process');

// Sonda de tela cheia (win32): um único processo PowerShell persistente que
// compila o P/Invoke UMA vez e responde a cada linha "check" no stdin.
// Janela MAXIMIZADA (IsZoomed) não conta como tela cheia — só janelas
// borderless cobrindo o monitor (apresentação, vídeo em fullscreen).
// Qualquer falha responde false (fail-open): o Lumi segue funcionando.
const PS_SCRIPT = `
$ErrorActionPreference = 'Stop'
try {
Add-Type @"
using System;using System.Runtime.InteropServices;
public class FG {
  [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h, out RECT r);
  [DllImport("user32.dll")] public static extern IntPtr MonitorFromWindow(IntPtr h, uint f);
  [DllImport("user32.dll")] public static extern bool GetMonitorInfo(IntPtr m, ref MONITORINFO mi);
  [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr h, out uint pid);
  [DllImport("user32.dll")] public static extern bool IsZoomed(IntPtr h);
  [StructLayout(LayoutKind.Sequential)] public struct RECT { public int L; public int T; public int R; public int B; }
  [StructLayout(LayoutKind.Sequential)] public struct MONITORINFO { public int cb; public RECT rcMonitor; public RECT rcWork; public uint flags; }
}
"@
} catch { [Console]::Out.WriteLine('ERR'); exit 1 }
while ($true) {
  $line = [Console]::In.ReadLine()
  if ($null -eq $line) { break }
  try {
    $h = [FG]::GetForegroundWindow()
    $r = New-Object FG+RECT
    [FG]::GetWindowRect($h, [ref]$r) | Out-Null
    $m = [FG]::MonitorFromWindow($h, 2)
    $mi = New-Object FG+MONITORINFO
    $mi.cb = [System.Runtime.InteropServices.Marshal]::SizeOf($mi)
    [FG]::GetMonitorInfo($m, [ref]$mi) | Out-Null
    $wpid = 0
    [FG]::GetWindowThreadProcessId($h, [ref]$wpid) | Out-Null
    $zoomed = [FG]::IsZoomed($h)
    $full = (-not $zoomed) -and ($r.L -le $mi.rcMonitor.L) -and ($r.T -le $mi.rcMonitor.T) -and ($r.R -ge $mi.rcMonitor.R) -and ($r.B -ge $mi.rcMonitor.B)
    [Console]::Out.WriteLine("$full $wpid")
  } catch {
    [Console]::Out.WriteLine('False 0')
  }
}
`;

let proc = null;
let pendente = null; // callback aguardando resposta
let buffer = '';
let timer = null;

function derrubarSonda() {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  if (proc) {
    try {
      proc.kill();
    } catch (_err) {
      /* já morto */
    }
    proc = null;
  }
  if (pendente) {
    const cb = pendente;
    pendente = null;
    cb(false);
  }
}

function garantirSonda() {
  if (proc) return true;
  try {
    proc = spawn('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', PS_SCRIPT], {
      windowsHide: true,
      stdio: ['pipe', 'pipe', 'ignore'],
    });
  } catch (_err) {
    proc = null;
    return false;
  }
  buffer = '';
  proc.stdout.on('data', (d) => {
    buffer += String(d);
    let i;
    while ((i = buffer.indexOf('\n')) >= 0) {
      const linha = buffer.slice(0, i).trim();
      buffer = buffer.slice(i + 1);
      if (linha === 'ERR') {
        derrubarSonda();
        return;
      }
      if (pendente) {
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
        const cb = pendente;
        pendente = null;
        const [full, wpid] = linha.split(/\s+/);
        cb(full === 'True' && Number(wpid) !== process.pid);
      }
    }
  });
  proc.on('error', derrubarSonda);
  proc.on('exit', () => {
    proc = null;
    if (pendente) {
      const cb = pendente;
      pendente = null;
      cb(false);
    }
  });
  return true;
}

function checarTelaCheia(cb) {
  if (process.platform !== 'win32') {
    cb(false);
    return;
  }
  if (pendente || !garantirSonda() || !proc || !proc.stdin.writable) {
    cb(false);
    return;
  }
  pendente = cb;
  timer = setTimeout(() => {
    // Sonda travada: derruba e falha aberto; próxima checagem recria
    derrubarSonda();
  }, 5000);
  try {
    proc.stdin.write('check\n');
  } catch (_err) {
    derrubarSonda();
  }
}

module.exports = { checarTelaCheia };
