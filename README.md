[![Download AO Loot Logger](https://img.shields.io/badge/AO%20Loot%20Logger-Download-blue)](https://github.com/matheussampaio/ao-loot-logger/releases/latest)
[![Discord](https://img.shields.io/badge/discord-join-blue)](https://discord.gg/fvNMF2abXr)

# Albion Online Loot Logger

With AO Loot Logger you can write all the loot grabbed by other players to a file. With this file, you can use [Loot Logger Viewer](https://matheus.sampaio.us/ao-loot-logger-viewer) to analyze it.

**NOTE:** It does not work with a VPN (i.e. Exit Lag) or playing through Geforce Now.

## Discord

Join the discord server for questions and help: https://discord.gg/fvNMF2abXr


## Funding

You can always [buy me a coffee](https://www.buymeacoffee.com/MatheusSampaio) or [sponsor me](https://github.com/sponsors/matheussampaio). ❤️

## How to Use (Windows)

1. Install [Npcap with WinPcap compatibility](https://nmap.org/npcap).
2. Download the latest AO Loot Logger for Windows: https://github.com/matheussampaio/ao-loot-logger/releases/latest
3. Extract the folder somewhere
4. Run `ao-loot-logger.cmd`.
5. The log is written to a file in the same folder as the executable (you can see the full path when AO Loot Logger starts).

## How to Use (Linux)

1. Install `libpcap-dev`: `sudo apt-get install libpcap-dev`
2. Download the latest AO Loot Logger for Linux: https://github.com/matheussampaio/ao-loot-logger/releases/latest
3. Extract the folder somewhere
4. Run `ao-loot-logger`.
5. The log is written to a file in the same folder as the executable (you can see the full path when AO Loot Logger starts).

## How to Use (Fedora / RHEL and derivatives via dnf)

1. Add the repo and import the signing key:
   ```console
   $ sudo dnf config-manager --add-repo https://matheussampaio.github.io/ao-loot-logger/rpm/ao-loot-logger.repo
   $ sudo rpm --import https://matheussampaio.github.io/ao-loot-logger/rpm/RPM-GPG-KEY-ao-loot-logger
   ```
2. Install: `sudo dnf install ao-loot-logger`
3. Run `ao-loot-logger` from the folder you want the log written to.
4. The log is written to a file in your current directory (you can see the full path when AO Loot Logger starts).

## How to run from source

1. Install [Node.js](https://nodejs.org/) v24 or newer.
2. **Windows:** Install [Npcap with WinPcap compatibility](https://nmap.org/npcap).
   **Linux:** Install libpcap: `sudo apt-get install libpcap-dev`
3. In the project folder, run `npm install` to install dependencies.
4. Run `npm start`.

## Questions?

Start a [discussion](https://github.com/matheussampaio/ao-loot-logger/discussions).

## Found any problem?

Create an [issue](https://github.com/matheussampaio/ao-loot-logger/issues) so we can get it fixed.
