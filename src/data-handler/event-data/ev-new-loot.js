const MemoryStorage = require('../../storage/memory-storage')
const Logger = require('../../utils/logger')
const ParserError = require('../parser-error')

const name = 'EvNewLoot'

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

  Logger.debug('EvNewLoot', container, event.parameters)
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

  const position = event.parameters[4]

  if (!Array.isArray(position) || position.length !== 2) {
    throw new ParserError(
      'EvNewLoot has invalid position parameter'
    )
  }

  return { id, owner }
}

module.exports = { name, handle, parse }
