const MemoryStorage = require('../../storage/memory-storage')
const Items = require('../../items')
const Logger = require('../../utils/logger')
const ParserError = require('../parser-error')

const name = 'EvNewEquipmentItem'

function handle(event) {
  const { objectId, itemNumId, quantity } = parse(event)

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

  Logger.debug('EvNewEquipmentItem', loot, event.parameters)
}

function parse(event) {
  const objectId = event.parameters[0]

  if (typeof objectId !== 'number') {
    throw new ParserError('EvNewEquipmentItem has invalid objectId parameter')
  }

  const itemNumId = event.parameters[1]

  if (typeof itemNumId !== 'number') {
    throw new ParserError('EvNewEquipmentItem has invalid itemNumId parameter')
  }

  const quantity = event.parameters[2]

  if (typeof quantity !== 'number') {
    throw new ParserError('EvNewEquipmentItem has invalid quantity parameter')
  }

  const craftedBy = event.parameters[5]

  if (typeof craftedBy !== 'string') {
    throw new ParserError('EvNewEquipmentItem has invalid craftedBy parameter')
  }

  const quality = event.parameters[6] ?? 1
  const durability = event.parameters[7] ?? 0
  const spells = event.parameters[8]
  const passives = event.parameters[9]

  return { objectId, itemNumId, quantity, craftedBy, quality, durability, spells, passives }
}

module.exports = { name, handle, parse }
