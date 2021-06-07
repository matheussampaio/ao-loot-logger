class BufferReader {
  constructor(buffer) {
    this.buffer = buffer
    this.position = 0
  }

  readUInt8() {
    const n = this.buffer.readUInt8(this.position)

    this.position += 1

    return n
  }

  readUInt16() {
    const n = this.buffer.readUInt16LE(this.position)

    this.position += 2

    return n
  }

  readUInt16BE() {
    const n = this.buffer.readUInt16BE(this.position)

    this.position += 2

    return n
  }

  readInt32() {
    const n = this.buffer.readInt32LE(this.position)

    this.position += 4

    return n
  }

  readInt32BE() {
    const n = this.buffer.readInt32BE(this.position)

    this.position += 4

    return n
  }

  readInt8() {
    const n = this.buffer.readInt8(this.position)

    this.position += 1

    return n
  }

  readBytes(length) {
    const bytes = this.buffer.slice(this.position, this.position + length)

    this.position += length

    return bytes
  }
}

module.exports = BufferReader
