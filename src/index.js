const { Cap, decoders } = require('cap')

const items = require('./items')
const logger = require('./logger')
const { onEventParser } = require('./parser')

main()

async function main() {
  await items.init()

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

  logger.init()
}

function onKeypressed(key) {
  if (key === '\u0003') {
    process.exit()
  }

  if (key.toLowerCase() === 'd') {
    logger.init()
  }
}

function addListener(addr) {
  const c = new Cap()

  const filter = 'ip and udp port 5056'
  const bufSize = 10 * 65536
  const buffer = Buffer.alloc(65535)
  const device = Cap.findDevice(addr)

  const linkType = c.open(device, filter, bufSize, buffer)

  if (linkType !== 'ETHERNET') {
    return c.close()
  }

  process.on('SIGTERM', () => {
    c.close()
  })

  if (c.setMinBytes != null) {
    c.setMinBytes(0)
  }

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

    let event

    try {
      event = onEventParser(
        buffer.slice(ret.offset, ret.offset + ret.info.length)
      )
    } catch {}

    if (event == null) {
      return
    }

    const { itemId, itemName } = items.get(event.itemNumId)

    const line = `${new Date().toISOString()};${event.lootedBy};${itemId};${
      event.quantity
    };${event.lootedFrom};${itemName}`

    console.info(line)

    logger.log(line)
  })
}