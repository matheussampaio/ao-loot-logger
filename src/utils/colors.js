function green(text) {
  return `\x1b[32m${text}\x1b[0m`
}

function gray(text) {
  return `\x1b[90m${text}\x1b[0m`
}

function red(text) {
  return `\x1b[31m${text}\x1b[0m`
}

function cyan(text) {
  return `\x1b[96m${text}\x1b[0m`
}

function yellow(text) {
  return `\x1b[33m${text}\x1b[0m`
}

module.exports = {
  green,
  gray,
  red,
  cyan,
  yellow
}
