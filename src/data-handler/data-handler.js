const RequestData = require('./request-data')
const ResponseData = require('./response-data')
const EventData = require('./event-data')
const Logger = require('../utils/logger')

class DataHandler {
  static handleEventData(event) {
    try {
      if (!event || event.eventCode !== 1) {
        return
      }

      const eventId = event?.parameters?.[252]

      switch (eventId) {
        case 24: // InventoryPutItem
          return EventData.EvInventoryPutItem(event)

        case 26: // NewCharacter
          return EventData.EvNewCharacter(event)

        case 27: // NewEquipmentItem
        case 28: // NewSimpleItem
          return EventData.EvNewItem(event)

        case 87: // NewLoot
          return EventData.EvNewLoot(event)

        case 88: // AttachItemContainer
          return EventData.EvAttachItemContainer(event)

        case 89: // DetachItemContainer
          return EventData.EvDetachItemContainer(event)

        case 130: // CharacterStats
          return EventData.EvCharacterStats(event)

        // case 133: // GuildStats
        // return EventData.EvGuildStats(event)

        case 256: // OtherGrabbedLoot
          return EventData.EvOtherGrabbedLoot(event)

        case 278: // PartyLootItems
          return EventData.EvPartyLootItems(event)

        case 279: // PartyLootItemsRemoved
          return EventData.EvPartyLootItemsRemoved(event)

        case 367: // onNewLootChest
          return EventData.EvNewLootChest(event)

        case 368: // onUpdateLootChest
          return EventData.EvUpdateLootChest(event)

        default:
          if (process.env.LOG_UNPROCESSED) Logger.silly('handleEventData', event.parameters)
      }
    } catch (error) {
      Logger.error(error, event)
    }
  }

  static handleRequestData(event) {
    const eventId = event?.parameters?.[253]

    try {
      switch (eventId) {
        case 30: // opJoin
          return RequestData.OpInventoryMoveItem(event)

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
        case 2: // opJoin
          return ResponseData.OpJoin(event)

        default:
          if (process.env.LOG_UNPROCESSED) Logger.silly('handleResponseData', event.parameters)
      }
    } catch (error) {
      Logger.error(error, event)
    }
  }
}

module.exports = DataHandler
