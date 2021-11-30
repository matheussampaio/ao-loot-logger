class PlayersStorage {
  constructor() {
    this.players = {}

    this.self = null
  }

  add({ playerName, guildName, allianceName }) {
    this.players[playerName] = { playerName, guildName, allianceName }

    return this.players[playerName]
  }

  getByName(playerName) {
    return this.players[playerName]
  }
}

module.exports = PlayersStorage
