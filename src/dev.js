const BufferReader = require('./buffer-reader')
const items = require('./items')

const parser = require('./parser')

dev()

/**
 * Dev entry point to help debugging packets.
 */
async function dev() {
  await items.init()

  const packets = [
    // `01 00 06 00 6B 01 36 01 73 00 0E 6D 61 74 68 65 75 73 73 61 6D 70 61 69 6F 02 73 00 08 4A 4D 4C 65 67 65 6E 64 04 6B 05 C7 05 62 01 FC 6B 01 04`,
    `01 00 06 00 69 00 3E 7F 60 01 73 00 0E 6D 61 74 68 65 75 73 73 61 6D 70 61 69 6F 02 73 00 09 73 61 73 75 6B 65 31 39 39 04 6B 02 28 05 62 02 FC 6B 01 04`,
    `01 00 05 00 69 00 20 BB 0D 02 73 00 0D 4D 61 73 74 65 72 4F 66 46 6F 72 67 65 03 6F 01 05 69 27 56 CD 00 FC 6B 01 04`
  ]

  for (const packet of packets) {
    const data = packet
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .map((e) => parseInt(e, 16))

    const buffer = Buffer.from(data)
    const br = new BufferReader(buffer)

    console.log(parser.parseEvent(br))
  }
}
