class BufferReader {
  constructor(buffer) {
    this.buffer = buffer;
    this.position = 0;
  }

  ReadUInt16() {
    const n = this.buffer.readUInt16LE(this.position);

    this.position += 2;

    return n;
  }

  ReadInt32() {
    const n = this.buffer.readInt32LE(this.position);

    this.position += 4;

    return n;
  }

  ReadInt32BE() {
    const n = this.buffer.readInt32BE(this.position);

    this.position += 4;

    return n;
  }

  ReadByte() {
    const n = this.buffer.readInt8(this.position);

    this.position += 1;

    return n;
  }

  ReadBytes(length) {
    const bytes = this.buffer.slice(this.position, this.position + length);

    this.position += length;

    return bytes;
  }

  toString() {
    const arr = [];

    for (let i = 0; i < this.buffer.length; i += 10) {
      const row = Array.from(this.buffer.slice(i, i + 10))
        .map((n) => n.toString(16).padStart(2, "0").toUpperCase())
        .join(" ");

      arr.push(row);
    }

    return arr.join("\n");
  }
}

module.exports = BufferReader;
