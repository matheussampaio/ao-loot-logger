// Protocol 18 type codes
// Based on Photon Protocol 18 specification
// Reference: https://github.com/Triky313/AlbionOnline-StatisticsAnalysis

const DATA_TYPE = {
  // Core scalar types
  UNKNOWN: 0x00,
  BOOLEAN: 0x02,
  BYTE: 0x03,
  SHORT: 0x04,
  FLOAT: 0x05,
  DOUBLE: 0x06,
  STRING: 0x07,
  NIL: 0x08,

  // Variable-length integer types (ZigZag + VarInt encoded)
  COMPRESSED_INT: 0x09,
  COMPRESSED_LONG: 0x0a,

  // Fixed small integer types (1-2 bytes, no ZigZag)
  INT1: 0x0b,
  INT1_NEGATIVE: 0x0c,
  INT2: 0x0d,
  INT2_NEGATIVE: 0x0e,
  LONG1: 0x0f,
  LONG1_NEGATIVE: 0x10,
  LONG2: 0x11,
  LONG2_NEGATIVE: 0x12,

  // Custom type support
  CUSTOM: 0x13,

  // Complex container types
  DICTIONARY: 0x14,
  HASHTABLE: 0x15,
  OBJECT_ARRAY: 0x17,

  // Photon operation types
  OPERATION_REQUEST: 0x18,
  OPERATION_RESPONSE: 0x19,
  EVENT_DATA: 0x1a,

  // Zero-compressed scalar types (common values for bandwidth optimization)
  BOOLEAN_FALSE: 0x1b,
  BOOLEAN_TRUE: 0x1c,
  SHORT_ZERO: 0x1d,
  INT_ZERO: 0x1e,
  LONG_ZERO: 0x1f,
  FLOAT_ZERO: 0x20,
  DOUBLE_ZERO: 0x21,
  BYTE_ZERO: 0x22,

  // Array types (0x40+)
  ARRAY: 0x40,
  BOOLEAN_ARRAY: 0x42,
  BYTE_ARRAY: 0x43,
  SHORT_ARRAY: 0x44,
  FLOAT_ARRAY: 0x45,
  DOUBLE_ARRAY: 0x46,
  STRING_ARRAY: 0x47,
  COMPRESSED_INT_ARRAY: 0x49,
  COMPRESSED_LONG_ARRAY: 0x4a,
  CUSTOM_TYPE_ARRAY: 0x53,
  DICTIONARY_ARRAY: 0x54,
  HASHTABLE_ARRAY: 0x55,

  // Slim custom type range start (0x80 - 0xE4)
  // These encode typeCode inline: typeCode = slimCode - 0x80
  CUSTOM_TYPE_SLIM: 0x80,
}

module.exports = { DATA_TYPE }
