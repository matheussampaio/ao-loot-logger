const MemoryStorage = require('../../storage/memory-storage')
const LootLogger = require('../../loot-logger')
const Items = require('../../items')
const ParserError = require('../parser-error')
const Logger = require('../../utils/logger')

const name = 'EvOtherGrabbedLoot'

function handle(event) {
  const { isSilver, lootedFrom, lootedBy, itemNumId, quantity } = parse(event)

  Logger.debug('EvOtherGrabbedLoot', {
    isSilver,
    lootedFrom,
    lootedBy,
    itemNumId,
    quantity
  })

  if (isSilver) {
    return
  }

  const { itemId, itemName } = Items.get(itemNumId)

  const date = new Date()

  LootLogger.write({
    date,
    itemId,
    quantity,
    itemName,
    lootedBy:
      MemoryStorage.players.getByName(lootedBy) ??
      MemoryStorage.players.add({ playerName: lootedBy }),
    lootedFrom:
      MemoryStorage.players.getByName(lootedFrom) ??
      MemoryStorage.players.add({ playerName: lootedFrom })
  })
}

function parse(event) {
  const isSilver = event.parameters[3]

  const lootedFrom = event.parameters[1]

  // if the event is silver, it has no parameter 1.
  if (!isSilver && typeof lootedFrom !== 'string') {
    throw new ParserError('EvOtherGrabbedLoot has invalid lootedFrom parameter')
  }

  const lootedBy = event.parameters[2]

  if (typeof lootedBy !== 'string') {
    throw new ParserError('EvOtherGrabbedLoot has invalid lootedBy parameter')
  }

  const itemNumId = event.parameters[4]

  if (!isSilver && typeof itemNumId !== 'number') {
    throw new ParserError('EvOtherGrabbedLoot has invalid itemNumId parameter')
  }

  const quantity = event.parameters[5]

  if (typeof quantity !== 'number') {
    throw new ParserError('EvOtherGrabbedLoot has invalid quantity parameter')
  }

  return { isSilver, lootedFrom, lootedBy, itemNumId, quantity }
}

module.exports = { name, handle, parse }
