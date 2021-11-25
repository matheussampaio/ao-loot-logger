const BufferReader = require('./buffer-reader')
const logger = require('./logger')
const { prettyPrintBuffer } = require('./utils')

function onEventParser(buffer, cb) {
  const br = new BufferReader(buffer)

  br.position += 3

  const commandCount = br.readUInt8()

  br.position += 8

  const commandHeaderLength = 12
  const signifierByteLength = 1

  for (let i = 0; i < commandCount; i++) {
    const commandType = br.readUInt8()

    br.position += 3

    let commandLength = br.readInt32BE()

    br.position += 4

    if (commandType === 4) {
      continue
    } else if (commandType === 5) {
      br.position += commandLength - commandHeaderLength
      continue
    } else if (commandType === 6) {
    } else if (commandType === 7) {
      br.position += 4
      commandLength -= 4
    } else {
      br.position += commandLength - commandHeaderLength
      continue
    }

    br.position += signifierByteLength

    const messageType = br.readUInt8()

    const operationLength = commandLength - commandHeaderLength - 2
    const payload = br.readBytes(operationLength)

    if (messageType === 2) {
    } else if (messageType === 3) {
    } else if (messageType === 4) {
      let event = null

      try {
        event = parseEvent(new BufferReader(payload))

        if (event?.code === 1) {
          cb(event)
        }
      } catch (error) {
        logger.warn(`Can't parse packet: ${prettyPrintBuffer(payload)}`, error)
      }
    } else {
      br.position += operationLength
    }
  }
}

function parseEvent(br) {
  const code = br.readUInt8()

  const size = br.readUInt16BE()

  const parameters = {}

  if (br.debug) br.debug.push('    ')

  for (let i = 0; i < size; i++) {
    const key = br.readUInt8()
    const op = br.readUInt8()

    if (br.debug) br.debug.push('    ')
    parameters[key] = readParamFromBuffer(op, br)
    if (br.debug) br.debug.pop()
  }

  return { code, size, parameters }
}

function readParamFromBuffer(op, br) {
  // process an dict
  if (op === 0x44) {
    const op1 = br.readUInt8()
    const op2 = br.readUInt8()
    const size = br.readUInt16BE()
    const dict = {}

    for (let i = 0; i < size; i++) {
      dict[readParamFromBuffer(op1, br)] = readParamFromBuffer(op2, br)
    }

    return dict
  }

  // reads a 8b integer
  if (op === 0x62 || op === 0x6f) {
    return br.readUInt8()
  }

  // read float
  if (op === 0x66) {
    return br.readFloatBE()
  }

  // reads a 32b integer
  if (op === 0x69) {
    return br.readInt32BE()
  }

  // reads a 16b integer
  if (op === 0x6b) {
    return br.readUInt16BE()
  }

  // read 64b int (big int)
  if (op === 0x6c) {
    return br.readBigInt64BE()
  }

  // read an 16b interger N, then a string with length N
  if (op === 0x73) {
    const size = br.readUInt16BE()

    return br.readBytes(size).toString()
  }

  // read an 32b interger N, then an array of N int8
  if (op === 0x78) {
    const size = br.readInt32BE()
    const arr = []

    for (let i = 0; i < size; i++) {
      arr.push(br.readUInt8())
    }

    return arr
  }

  // an array of dynamic data
  if (op === 0x79) {
    const size = br.readUInt16BE()
    const secondOp = br.readUInt8()
    const arr = []

    for (let i = 0; i < size; i++) {
      arr.push(readParamFromBuffer(secondOp, br))
    }

    return arr
  }

  throw new Error(
    `unknown op code. op=0x${op
      .toString(16)
      .toUpperCase()
      .padStart(2, 0)} position=${br.position - 1}`
  )
}

module.exports = { onEventParser, parseEvent }
