const winston = require('winston')

const transport = new winston.transports.File({
  maxFiles: 5,
  maxsize: 1024 * 1024 * 10, // 10mb
  tailable: true,
  filename: 'ao-loot-logger.log'
})

const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.json(),
  defaultMeta: { service: 'ao-loot-logger' },
  transports: [transport],
  exceptionHandlers: [transport]
})

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV !== 'production' && process.pkg == null) {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple()
    })
  )
}

module.exports = logger
