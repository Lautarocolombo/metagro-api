const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console()
  ]
});

if (process.env.NODE_ENV === 'production') {
  logger.add(new DailyRotateFile({
    dirname: path.join(__dirname, '..', 'logs'),
    filename: 'application-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d'
  }));
}

const originalConsoleError = console.error;
console.error = (...args) => {
  logger.error(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
  originalConsoleError.apply(console, args);
};

module.exports = logger;
