const BufferReader = require('./buffer-reader')
const Logger = require('./logger')
const { prettyPrintBuffer } = require('./utils')

const logger = process.env.DUMP ? new Logger('dump.txt') : null

const flag = Buffer.from([0xfc, 0x6b, 0x01, 0x04])

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

      if (
        event.code === 1 &&
        event.size === 6 &&
        event.parameters[252] === 260
      ) {
        cb(onLootGrabbedEvent(event))
      } else if (
        process.env.DUMP &&
        payload.indexOf(flag) === payload.length - 4
      ) {
        const line = prettyPrintBuffer(payload)

        logger.log(line)
        logger.log(JSON.stringify(event))
        console.log('PROB A LOG PACKET NOT WELL PARSED:', line)
        console.log(JSON.stringify(event))
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

  // grabbed loot event should have 6 params
  // if (Params !== 6) {
  // return { Code: 2 }
  // }

  const parameters = {}

  for (let i = 0; i < size; i++) {
    const key = br.readUInt8()
    const op = br.readUInt8()

    if (op === 0x6b) {
      parameters[key] = br.readUInt16BE()
    } else if (op === 0x62 || op === 0x6f) {
      parameters[key] = br.readUInt8()
    } else if (op === 0x69) {
      parameters[key] = br.readInt32BE()
    } else if (op === 0x73) {
      const valueLength = br.readUInt16BE()
      parameters[key] = br.readBytes(valueLength).toString()
    } else {
      return { Code: 2, key, op }
    }
  }

  return { code, size, parameters }
}

module.exports = { onEventParser, onLootGrabbedEvent, parseEvent }
