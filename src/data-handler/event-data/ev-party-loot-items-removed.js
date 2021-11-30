const MemoryStorage = require('../../storage/memory-storage')
const Logger = require('../../utils/logger')

function EvPartyLootItemsRemoved(event) {
  const id = event.parameters[0]

  if (typeof id !== 'number') {
    return Logger.warn(
      'EvPartyLootItemsRemoved has invalid id parameter',
      event.parameters
    )
  }

  const unknown = event.parameters[1]

  Logger.warn(
    'NEED TO INDENTIFY PARAMETERS [1] EvPartyLootItemsRemoved unknown',
    event
  )

  if (!Array.isArray(unknown)) {
    return Logger.warn(
      'EvPartyLootItemsRemoved has invalid unknown parameter',
      event.parameters
    )
  }

  const container = MemoryStorage.containers.getById(id)

  if (container == null) {
    return Logger.warn(
      'cant find container for EvPartyLootItemsRemoved',
      event.parameters
    )
  }

  // TODO: process unknown somehow
}

module.exports = EvPartyLootItemsRemoved
