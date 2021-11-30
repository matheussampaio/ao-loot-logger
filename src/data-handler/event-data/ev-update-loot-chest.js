const MemoryStorage = require('../../storage/memory-storage')
const Logger = require('../../utils/logger')

function EvUpdateLootChest(event) {
  const id = event.parameters[0]

  if (typeof id !== 'number') {
    return Logger.warn('EvUpdateLootChest has invalid id parameter')
  }

  let container = MemoryStorage.containers.getById(id)

  const type = 'chest'

  if (container == null) {
    container = MemoryStorage.containers.add({ id, type })
  }

  if (container.type !== type) {
    container.type = type
  }

  Logger.debug('EvUpdateLootChest', container)
}

module.exports = EvUpdateLootChest
