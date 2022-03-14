const { version } = require('../../package.json')

function isProd() {
  if (process.env.NODE_ENV === 'production') {
    return true
  }

  if (version.indexOf('development') === -1) {
    return true
  }

  return false
}

module.exports = isProd
