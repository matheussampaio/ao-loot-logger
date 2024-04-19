const MemoryStorage = require('../../storage/memory-storage')
const LootLogger = require('../../loot-logger')
const uuidStringify = require('../../utils/uuid-stringify')
const Logger = require('../../utils/logger')
const ParserError = require('../parser-error')

const name = 'OpInventoryMoveItem'

function handle(event) {
  const { fromSlot, fromUuid, toSlot, toUuid } = parse(event)

  Logger.debug(
    'opIventoryMoveItem',
    { fromSlot, fromUuid, toSlot, toUuid },
    event.parameters
  )

  if (fromUuid === toUuid) {
    return Logger.debug(
      'OpInventoryMoveItem moving inside same container',
      fromUuid
    )
  }

  let container = MemoryStorage.containers.getByUUID(fromUuid)

  if (container == null) {
    return Logger.debug('OpInventoryMoveItem cant find container', fromUuid)
  }

  if (container.type !== 'chest') {
    const loot = container.items[fromSlot]

    if (loot == null) {
      return Logger.debug('OpInventoryMoveItem cant find loot', {
        fromSlot,
        items: container.items
      })
    }

    MemoryStorage.loots.deleteById(loot.id)
    delete container.items[fromSlot]

    if (loot.owner == null) {
      return Logger.debug('OpInventoryMoveItem no owner', fromUuid)
    }

    const lootedBy = MemoryStorage.players.self
    const lootedFrom =
      MemoryStorage.players.getByName(loot.owner) ??
      MemoryStorage.players.add({ playerName: loot.owner })
    const { quantity, itemId, itemName } = loot
    const date = new Date()

    if (lootedBy == null) {
      return Logger.warn(
        'SELF not detected yet. Skipping self loot event.',
        event
      )
    }

    LootLogger.write({
      date,
      itemId,
      quantity,
      itemName,
      lootedBy,
      lootedFrom
    })
  }
}

function parse(event) {
  const fromSlot = event.parameters[0] ?? 0

  if (typeof fromSlot !== 'number') {
    throw new ParserError('OpInventoryMoveItem has invalid fromSlot parameter')
  }

  const fromEncodedUuid = event.parameters[1]

  if (!Array.isArray(fromEncodedUuid) || fromEncodedUuid.length !== 16) {
    throw new ParserError(
      'OpInventoryMoveItem has invalid fromEncodedUuid parameter'
    )
  }

  const toSlot = event.parameters[3] ?? 0

  if (typeof toSlot !== 'number') {
    throw new ParserError('OpInventoryMoveItem has invalid toSlot parameter')
  }

  const toEncodedUuid = event.parameters[4]

  if (!Array.isArray(toEncodedUuid) || toEncodedUuid.length !== 16) {
    throw new ParserError(
      'OpInventoryMoveItem has invalid toEncodedUuid parameter'
    )
  }

  const fromUuid = uuidStringify(fromEncodedUuid)
  const toUuid = uuidStringify(toEncodedUuid)

  return { fromSlot, fromUuid, toSlot, toUuid }
}

module.exports = { name, handle, parse }
