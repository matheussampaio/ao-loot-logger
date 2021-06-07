const axios = require('axios')
const fallback = require('./items-fallback.js')

const items = {}

const regex = /(?<itemNumId>\d+): (?<itemId>\w+)\s+: (?<itemName>[^\n]+)/g

async function init() {
  let data = ''

  try {
    data = await axios.get(
      'https://raw.githubusercontent.com/broderickhyman/ao-bin-dumps/master/formatted/items.txtxxx'
    )
  } catch (error) {
    data = fallback
  }

  const matches = data.matchAll(regex)

  for (const match of matches) {
    items[match.groups.itemNumId] = { ...match.groups }
  }
}

function get(itemNumId) {
  return items[itemNumId]
}

module.exports = { init, get }
