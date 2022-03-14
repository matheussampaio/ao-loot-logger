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
      level: process.env.NODE_ENV === 'production' ? 'error' : 'debug',
      maxFiles: 2,
      maxsize: 1024 * 1024 * 5, // 10mb
      tailable: true,
      filename: 'messages.error',
      zippedArchive: true,
      handleExceptions: true,
      handleRejections: true
    }),
    new winston.transports.Console({
      level: process.env.NODE_ENV === 'production' ? 'error' : 'silly',
      handleExceptions: true,
      handleRejections: true
    })
  ]
})

module.exports = logger
