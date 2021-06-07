if (process.pkg) {
  process.env.EDGE_CS_NATIVE = "./edge-cs.dll";
}

const { Cap, decoders } = require("cap");
const edge = require("edge-js");
const { prettyPrintBuffer } = require("./utils");
const items = require("./items");
const BufferReader = require("./buffer-reader");
const logger = require("./logger");

const deserializeEventData = edge.func(`
  #r "Photon3Unity3D.dll"

  using ExitGames.Client.Photon;
  using System.Threading.Tasks;

  public class Log {
    public int code;
    public string lootedBy;
    public string lootedFrom;
    public int itemNumId;
    public int quantity;

    public Log(EventData eventData) {
      code = int.Parse(eventData.Code.ToString());

      lootedFrom = eventData.Parameters[1].ToString();
      lootedBy = eventData.Parameters[2].ToString();
      itemNumId = int.Parse(eventData.Parameters[4].ToString());
      quantity = int.Parse(eventData.Parameters[5].ToString());
    }
  }

  public class Startup {
    public async Task<object> Invoke(byte[] bytes) {
      Protocol16 protocol16 = new Protocol16();

      StreamBuffer payload = new StreamBuffer(bytes);

      EventData eventData = protocol16.DeserializeEventData(payload);

      if (eventData.Code.ToString() == "1" && eventData.Parameters[252].ToString() == "260") {
        return new Log(eventData);
      }

      return false;
    }
  }
`);

main();
// dev();

async function main() {
  await items.init();

  const addrs = [];

  for (const device of Cap.deviceList()) {
    for (const address of device.addresses) {
      if (address.addr.match(/\d+\.\d+\.\d+\.\d+/)) {
        if (device.description) {
          console.info(`Listening to`, device.description);
        }

        addrs.push(address.addr);
      }
    }
  }

  for (const addr of addrs) {
    addListener(addr);
  }

  process.stdin.setRawMode(true);

  process.stdin.resume();

  process.stdin.setEncoding("utf8");

  process.stdin.on("data", onKeypressed);

  process.on("SIGTERM", () => {
    process.stdin.removeListener(onKeypressed);
  });

  logger.init();
}

function onKeypressed(key) {
  if (key === "\u0003") {
    process.exit();
  }

  if (key.toLowerCase() === "d") {
    logger.init();
  }
}

function addListener(addr) {
  const c = new Cap();

  const filter = "ip and udp port 5056";
  const bufSize = 10 * 65536;
  const buffer = Buffer.alloc(65535);
  const device = Cap.findDevice(addr);

  const linkType = c.open(device, filter, bufSize, buffer);

  if (linkType !== "ETHERNET") {
    return c.close();
  }

  process.on("SIGTERM", () => {
    c.close();
  });

  if (c.setMinBytes != null) {
    c.setMinBytes(0);
  }

  c.on("packet", (nbytes, trunc) => {
    let ret = decoders.Ethernet(buffer);

    if (ret.info.type !== decoders.PROTOCOL.ETHERNET.IPV4) {
      return console.log(
        "Unsupported Ethertype: " + decoders.PROTOCOL.ETHERNET[ret.info.type]
      );
    }

    ret = decoders.IPV4(buffer, ret.offset);

    if (ret.info.protocol !== decoders.PROTOCOL.IP.UDP) {
      return console.log(
        "Unsupported IPv4 protocol: " + decoders.PROTOCOL.IP[ret.info.protocol]
      );
    }

    ret = decoders.UDP(buffer, ret.offset);

    const br = new BufferReader(
      buffer.slice(ret.offset, ret.offset + ret.info.length)
    );

    try {
      parseBuffer(br);
    } catch (error) {
      console.error(error);
    }
  });
}

// async function dev() {
//   await items.init();

//   const packets = [
//     `00 00 00 01 99 2E EC FF 6B EE
//     BA 1F 06 00 01 00 00 00 00 34
//     00 00 01 B8 F3 04 01 00 06 00
//     6B 1A C2 01 73 00 06 42 65 6C
//     6C 61 67 02 73 00 06 42 65 6C
//     6C 61 67 04 6B 01 D0 05 62 02
//     FC 6B 01 04`,
//     `00 00 00 01 99 2F 09 CE 6B EE
//     BA 1F 06 00 01 00 00 00 00 34
//     00 00 01 B9 F3 04 01 00 06 00
//     6B 1A C2 01 73 00 06 42 65 6C
//     6C 61 67 02 73 00 06 42 65 6C
//     6C 61 67 04 6B 02 00 05 62 03
//     FC 6B 01 04`,
//     `00 00 00 01 99 2F 1E 60 6B EE
//     BA 1F 06 00 01 00 00 00 00 34
//     00 00 01 BA F3 04 01 00 06 00
//     6B 1A C2 01 73 00 06 42 65 6C
//     6C 61 67 02 73 00 06 42 65 6C
//     6C 61 67 04 6B 01 D8 05 62 02
//     FC 6B 01 04`,
//     `00 00 00 01 99 2F 21 DB 6B EE
//     BA 1F 06 00 01 00 00 00 00 34
//     00 00 01 BB F3 04 01 00 06 00
//     6B 1A C2 01 73 00 06 42 65 6C
//     6C 61 67 02 73 00 06 42 65 6C
//     6C 61 67 04 6B 01 C6 05 62 02
//     FC 6B 01 04`,
//   ];

//   for (const packet of packets) {
//     const data = packet
//       .replace(/\s+/g, " ")
//       .trim()
//       .split(" ")
//       .map((e) => parseInt(e, 16));

//     const buffer = Buffer.from(data);

//     const br = new BufferReader(buffer, 0, data.length);

//     parseBuffer(br);
//   }
// }

function parseBuffer(br) {
  br.ReadUInt16();
  br.ReadByte();

  const commandCount = br.ReadByte();

  br.ReadInt32();
  br.ReadInt32();

  const commandHeaderLength = 12;
  const signifierByteLength = 1;

  for (let i = 0; i < commandCount; i++) {
    const commandType = br.ReadByte();

    br.ReadByte();
    br.ReadByte();
    br.ReadByte();

    let commandLength = br.ReadInt32BE();

    br.ReadInt32();

    if (commandType === 4) {
      continue;
    } else if (commandType === 5) {
      br.position += commandLength - commandHeaderLength;
      continue;
    } else if (commandType === 6) {
    } else if (commandType === 7) {
      br.position += 4;
      commandLength -= 4;
    } else {
      br.position += commandLength - commandHeaderLength;
      continue;
    }

    br.position += signifierByteLength;

    const messageType = br.ReadByte();
    const operationLength = commandLength - commandHeaderLength - 2;
    const payload = br.ReadBytes(operationLength);

    if (messageType === 2) {
    } else if (messageType === 3) {
    } else if (messageType === 4) {
      const eventData = deserializeEventData(payload, true);

      if (eventData) {
        onLootGrabbedEvent(eventData, payload);
      }
    } else {
      br.position += operationLength;
    }
  }
}

function onLootGrabbedEvent(eventData, payload) {
  const { itemId, itemName } = items.get(eventData.itemNumId);

  const line = `${new Date().toISOString()};${eventData.lootedBy};${itemId};${
    eventData.quantity
  };${eventData.lootedFrom};${itemName};${prettyPrintBuffer(payload, {
    sep: ",",
    col: Infinity,
  })}`;

  logger.log(line + "\n");

  console.info(line);
}
