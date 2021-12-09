const winston = require('winston')
const util = require('util')

const { combine, timestamp, printf, errors } = winston.format

const logger = winston.createLogger({
  format: combine(
    timestamp(),
    errors({ stack: true }),
    printf((params) => {
      const { timestamp, level, message } = params
      const extra = params[Symbol.for('splat')]

      if (extra) {
        return `${timestamp} [${level}]: ${
          typeof message === 'string' ? message : util.format(message)
        } ${util.format(extra)}`
      }

      return `${timestamp} [${level}]: ${
        typeof message === 'string' ? message : util.format(message)
      }`
    })
  ),
  transports: [
    new winston.transports.File({
      level: 'debug',
      maxFiles: 5,
      maxsize: 1024 * 1024 * 10, // 10mb
      tailable: true,
      filename: 'ao-loot-logger.log',
      zippedArchive: true,
      handleExceptions: true,
      handleRejections: true
    }),
    new winston.transports.Console({
      level: process.pkg != null ? 'error' : 'silly',
      handleExceptions: true,
      handleRejections: true
    })
  ]
})

module.exports = logger
