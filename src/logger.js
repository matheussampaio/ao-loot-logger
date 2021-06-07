const fs = require("fs");
const path = require("path");

let logFileName = null;
let stream = null;

function log(line) {
  if (stream == null) {
    init();
  }

  stream.write(line);
}

function init() {
  if (stream != null) {
    stream.close();

    process.removeListener("SIGTERM", closeStream);
  }

  const d = new Date();

  logFileName = `log-${d.getUTCDay()}-${d.getUTCMonth()}-${d.getUTCFullYear()}-${d.getUTCHours()}-${d.getUTCMinutes()}-${d.getUTCSeconds()}.txt`;

  stream = fs.createWriteStream(logFileName, { flags: "a" });

  process.once("SIGTERM", () => {});

  console.info("Logs will be saved to", path.join(process.cwd(), logFileName));
}

function closeStream() {
  stream.close();
}

function getFilename() {
  return logFileName;
}

module.exports = { log, init, getFilename };
