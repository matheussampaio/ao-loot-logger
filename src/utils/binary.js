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

module.exports = {
  prettyPrintBuffer,
  hexStrToBuffer,
  strToBuffer,
  bufferToStr,
  hexToInt
}
