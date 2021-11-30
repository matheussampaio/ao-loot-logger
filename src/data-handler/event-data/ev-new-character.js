const MemoryStorage = require('../../storage/memory-storage')
const Logger = require('../../utils/logger')

function EvNewCharacter(event) {
  const playerName = event.parameters[1]
  const guildName = event.parameters[8]
  const allianceName = event.parameters[43]

  if (typeof playerName !== 'string') {
    return Logger.warn('EvNewCharacter has invalid playerName parameter')
  }

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

  Logger.debug('EvNewCharacter', player)
}

module.exports = EvNewCharacter
