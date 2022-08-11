const axios = require('axios')

const { version } = require('../package.json')
const { green } = require('./utils/colors')
const Logger = require('./utils/logger')
const isProd = require('./utils/is-prod')

const url =
  'https://bit.ly/3JLkE2x'

async function checkNewVersion() {
  if (!isProd()) {
    return
  }

  let response

  try {
    response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:91.0) Gecko/20100101 Firefox/91.0'
      }
    })
  } catch (error) {
    Logger.debug('error fetching github api for version', error)
  }

  if (response == null) {
    return
  }

  const { data } = response

  if (data.tag_name !== version) {
    const latestVersion = parseVersion(data.tag_name)
    const currentVersion = parseVersion(version)

    const isNewVersionAvailable =
      currentVersion.major < latestVersion.major ||
      currentVersion.minor < latestVersion.minor ||
      currentVersion.patch < latestVersion.patch

    if (isNewVersionAvailable) {
      console.info(
        green(
          `New AO Loot Logger ${data.tag_name} available: https://github.com/matheussampaio/ao-loot-logger/releases/latest\n`
        )
      )
    }
  }
}

function parseVersion(version) {
  const re = /^v?(?<major>\d+).(?<minor>\d+).(?<patch>\d+)/
  const match = version.match(re)

  if (match == null) {
    return {
      major: 0,
      minor: 0,
      patch: 0
    }
  }

  return {
    major: parseInt(match.groups.major, 10),
    minor: parseInt(match.groups.minor, 10),
    patch: parseInt(match.groups.patch, 10)
  }
}

module.exports = checkNewVersion
