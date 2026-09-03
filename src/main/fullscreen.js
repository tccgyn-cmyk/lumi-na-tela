const { execFile } = require('child_process');

// Detecta se a janela em primeiro plano do SISTEMA está em tela cheia
// (apresentação, vídeo, teleconsulta maximizada). Windows-only por enquanto;
// em outras plataformas responde sempre false. Em qualquer erro, false.
const PS_SCRIPT = `
Add-Type @"
using System;using System.Runtime.InteropServices;
public class FG {
  [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h, out RECT r);
  [DllImport("user32.dll")] public static extern IntPtr MonitorFromWindow(IntPtr h, uint f);
  [DllImport("user32.dll")] public static extern bool GetMonitorInfo(IntPtr m, ref MONITORINFO mi);
  [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr h, out uint pid);
  [StructLayout(LayoutKind.Sequential)] public struct RECT { public int L; public int T; public int R; public int B; }
  [StructLayout(LayoutKind.Sequential)] public struct MONITORINFO { public int cb; public RECT rcMonitor; public RECT rcWork; public uint flags; }
}
"@
$h = [FG]::GetForegroundWindow()
$r = New-Object FG+RECT
[FG]::GetWindowRect($h, [ref]$r) | Out-Null
$m = [FG]::MonitorFromWindow($h, 2)
$mi = New-Object FG+MONITORINFO
$mi.cb = [System.Runtime.InteropServices.Marshal]::SizeOf($mi)
[FG]::GetMonitorInfo($m, [ref]$mi) | Out-Null
$wpid = 0
[FG]::GetWindowThreadProcessId($h, [ref]$wpid) | Out-Null
$full = ($r.L -le $mi.rcMonitor.L) -and ($r.T -le $mi.rcMonitor.T) -and ($r.R -ge $mi.rcMonitor.R) -and ($r.B -ge $mi.rcMonitor.B)
Write-Output "$full $wpid"
`;

function checarTelaCheia(cb) {
  if (process.platform !== 'win32') {
    cb(false);
    return;
  }
  execFile(
    'powershell.exe',
    ['-NoProfile', '-NonInteractive', '-Command', PS_SCRIPT],
    { timeout: 8000, windowsHide: true },
    (err, stdout) => {
      if (err) {
        cb(false);
        return;
      }
      const [full, wpid] = String(stdout).trim().split(/\s+/);
      // Nossa própria janela em primeiro plano não conta como tela cheia
      cb(full === 'True' && Number(wpid) !== process.pid);
    }
  );
}

module.exports = { checarTelaCheia };
