const ContainersStorage = require('./containers-storage')
const LootsStorage = require('./loots-storage')
const PlayersStorage = require('./players-storage')

class MemoryStorage {
  constructor() {
    this.containers = new ContainersStorage()
    this.loots = new LootsStorage()
    this.players = new PlayersStorage()
  }
}

module.exports = new MemoryStorage()
