const { Cap, decoders } = require('cap')

const items = require('./items')
const Logger = require('./logger')
const { onEventParser } = require('./parser')
const checkNewVersion = require('./check-new-version')

const logger = new Logger()

main().catch((error) => console.error(error))

async function main() {
  await Promise.all([checkNewVersion(), items.init()])

  const addrs = []

  for (const device of Cap.deviceList()) {
    for (const address of device.addresses) {
      if (address.addr.match(/\d+\.\d+\.\d+\.\d+/)) {
        if (device.description) {
          console.info(`Listening to`, device.description)
        }

        addrs.push(address.addr)
      }
    }
  }

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
}

function onKeypressed(key) {
  const CTRL_C = '\u0003'
  const ROTATE_LOGGER_FILE_KEY = 'd'

  if (key === CTRL_C) {
    console.info('Ctrl+C detected. Stopping app.')

    process.exit()
  }

  if (key.toLowerCase() === ROTATE_LOGGER_FILE_KEY) {
    logger.init()
  }
}

function addListener(addr) {
  const c = new Cap()

  const ALBION_PORT = 5056

  const filter = `ip and udp port ${ALBION_PORT}`
  const bufSize = 10 * 65536
  const buffer = Buffer.alloc(65535)
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

    try {
      onEventParser(slice, (event) => {
        const { itemId, itemName } = items.get(event.itemNumId)

        const line = `${new Date().toISOString()};${event.lootedBy};${itemId};${
          event.quantity
        };${event.lootedFrom};${itemName}`

        console.info(line)

        logger.log(line)
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
