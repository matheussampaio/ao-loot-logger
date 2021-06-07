const items = require('./items')

const { onEventParser } = require('./parser')

dev()

async function dev() {
  await items.init()

  const packets = [
    `00 00 00 01 99 2E EC FF 6B EE
    BA 1F 06 00 01 00 00 00 00 34
    00 00 01 B8 F3 04 01 00 06 00
    6B 1A C2 01 73 00 06 42 65 6C
    6C 61 67 02 73 00 06 42 65 6C
    6C 61 67 04 6B 01 D0 05 62 02
    FC 6B 01 04`,
    `00 00 00 01 99 2F 09 CE 6B EE
    BA 1F 06 00 01 00 00 00 00 34
    00 00 01 B9 F3 04 01 00 06 00
    6B 1A C2 01 73 00 06 42 65 6C
    6C 61 67 02 73 00 06 42 65 6C
    6C 61 67 04 6B 02 00 05 62 03
    FC 6B 01 04`,
    `00 00 00 01 99 2F 1E 60 6B EE
    BA 1F 06 00 01 00 00 00 00 34
    00 00 01 BA F3 04 01 00 06 00
    6B 1A C2 01 73 00 06 42 65 6C
    6C 61 67 02 73 00 06 42 65 6C
    6C 61 67 04 6B 01 D8 05 62 02
    FC 6B 01 04`,
    `00 00 00 01 99 2F 21 DB 6B EE
    BA 1F 06 00 01 00 00 00 00 34
    00 00 01 BB F3 04 01 00 06 00
    6B 1A C2 01 73 00 06 42 65 6C
    6C 61 67 02 73 00 06 42 65 6C
    6C 61 67 04 6B 01 C6 05 62 02
    FC 6B 01 04`
  ]

  for (const packet of packets) {
    const data = packet
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .map((e) => parseInt(e, 16))

    const buffer = Buffer.from(data)

    onEventParser(buffer, (event) => {
      const { itemId, itemName } = items.get(event.itemNumId)

      const line = `${new Date().toISOString()};${event.lootedBy};${itemId};${
        event.quantity
      };${event.lootedFrom};${itemName}`

      console.info(line)
    })
  }
}

function prettyPrintBuffer(buffer, { sep = ' ', col = Infinity } = {}) {
  const arr = []

  for (let i = 0; i < buffer.length; i += col) {
    const row = Array.from(buffer.slice(i, i + col))
      .map((n) => n.toString(16).padStart(2, '0').toUpperCase())
      .join(sep)

    arr.push(row)
  }

  return arr.join('\n')
}
