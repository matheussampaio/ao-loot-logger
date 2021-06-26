[![Download AO Loot Logger](https://img.shields.io/badge/AO%20Loot%20Logger-Download-blue)](https://github.com/matheussampaio/ao-loot-logger/releases/latest)

# Albion Online Loot Logger

With AO Loot Logger you can write all the loot grabbed by other players to a file. With this file, you can use [Loog Logger Viewer](https://matheus.sampaio.us/albion-loot-logger-helper) to analyze it.

**NOTE:** It does not work with a VPN (i.e. Exit Lag) or playing through Geforce Now.

## Funding

You can always [buy me a coffee](https://www.buymeacoffee.com/MatheusSampaio) or [sponsor me](https://github.com/sponsors/matheussampaio). ❤️

## How to Use (Windows)

1. Install [Npcap with WinPcap compatibility](https://nmap.org/npcap).
1. Download the latest AO Loot Logger for Windows: https://github.com/matheussampaio/ao-loot-logger/releases/latest
1. Execute `ao-loot-logger.exe`.
1. The log is written to file in the same folder as the executable (you can see the full path when the AO Loot Logger starts).

## How to Use (Linux)

1. Install `libpcap-dev`: `sudo apt-get install libpcap-dev`.
1. Download the latest AO Loot Logger for Linux: https://github.com/matheussampaio/ao-loot-logger/releases/latest
1. Execute `ao-loot-logger`.
1. The log is written to file in the same folder as the executable (you can see the full path when the AO Loot Logger starts).

## How to Develop

1. Install Node 14.
1. If you're on windows, install [Npcap with WinPcap compatibility](https://nmap.org/npcap)
1. If you're on linux, install `libpcap-dev`: `sudo apt-get install libpcap-dev`.
1. In the project's folder, run `npm install` to install all dependencies.
1. Start coding.
1. Run the project with `npm start` or `node src/index.js`.

## Question?

Start a [discussion](https://github.com/matheussampaio/ao-loot-logger/discussions).

## Found any problem?

Create an [issue](https://github.com/matheussampaio/ao-loot-logger/issues) so we can get it fixed.
