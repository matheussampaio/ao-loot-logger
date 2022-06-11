const AlbionNetwork = require('./network/albion-network')

const EventData = require('./data-handler/event-data')
const RequestData = require('./data-handler/request-data')
const ResponseData = require('./data-handler/response-data')

const Logger = require('./utils/logger')
const ParserError = require('./data-handler/parser-error')

async function main() {
  Logger.transports[1].level = 'warn'

  AlbionNetwork.on('event-data', (data) => analyze('event-data', EventData, data))
  AlbionNetwork.on('request-data', (data) => analyze('request-data', RequestData, data))
  AlbionNetwork.on('response-data', (data) => analyze('response-data', ResponseData, data))

  AlbionNetwork.init()
}

function analyze(type, events, event) {
  for (const eventName in events) {
    const Event = events[eventName]

    try {
      const result = Event.parse(event)

      if (result == null) {
        continue
      }
        
      const diff = Math.abs(Event.EventId - (event.parameters[252] ?? event.parameters[253]))

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
