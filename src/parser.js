const BufferReader = require('./buffer-reader')

function onEventParser(buffer, cb) {
  const br = new BufferReader(buffer)

  br.position += 3

  const commandCount = br.readUInt8()

  br.position += 8

  const commandHeaderLength = 12
  const signifierByteLength = 1

  for (let i = 0; i < commandCount; i++) {
    const commandType = br.readUInt8()

    br.position += 3

    let commandLength = br.readInt32BE()

    br.position += 4

    if (commandType === 4) {
      continue
    } else if (commandType === 5) {
      br.position += commandLength - commandHeaderLength
      continue
    } else if (commandType === 6) {
    } else if (commandType === 7) {
      br.position += 4
      commandLength -= 4
    } else {
      br.position += commandLength - commandHeaderLength
      continue
    }

    br.position += signifierByteLength

    const messageType = br.readUInt8()
    const operationLength = commandLength - commandHeaderLength - 2
    const payload = br.readBytes(operationLength)

    if (messageType === 2) {
    } else if (messageType === 3) {
    } else if (messageType === 4) {
      const eventData = parseEvent(new BufferReader(payload), true)

      if (eventData.Code === 1 && eventData.Parameters[252] === 260) {
        cb(onLootGrabbedEvent(eventData))
      }
    } else {
      br.position += operationLength
    }
  }
}

function onLootGrabbedEvent(eventData) {
  const lootedFrom = eventData.Parameters[1]
  const lootedBy = eventData.Parameters[2]
  const itemNumId = eventData.Parameters[4]
  const quantity = eventData.Parameters[5]

  return {
    lootedFrom,
    lootedBy,
    itemNumId,
    quantity
  }
}

function parseEvent(br) {
  const Code = br.readUInt8()

  if (Code !== 1) {
    return { Code }
  }

  const paramsLength = br.readUInt16BE()

  // grabbed loot event should have 6 params
  if (paramsLength !== 6) {
    return { Code: 2 }
  }

  const Parameters = {}

  for (let i = 0; i < paramsLength; i++) {
    const key = br.readUInt8()
    const op = br.readUInt8()

    if (op === 0x6b) {
      Parameters[key] = br.readUInt16BE()
    } else if (op === 0x62) {
      Parameters[key] = br.readUInt8()
    } else if (op === 0x73) {
      const valueLength = br.readUInt16BE()
      Parameters[key] = br.readBytes(valueLength).toString()
    } else {
      return { Code: 2 }
    }
  }

  return { Code, Parameters }
}

module.exports = { onEventParser, onLootGrabbedEvent }
