const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf } = format;

const logFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} ${level}: ${message}`;
  });

const logger = createLogger({
    level: 'debug',
    transports: [
      new transports.Console({
        format: combine(
            format.colorize(),
            timestamp(),
            logFormat
        )
      }),
      new transports.File(
          { filename: 'logs/scraping.log',
            maxsize:'10000000', 
            maxFiles:'10',
            format: combine(
                timestamp(),
                logFormat
            )
        })
    ]
});

module.exports = logger;