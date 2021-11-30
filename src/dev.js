const PhotonParser = require('./network/photon/photon-parser')

async function dev() {
  const pp = new PhotonParser([])

  pp.on('event-data', (event) => {
    Logger.debug(event)
  })

  const packets = [
    `01 78 00 00 00 60 1A EA 33 BB D8 E8 70 50 F1 3D E1 F7 D9 15 90 1D 01 3D 03 2F 56 5E 31 1C 82 CA D6 0F D6 B8 56 A5 76
    D6 63 0B 1B 99 05 49 3E EB 96 F2 67 4C B7 C4 B1 50 56 FC 52 28 B7 BA 89 0B 97 A5 5E B8 24 70 A0 B7 60 BD 0B C0 47 AF
    35 EF 7F 3A DD B9 5D 58 BE 79 99 39 77 BF 7C 16 A9 F6 C5 BB AA 22 2D 4F`
  ]

  for (const packet of packets) {
    const data = Buffer.from(
      packet
        .replace(/\s+/g, ' ')
        .trim()
        .split(' ')
        .map((e) => parseInt(e, 16))
    )

    pp.handleParamsTable({ parametersCount: 1, data })
  }
}

dev()
