const MemoryStorage = require('../../storage/memory-storage')
const Logger = require('../../utils/logger')
const ParserError = require('../parser-error')

const EventId = 89

function handle(event) {
  const { id, owner } = parse(event)

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

function parse(event) {
  const id = event.parameters[0]

  if (typeof id !== 'number') {
    throw new ParserError('EvNewLoot has invalid id parameter')
  }

  const owner = event.parameters[3]

  if (typeof owner !== 'string') {
    throw new ParserError('EvNewLoot has invalid owner parameter')
  }

  return { id, owner }
}

module.exports = { EventId, handle, parse }
