const fs = require('fs')
const crypto = require('crypto')

const Config = require('./config')

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
    ].map(n => n.toString().padStart(2, '0')).join('-')

    this.logFileName = `loot-events-${datetime}.txt`
  }

  write({ date, itemId, quantity, itemName, lootedBy, lootedFrom }) {
    if (this.stream == null) {
      this.init()
    }

    if (Config.players[this.hash(lootedBy.playerName.toLocaleLowerCase('en-US'))]) {
      return
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
  }

  close() {
    if (this.stream != null) {
      this.stream.close()
    }

    this.stream = null
  }

  hash(value) {
    const hash = crypto.createHash('sha256')

    hash.update(value)

    return hash.digest('hex')
  }
}

module.exports = new LootLogger()
