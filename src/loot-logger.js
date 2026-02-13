const fs = require('fs')

const { red, green } = require('./utils/colors')
const formatPlayerName = require('./utils/format-player-name')

class LootLogger {
  constructor() {
    this.stream = null
    this.logFileName = null

    this.createNewLogFileName()
  }

  init() {
    if (this.stream != null) {
      this.stream.close()
    }

    this.stream = fs.createWriteStream(this.logFileName, { flags: 'a' })

    const header = [
      'timestamp_utc',
      'looted_by__alliance',
      'looted_by__guild',
      'looted_by__name',
      'item_id',
      'item_name',
      'quantity',
      'looted_from__alliance',
      'looted_from__guild',
      'looted_from__name'
    ].join(';')

    this.stream.write(header + '\n')

    process.on('exit', () => {
      this.close()
    })
  }

  createNewLogFileName() {
    const d = new Date()

    const datetime = [
      d.getFullYear(),
      d.getMonth() + 1,
      d.getDate(),
      d.getHours(),
      d.getMinutes(),
      d.getSeconds()
    ]
      .map((n) => n.toString().padStart(2, '0'))
      .join('-')

    this.logFileName = `loot-events-${datetime}.txt`
  }

  write({ date, itemId, quantity, itemName, lootedBy, lootedFrom }) {
    if (this.stream == null) {
      this.init()
    }

    const line = [
      date.toISOString(),
      lootedBy.allianceName ?? '',
      lootedBy.guildName ?? '',
      lootedBy.playerName,
      itemId,
      itemName,
      quantity,
      lootedFrom.allianceName ?? '',
      lootedFrom.guildName ?? '',
      lootedFrom.playerName
    ].join(';')

    this.stream.write(line + '\n')

    console.info(
      this.formatLootLog({
        date,
        lootedBy,
        lootedFrom,
        quantity,
        itemName
      })
    )
  }

  formatLootLog({ date, lootedBy, itemName, lootedFrom, quantity }) {
    const hours = date.getUTCHours().toString().padStart(2, '0')
    const minute = date.getUTCMinutes().toString().padStart(2, '0')
    const seconds = date.getUTCSeconds().toString().padStart(2, '0')

    return `${hours}:${minute}:${seconds} UTC: ${formatPlayerName(
      lootedBy,
      green
    )} looted ${quantity}x ${itemName} from ${formatPlayerName(
      lootedFrom,
      red
    )}.`
  }

  close() {
    if (this.stream != null) {
      this.stream.close()
    }

    this.stream = null
  }
}

module.exports = new LootLogger()
