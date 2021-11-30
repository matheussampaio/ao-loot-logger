const { red, green } = require('./colors')
const formatPlayerName = require('./format-player-name')

function formatLootLog({ date, lootedBy, itemName, lootedFrom, quantity }) {
  const hours = date.getUTCHours().toString().padStart(2, '0')
  const minute = date.getUTCMinutes().toString().padStart(2, '0')
  const seconds = date.getUTCSeconds().toString().padStart(2, '0')

  return `${hours}:${minute}:${seconds} UTC: ${formatPlayerName(
    lootedBy,
    green
  )} looted ${quantity}x ${itemName} from ${red(lootedFrom.playerName)}.`
}

module.exports = formatLootLog
