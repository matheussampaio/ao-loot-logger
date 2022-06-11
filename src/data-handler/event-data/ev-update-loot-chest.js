const MemoryStorage = require('../../storage/memory-storage')
const Logger = require('../../utils/logger')
const ParserError = require('../parser-error')

const EventId = 371

function handle(event) {
  const { id } = parse(event)

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

function parse(event) {
  const id = event.parameters[0]

  if (typeof id !== 'number') {
    throw new ParserError('EvUpdateLootChest has invalid id parameter')
  }

  return { id }
}

module.exports = { EventId, handle, parse }
