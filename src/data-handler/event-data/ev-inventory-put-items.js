const MemoryStorage = require('../../storage/memory-storage')
const LootLogger = require('../../loot-logger')
const formatLootLog = require('../../utils/format-loot-log')
const Logger = require('../../utils/logger')
const ParserError = require('../parser-error')

const EventId = 25

function handle(event) {
  const { objectId } = parse(event)

  let loot = MemoryStorage.loots.getById(objectId)

  // when moving items inside cities' chest will be null
  if (loot == null || !loot.owner) {
    return
  }

  const lootedBy = MemoryStorage.players.self
  const lootedFrom =
    MemoryStorage.players.getByName(loot.owner) ??
    MemoryStorage.players.add({ playerName: loot.owner })
  const { quantity, itemId, itemName } = loot
  const date = new Date()

  MemoryStorage.loots.deleteById(objectId)

  if (lootedBy == null) {
    return Logger.warn('SELF not detected yet. Skipping self loot event.')
  }

  LootLogger.write({
    date,
    itemId,
    quantity,
    itemName,
    lootedBy,
    lootedFrom
  })

  console.info(
    formatLootLog({
      date,
      lootedBy,
      lootedFrom,
      quantity,
      itemName
    })
  )

  Logger.debug('EvInventoryPutItem', loot)
}

function parse(event) {
  const objectId = event.parameters[0]

  if (typeof objectId !== 'number') {
    throw new ParserError('EvInventoryPutItem has invalid objectId parameter')
  }

  const slotId = event.parameters[1]

  if (typeof slotId !== 'number') {
    throw new ParserError('EvInventoryPutItem has invalid slotId parameter')
  }

  const containerId = event.parameters[2]

  if (!Array.isArray(containerId)) {
    throw new ParserError('EvInventoryPutItem has invalid containerId parameter')
  }

  return { objectId }
}

module.exports = { EventId, handle, parse }
