class ContainersStorage {
  constructor() {
    this.containers = {}
  }

  add({ uuid, id, type, owner, items = {} }) {
    this.containers[id] = { uuid, id, type, owner, items }

    return this.containers[id]
  }

  deleteById(id) {
    delete this.containers[id]
  }

  deleteByUUID(uuid) {
    const container = this.getByUUID(uuid)

    if (container) {
      delete this.containers[container.id]
    }

    return container
  }

  getById(id) {
    return this.containers[id]
  }

  getByUUID(uuid) {
    return Object.values(this.containers).find((c) => c.uuid === uuid)
  }
}

module.exports = ContainersStorage
