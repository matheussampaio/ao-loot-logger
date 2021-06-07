const { prettyPrintBuffer } = require("./utils");

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
    return prettyPrintBuffer(this.buffer);
  }
}

module.exports = BufferReader;
