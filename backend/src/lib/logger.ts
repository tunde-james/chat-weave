import winston from 'winston';
import path from 'path';
import fs from 'node:fs';

import { env } from '../config/env.config';

const isProduction = env.NODE_ENV === 'production';

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    ({ level, message, timestamp, requestId, userId, ...meta }) => {
      let log = `${timestamp} [${level}]`;

      if (requestId) {
        log += ` [${requestId}]`;
      }

      if (userId) {
        log += ` [user:${userId}]`;
      }

      log += ` ${message}`;

      const metaKeys = Object.keys(meta);

      if (metaKeys.length > 0 && metaKeys.some((key) => key !== 'splat')) {
        const filteredMeta = Object.fromEntries(
          Object.entries(meta).filter(([key]) => key !== 'splat'),
        );

        if (Object.keys(filteredMeta).length > 0) {
          log += ` ${JSON.stringify(filteredMeta)}`;
        }
      }

      return log;
    },
  ),
);

const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

const transports: winston.transport[] = [
  new winston.transports.Console({
    format: consoleFormat,
  }),
];

if (isProduction) {
  const logsDir = path.join(process.cwd(), 'logs');
  fs.mkdirSync(logsDir, { recursive: true });

  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      format: fileFormat,
      maxsize: 3 * 1024 * 1024,
      maxFiles: 3,
    }),
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      format: fileFormat,
      maxsize: 3 * 1024 * 1024,
      maxFiles: 3,
    }),
  );
}

export const logger = winston.createLogger({
  level: isProduction ? 'info' : 'debug',
  defaultMeta: { service: 'chat-weave-api' },
  transports,
});

export const createRequestLogger = (requestId: string, userId?: string) => {
  return logger.child({ requestId, userId });
};
