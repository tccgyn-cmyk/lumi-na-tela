class Rotation {
  constructor(types) {
    if (!Array.isArray(types) || types.length === 0) {
      throw new TypeError('Rotation exige uma lista não vazia de tipos');
    }
    this.types = types;
    this.i = 0;
  }

  next() {
    const t = this.types[this.i];
    this.i = (this.i + 1) % this.types.length;
    return t;
  }
}

module.exports = { Rotation };
