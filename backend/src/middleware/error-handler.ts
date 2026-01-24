import type { ErrorRequestHandler } from 'express';

import { HttpError } from '../lib/errors';
import { ZodError } from 'zod';
import { logger } from '../lib/logger';

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  let status = 500;
  let message = 'Internal Server Error';
  let details: unknown = undefined;

  if (err instanceof HttpError) {
    status = err.status;
    message = err.message;
    details = err.details;
  } else if (err instanceof ZodError) {
    status = 400;
    message = 'Invalid Request Data';
    details = err.issues.map((issue) => ({
      path: issue.path,
      message: issue.message,
    }));
  }
  logger.error(`${req.method} ${req.originalUrl} --> ${status}-${message}`);

  res.status(status).json({
    message,
    status,
    details,
  });
};
