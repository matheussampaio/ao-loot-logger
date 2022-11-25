const MemoryStorage = require('../../storage/memory-storage')
const Logger = require('../../utils/logger')
const ParserError = require('../parser-error')

const name = 'EvNewLootChest'

function handle(event) {
  const { id, owner } = parse(event)

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

  Logger.debug('EvNewLootChest', container, event.parameters)
}

function parse(event) {
  const id = event.parameters[0]

  if (typeof id !== 'number') {
    throw new ParserError('EvNewLootChest has invalid id parameter')
  }

  const owner = event.parameters[3]

  if (typeof owner !== 'string') {
    throw new ParserError('EvNewLootChest has invalid owner parameter')
  }

  return { id, owner }
}

module.exports = { name, handle, parse }
