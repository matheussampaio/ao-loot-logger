class CrcCalculator {
  static calculate(buffer, length) {
    let result = Number.MAX_SAFE_INTEGER
    let key = 3988292384

    for (let i = 0; i < length; i++) {
      result ^= buffer[i]

      for (let j = 0; j < 8; j++) {
        if ((result & 1) > 0) {
          result = (result >> 1) ^ key
        } else {
          result >>= 1
        }
      }
    }

    return result
  }
}

module.exports = CrcCalculator
