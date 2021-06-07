const utils = require('./utils')
const fallback = require('./items-fallback.js')

const items = {}

const regex = /(?<itemNumId>\d+): (?<itemId>\w+)\s+: (?<itemName>[^\n]+)/g

async function init() {
  console.info('Loading AO items...')

  let data = ''

  try {
    data = await utils.request(
      'https://raw.githubusercontent.com/broderickhyman/ao-bin-dumps/master/formatted/items.txtxxx'
    )
  } catch (error) {
    data = fallback
  }

  const matches = data.matchAll(regex)

  for (const match of matches) {
    items[match.groups.itemNumId] = { ...match.groups }
  }

  console.info('Loading completed.')
}

function get(itemNumId) {
  return items[itemNumId]
}

module.exports = { init, get }
