#!/bin/sh -e

LINUX=0

while getopts 'l' flag; do
  case "${flag}" in
    l) LINUX=1 ;;
  esac
done

if [[ "$LINUX" -eq 1 ]]; then
  OUTPUT_FILE="ao-loot-logger-linux"
else
  OUTPUT_FILE="ao-loot-logger-win.exe"
fi

set -x

# make sure we have a node_modules with only production dependencies
rm -rf node_modules && npm install --production

# clear old builds (if any)
rm -rf ao-loot-logger && mkdir -p ao-loot-logger

# copy assets that needs to be packaged
cp -r node_modules/ src/ ao-loot-logger

cp package.json ao-loot-logger

# install dependencies needes to package the app
npm install --no-save caxa

# package the app
npx caxa --input ao-loot-logger --output "${OUTPUT_FILE}" -- '{{caxa}}/node_modules/.bin/node' '{{caxa}}/src/index.js'

# inject the ico into the .exe file
# if [[ "$LINUX" -eq 0 ]]; then
#   curl -L -O https://github.com/electron/rcedit/releases/latest/download/rcedit-x64.exe

#   ./rcedit-x64.exe "ao-loot-logger-win.exe" --set-icon "assets/logo.ico"

#   rm -rf rcedit-x64.exe
# fi
