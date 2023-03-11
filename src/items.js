const axios = require('axios')

const fallback = require('./items-fallback')

class Items {
  constructor() {
    this.items = {}
  }

  async init() {
    let data = ''

    try {
      const response = await axios.get(
        'https://raw.githubusercontent.com/ao-data/ao-bin-dumps/master/formatted/items.txt'
      )

      data = response.data
    } catch (error) {
      data = fallback
    }

    for (const line of data.trim().split('\n')) {
      const raw = line.split(':')

      const itemNumId = parseInt(raw[0].trim(), 10)
      const itemId = raw[1].trim()
      const itemName = raw[2] != null ? raw[2].trim() : itemId

      this.items[itemNumId] = {
        itemNumId,
        itemId,
        itemName
      }
    }
  }

  get(itemNumId) {
    return this.items[itemNumId]
  }
}

module.exports = new Items()
