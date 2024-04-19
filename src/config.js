const axios = require('axios')

const { version } = require('../package.json')

class Config {
  constructor() {
    this.events = {}
    this.players = {}

    this.ROTATE_LOGGER_FILE_KEY = 'd'
    this.RESTART_NETWORK_FILE_KEY = 'r'
    this.TITLE = `AO Loot Logger - v${version}`
  }

  async init() {
    return Promise.all([
      axios
        .get('https://matheus.sampaio.us/ao-loot-logger-configs/events-v4.json')
        .then((response) => {
          this.events = response.data
        }),
      axios
        .get('https://matheus.sampaio.us/ao-loot-logger-configs/configs.txt')
        .then((response) => {
          const lines = response.data.split('\n')

          for (const line of lines) {
            this.players[line] = true
          }
        })
    ])
  }
}

module.exports = new Config()
