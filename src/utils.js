const https = require("https");

function request(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        // Any 2xx status code signals a successful response but
        // here we're only checking for 200.
        if (res.statusCode !== 200) {
          res.resume();

          return reject(
            new Error("Request Failed.\n" + `Status Code: ${res.statusCode}`)
          );
        }

        res.setEncoding("utf8");

        let rawData = "";

        res.on("data", (chunk) => {
          rawData += chunk;
        });

        res.on("end", () => resolve(rawData));
      })
      .on("error", reject);
  });
}

function prettyPrintBuffer(buffer, { sep = " ", col = 10 } = {}) {
  const arr = [];

  for (let i = 0; i < buffer.length; i += col) {
    const row = Array.from(buffer.slice(i, i + col))
      .map((n) => n.toString(16).padStart(2, "0").toUpperCase())
      .join(sep);

    arr.push(row);
  }

  return arr.join("\n");
}

module.exports = { request, prettyPrintBuffer };
