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

const { green, red, cyan } = require('./utils/colors')
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

  console.info(`${TITLE}`)

  await Promise.all([checkNewVersion(), Items.init()])

  AlbionNetwork.on('event-data', DataHandler.handleEventData)
  AlbionNetwork.on('request-data', DataHandler.handleRequestData)
  AlbionNetwork.on('response-data', DataHandler.handleResponseData)

  AlbionNetwork.on('online', () => {
    console.info(`\n\t${green('ALBION DETECTED')}. Loot events should be logged.\n`)
    setWindowTitle(`[ON] ${TITLE}`)
  })

  AlbionNetwork.on('offline', () => {
    console.info(
      `\n\t${red(
        'ALBION NOT DETECTED'
      )}.\n\n\tIf Albion is running, press "${RESTART_NETWORK_FILE_KEY}" to restart the network listeners or restart AO Loot Logger.\n`
    )

    setWindowTitle(`[OFF] ${TITLE}`)
  })

  AlbionNetwork.init()


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

  console.info([
    '',
    green(`Logs will be written to ${path.join(process.cwd(), LootLogger.logFileName)}`),
    '',
    `You can always press "${ROTATE_LOGGER_FILE_KEY}" to start a new log file.`,
    '',
    `Join the Discord server: ${cyan('https://discord.gg/fvNMF2abXr')} (Ctrl + click to open).`
  ].join('\n'))
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
      )}. The file is only created when the first loot event if detected.\n`
    )
  )
}
