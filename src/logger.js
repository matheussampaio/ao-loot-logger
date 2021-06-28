const fs = require('fs')

const streams = []

process.once('SIGTERM', () => {
  for (const stream of streams) {
    stream.close()
  }
})

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
    }

    this.stream = fs.createWriteStream(this.logFileName, { flags: 'a' })

    streams.push(this.stream)
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
