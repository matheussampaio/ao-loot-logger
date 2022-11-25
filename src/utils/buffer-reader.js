const Logger = require('./logger')

class BufferReader {
  constructor(buffer, debug) {
    this.buffer = buffer
    this.position = 0
    this.debug = debug
  }

  get length() {
    return this.buffer.length
  }

  readInt8() {
    if (this.position < 0 || this.position > this.buffer.length - 1) {
      throw new Error('outofboundread')
    }

    if (this.debug) {
      Logger.debug(
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
      throw new Error('outofboundread')
    }

    if (this.debug) {
      Logger.debug(
        this.debug.join(''),
        this.buffer.slice(this.position, this.position + 1),
        'readUInt8'
      )
    }

    const n = this.buffer.readUInt8(this.position)

    this.position += 1

    return n
  }

  readInt16BE() {
    if (this.position < 0 || this.position > this.buffer.length - 2) {
      throw new Error('outofboundread')
    }

    if (this.debug) {
      Logger.debug(
        this.debug.join(''),
        this.buffer.slice(this.position, this.position + 2),
        'readInt16BE'
      )
    }

    const n = this.buffer.readInt16BE(this.position)

    this.position += 2

    return n
  }

  readUInt16BE() {
    if (this.position < 0 || this.position > this.buffer.length - 2) {
      throw new Error('outofboundread')
    }

    if (this.debug) {
      Logger.debug(
        this.debug.join(''),
        this.buffer.slice(this.position, this.position + 2),
        'readUInt16BE'
      )
    }

    const n = this.buffer.readUInt16BE(this.position)

    this.position += 2

    return n
  }

  readInt32BE() {
    if (this.position < 0 || this.position > this.buffer.length - 4) {
      throw new Error('outofboundread')
    }

    if (this.debug) {
      Logger.debug(
        this.debug.join(''),
        this.buffer.slice(this.position, this.position + 4),
        'readInt32BE'
      )
    }

    const n = this.buffer.readInt32BE(this.position)

    this.position += 4

    return n
  }

  readUInt32BE() {
    if (this.position < 0 || this.position > this.buffer.length - 4) {
      throw new Error('outofboundread')
    }

    if (this.debug) {
      Logger.debug(
        this.debug.join(''),
        this.buffer.slice(this.position, this.position + 4),
        'readUInt32BE'
      )
    }

    const n = this.buffer.readUInt32BE(this.position)

    this.position += 4

    return n
  }

  readBigInt64BE() {
    if (this.position < 0 || this.position > this.buffer.length - 8) {
      throw new Error('outofboundread')
    }

    if (this.debug) {
      Logger.debug(
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
      throw new Error('outofboundread')
    }

    if (this.debug) {
      Logger.debug(
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
    if (length == null) {
      length = this.buffer.length - this.position
    }

    if (this.debug) {
      Logger.debug(
        this.debug.join(''),
        this.buffer.slice(this.position, this.position + length),
        'readBytes',
        length
      )
    }

    const bytes = this.buffer.slice(this.position, this.position + length)

    this.position += length

    return bytes
  }

  slice(end) {
    return this.buffer.slice(this.position, end ?? this.buffer.length)
  }
}

module.exports = BufferReader
