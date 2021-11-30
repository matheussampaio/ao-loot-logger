class LootsStorage {
  constructor() {
    this.loots = {}
  }

  add({ objectId, itemId, itemName, quantity, owner }) {
    this.loots[objectId] = { objectId, itemId, itemName, quantity, owner }

    return this.loots[objectId]
  }

  deleteById(id) {
    delete this.loots[id]
  }

  getById(objectId) {
    return this.loots[objectId]
  }

  getByUUID(uuid) {
    return Object.values(this.loots).find((l) => l.uuid === uuid)
  }
}

module.exports = LootsStorage
