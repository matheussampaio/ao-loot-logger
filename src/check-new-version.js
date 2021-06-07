const axios = require('axios')

const package = require('../package.json')

const url =
  'https://api.github.com/repos/matheussampaio/ao-loot-logger/releases/latest'

async function checkNewVersion() {
  try {
    const { data } = await axios.get(url)

    if (data.tag_name !== package.version) {
      console.info(
        'New version available. Download it from https://github.com/matheussampaio/ao-loot-logger/releases/latest'
      )
    }
  } catch (error) {}
}

module.exports = checkNewVersion
