const { version } = require('../package.json')

// Photon/Albion event and operation codes (fixed for the game protocol version in use)
const EVENTS = {
  EvInventoryPutItem: 26,
  EvNewCharacter: 29,
  EvNewEquipmentItem: 30,
  EvNewSiegeBannerItem: 31,
  EvNewSimpleItem: 32,
  EvNewLoot: 98,
  EvAttachItemContainer: 99,
  EvDetachItemContainer: 100,
  EvCharacterStats: 143,
  EvOtherGrabbedLoot: 275,
  OpJoin: 2,
  OpInventoryMoveItem: 29
}

class Config {
  constructor() {
    this.events = EVENTS

    this.ROTATE_LOGGER_FILE_KEY = 'd'
    this.RESTART_NETWORK_FILE_KEY = 'r'
    this.TITLE = `AO Loot Logger - v${version}`
  }
}

module.exports = new Config()
