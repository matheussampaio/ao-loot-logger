if (process.argv[2] == undefined) process.exit(0)
if (process.argv[2] == '') process.exit(0)
const {
  pkg_fetch_version,
  node_version,
  pkg_cache_path,
  icon,
  description,
  company,
  name,
  copyright,
  file
} = require(`./${process.argv[2]}.json`)

const ResEdit = require('resedit')
const path = require('path')
const fs = require('fs')
const https = require('https')
const { version } = require('./package.json')

function download(url, dest) {
  return new Promise((resolve, reject) => {
    fs.access(dest, fs.constants.F_OK, (err) => {
      if (err === null) reject('File already exists')
      const request = https.get(url, (response) => {
        if (response.statusCode === 200) {
          const file = fs.createWriteStream(dest, { flags: 'wx' })
          file.on('finish', () => resolve())
          file.on('error', (err) => {
            file.close()
            if (err.code === 'EEXIST') reject('File already exists')
            else fs.unlink(dest, () => reject(err.message)) // Delete temp file
          })
          response.pipe(file)
        } else if (response.statusCode === 302 || response.statusCode === 301) {
          download(response.headers.location, dest).then(() => resolve())
        } else {
          reject(
            `Server responded with ${response.statusCode}: ${response.statusMessage}`
          )
        }
      })
      request.on('error', (err) => {
        reject(err.message)
      })
    })
  })
}
process.env['PKG_CACHE_PATH'] = path.join(__dirname, pkg_cache_path)
const pkg_fetch = path.join(
  process.env['PKG_CACHE_PATH'],
  `v${pkg_fetch_version}`
)
const fetched = path.join(pkg_fetch, `fetched-v${node_version}-win-x64`)
const built = path.join(pkg_fetch, `built-v${node_version}-win-x64`)
const url = `https://github.com/vercel/pkg-fetch/releases/download/v${pkg_fetch_version}/node-v${node_version}-win-x64`
const { exec } = require('pkg')

console.log(url)
;(async () => {
  if (!fs.existsSync(fetched)) {
    console.log('Downloading File')
    try {
      await fs.mkdirSync(pkg_fetch, { recursive: true })
    } catch (e) {
      console.error(e)
    }
    try {
      await download(url, fetched)
    } catch (e) {
      console.error(e)
      process.exit(1)
    }
    console.log('Downloaded File')
  } else {
    console.log('Using Existing File')
  }
  console.log('Reading EXE')
  let data = fs.readFileSync(fetched)
  let exe = ResEdit.NtExecutable.from(data)
  let res = ResEdit.NtExecutableResource.from(exe)
  let viList = ResEdit.Resource.VersionInfo.fromEntries(res.entries)
  console.log(viList[0].data.strings)
  let vi = viList[0]
  const theversion = version.split('.')
  console.log('Removing OriginalFilename')
  vi.removeStringValue({ lang: 1033, codepage: 1200 }, 'OriginalFilename')
  console.log('Removing InternalName')
  vi.removeStringValue({ lang: 1033, codepage: 1200 }, 'InternalName')
  console.log('Setting Product Version')
  vi.setProductVersion(
    theversion[0],
    theversion[1],
    theversion[2],
    theversion[3],
    1033
  )
  console.log('Setting File Version')
  vi.setFileVersion(
    theversion[0],
    theversion[1],
    theversion[2],
    theversion[3],
    1033
  )
  console.log('Setting File Info')
  vi.setStringValues(
    { lang: 1033, codepage: 1200 },
    {
      FileDescription: description,
      ProductName: name,
      CompanyName: company,
      LegalCopyright: copyright
    }
  )
  console.log(vi.data.strings)
  vi.outputToResourceEntries(res.entries)
  console.log('Replacing Icon')
  let iconFile = ResEdit.Data.IconFile.from(
    fs.readFileSync(path.join(__dirname, icon))
  )
  ResEdit.Resource.IconGroupEntry.replaceIconsForResource(
    res.entries,
    1,
    1033,
    iconFile.icons.map((item) => item.data)
  )
  res.outputResource(exe)
  console.log('Generating EXE')
  let newBinary = exe.generate()
  console.log('Saving EXE', built)
  fs.writeFileSync(built, Buffer.from(newBinary))

  console.log('Bundling App', `${process.argv[2]}.json`, file)

  await exec(['--build', '--config', `${process.argv[2]}.json`, `${file}`])
})()
