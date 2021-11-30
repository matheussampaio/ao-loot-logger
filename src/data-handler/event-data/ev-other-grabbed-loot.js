const MemoryStorage = require('../../storage/memory-storage')
const LootLogger = require('../../loot-logger')
const formatLootLog = require('../../utils/format-loot-log')
const Items = require('../../items')

function EvOtherGrabbedLoot(event) {
  const lootedFrom = event.parameters[1]
  const lootedBy = event.parameters[2]
  const itemNumId = event.parameters[4]
  const quantity = event.parameters[5]

  if (typeof lootedBy !== 'string' || typeof lootedFrom !== 'string') {
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

module.exports = EvOtherGrabbedLoot
