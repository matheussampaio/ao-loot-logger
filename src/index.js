const { Cap, decoders } = require('cap')
const path = require('path')

const items = require('./items')
const Logger = require('./logger')
const { onEventParser } = require('./parser')
const checkNewVersion = require('./check-new-version')
const { prettyPrintBuffer } = require('./utils')
const package = require('../package.json')

const logger = new Logger()
const dumplogger = process.env.DUMP ? new Logger('dump.txt') : null

const players = []

if (process.env.FOLLOW_PLAYERS) {
  for (const player of process.env.FOLLOW_PLAYERS.split(',')) {
    players.push({
      buf: Buffer.from(player),
      logger: new Logger(`${player}.txt`)
    })
  }
}

main().catch((error) => {
  console.error(error)

  process.exit(1)
})

async function main() {
  console.info(`AO Loot Logger - ${package.version}\n`)

  await Promise.all([checkNewVersion(), items.init()])

  const addrs = []

  for (const device of Cap.deviceList()) {
    for (const address of device.addresses) {
      if (address.addr.match(/\d+\.\d+\.\d+\.\d+/)) {
        if (device.description) {
          console.info(`Listening to ${device.description}`)
        }

        addrs.push(address.addr)
      }
    }
  }

  console.info()

  for (const addr of addrs) {
    addListener(addr)
  }

  process.stdin.setRawMode(true)

  process.stdin.resume()

  process.stdin.setEncoding('utf8')

  process.stdin.on('data', onKeypressed)

  process.on('SIGTERM', () => {
    process.stdin.removeListener(onKeypressed)
  })

  console.info(
    'Logs will be saved to',
    path.join(process.cwd(), logger.logFileName)
  )

  console.info(`Press "d" to create a new log file.\n`)
}

function onKeypressed(key) {
  const CTRL_C = '\u0003'
  const ROTATE_LOGGER_FILE_KEY = 'd'

  if (key === CTRL_C) {
    console.info('Exiting...')

    process.exit()
  }

  if (key.toLowerCase() === ROTATE_LOGGER_FILE_KEY) {
    logger.createNewLogFileName()
    logger.close()

    console.info(
      `Logs will be saved to ${path.join(process.cwd(), logger.logFileName)}\n`
    )
  }
}

function addListener(addr) {
  const c = new Cap()

  const ALBION_PORT = 5056

  const filter = `ip and udp port ${ALBION_PORT}`
  const bufSize = 1 * 1024 * 1024
  const buffer = Buffer.alloc(2024)
  const device = Cap.findDevice(addr)

  process.on('SIGTERM', () => {
    c.close()
  })

  c.on('packet', () => {
    let ret = decoders.Ethernet(buffer)

    if (ret.info.type !== decoders.PROTOCOL.ETHERNET.IPV4) {
      return
    }

    ret = decoders.IPV4(buffer, ret.offset)

    if (ret.info.protocol !== decoders.PROTOCOL.IP.UDP) {
      return
    }

    ret = decoders.UDP(buffer, ret.offset)

    const slice = buffer.slice(ret.offset, ret.offset + ret.info.length)

    if (process.env.DUMP) {
      dumplogger.log(prettyPrintBuffer(slice))
    }

    for (const player of players) {
      if (slice.indexOf(player.buf) !== -1) {
        player.logger.log(prettyPrintBuffer(slice))
      }
    }

    try {
      onEventParser(slice, (event) => {
        const { itemId, itemName } = items.get(event.itemNumId)

        const date = new Date()

        const line = `${date.toISOString()};${event.lootedBy};${itemId};${
          event.quantity
        };${event.lootedFrom};${itemName}`

        logger.log(line)

        const prettyLine = `[${date}] \x1b[32m${event.lootedBy} looted ${event.quantity}x ${itemName} from ${event.lootedFrom}\x1b[0m`

        console.info(prettyLine)
      })
    } catch (error) {
      console.error(error, slice)
    }
  })

  const linkType = c.open(device, filter, bufSize, buffer)

  if (c.setMinBytes != null) {
    c.setMinBytes(0)
  }

  if (linkType !== 'ETHERNET') {
    return c.close()
  }
}
