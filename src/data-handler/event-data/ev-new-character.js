const MemoryStorage = require('../../storage/memory-storage')
const Logger = require('../../utils/logger')
const ParserError = require('../parser-error')

const name = 'EvNewCharacter'

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

  Logger.debug('EvNewCharacter', player, event.parameters)
}

function parse(event) {
  const playerName = event.parameters[1]

  if (typeof playerName !== 'string') {
    throw new ParserError('EvNewCharacter has invalid playerName parameter', event)
  }

  const guildName = event.parameters[8]
  const allianceName = event.parameters[51]

  return { allianceName, guildName, playerName }
}

module.exports = { name, handle, parse }
