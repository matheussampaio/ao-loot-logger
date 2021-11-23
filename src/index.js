const { Cap, decoders } = require('cap')
const path = require('path')

const items = require('./items')
const logger = require('./logger')
const LootLogger = require('./loot-logger')
const { onEventParser } = require('./parser')
const checkNewVersion = require('./check-new-version')
const { green, gray, white } = require('./utils')
const package = require('../package.json')

const lootLogger = new LootLogger()

const playersDb = {}
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

// eventsDump = {}

// setInterval(() => {
//   console.log(eventsDump)

//   eventsDump = {}
// }, 60000)

function handleEvent(event) {
  if (!event || event.code !== 1) {
    return
  }

  const eventId = event?.parameters?.[252]

  switch (eventId) {
    // case 1: // Leave
    // case 6: // HealthUpdate
    // case 7: // EnergyUpdate
    // case 10: // ActiveSpellEffectsUpdate
    // case 12: // Attack
    // case 13: // CastStart
    // case 15: // CastCancel
    // case 17: // CastFinished
    // case 18: // CastSpell
    // case 19: // CastHit
    // case 20: // CastHits
    // case 21: // ChannelingEnded
    // case 34: // NewSilverObject
    // case 35: // NewBuilding
    // case 52: // TakeSilver
    // case 53: // ActionOnBuildingStart
    // case 54: // ActionOnBuildingCancel
    // case 55: // ActionOnBuildingFinished
    // case 56: // ItemRerollQualityStart
    // case 58: // ItemRerollQualityFinished
    // case 62: // CraftItemFinished
    // case 65: // ChatSay
    // case 68: // PlayEmote
    // case 69: // StopEmote
    // case 96: // InvitedToGuild
    // case 78: // Respawn
    // case 80: // CharacterEquipmentChanged  *****
    // case 81: // RegenerationHealthChanged
    // case 82: // RegenerationEnergyChanged
    // case 83: // RegenerationMountHealthChanged
    // case 86: // RegenerationPlayerComboChanged
    // case 88: // NewLoot *****
    // case 103: // NewSpellEffectArea
    // case 132: // ForcedMovement
    // case 148: // TimeSync *****
    // case 150: // ChangeMountSkin
    // case 151: // GameEvent *****
    // case 153: // Died
    // case 154: // KnockedDown
    // case 158: // MatchTimeLineEventEvent
    // case 196: // MountStart
    // case 197: // MountCancel
    // case 247: // ArenaRegistrationInfo
    // case 250: // EnteringArenaLockStart
    // case 255: // Unknown255
    // case 290: // UnrestrictedPvpZoneUpdate
    // case 336: // SteamAchievementCompleted
    //   return

    case 25: // NewCharacter
      return onNewCharacter(event)

    case 257: // OtherGrabbedLoot
      return onOtherGrabbedLoot(event)
  }

  // if (eventsDump[eventId] == null) {
  //   eventsDump[eventId] = { count: 0, latest: null }
  // }

  // eventsDump[eventId].count += 1
  // eventsDump[eventId].latest = event
}

function onNewCharacter(event) {
  const playerName = event.parameters[1]
  const guildName = event.parameters[8]
  const allianceName = event.parameters[43]

  playersDb[playerName] = { guildName, allianceName }
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

  const line = [
    date.toISOString(),
    playersDb?.[lootedBy]?.allianceName ?? '',
    playersDb?.[lootedBy]?.guildName ?? '',
    lootedBy,
    itemId,
    quantity,
    playersDb?.[lootedFrom]?.allianceName ?? '',
    playersDb?.[lootedFrom]?.guildName ?? '',
    lootedFrom,
    itemName
  ].join(';')

  lootLogger.write(line)

  const prettyLine = `${date.toLocaleTimeString()}: ${formatPlayerName(
    lootedBy
  )} looted ${quantity}x ${green(itemName)} from ${formatPlayerName(
    lootedFrom
  )}`

  console.info(prettyLine)
}

function formatPlayerName(playerName) {
  let result = ''

  const allianceName = playersDb?.[playerName]?.allianceName

  if (allianceName) {
    result += gray('{' + allianceName + '}') + ' '
  }

  const guildName = playersDb?.[playerName]?.guildName

  if (guildName) {
    result += gray('[' + guildName + ']') + ' '
  }

  result += white(playerName)

  return
}
