const MemoryStorage = require('../../storage/memory-storage')
const LootLogger = require('../../loot-logger')
const formatLootLog = require('../../utils/format-loot-log')
const Items = require('../../items')
const ParserError = require('../parser-error')

const EventId = 258

function handle(event) {
  const { lootedFrom, lootedBy, itemNumId, quantity } = parse(event)

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

  console.info(
    formatLootLog({
      date,
      lootedBy:
        MemoryStorage.players.getByName(lootedBy) ??
        MemoryStorage.players.add({ playerName: lootedBy }),
      lootedFrom:
        MemoryStorage.players.getByName(lootedFrom) ??
        MemoryStorage.players.add({ playerName: lootedFrom }),
      quantity,
      itemName
    })
  )
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

  if (typeof itemNumId !== 'number') {
    throw new ParserError('EvOtherGrabbedLoot has invalid itemNumId parameter')
  }

  const quantity = event.parameters[5]

  if (typeof quantity !== 'number') {
    throw new ParserError('EvOtherGrabbedLoot has invalid quantity parameter')
  }

  return { lootedFrom, lootedBy, itemNumId, quantity }
}

module.exports = { EventId, handle, parse }
