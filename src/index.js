const { Cap, decoders } = require('cap')
const path = require('path')

const items = require('./items')
const logger = require('./logger')
const LootLogger = require('./loot-logger')
const { onEventParser } = require('./parser')
const checkNewVersion = require('./check-new-version')
const { green, gray, red, uuidStringify } = require('./utils')
const package = require('../package.json')

const lootLogger = new LootLogger()

const playersDb = {}
const guildDb = {}
const caps = []

// let alive = true

// function keepAlive() {
//   if (alive) {
//     setTimeout(keepAlive, 1000)
//   }
// }

main().catch((error) => {
  logger.error('exception', error)
})

async function main() {
  // keepAlive()

  // set terminal title
  process.stdout.write(
    String.fromCharCode(27) +
      ']0;' +
      `AO Loot Logger - v${package.version}` +
      String.fromCharCode(7)
  )

  console.info(`AO Loot Logger - v${package.version}\n`)

  await Promise.all([checkNewVersion(), items.init()])

  const addrs = []

  for (const device of Cap.deviceList()) {
    for (const address of device.addresses) {
      if (address.addr.match(/\d+\.\d+\.\d+\.\d+/)) {
        const infos = []

        if (device.name) {
          infos.push(device.name)
        }

        if (device.description) {
          infos.push(device.description)
        }

        if (infos.length) {
          console.info(`Listening to ${infos.join(' - ')}`)
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

  process.once('SIGTERM', () => {
    // alive = false

    process.stdin.removeListener(onKeypressed)

    for (const cap of caps) {
      cap.close()
    }
  })

  console.info(
    'Logs will be saved to',
    path.join(process.cwd(), lootLogger.logFileName)
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
    lootLogger.createNewLogFileName()
    lootLogger.close()

    console.info(
      `Logs will be saved to ${path.join(
        process.cwd(),
        lootLogger.logFileName
      )}\n`
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

  caps.push(c)

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
      onEventParser(slice, handleEvent)
    } catch (error) {
      logger.error('error parsing packet', { error, slice })
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

function handleEvent(event) {
  if (!event || event.code !== 1) {
    return
  }

  // const str = JSON.stringify(event, (key, value) =>
  //   typeof value === 'bigint' ? value.toString() + 'n' : value
  // )

  const eventId = event?.parameters?.[252]

  switch (eventId) {
    case 130: // CharacterStats
      return onCharacterStats(event)

    case 133: // GuildStats
      return onGuildStats(event)

    case 26: // NewCharacter
      return onNewCharacter(event)

    case 256: // OtherGrabbedLoot
      return onOtherGrabbedLoot(event)
  }
}

function onCharacterStats(event) {
  const playerName = event.parameters[1]
  const guildName = event.parameters[2]
  const allianceName = event.parameters[4]

  if (guildName && guildDb[guildName] == null) {
    guildDb[guildName] = { guildName }
  }

  if (allianceName && guildDb[guildName].allianceName !== allianceName) {
    guildDb[guildName].allianceName = allianceName
  }

  playersDb[playerName] = guildDb[guildName]
}

function onGuildStats(event) {
  const guildName = event.parameters[1]
  const uuid = uuidStringify(event.parameters[2])

  if (guildName && guildDb[guildName] == null) {
    guildDb[guildName] = { uuid, guildName }
  }

  if (uuid && guildDb[guildName] && guildDb[guildName].uuid !== uuid) {
    guildDb[guildName].uuid = uuid
  }
}

function onNewCharacter(event) {
  const playerName = event.parameters[1]
  const guildName = event.parameters[8]
  const allianceName = event.parameters[43]

  if (guildName && guildDb[guildName] == null) {
    guildDb[guildName] = { guildName }
  }

  if (
    allianceName &&
    guildDb[guildName] &&
    guildDb[guildName].allianceName !== allianceName
  ) {
    guildDb[guildName].allianceName = allianceName
  }

  playersDb[playerName] = guildDb[guildName]
}

function onOtherGrabbedLoot(event) {
  if (event.size !== 6) {
    return
  }

  const lootedFrom = event.parameters[1]
  const lootedBy = event.parameters[2]
  const itemNumId = event.parameters[4]
  const quantity = event.parameters[5]

  const { itemId, itemName } = items.get(itemNumId)

  const date = new Date()

  lootLogger.write({
    date,
    itemId,
    quantity,
    itemName,
    lootedBy: {
      allianceName: playersDb?.[lootedBy]?.allianceName,
      guildName: playersDb?.[lootedBy]?.guildName,
      playerName: lootedBy
    },
    lootedFrom: {
      allianceName: playersDb?.[lootedFrom]?.allianceName,
      guildName: playersDb?.[lootedFrom]?.guildName,
      playerName: lootedFrom
    }
  })

  console.info(
    formatLootLog({
      date,
      lootedBy,
      lootedFrom,
      quantity,
      itemName
    })
  )
}

function formatLootLog({ date, lootedBy, itemName, lootedFrom, quantity }) {
  const hours = date.getUTCHours().toString().padStart(2, '0')
  const minute = date.getUTCMinutes().toString().padStart(2, '0')
  const seconds = date.getUTCSeconds().toString().padStart(2, '0')

  return `${hours}:${minute}:${seconds} UTC: ${formatPlayerName(
    lootedBy,
    green
  )} looted ${quantity}x ${itemName} from ${red(lootedFrom)}.`
}

function formatPlayerName(playerName, color) {
  let result = ''

  const allianceName = playersDb?.[playerName]?.allianceName

  if (allianceName) {
    result += gray('{' + allianceName + '}') + ' '
  }

  const guildName = playersDb?.[playerName]?.guildName

  if (guildName) {
    result += gray('[' + guildName + ']') + ' '
  }

  result += color ? color(playerName) : playerName

  return result
}
