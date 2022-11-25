const { initializeApp } = require("firebase/app")
const { getFirestore, doc, getDoc } = require("firebase/firestore")

const { name, version } = require('../package.json')

const app = initializeApp({ projectId: name })
const db = getFirestore(app)

const read = async (collection, docId, defaultValue) => {
  const docRef = doc(db, collection, docId)
  const docSnap = await getDoc(docRef)

  return docSnap.exists() ? docSnap.data() : defaultValue
}

class Config {
  constructor() {
    this.events = {}
    this.players = {}

    this.ROTATE_LOGGER_FILE_KEY = 'd'
    this.RESTART_NETWORK_FILE_KEY = 'r'
    this.TITLE = `AO Loot Logger - v${version}`
  }

  async init() {
    this.events = await read("events", "v1", {})
    this.players = await read("players", "v1", {})
  }
}

module.exports = new Config()
