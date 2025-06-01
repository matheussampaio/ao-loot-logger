const RequestData = require('./request-data')
const ResponseData = require('./response-data')
const EventData = require('./event-data')
const Logger = require('../utils/logger')
const ParserError = require('./parser-error')
const Config = require('../config')

class DataHandler {
  static handleEventData(event) {
    try {
      if (!event || event.eventCode !== 1) {
        return
      }

      const eventId = event?.parameters?.[252]

      switch (eventId) {
        // case Config.events.EvInventoryPutItem:
        //   return EventData.EvInventoryPutItem.handle(event)

        case Config.events.EvNewCharacter:
          return EventData.EvNewCharacter.handle(event)

        case Config.events.EvNewEquipmentItem:
          return EventData.EvNewEquipmentItem.handle(event)

        case Config.events.EvNewSiegeBannerItem:
          return EventData.EvNewSiegeBannerItem.handle(event)

        case Config.events.EvNewSimpleItem:
          return EventData.EvNewSimpleItem.handle(event)

        case Config.events.EvNewLoot:
          return EventData.EvNewLoot.handle(event)

        case Config.events.EvAttachItemContainer:
          return EventData.EvAttachItemContainer.handle(event)

        case Config.events.EvDetachItemContainer:
          return EventData.EvDetachItemContainer.handle(event)

        case Config.events.EvCharacterStats:
          return EventData.EvCharacterStats.handle(event)

        case Config.events.EvOtherGrabbedLoot:
          return EventData.EvOtherGrabbedLoot.handle(event)

        case Config.events.EvNewLootChest:
          return EventData.EvNewLootChest.handle(event)

        // case Config.events.EvUpdateLootChest:
        //   return EventData.EvUpdateLootChest.handle(event)

        default:
          if (process.env.LOG_UNPROCESSED)
            Logger.silly('handleEventData', event.parameters)
      }
    } catch (error) {
      if (error instanceof ParserError) {
        // Logger.warn(error, event)
      } else {
        // Logger.error(error, event)
      }
    }
  }

  static handleRequestData(event) {
    const eventId = event?.parameters?.[253]

    try {
      switch (eventId) {
        case Config.events.OpInventoryMoveItem:
          return RequestData.OpInventoryMoveItem.handle(event)

        default:
          if (process.env.LOG_UNPROCESSED) Logger.silly('handleRequestData', event.parameters)
      }
    } catch (error) {
      if (error instanceof ParserError) {
        Logger.warn(error, event)
      } else {
        Logger.error(error, event)
      }
    }
  }

  static handleResponseData(event) {
    const eventId = event?.parameters?.[253]

    try {
      switch (eventId) {
        case Config.events.OpJoin:
          return ResponseData.OpJoin.handle(event)

        default:
          if (process.env.LOG_UNPROCESSED) Logger.silly('handleResponseData', event.parameters)
      }
    } catch (error) {
      if (error instanceof ParserError) {
        Logger.warn(error, event)
      } else {
        Logger.error(error, event)
      }
    }
  }
}

module.exports = DataHandler
