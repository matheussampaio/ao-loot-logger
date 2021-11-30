const MemoryStorage = require('../../storage/memory-storage')
const uuidStringify = require('../../utils/uuid-stringify')
const Logger = require('../../utils/logger')

function EvDetachItemContainer(event) {
  const encodedUuid = event.parameters[0]

  if (!Array.isArray(encodedUuid) || encodedUuid.length !== 16) {
    return Logger.warn(
      'EvDetachItemContainer has invalid encodedUuid parameter'
    )
  }

  const uuid = uuidStringify(encodedUuid)

  const container = MemoryStorage.containers.deleteByUUID(uuid)

  Logger.debug('EvDetachItemContainer', container)
}

module.exports = EvDetachItemContainer
