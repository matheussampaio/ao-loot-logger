const BufferReader = require('../../utils/buffer-reader')
const { DATA_TYPE } = require('./data-type')
const { prettyPrintBuffer } = require('../../utils/binary')
const Logger = require('../../utils/logger')

class Protocol16 {
  static decodeOperationRequest(buffer, debug) {
    const br =
      buffer instanceof BufferReader ? buffer : new BufferReader(buffer, debug)

    const operationCode = br.readUInt8()
    const parameters = Protocol16.decodeParameterTable(br, debug)

    return { operationCode, parameters }
  }

  static decodeOperationResponse(buffer, debug) {
    const br =
      buffer instanceof BufferReader ? buffer : new BufferReader(buffer, debug)

    const operationCode = br.readUInt8()
    const returnCode = br.readUInt16BE()

    const paramType = br.readUInt8()
    const debugMessage = Protocol16.readParam(paramType, br)

    const parameters = Protocol16.decodeParameterTable(br, debug)

    return { operationCode, returnCode, debugMessage, parameters }
  }

  static decodeEventData(buffer, debug) {
    const br =
      buffer instanceof BufferReader ? buffer : new BufferReader(buffer, debug)

    const eventCode = br.readUInt8()
    const parameters = Protocol16.decodeParameterTable(br, debug)

    return { eventCode, parameters }
  }

  static decodeParameterTable(buffer, debug) {
    const br =
      buffer instanceof BufferReader ? buffer : new BufferReader(buffer, debug)

    const parameters = {}

    const parametersCount = br.readInt16BE()

    if (debug) debug.push('    ')

    for (let i = 0; i < parametersCount; i++) {
      if (debug) {
        Logger.debug(debug.join(''), `count: ${i}`)
      }

      const paramId = br.readUInt8()
      const paramType = br.readUInt8()

      if (debug) debug.push('    ')

      parameters[paramId] = Protocol16.readParam(paramType, br)

      if (debug) debug.pop()
    }

    return parameters
  }

  static readParam(paramType, br) {
    switch (paramType) {
      case 0:
      case DATA_TYPE.NIL:
        return null

      case DATA_TYPE.INT8:
        return br.readUInt8()

      case DATA_TYPE.FLOAT32:
        return br.readFloatBE()

      case DATA_TYPE.INT32:
        return br.readInt32BE()

      case 7:
      case DATA_TYPE.INT16:
        return br.readUInt16BE()

      case DATA_TYPE.INT64:
        return br.readBigInt64BE()

      case DATA_TYPE.STRING: {
        const length = br.readUInt16BE()

        return br.readBytes(length).toString()
      }

      case DATA_TYPE.BOOLEAN: {
        const value = br.readUInt8()

        if (value === 0) {
          return false
        }

        if (value === 1) {
          return true
        }

        throw new Error(`Invalid format for boolean: ${value}`)
      }

      case DATA_TYPE.INT8_SLICE: {
        const size = br.readUInt32BE()
        const arr = []

        for (let i = 0; i < size; i++) {
          arr.push(br.readUInt8())
        }

        return arr
      }

      case DATA_TYPE.SLICE: {
        const length = br.readUInt16BE()
        const sliceType = br.readUInt8()
        const arr = []

        for (let i = 0; i < length; i++) {
          arr.push(Protocol16.readParam(sliceType, br))
        }

        return arr
      }

      case DATA_TYPE.DICTIONARY: {
        const keyType = br.readUInt8()
        const valueType = br.readUInt8()
        const length = br.readUInt16BE()

        const dict = {}

        for (let i = 0; i < length; i++) {
          const key = Protocol16.readParam(keyType, br)
          const value = Protocol16.readParam(valueType, br)

          dict[key] = value
        }

        return dict
      }

      default:
        if (br.debug) {
          prettyPrintBuffer(br.readBytes())
        }

        throw new Error(
          `unknown paramType code. paramType=0x${paramType
            .toString(16)
            .toUpperCase()
            .padStart(2, 0)} position=${br.position - 1}`
        )
    }
  }
}

module.exports = Protocol16
