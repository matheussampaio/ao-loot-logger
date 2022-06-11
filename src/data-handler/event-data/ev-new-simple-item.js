const MemoryStorage = require('../../storage/memory-storage')
const Items = require('../../items')
const Logger = require('../../utils/logger')
const ParserError = require('../parser-error')

const EventId = 29

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

  Logger.debug('EvNewSimpleItem', loot, event.parameters)
}

function parse(event) {
  const objectId = event.parameters[0]
  const itemNumId = event.parameters[1]
  const quantity = event.parameters[2]

  if (typeof objectId !== 'number') {
    throw new ParserError('EvNewSimpleItem has invalid objectId parameter')
  }

  if (typeof itemNumId !== 'number') {
    throw new ParserError('EvNewSimpleItem has invalid itemNumId parameter')
  }

  if (typeof quantity !== 'number') {
    throw new ParserError('EvNewSimpleItem has invalid quantity parameter')
  }

  const craftedBy = event.parameters[5]

  if (typeof craftedBy === 'string') {
    throw new ParserError('EvNewSimpleItem should not have craftedBy parameter')
  }

  return { objectId, itemNumId, quantity }
}

module.exports = { EventId, handle, parse }
