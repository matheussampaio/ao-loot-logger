const MemoryStorage = require('../../storage/memory-storage')
const Logger = require('../../utils/logger')
const ParserError = require('../parser-error')

const name = 'EvCharacterStats'

function handle(event) {
  const { allianceName, guildName, playerName } = parse(event)

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

  Logger.debug('EvCharacterStats', player, event.parameters)
}

function parse(event) {
  const playerName = event.parameters[1]
  const guildName = event.parameters[2]
  const allianceName = event.parameters[4]

  if (typeof playerName !== 'string') {
    throw new ParserError('EvCharacterStats has invalid playerName parameter')
  }

  if (guildName != null && typeof guildName !== 'string') {
    throw new ParserError('EvCharacterStats has invalid guildName parameter')
  }

  if (allianceName != null && typeof allianceName !== 'string') {
    throw new ParserError('EvCharacterStats has invalid allianceName parameter')
  }

  const profileDescription = event.parameters[5]

  if (profileDescription != null && typeof profileDescription !== 'string') {
    throw new ParserError('EvCharacterStats has invalid profileDescription parameter')
  }

  return { allianceName, guildName, playerName }
}

module.exports = { name, handle, parse }
