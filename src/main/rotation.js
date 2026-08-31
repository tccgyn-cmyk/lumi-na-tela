class Rotation {
  constructor(types) {
    this.types = types;
    this.i = 0;
  }

  next() {
    const t = this.types[this.i % this.types.length];
    this.i += 1;
    return t;
  }
}

module.exports = { Rotation };
