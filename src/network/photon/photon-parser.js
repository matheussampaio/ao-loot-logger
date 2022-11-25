const { EventEmitter } = require('events')

const BufferReader = require('../../utils/buffer-reader')
const Protocol16 = require('../protocol16/protocol16')
const { CrcCalculator } = require('../protocol16/crc-calculator')
const { COMMAND_TYPE, MESSAGE_TYPE } = require('./constants')
const Logger = require('../../utils/logger')

const PHOTON_COMMAND_HEADER_LENGTH = 12
const PHOTON_HEADER_LENGTH = 12
const PHOTON_FRAGMENT_HEADER_LENGTH = 20

class PhotonParser extends EventEmitter {
  constructor(debug) {
    super()

    this.debug = debug
    this.tickCount = Number.MIN_SAFE_INTEGER
    this.pendingSegments = {}
  }

  handlePhotonPacket(buffer) {
    if (this.debug) Logger.debug('handlePhotonPacket')

    if (buffer.length < PHOTON_HEADER_LENGTH) {
      return
    }

    this.tickCount = process.uptime()

    const br = new BufferReader(buffer, this.debug)

    // read headers
    const peerId = br.readUInt16BE()
    const flags = br.readUInt8()
    const commandCount = br.readUInt8()
    const timestamp = br.readUInt32BE()
    const challenge = br.readInt32BE()

    const isEncrypted = flags === 1
    const isCrcEnabled = flags === 0xcc

    // encrypted packages are not supported
    if (isEncrypted) {
      return
    }

    if (isCrcEnabled) {
      const crc = br.readInt32BE()

      Buffer.from([0, 0, 0, 0]).copy(buffer, br.position - 4)

      if (crc !== CrcCalculator.calculate(buffer, buffer.length)) {
        return
      }

      // FIXME: can't trust our crc calculator
      // will skip packets with crc
      return Logger.debug('skipping packets with crc')
    }

    if (this.debug) this.debug.push('    ')

    // read each command
    for (let i = 0; i < commandCount && br.position < br.length; i++) {
      // read command headers
      const commandType = br.readUInt8()
      const channelId = br.readUInt8()
      const commandFlags = br.readUInt8()
      const reservedByte = br.readUInt8()
      let commandLength = br.readInt32BE()
      const sequenceNumber = br.readInt32BE()

      commandLength -= PHOTON_COMMAND_HEADER_LENGTH

      if (this.debug) this.debug.push('    ')

      switch (commandType) {
        case COMMAND_TYPE.DISCONNECT:
          return

        case COMMAND_TYPE.SEND_UNRELIABLE:
          br.position += 4
          commandLength -= 4
          this.handleSendReliable(br.readBytes(commandLength))
          break

        case COMMAND_TYPE.SEND_RELIABLE:
          this.handleSendReliable(br.readBytes(commandLength))
          break

        case COMMAND_TYPE.SEND_RELIABLE_FRAGMENT:
          this.handleSendFragment(br.readBytes(commandLength), commandLength)
          break

        default:
          br.position += commandLength
      }

      if (this.debug) this.debug.pop()
    }
  }

  handleSendFragment(buffer, fragmentLength) {
    if (this.debug) Logger.debug('handleSendFragment')

    const br = new BufferReader(buffer, this.debug)

    const sequenceNumber = br.readInt32BE()
    const fragmentCount = br.readInt32BE()
    const fragmentNumber = br.readInt32BE()
    const totalLength = br.readInt32BE()
    const fragmentOffset = br.readInt32BE()

    fragmentLength -= PHOTON_FRAGMENT_HEADER_LENGTH

    if (this.pendingSegments[sequenceNumber] == null) {
      this.pendingSegments[sequenceNumber] = {
        bytesWritten: 0,
        totalLength,
        payload: Buffer.alloc(totalLength)
      }
    }

    const segmentedPackage = this.pendingSegments[sequenceNumber]

    const fragment = br.readBytes(fragmentLength)

    fragment.copy(segmentedPackage.payload, fragmentOffset)

    segmentedPackage.bytesWritten += fragmentLength

    if (segmentedPackage.bytesWritten >= segmentedPackage.totalLength) {
      delete this.pendingSegments[sequenceNumber]

      if (this.debug) Logger.debug('complete fragment')

      this.handleSendReliable(segmentedPackage.payload)
    }
  }

  handleSendReliable(buffer) {
    if (this.debug) Logger.debug('handleSendReliable', buffer)

    const br = new BufferReader(buffer, this.debug)

    const flag = br.readUInt8()

    if (flag !== 243 && flag !== 253) {
      return
    }

    const messageType = br.readUInt8()
    const isEncrypted = messageType > 128

    if (isEncrypted) {
      return
    }

    switch (messageType) {
      case MESSAGE_TYPE.OPERATION_REQUEST: {
        const requestData = Protocol16.decodeOperationRequest(br)

        this.emit('request-data', requestData)
        break
      }

      case MESSAGE_TYPE.OPERATION_RESPONSE: {
        const responseData = Protocol16.decodeOperationResponse(br)

        this.emit('response-data', responseData)
        break
      }

      case MESSAGE_TYPE.EVENT_DATA_TYPE: {
        const eventData = Protocol16.decodeEventData(br)

        this.emit('event-data', eventData)
        break
      }

      case MESSAGE_TYPE.INTERNAL_OPERATION_REQUEST: {
        const internalRequestData = Protocol16.decodeOperationRequest(br)

        internalRequestData.parameters[88] = this.tickCount

        this.emit('request-data', internalRequestData)
        break
      }

      case MESSAGE_TYPE.INTERNAL_OPERATION_RESPONSE: {
        const internalResponseData = Protocol16.decodeOperationResponse(br)

        this.emit('response-data', internalResponseData)
        break
      }
    }
  }
}

module.exports = PhotonParser
