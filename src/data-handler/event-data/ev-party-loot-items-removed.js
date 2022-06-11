const MemoryStorage = require('../../storage/memory-storage')
const Logger = require('../../utils/logger')
const ParserError = require('../parser-error')

const EventId = 279

function handle(event) {
  const { id, unknown, container } = parse(event)

  Logger.debug('EvPartyLootItemsRemoved', event)
}

function parse(event) {
  const id = event.parameters[0]

  if (typeof id !== 'number') {
    throw new ParserError(
      'EvPartyLootItemsRemoved has invalid id parameter'
    )
  }

  const unknown = event.parameters[1]

  if (!Array.isArray(unknown)) {
    throw new ParserError(
      'EvPartyLootItemsRemoved has invalid unknown parameter'
    )
  }

  const container = MemoryStorage.containers.getById(id)

  if (container == null) {
    throw new ParserError(
      'cant find container for EvPartyLootItemsRemoved'
    )
  }

  return { id, unknown, container }
}

module.exports = { EventId, handle, parse }
