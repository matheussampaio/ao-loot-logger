const fs = require('fs')

class Logger {
  constructor(overrideFilename) {
    this.stream = null
    this.logFileName = null

    this.overrideFilename = overrideFilename

    this.createNewLogFileName()
  }

  init() {
    if (this.stream != null) {
      this.stream.close()

      process.removeListener('SIGTERM', this.close)
    }

    this.stream = fs.createWriteStream(this.logFileName, { flags: 'a' })

    process.once('SIGTERM', () => {
      this.close()
    })
  }

  createNewLogFileName() {
    const d = new Date()

    this.logFileName =
      this.overrideFilename ||
      `log-${d.getUTCDay()}-${d.getUTCMonth()}-${d.getUTCFullYear()}-${d.getUTCHours()}-${d.getUTCMinutes()}-${d.getUTCSeconds()}.txt`
  }

  log(line) {
    if (this.stream == null) {
      this.init()
    }

    this.stream.write(line + '\n')
  }

  close() {
    if (this.stream != null) {
      this.stream.close()
    }

    this.stream = null
  }
}

module.exports = Logger
