const DATA_TYPE = {
  NIL: 0x2a,
  DICTIONARY: 0x44,
  STRING_SLICE: 0x61,
  INT8: 0x62,
  CUSTOM: 0x63,
  DOUBLE: 0x64,
  EVENT_DATE: 0x65,
  FLOAT32: 0x66,
  HASHTABLE: 0x68,
  INT32: 0x69,
  INT16: 0x6b,
  INT64: 0x6c,
  INT32_SLICE: 0x6e,
  BOOLEAN: 0x6f,
  OPERATION_RESPONSE: 0x70,
  OPERATION_REQUEST: 0x71,
  STRING: 0x73,
  INT8_SLICE: 0x78,
  SLICE: 0x79,
  OBJECT_SLICE: 0x7a
}

module.exports = { DATA_TYPE }