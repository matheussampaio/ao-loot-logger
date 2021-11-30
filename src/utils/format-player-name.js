const { gray } = require('./colors')

function formatPlayerName(player, color) {
  let name = ''

  if (player.allianceName) {
    name += gray('{' + player.allianceName + '}') + ' '
  }

  if (player.guildName) {
    name += gray('[' + player.guildName + ']') + ' '
  }

  name += color ? color(player.playerName) : player.playerName

  return name
}

module.exports = formatPlayerName
