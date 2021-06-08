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

module.exports = { prettyPrintBuffer }
