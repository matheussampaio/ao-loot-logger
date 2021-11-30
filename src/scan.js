const AlbionNetwork = require('./network/albion-network')

const EventData = require('./data-handler/event-data')
const RequestData = require('./data-handler/request-data')
const ResponseData = require('./data-handler/response-data')

main()

const searching = {
  EvNewItem: EventData.EvNewItem,
  OpJoin: ResponseData.OpJoin
}

async function main() {
  AlbionNetwork.on('event-data', (data) => analyze('event-data', data))
  AlbionNetwork.on('request-data', (data) => analyze('request-data', data))
  AlbionNetwork.on('response-data', (data) => analyze('response-data', data))

  AlbionNetwork.init()
}

function analyze(type, data) {
  for (const eventName of Object.values(searching)) {
    const event = searching[eventName]

    if (event.matches(data)) {
      delete searching[eventName]

      console.info(`${eventName} match:`, type, data)
    }
  }
}
