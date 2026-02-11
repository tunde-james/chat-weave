import type { Request, Response, NextFunction } from 'express';

import { logger } from '../lib/logger';

export const requestLoggerMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const { method, originalUrl, requestId } = req;
    const { statusCode } = res;

    const logLevel =
      statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';

    logger.log(
      logLevel,
      `${method} ${originalUrl} ${statusCode} - ${duration}ms`,
      {
        requestId,
        method,
        path: originalUrl,
        statusCode,
        duration,
        userAgent: req.get('user-agent'),
        ip: req.ip || req.socket.remoteAddress,
      },
    );
  });

  next();
};
