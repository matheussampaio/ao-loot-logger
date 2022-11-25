const MemoryStorage = require('../../storage/memory-storage')
const uuidStringify = require('../../utils/uuid-stringify')
const Logger = require('../../utils/logger')
const ParserError = require('../parser-error')

const name = 'EvAttachItemContainer'

function handle(event) {
  Logger.debug('EvAttachItemContainer', event.parameters)

  const { id, uuid, inventory, slots } = parse(event)

  let container =
    MemoryStorage.containers.getByUUID(uuid) ??
    MemoryStorage.containers.getById(id)

  if (container == null) {
    container = MemoryStorage.containers.add({ uuid, id })
  }

  if (container.uuid !== uuid) {
    container.uuid = uuid
  }

  if (container.id !== id) {
    container.id = id
  }

  const containerSize = inventory.length

  for (let position = 0; position < containerSize; position++) {
    const objectId = inventory[position]
    const loot = MemoryStorage.loots.getById(objectId)

    if (loot == null) {
      continue
    }

    if (!loot.owner) {
      loot.owner = container.owner
    }

    container.items[position] = loot
  }

  Logger.debug('EvAttachItemContainer', container, event.parameters)
}

function parse(event) {
  const id = event.parameters[0]

  if (typeof id !== 'number') {
    throw new ParserError('EvAttachItemContainer has invalid id parameter')
  }

  const encodedUuid = event.parameters[1]

  if (!Array.isArray(encodedUuid) || encodedUuid.length !== 16) {
    throw new ParserError('EvAttachItemContainer has invalid uuid parameter')
  }

  const inventory = event.parameters[3]

  if (!Array.isArray(inventory)) {
    throw new ParserError('EvAttachItemContainer has invalid inventory parameter')
  }

  const slots = event.parameters[4]

  if (typeof slots !== 'number') {
    throw new ParserError('EvAttachItemContainer has invalid slots parameter')
  }

  const uuid = uuidStringify(encodedUuid)

  return { id, uuid, inventory, slots }
}
module.exports = { name, handle, parse }
