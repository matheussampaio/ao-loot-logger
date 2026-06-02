// Photon Protocol 18 Deserializer
// Upgraded from Protocol 16 for Albion Online v8.7.0+ compatibility
//
// Key differences from Protocol 16:
// - Variable-length integer encoding (VarInt + ZigZag for signed)
// - Little-endian byte order for float/double
// - 1-byte parameter table count (was 2 bytes)
// - Zero-compressed type codes for common values
// - Bit-packed boolean arrays
// - Custom type support (slim + full variants)
//
// Reference implementation:
// https://github.com/Triky313/AlbionOnline-StatisticsAnalysis

const BufferReader = require('../../utils/buffer-reader')
const { DATA_TYPE } = require('./data-type')
const { prettyPrintBuffer } = require('../../utils/binary')
const Logger = require('../../utils/logger')

// Slim custom type codes range from 0x80 to 0xE4 (228)
const MAX_SLIM_CUSTOM_TYPE_CODE = 228

class Protocol18 {
  // ============================================================
  // VarInt / ZigZag helpers
  // ============================================================

  // Reads a variable-length unsigned 32-bit integer
  // Each byte uses 7 bits for data, MSB as continuation flag
  static readCompressedUInt32(br) {
    let value = 0
    let shift = 0

    while (shift !== 35) {
      const current = br.readUInt8()
      value |= (current & 0x7F) << shift
      shift += 7

      if ((current & 0x80) === 0) {
        return value >>> 0
      }
    }

    return value >>> 0
  }

  // Reads a variable-length signed 32-bit integer
  // Uses ZigZag encoding: negative numbers are mapped to odd unsigned values
  static readCompressedInt32(br) {
    const encoded = Protocol18.readCompressedUInt32(br)
    // ZigZag decode: (n >>> 1) ^ -(n & 1)
    return (encoded >>> 1) ^ -(encoded & 1)
  }

  // Reads a variable-length unsigned 64-bit integer
  static readCompressedUInt64(br) {
    let value = 0n
    let shift = 0

    while (shift !== 70) {
      const current = BigInt(br.readUInt8())
      value |= (current & 0x7Fn) << BigInt(shift)
      shift += 7

      if ((current & 0x80n) === 0n) {
        return value
      }
    }

    return value
  }

  // Reads a variable-length signed 64-bit integer
  static readCompressedInt64(br) {
    const encoded = Protocol18.readCompressedUInt64(br)
    return Number((encoded >> 1n) ^ -(encoded & 1n))
  }

  // ============================================================
  // Scalar readers
  // ============================================================

  static readByte(br) {
    return br.readUInt8()
  }

  // Protocol 18 uses little-endian for short (2 bytes)
  static readShort(br) {
    const b0 = br.readUInt8()
    const b1 = br.readUInt8()
    return (b0 | (b1 << 8))
  }

  static readUShort(br) {
    const b0 = br.readUInt8()
    const b1 = br.readUInt8()
    return (b0 | (b1 << 8))
  }

  // Protocol 18 uses little-endian for float (4 bytes)
  static readFloat(br) {
    const bytes = br.readBytes(4)
    const buf = Buffer.from(bytes)
    return buf.readFloatLE(0)
  }

  // Protocol 18 uses little-endian for double (8 bytes)
  static readDouble(br) {
    const bytes = br.readBytes(8)
    const buf = Buffer.from(bytes)
    return buf.readDoubleLE(0)
  }

  // String length is VarInt encoded, not fixed 2 bytes
  static readString(br) {
    const length = Protocol18.readCompressedUInt32(br)
    if (length === 0) return ''

    const bytes = br.readBytes(length)
    return Buffer.from(bytes).toString('utf8')
  }

  // Byte array length is VarInt encoded
  static readByteArray(br) {
    const length = Protocol18.readCompressedUInt32(br)
    if (length === 0) return []

    return Array.from(br.readBytes(length))
  }

  // ============================================================
  // Array readers
  // ============================================================

  // Boolean arrays are bit-packed: 8 booleans per byte
  static readBooleanArray(br) {
    const length = Protocol18.readCompressedUInt32(br)
    const result = []
    const fullByteCount = Math.floor(length / 8)
    let index = 0

    // Read full bytes (8 booleans each)
    for (let i = 0; i < fullByteCount; i++) {
      const value = br.readUInt8()
      result.push((value & 1) === 1)
      result.push((value & 2) === 2)
      result.push((value & 4) === 4)
      result.push((value & 8) === 8)
      result.push((value & 16) === 16)
      result.push((value & 32) === 32)
      result.push((value & 64) === 64)
      result.push((value & 128) === 128)
      index += 8
    }

    // Read remaining booleans from partial byte
    if (index < length) {
      const value = br.readUInt8()
      const masks = [1, 2, 4, 8, 16, 32, 64, 128]
      let bitIndex = 0
      while (index < length) {
        result.push((value & masks[bitIndex]) === masks[bitIndex])
        bitIndex++
        index++
      }
    }

    return result
  }

  static readShortArray(br) {
    const length = Protocol18.readCompressedUInt32(br)
    const result = []
    for (let i = 0; i < length; i++) {
      result.push(Protocol18.readShort(br))
    }
    return result
  }

  // Float arrays are read as raw bytes then converted via Buffer
  static readFloatArray(br) {
    const length = Protocol18.readCompressedUInt32(br)
    const byteLength = length * 4
    const result = []
    if (byteLength === 0) return result

    const bytes = br.readBytes(byteLength)
    const buf = Buffer.from(bytes)
    for (let i = 0; i < length; i++) {
      result.push(buf.readFloatLE(i * 4))
    }
    return result
  }

  // Double arrays are read as raw bytes then converted via Buffer
  static readDoubleArray(br) {
    const length = Protocol18.readCompressedUInt32(br)
    const byteLength = length * 8
    const result = []
    if (byteLength === 0) return result

    const bytes = br.readBytes(byteLength)
    const buf = Buffer.from(bytes)
    for (let i = 0; i < length; i++) {
      result.push(buf.readDoubleLE(i * 8))
    }
    return result
  }

  static readStringArray(br) {
    const length = Protocol18.readCompressedUInt32(br)
    const result = []
    for (let i = 0; i < length; i++) {
      result.push(Protocol18.readString(br))
    }
    return result
  }

  static readCompressedIntArray(br) {
    const length = Protocol18.readCompressedUInt32(br)
    const result = []
    for (let i = 0; i < length; i++) {
      result.push(Protocol18.readCompressedInt32(br))
    }
    return result
  }

  static readCompressedLongArray(br) {
    const length = Protocol18.readCompressedUInt32(br)
    const result = []
    for (let i = 0; i < length; i++) {
      result.push(Protocol18.readCompressedInt64(br))
    }
    return result
  }

  static readObjectArray(br) {
    const length = Protocol18.readCompressedUInt32(br)
    const result = []
    for (let i = 0; i < length; i++) {
      result.push(Protocol18.readParam(br))
    }
    return result
  }

  // ============================================================
  // Complex types
  // ============================================================

  // Hashtable: key-value pairs with dynamic types
  static readHashtable(br) {
    const size = Protocol18.readCompressedUInt32(br)
    const result = {}

    for (let i = 0; i < size; i++) {
      const key = Protocol18.readParam(br)
      const value = Protocol18.readParam(br)
      if (key !== null) {
        result[key] = value
      }
    }

    return result
  }

  // Dictionary: key-value pairs with fixed types declared upfront
  static readDictionary(br) {
    const keyTypeCode = br.readUInt8()
    const valueTypeCode = br.readUInt8()
    const size = Protocol18.readCompressedUInt32(br)
    const result = {}

    for (let i = 0; i < size; i++) {
      // If type is UNKNOWN (0), read type byte dynamically
      const key = (keyTypeCode === DATA_TYPE.UNKNOWN)
        ? Protocol18.readParam(br)
        : Protocol18.readParamByType(keyTypeCode, br)
      const value = (valueTypeCode === DATA_TYPE.UNKNOWN)
        ? Protocol18.readParam(br)
        : Protocol18.readParamByType(valueTypeCode, br)

      if (key !== null) {
        result[key] = value
      }
    }

    return result
  }

  // Array of arrays: each element is itself an array
  static readArrayInArray(br) {
    const length = Protocol18.readCompressedUInt32(br)
    const result = []

    for (let i = 0; i < length; i++) {
      const value = Protocol18.readParam(br)
      if (Array.isArray(value)) {
        result.push(value)
      }
    }

    return result
  }

  // Custom type: typeCode + length-prefixed raw data
  static readCustomType(br, slimTypeCode = 0) {
    const typeCode = slimTypeCode === 0
      ? br.readUInt8()
      : (slimTypeCode - DATA_TYPE.CUSTOM_TYPE_SLIM)
    const length = Protocol18.readCompressedUInt32(br)
    const data = br.readBytes(length)

    return { typeCode, data: Array.from(data) }
  }

  // Array of custom types: shared typeCode, individual lengths
  static readCustomTypeArray(br) {
    const length = Protocol18.readCompressedUInt32(br)
    const typeCode = br.readUInt8()
    const result = []

    for (let i = 0; i < length; i++) {
      const len = Protocol18.readCompressedUInt32(br)
      const data = br.readBytes(len)
      result.push({ typeCode, data: Array.from(data) })
    }

    return result
  }

  // ============================================================
  // Main parameter dispatcher
  // ============================================================

  // Reads a parameter of a specific type code
  static readParamByType(paramType, br) {
    // Handle slim custom types (0x80 - 0xE4)
    // These encode the typeCode inline to save space
    if (paramType >= DATA_TYPE.CUSTOM_TYPE_SLIM && paramType <= MAX_SLIM_CUSTOM_TYPE_CODE) {
      return Protocol18.readCustomType(br, paramType)
    }

    switch (paramType) {
      case DATA_TYPE.NIL:
      case DATA_TYPE.UNKNOWN:
        return null

      case DATA_TYPE.BOOLEAN:
        return br.readUInt8() !== 0

      case DATA_TYPE.BOOLEAN_FALSE:
        return false

      case DATA_TYPE.BOOLEAN_TRUE:
        return true

      case DATA_TYPE.BYTE:
        return br.readUInt8()

      case DATA_TYPE.BYTE_ZERO:
        return 0

      case DATA_TYPE.SHORT:
        return Protocol18.readShort(br)

      case DATA_TYPE.SHORT_ZERO:
        return 0

      case DATA_TYPE.FLOAT:
        return Protocol18.readFloat(br)

      case DATA_TYPE.FLOAT_ZERO:
        return 0.0

      case DATA_TYPE.DOUBLE:
        return Protocol18.readDouble(br)

      case DATA_TYPE.DOUBLE_ZERO:
        return 0.0

      case DATA_TYPE.STRING:
        return Protocol18.readString(br)

      case DATA_TYPE.COMPRESSED_INT:
        return Protocol18.readCompressedInt32(br)

      case DATA_TYPE.INT1:
        return Protocol18.readByte(br)

      case DATA_TYPE.INT1_NEGATIVE:
        return -Protocol18.readByte(br)

      case DATA_TYPE.INT2:
        return Protocol18.readUShort(br)

      case DATA_TYPE.INT2_NEGATIVE:
        return -Protocol18.readUShort(br)

      case DATA_TYPE.INT_ZERO:
        return 0

      case DATA_TYPE.COMPRESSED_LONG:
        return Protocol18.readCompressedInt64(br)

      case DATA_TYPE.LONG1:
        return Protocol18.readByte(br)

      case DATA_TYPE.LONG1_NEGATIVE:
        return -Protocol18.readByte(br)

      case DATA_TYPE.LONG2:
        return Protocol18.readUShort(br)

      case DATA_TYPE.LONG2_NEGATIVE:
        return -Protocol18.readUShort(br)

      case DATA_TYPE.LONG_ZERO:
        return 0

      case DATA_TYPE.CUSTOM:
        return Protocol18.readCustomType(br)

      case DATA_TYPE.DICTIONARY:
        return Protocol18.readDictionary(br)

      case DATA_TYPE.HASHTABLE:
        return Protocol18.readHashtable(br)

      case DATA_TYPE.OBJECT_ARRAY:
        return Protocol18.readObjectArray(br)

      case DATA_TYPE.OPERATION_REQUEST:
        return Protocol18.decodeOperationRequest(br)

      case DATA_TYPE.OPERATION_RESPONSE:
        return Protocol18.decodeOperationResponse(br)

      case DATA_TYPE.EVENT_DATA:
        return Protocol18.decodeEventData(br)

      case DATA_TYPE.ARRAY:
        return Protocol18.readArrayInArray(br)

      case DATA_TYPE.BOOLEAN_ARRAY:
        return Protocol18.readBooleanArray(br)

      case DATA_TYPE.BYTE_ARRAY:
        return Protocol18.readByteArray(br)

      case DATA_TYPE.SHORT_ARRAY:
        return Protocol18.readShortArray(br)

      case DATA_TYPE.FLOAT_ARRAY:
        return Protocol18.readFloatArray(br)

      case DATA_TYPE.DOUBLE_ARRAY:
        return Protocol18.readDoubleArray(br)

      case DATA_TYPE.STRING_ARRAY:
        return Protocol18.readStringArray(br)

      case DATA_TYPE.COMPRESSED_INT_ARRAY:
        return Protocol18.readCompressedIntArray(br)

      case DATA_TYPE.COMPRESSED_LONG_ARRAY:
        return Protocol18.readCompressedLongArray(br)

      case DATA_TYPE.CUSTOM_TYPE_ARRAY:
        return Protocol18.readCustomTypeArray(br)

      case DATA_TYPE.DICTIONARY_ARRAY:
        // Simplified: full implementation needs nested dictionary type parsing
        return Protocol18.readObjectArray(br)

      case DATA_TYPE.HASHTABLE_ARRAY:
        return Protocol18.readObjectArray(br)

      default:
        if (br.debug) {
          prettyPrintBuffer(br.readBytes())
        }
        throw new Error(
          `unknown paramType code. paramType=0x${paramType
            .toString(16)
            .toUpperCase()
            .padStart(2, '0')} position=${br.position - 1}`
        )
    }
  }

  // Reads a parameter with dynamic type (type byte precedes value)
  static readParam(br) {
    const paramType = br.readUInt8()
    return Protocol18.readParamByType(paramType, br)
  }

  // ============================================================
  // Packet decoders (public API)
  // ============================================================

  // Decodes an operation request packet
  static decodeOperationRequest(buffer, debug) {
    const br = buffer instanceof BufferReader ? buffer : new BufferReader(buffer, debug)

    const operationCode = br.readUInt8()
    const parameters = Protocol18.decodeParameterTable(br, debug)

    return { operationCode, parameters }
  }

  // Decodes an operation response packet
  static decodeOperationResponse(buffer, debug) {
    const br = buffer instanceof BufferReader ? buffer : new BufferReader(buffer, debug)

    const operationCode = br.readUInt8()
    const returnCode = Protocol18.readShort(br)

    const paramType = br.readUInt8()
    const debugMessage = Protocol18.readParamByType(paramType, br)

    const parameters = Protocol18.decodeParameterTable(br, debug)

    return { operationCode, returnCode, debugMessage, parameters }
  }

  // Decodes an event data packet
  static decodeEventData(buffer, debug) {
    const br = buffer instanceof BufferReader ? buffer : new BufferReader(buffer, debug)

    const eventCode = br.readUInt8()
    const parameters = Protocol18.decodeParameterTable(br, debug)

    return { eventCode, parameters }
  }

  // Decodes a parameter table (used by operation and event packets)
  // Protocol 18: count is 1 byte (Protocol 16 used 2 bytes)
  static decodeParameterTable(buffer, debug) {
    const br = buffer instanceof BufferReader ? buffer : new BufferReader(buffer, debug)

    const parameters = {}

    // Protocol 18: parameter count is a single byte
    const parametersCount = br.readUInt8()

    if (debug) debug.push('    ')

    for (let i = 0; i < parametersCount; i++) {
      if (debug) {
        Logger.debug(debug.join(''), `count: ${i}`)
      }

      const paramId = br.readUInt8()
      const paramType = br.readUInt8()

      if (debug) debug.push('    ')

      parameters[paramId] = Protocol18.readParamByType(paramType, br)

      if (debug) debug.pop()
    }

    return parameters
  }
}

module.exports = Protocol18
