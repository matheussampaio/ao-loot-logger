const MemoryStorage = require('../../storage/memory-storage')
const LootLogger = require('../../loot-logger')
const formatLootLog = require('../../utils/format-loot-log')
const Logger = require('../../utils/logger')

function EvInventoryPutItem(event) {
  const objectId = event.parameters[0]

  if (typeof objectId !== 'number') {
    return Logger.warn('EvInventoryPutItem has invalid objectId parameter')
  }

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

module.exports = EvInventoryPutItem
