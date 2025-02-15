import { createLogger, format, transports } from 'winston';
import path from 'path';

const logLevel = process.env.LOG_LEVEL || 'info';

const logger = createLogger({
  level: logLevel,
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  transports: [
    new transports.File({
      filename: path.join(process.cwd(), 'logs', 'logs.log'),
      level: 'info',
    }),
    new transports.File({
      filename: path.join(process.cwd(), 'logs', 'errors.log'),
      level: 'error',
    }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(({ level, message, timestamp, stack }) => {
          return stack
            ? `${timestamp} [${level}]: ${message} - ${stack}`
            : `${timestamp} [${level}]: ${message}`;
        })
      ),
    })
  );
}

export default logger;
