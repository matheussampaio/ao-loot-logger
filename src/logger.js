const fs = require('fs')
const path = require('path')

class Logger {
  constructor(filename) {
    this.stream = null

    this.filename = filename
  }

  init() {
    if (this.stream != null) {
      this.stream.close()

      process.removeListener('SIGTERM', this.close)
    }

    const d = new Date()

    this.logFileName =
      this.filename ||
      `log-${d.getUTCDay()}-${d.getUTCMonth()}-${d.getUTCFullYear()}-${d.getUTCHours()}-${d.getUTCMinutes()}-${d.getUTCSeconds()}.txt`

    this.stream = fs.createWriteStream(this.logFileName, { flags: 'a' })

    process.once('SIGTERM', () => {
      this.close()
    })

    console.info(
      'Logs will be saved to',
      path.join(process.cwd(), this.logFileName)
    )
  }

  log(line) {
    if (this.stream == null) {
      this.init()
    }

    this.stream.write(line + '\n')
  }

  close() {
    this.stream.close()
  }
}

module.exports = Logger
