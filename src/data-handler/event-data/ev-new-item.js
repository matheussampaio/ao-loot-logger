const MemoryStorage = require('../../storage/memory-storage')
const Items = require('../../items')
const Logger = require('../../utils/logger')

function EvNewItem(event) {
  const objectId = event.parameters[0]
  const itemNumId = event.parameters[1]
  const quantity = event.parameters[2]

  if (typeof objectId !== 'number') {
    return Logger.warn('EvNewItem has invalid objectId parameter')
  }

  if (typeof itemNumId !== 'number') {
    return Logger.warn('EvNewItem has invalid itemNumId parameter')
  }

  if (typeof quantity !== 'number') {
    return Logger.warn('EvNewItem has invalid quantity parameter')
  }

  const item = Items.get(itemNumId)

  if (item == null) {
    return Logger.warn(`item num id not found`, itemNumId)
  }

  const { itemId, itemName } = item

  let loot = MemoryStorage.loots.getById(objectId)

  if (loot == null) {
    loot = MemoryStorage.loots.add({ objectId, itemId, itemName, quantity })
  }

  if (loot.itemId !== itemId) {
    loot.itemId = itemId
  }

  if (loot.itemName !== itemName) {
    loot.itemName = itemName
  }

  if (loot.quantity !== quantity) {
    loot.quantity = quantity
  }

  Logger.debug('EvNewItem', loot, event)
}

module.exports = EvNewItem
