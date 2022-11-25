const AlbionNetwork = require('../src/network/albion-network')

const EventData = require('../src/data-handler/event-data')
const RequestData = require('../src/data-handler/request-data')
const ResponseData = require('../src/data-handler/response-data')

const Logger = require('../src/utils/logger')
const ParserError = require('../src/data-handler/parser-error')
const Config = require('../src/config')

async function main() {
  Logger.transports[1].level = 'warn'

  Config.init()

  AlbionNetwork.on('event-data', (data) => analyze('event-data', EventData, data))
  AlbionNetwork.on('request-data', (data) => analyze('request-data', RequestData, data))
  AlbionNetwork.on('response-data', (data) => analyze('response-data', ResponseData, data))

  AlbionNetwork.init()
}

function analyze(type, events, event) {
  // console.log(event)

  for (const eventName in events) {
    const Event = events[eventName]

    try {
      const result = Event.parse(event)

      if (result == null) {
        continue
      }

      const diff = Math.abs(Config.events[Event.name] - (event.parameters[252] ?? event.parameters[253]))

      if (diff >= 10) {
        continue
      }

      console.info(`diff=${diff} [${type}] ${eventName}:`, event.parameters)
    } catch (error) {
      if (!error instanceof ParserError) {
        console.error(error)
      }
    }
  }
}

main().catch(console.error)
