class BufferReader {
  constructor(buffer, debug) {
    this.buffer = buffer
    this.position = 0
    this.debug = debug
  }

  readInt8() {
    if (this.position < 0 || this.position > this.buffer.length - 1) {
      return -1
    }

    if (this.debug) {
      console.log(
        this.debug.join(''),
        this.buffer.slice(this.position, this.position + 1),
        'readInt8'
      )
    }

    const n = this.buffer.readInt8(this.position)

    this.position += 1

    return n
  }

  readUInt8() {
    if (this.position < 0 || this.position > this.buffer.length - 1) {
      return -1
    }

    if (this.debug) {
      console.log(
        this.debug.join(''),
        this.buffer.slice(this.position, this.position + 1),
        'readUInt8'
      )
    }

    const n = this.buffer.readUInt8(this.position)

    this.position += 1

    return n
  }

  readUInt16() {
    if (this.position < 0 || this.position > this.buffer.length - 2) {
      return -1
    }

    if (this.debug) {
      console.log(
        this.debug.join(''),
        this.buffer.slice(this.position, this.position + 2),
        'readUInt16'
      )
    }

    const n = this.buffer.readUInt16LE(this.position)

    this.position += 2

    return n
  }

  readUInt16BE() {
    if (this.position < 0 || this.position > this.buffer.length - 2) {
      return -1
    }

    if (this.debug) {
      console.log(
        this.debug.join(''),
        this.buffer.slice(this.position, this.position + 2),
        'readUInt16BE'
      )
    }

    const n = this.buffer.readUInt16BE(this.position)

    this.position += 2

    return n
  }

  readInt32() {
    if (this.position < 0 || this.position > this.buffer.length - 4) {
      return -1
    }

    if (this.debug) {
      console.log(
        this.debug.join(''),
        this.buffer.slice(this.position, this.position + 4),
        'readInt32'
      )
    }

    const n = this.buffer.readInt32LE(this.position)

    this.position += 4

    return n
  }

  readInt32BE() {
    if (this.position < 0 || this.position > this.buffer.length - 4) {
      return -1
    }

    if (this.debug) {
      console.log(
        this.debug.join(''),
        this.buffer.slice(this.position, this.position + 4),
        'readInt32BE'
      )
    }

    const n = this.buffer.readInt32BE(this.position)

    this.position += 4

    return n
  }

  readBigInt64BE() {
    if (this.position < 0 || this.position > this.buffer.length - 8) {
      return -1
    }

    if (this.debug) {
      console.log(
        this.debug.join(''),
        this.buffer.slice(this.position, this.position + 8),
        'readBigInt64BE'
      )
    }

    const n = this.buffer.readBigInt64BE(this.position)

    this.position += 8

    return n
  }

  readFloatBE() {
    if (this.position < 0 || this.position > this.buffer.length - 4) {
      return -1
    }

    if (this.debug) {
      console.log(
        this.debug.join(''),
        this.buffer.slice(this.position, this.position + 4),
        'readFloatBE'
      )
    }

    const n = this.buffer.readFloatBE(this.position)

    this.position += 4

    return n
  }

  readBytes(length) {
    if (this.debug) {
      console.log(
        this.debug.join(''),
        this.buffer.slice(this.position, this.position + length),
        'readBytes'
      )
    }

    const bytes = this.buffer.slice(this.position, this.position + length)

    this.position += length

    return bytes
  }

  slice(end) {
    return this.buffer.slice(this.position, end)
  }
}

module.exports = BufferReader
