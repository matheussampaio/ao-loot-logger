function prettyPrintBuffer(buffer, { sep = ' ', col = Infinity } = {}) {
  const arr = []

  for (let i = 0; i < buffer.length; i += col) {
    const row = Array.from(buffer.slice(i, i + col))
      .map((n) => n.toString(16).padStart(2, '0').toUpperCase())
      .join(sep)

    arr.push(row)
  }

  return arr.join('\n')
}

function hexStrToBuffer(str) {
  return Buffer.from(
    str
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .map((e) => parseInt(e, 16))
  )
}

function strToBuffer(str) {
  return Buffer.from(str)
}

function bufferToStr(buf) {
  return buf.toString()
}

function hexToInt(str) {
  return parseInt(str, 16)
}

function green(text) {
  return `\x1b[32m${text}\x1b[0m`
}

function gray(text) {
  return `\x1b[90m${text}\x1b[0m`
}

function red(text) {
  return `\x1b[31m${text}\x1b[0m`
}

/**
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 */
const byteToHex = []

for (let i = 0; i < 256; ++i) {
  byteToHex.push((i + 0x100).toString(16).substr(1))
}

function uuidStringify(arr, offset = 0) {
  // Note: Be careful editing this code!  It's been tuned for performance
  // and works in ways you may not expect. See https://github.com/uuidjs/uuid/pull/434
  const uuid = (
    byteToHex[arr[offset + 0]] +
    byteToHex[arr[offset + 1]] +
    byteToHex[arr[offset + 2]] +
    byteToHex[arr[offset + 3]] +
    '-' +
    byteToHex[arr[offset + 4]] +
    byteToHex[arr[offset + 5]] +
    '-' +
    byteToHex[arr[offset + 6]] +
    byteToHex[arr[offset + 7]] +
    '-' +
    byteToHex[arr[offset + 8]] +
    byteToHex[arr[offset + 9]] +
    '-' +
    byteToHex[arr[offset + 10]] +
    byteToHex[arr[offset + 11]] +
    byteToHex[arr[offset + 12]] +
    byteToHex[arr[offset + 13]] +
    byteToHex[arr[offset + 14]] +
    byteToHex[arr[offset + 15]]
  ).toLowerCase()

  return uuid
}

module.exports = {
  bufferToStr,
  green,
  hexStrToBuffer,
  hexToInt,
  prettyPrintBuffer,
  strToBuffer,
  uuidStringify,
  gray,
  red
}
