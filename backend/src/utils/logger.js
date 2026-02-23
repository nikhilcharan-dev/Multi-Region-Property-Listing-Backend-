const { createLogger, format, transports } = require('winston');

const { combine, timestamp, printf, errors, colorize, json } = format;

// Custom log format for development (pretty console logs)
const consoleFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
  return `${timestamp} [${level}] ${stack || message} ${
    Object.keys(meta).length ? JSON.stringify(meta) : ""
  }`;
});

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp(),
    errors({ stack: true })
  ),
  transports: [
    new transports.Console({
      format: combine(
        colorize(),
        consoleFormat
      ),
    }),
  ],
});

// Add JSON logging in production
if (process.env.NODE_ENV === 'production') {
  logger.clear();
  logger.add(
    new transports.Console({
      format: combine(
        timestamp(),
        errors({ stack: true }),
        json()
      ),
    })
  );
}

module.exports = logger;