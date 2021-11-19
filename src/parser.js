const BufferReader = require('./buffer-reader')
const { prettyPrintBuffer } = require('./utils')

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
      const event = parseEvent(new BufferReader(payload))

      let eventId = event && event.parameters && event.parameters[252]

      // Move event
      if (event && event.code === 3) {
        eventId = 3
      }

      // in case we can't parse the event, try to search for the
      // event id at the end of the payload
      if (!eventId) {
        const b = payload.slice(-4, -2)

        if (b.readUInt8() == 252 && b.readUInt8(1) == 0x6b) {
          eventId = payload.slice(-2).readUInt16BE()
        }
      }

      switch (eventId) {
        // OtherGrabbedLoot
        case 256:
        case 257:
          if (event.code === 1 && event.size === 6) {
            cb(onLootGrabbedEvent(event))
          }
          break
        // Ignore a few events
        default:
          break
      }
    } else {
      br.position += operationLength
    }
  }
}

function onLootGrabbedEvent(event) {
  const lootedFrom = event.parameters[1]
  const lootedBy = event.parameters[2]
  const itemNumId = event.parameters[4]
  const quantity = event.parameters[5]

  return {
    lootedFrom,
    lootedBy,
    itemNumId,
    quantity
  }
}

function parseEvent(br) {
  const code = br.readUInt8()

  if (code !== 1) {
    return { code }
  }

  const size = br.readUInt16BE()

  const parameters = {}

  for (let i = 0; i < size; i++) {
    const key = br.readUInt8()
    const op = br.readUInt8()

    // reads a 8b integer
    if (op === 0x62 || op === 0x6f) {
      parameters[key] = br.readUInt8()

      // read float
    } else if (op === 0x66) {
      parameters[key] = br.readFloatBE()

      // reads a 32b integer
    } else if (op === 0x69) {
      parameters[key] = br.readInt32BE()

      // reads a 16b integer
    } else if (op === 0x6b) {
      parameters[key] = br.readUInt16BE()

      // ??? not sure exactly what 6C does, but seems to always read 8 bytes
    } else if (op === 0x6c) {
      parameters[key] = br.readBytes(8)

      // read an 16b interger N, then a string with length N
    } else if (op === 0x73) {
      const size = br.readUInt16BE()
      parameters[key] = br.readBytes(size).toString()

      // read an 32b interger N, then an array of N int8
    } else if (op === 0x78) {
      const size = br.readInt32BE()

      parameters[key] = []

      for (let i = 0; i < size; i++) {
        parameters[key].push(br.readInt8())
      }

      // read an array of floats
    } else if (op === 0x79) {
      const size = br.readUInt16BE()
      const secondOp = br.readUInt8()

      parameters[key] = []

      for (let i = 0; i < size; i++) {
        if (secondOp === 0x66) {
          parameters[key].push(br.readFloatBE())
        } else if (secondOp === 0x69) {
          parameters[key].push(br.readInt32BE())
        } else if (secondOp === 0x6b) {
          parameters[key].push(br.readUInt16BE())
        } else if (secondOp === 0x6c) {
          parameters[key].push(br.readBytes(8))
        } else if (secondOp === 0x73) {
          const size = br.readUInt16BE()
          parameters[key].push(br.readBytes(size).toString())
        } else if (secondOp === 0x78) {
          const secsize = br.readInt32BE()
          const arr = []

          for (let j = 0; j < secsize; j++) {
            arr.push(br.readInt8())
          }

          parameters[key].push(arr)
        } else {
          return {
            error: `unknown second op`,
            key: `0x${key.toString(16).toUpperCase().padStart(2, 0)}`,
            op: `0x${op.toString(16).toUpperCase().padStart(2, 0)}`,
            secondOp: `0x${secondOp.toString(16).toUpperCase().padStart(2, 0)}`,
            parameters
          }
        }
      }
    } else {
      return {
        error: `unknown op`,
        key: `0x${key.toString(16).toUpperCase().padStart(2, 0)}`,
        op: `0x${op.toString(16).toUpperCase().padStart(2, 0)}`,
        parameters
      }
    }
  }

  return { code, size, parameters }
}

module.exports = { onEventParser, onLootGrabbedEvent, parseEvent }