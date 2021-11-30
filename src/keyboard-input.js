const { EventEmitter } = require('events')

class KeyboardInput extends EventEmitter {
  constructor() {
    super()

    this.minTimeBetweenPress = 2000
    this.block = false

    this.onKeyPressed = (key) => {
      if (this.block) {
        return
      }

      this.block = true

      setTimeout(() => (this.block = false), this.minTimeBetweenPress)

      this.emit('key-pressed', key)
    }
  }

  init() {
    // when running with nodemon, process.stdin.setRawMode will be null
    if (process.stdin.setRawMode == null) {
      return
    }

    process.stdin.setRawMode(true)

    process.stdin.resume()

    process.stdin.setEncoding('utf8')

    process.stdin.on('data', this.onKeyPressed)

    process.on('exit', () => {
      process.stdin.removeListener('data', this.onKeyPressed)
    })
  }
}

module.exports = new KeyboardInput()
