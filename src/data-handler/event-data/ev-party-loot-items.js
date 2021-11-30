const Logger = require('../../utils/logger')

function EvPartyLootItems(event) {
  const itemIds = event.parameters[1]

  if (!Array.isArray(itemIds)) {
    return Logger.warn('EvPartyLootItems has invalid itemIds parameter', event)
  }

  const itemTypeIds = event.parameters[2]

  if (!Array.isArray(itemTypeIds)) {
    return Logger.warn(
      'EvPartyLootItems has invalid itemTypeIds parameter',
      event
    )
  }

  const quantities = event.parameters[9]

  if (!Array.isArray(quantities)) {
    return Logger.warn(
      'EvPartyLootItems has invalid quantities parameter',
      event
    )
  }

  const names = event.parameters[10]

  if (!Array.isArray(names)) {
    return Logger.warn('EvPartyLootItems has invalid names parameter', event)
  }

  Logger.debug('EvPartyLootItems', event)
}

module.exports = EvPartyLootItems
