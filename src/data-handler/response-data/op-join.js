const MemoryStorage = require('../../storage/memory-storage')
const Logger = require('../../utils/logger')

function OpJoin(event) {
  const playerName = event.parameters[2]

  if (typeof playerName !== 'string') {
    return Logger.warn('onOpJoin has invalid playerName parameter')
  }

  const guildName = event.parameters[51]
  const allianceName = event.parameters[70]

  let player = MemoryStorage.players.getByName(playerName)

  if (player == null) {
    player = MemoryStorage.players.add({ playerName, guildName, allianceName })
  }

  if (player.guildName !== guildName) {
    player.guildName = guildName
  }

  if (player.allianceName !== allianceName) {
    player.allianceName = allianceName
  }

  MemoryStorage.players.self = player

  Logger.debug('onOpJoin', player)
}

module.exports = OpJoin
