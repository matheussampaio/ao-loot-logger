const axios = require('axios')

const package = require('../package.json')

const url =
  'https://api.github.com/repos/matheussampaio/ao-loot-logger/releases/latest'

async function checkNewVersion() {
  // only run if bundled by pkg (production exe)
  if (process.pkg == null) {
    return
  }

  let response

  try {
    response = await axios.get(url)
  } catch {}

  if (response == null) {
    return
  }

  const { data } = response

  if (data.tag_name !== package.version) {
    console.info(
      'New version available. Download it from https://github.com/matheussampaio/ao-loot-logger/releases/latest'
    )
  }
}

module.exports = checkNewVersion
