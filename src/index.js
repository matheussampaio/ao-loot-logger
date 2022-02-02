process.on('uncaughtException', async (error, source) => {
  console.error(error)

  await new Promise((resolve) => setTimeout(resolve, 25000))
})

process.on('unhandledRejection', async (reason, promise) => {
  console.error(reason)

  await new Promise((resolve) => setTimeout(resolve, 25000))
})

const LootLogger = require('./loot-logger')

const path = require('path')

const { green, red } = require('./utils/colors')
const AlbionNetwork = require('./network/albion-network')
const checkNewVersion = require('./check-new-version')
const DataHandler = require('./data-handler/data-handler')
const Items = require('./items')
const KeyboardInput = require('./keyboard-input')
const { version } = require('../package.json')

const CTRL_C = '\u0003'
const ROTATE_LOGGER_FILE_KEY = 'd'
const RESTART_NETWORK_FILE_KEY = 'r'
const TITLE = `AO Loot Logger - v${version}`

main()

async function main() {
  setWindowTitle(TITLE)

  console.info(`${TITLE}\n`)

  await Promise.all([checkNewVersion(), Items.init()])

  AlbionNetwork.on('add-listener', (device) => {
    console.info(`Listening to ${device.name}`)
  })

  AlbionNetwork.on('event-data', DataHandler.handleEventData)
  AlbionNetwork.on('request-data', DataHandler.handleRequestData)
  AlbionNetwork.on('response-data', DataHandler.handleResponseData)

  AlbionNetwork.on('online', () => {
    console.info(`\n\t${green('ONLINE')}. Loot events should be detected.\n`)
    setWindowTitle(`[ON] ${TITLE}`)
  })

  AlbionNetwork.on('offline', () => {
    console.info(
      `\n\t${red(
        'OFFLINE'
      )}.\n\n\tPress "${RESTART_NETWORK_FILE_KEY.toUpperCase()}" to restart the network listeners or restart AO Loot Logger.\n`
    )

    setWindowTitle(`[OFF] ${TITLE}`)
  })

  AlbionNetwork.init()

  console.info(
    green(
      '\nLogs will be written to ' +
        path.join(process.cwd(), LootLogger.logFileName)
    )
  )

  KeyboardInput.on('key-pressed', (key) => {
    switch (key) {
      case CTRL_C:
        return exit()

      case RESTART_NETWORK_FILE_KEY.toLocaleLowerCase():
      case RESTART_NETWORK_FILE_KEY.toUpperCase():
        return restartNetwork()

      case ROTATE_LOGGER_FILE_KEY.toLocaleLowerCase():
      case ROTATE_LOGGER_FILE_KEY.toUpperCase():
        return rotateLogFile()
    }
  })

  KeyboardInput.init()

  console.info(
    `\n\tYou can always press "${ROTATE_LOGGER_FILE_KEY.toUpperCase()}" to start a new log file.\n`
  )
}

function restartNetwork() {
  console.info(`\n\tRestarting network listeners...\n`)

  AlbionNetwork.close()
  AlbionNetwork.init()

  setWindowTitle(TITLE)
}

function setWindowTitle(title) {
  process.stdout.write(
    String.fromCharCode(27) + ']0;' + title + String.fromCharCode(7)
  )
}

function exit() {
  console.info('Exiting...')

  process.exit(0)
}

function rotateLogFile() {
  LootLogger.close()
  LootLogger.createNewLogFileName()

  console.info(
    green(
      `From now on, logs will be written to ${path.join(
        process.cwd(),
        LootLogger.logFileName
      )}\n`
    )
  )
}
