const MemoryStorage = require('../../storage/memory-storage')
const Logger = require('../../utils/logger')
const ParserError = require('../parser-error')

const EventId = 2

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

  MemoryStorage.players.self = player

  Logger.debug('onOpJoin', player)
}

function parse(event) {
  const playerName = event.parameters[2]

  if (typeof playerName !== 'string') {
    throw new ParserError('onOpJoin has invalid playerName parameter')
  }

  const guildName = event.parameters[51]
  const allianceName = event.parameters[70]

  return { allianceName, guildName, playerName }
}

module.exports = { EventId, handle, parse }
