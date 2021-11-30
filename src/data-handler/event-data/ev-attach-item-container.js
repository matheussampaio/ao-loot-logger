const MemoryStorage = require('../../storage/memory-storage')
const uuidStringify = require('../../utils/uuid-stringify')
const Logger = require('../../utils/logger')

function EvAttachItemContainer(event) {
  Logger.debug('EvAttachItemContainer', event.parameters)

  const id = event.parameters[0]

  if (typeof id !== 'number') {
    return Logger.warn('EvAttachItemContainer has invalid id parameter')
  }

  const encodedUuid = event.parameters[1]

  if (!Array.isArray(encodedUuid) || encodedUuid.length !== 16) {
    return Logger.warn('EvAttachItemContainer has invalid uuid parameter')
  }

  const uuid = uuidStringify(encodedUuid)

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

  const objectIds = event.parameters[3]

  if (!Array.isArray(objectIds)) {
    return Logger.warn('EvAttachItemContainer has invalid objectIds parameter')
  }

  const containerSize = objectIds.length

  for (let position = 0; position < containerSize; position++) {
    const objectId = objectIds[position]
    const loot = MemoryStorage.loots.getById(objectId)

    if (loot == null) {
      continue
    }

    if (!loot.owner) {
      loot.owner = container.owner
    }

    container.items[position] = loot
  }
}

module.exports = EvAttachItemContainer
