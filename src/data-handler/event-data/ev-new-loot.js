const MemoryStorage = require('../../storage/memory-storage')
const Logger = require('../../utils/logger')

function EvNewLoot(event) {
  const id = event.parameters[0]

  if (typeof id !== 'number') {
    return Logger.warn('EvNewLoot has invalid id parameter')
  }

  const owner = event.parameters[3]

  if (typeof owner !== 'string') {
    return Logger.warn('EvNewLoot has invalid owner parameter')
  }

  let container = MemoryStorage.containers.getById(id)

  const type = owner.startsWith('@MOB') ? 'monster' : 'player'

  if (container == null) {
    container = MemoryStorage.containers.add({ id, owner, type })
  }

  if (container.owner !== owner) {
    container.owner = owner
  }

  if (container.type !== type) {
    container.type = type
  }

  Logger.debug('EvNewLoot', container)
}

module.exports = EvNewLoot
