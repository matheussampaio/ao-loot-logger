#!/usr/bin/sh

set -e

rm -rf dist/*

pkg package.json

cp node_modules/edge-cs/lib/edge-cs.dll dist/
cp node_modules/edge-js/lib/native/win32/x64/12.13.0/edge_nativeclr.node dist/
cp Photon3Unity3D.dll dist/

mv dist/ao-loot-logger.exe dist/node.exe

du -h -d 0 dist