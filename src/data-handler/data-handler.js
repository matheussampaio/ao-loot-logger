const RequestData = require('./request-data')
const ResponseData = require('./response-data')
const EventData = require('./event-data')
const Logger = require('../utils/logger')
const ParserError = require('./parser-error')

class DataHandler {
  static handleEventData(event) {
    try {
      if (!event || event.eventCode !== 1) {
        return
      }

      const eventId = event?.parameters?.[252]

      switch (eventId) {
        case EventData.EvInventoryPutItems.EventId:
          return EventData.EvInventoryPutItems.handle(event)

        case EventData.EvNewCharacter.EventId:
          return EventData.EvNewCharacter.handle(event)

        case EventData.EvNewEquipmentItem.EventId:
        case EventData.EvNewSimpleItem.EventId:
          return EventData.EvNewSimpleItem.handle(event)

        case EventData.EvNewLoot.EventId:
          return EventData.EvNewLoot.handle(event)

        case EventData.EvAttachItemContainer.EventId:
          return EventData.EvAttachItemContainer.handle(event)

        case EventData.EvDetachItemContainer.EventId:
          return EventData.EvDetachItemContainer.handle(event)

        case EventData.EvCharacterStats.EventId:
          return EventData.EvCharacterStats.handle(event)

        // case 133:
        // return EventData.EvGuildStats(event)

        case EventData.EvOtherGrabbedLoot.EventId:
          return EventData.EvOtherGrabbedLoot.handle(event)

        // case EventData.EvPartyLootItems.EventId:
        //   return EventData.EvPartyLootItems.handle(event)

        // case EventData.EvPartyLootItemsRemoved.EventId:
        //   return EventData.EvPartyLootItemsRemoved.handle(event)

        case EventData.EvNewLootChest.EventId:
          return EventData.EvNewLootChest.handle(event)

        case EventData.EvUpdateLootChest.EventId:
          return EventData.EvUpdateLootChest.handle(event)

        default:
          if (process.env.LOG_UNPROCESSED) Logger.silly('handleEventData', event.parameters)
      }
    } catch (error) {
      if (!error instanceof ParserError) {
        Logger.error(error, event)
      }
    }
  }

  static handleRequestData(event) {
    const eventId = event?.parameters?.[253]

    try {
      switch (eventId) {
        case RequestData.OpInventoryMoveItem.EventId:
          return RequestData.OpInventoryMoveItem.handle(event)

        default:
          if (process.env.LOG_UNPROCESSED) Logger.silly('handleRequestData', event.parameters)
      }
    } catch (error) {
      Logger.error(error, event)
    }
  }

  static handleResponseData(event) {
    const eventId = event?.parameters?.[253]

    try {
      switch (eventId) {
        case ResponseData.OpJoin.EventId:
          return ResponseData.OpJoin.handle(event)

        default:
          if (process.env.LOG_UNPROCESSED) Logger.silly('handleResponseData', event.parameters)
      }
    } catch (error) {
      Logger.error(error, event)
    }
  }
}

module.exports = DataHandler
