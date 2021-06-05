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

module.exports = { request };
