const MemoryStorage = require('../../storage/memory-storage')
const Logger = require('../../utils/logger')

function EvNewLootChest(event) {
  const id = event.parameters[0]

  if (typeof id !== 'number') {
    return Logger.warn('EvNewLootChest has invalid id parameter', event)
  }

  const owner = event.parameters[3]

  if (typeof owner !== 'string') {
    return Logger.warn('EvNewLootChest has invalid owner parameter', event)
  }

  let container = MemoryStorage.containers.getById(id)

  const type = 'chest'

  if (container == null) {
    container = MemoryStorage.containers.add({ id, owner, type })
  }

  if (container.owner !== owner) {
    container.owner = owner
  }

  if (container.type !== type) {
    container.type = type
  }

  Logger.debug('EvNewLootChest', container)
}

module.exports = EvNewLootChest
