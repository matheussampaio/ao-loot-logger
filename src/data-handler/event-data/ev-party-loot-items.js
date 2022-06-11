const Logger = require('../../utils/logger')
const ParserError = require('../parser-error')

const EventId = 278

function handle(event) {
  const { itemIds, itemTypeIds, quantities, names } = parse(event)

  Logger.debug('EvPartyLootItems', event)
}

function parse(event) {
  const itemIds = event.parameters[1]

  if (!Array.isArray(itemIds)) {
    throw new ParserError('EvPartyLootItems has invalid itemIds parameter')
  }

  const itemTypeIds = event.parameters[2]

  if (!Array.isArray(itemTypeIds)) {
    throw new ParserError(
      'EvPartyLootItems has invalid itemTypeIds parameter'
    )
  }

  const quantities = event.parameters[9]

  if (!Array.isArray(quantities)) {
    throw new ParserError(
      'EvPartyLootItems has invalid quantities parameter'
    )
  }

  const names = event.parameters[10]

  if (!Array.isArray(names)) {
    throw new ParserError('EvPartyLootItems has invalid names parameter')
  }

  return { itemIds, itemTypeIds, quantities, names }
}

module.exports = { EventId, handle, parse }
