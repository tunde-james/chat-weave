import winston from 'winston';

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),

    winston.format.printf((info) => {
      return `${info.timestamp} -> [${info.level.toLowerCase()}] ${info.level}`;
    }),
  ),
  transports: [new winston.transports.Console()],
});
