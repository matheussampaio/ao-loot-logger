const https = require('https')

function request(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode !== 200) {
          res.resume()

          return reject(
            new Error('Request Failed.\n' + `Status Code: ${res.statusCode}`)
          )
        }

        res.setEncoding('utf8')

        let rawData = ''

        res.on('data', (chunk) => {
          rawData += chunk
        })

        res.on('end', () => resolve(rawData))
      })
      .on('error', reject)
  })
}

module.exports = { request }
