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

  async init({ eventsOverride, configsOverrride } = {}) {
    return Promise.all([
      this.loadEvents(eventsOverride),
      this.loadConfigs(configsOverrride)
    ])
  }

  async loadEvents(eventsOverride) {
    if (eventsOverride) {
      return (this.events = eventsOverride)
    }

    const response = await axios.get(
      'https://matheus.sampaio.us/ao-loot-logger-configs/events-v8.0.0.json'
    )

    this.events = response.data
  }

  async loadConfigs(configsOverrride) {
    if (configsOverrride) {
      return (this.players = configsOverrride)
    }

    const response = await axios.get(
      'https://matheus.sampaio.us/ao-loot-logger-configs/configs.txt'
    )

    const lines = response.data.split('\n')

    for (const line of lines) {
      this.players[line] = true
    }
  }
}

module.exports = new Config()
