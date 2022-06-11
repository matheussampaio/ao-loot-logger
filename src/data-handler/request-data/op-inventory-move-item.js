const MemoryStorage = require('../../storage/memory-storage')
const LootLogger = require('../../loot-logger')
const uuidStringify = require('../../utils/uuid-stringify')
const formatLootLog = require('../../utils/format-loot-log')
const Logger = require('../../utils/logger')
const ParserError = require('../parser-error')

const EventId = 30

function handle(event) {
  const { fromUuid, toUuid } = parse(event)

  if (fromUuid === toUuid) {
    return
  }

  let container = MemoryStorage.containers.getByUUID(fromUuid)

  if (container == null) {
    return Logger.debug('OpInventoryMoveItem cant find container', fromUuid)
  }

  const position = event.parameters[0] ?? 0

  if (typeof position !== 'number') {
    Logger.warn('OpInventoryMoveItem has invalid position parameter')
  }

  if (container.type !== 'chest') {
    const loot = container.items[position]

    if (loot == null) {
      return
    }

    MemoryStorage.loots.deleteById(loot.id)
    delete container.items[position]

    if (fromUuid === toUuid) {
      return
    }

    if (loot.onwer == null) {
      return
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

    Logger.debug('opIventoryMoveItem', {
      lootedBy,
      lootedFrom,
      container,
      loot
    })

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
  }
}

function parse(event) {
  const fromEncodedUuid = event.parameters[1]

  if (!Array.isArray(fromEncodedUuid) || fromEncodedUuid.length !== 16) {
    throw new ParserError(
      'OpInventoryMoveItem has invalid fromEncodedUuid parameter'
    )
  }

  const toEncodedUuid = event.parameters[4]

  if (!Array.isArray(toEncodedUuid) || toEncodedUuid.length !== 16) {
    throw new ParserError(
      'OpInventoryMoveItem has invalid toEncodedUuid parameter'
    )
  }

  const slotId = event.parameters[3] ?? 0

  if (typeof slotId !== 'number') {
    throw new ParserError('EvInventoryPutItem has invalid slotId parameter')
  }

  const fromUuid = uuidStringify(fromEncodedUuid)
  const toUuid = uuidStringify(toEncodedUuid)

  return { fromUuid, toUuid }
}

module.exports = { EventId, handle, parse }
