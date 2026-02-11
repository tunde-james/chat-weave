import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';

import { AppError } from '../lib/app-error';
import { HTTP_STATUS } from '../config/http-status.config';
import { logger } from '../lib/logger';
import { env } from '../config/env.config';

const isProduction = env.NODE_ENV === 'production';


const formatZodErrors = (error: ZodError) => {
  return error.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  }));
};

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const requestId = req.requestId;

  let status: number = HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message = 'Internal Server Error';
  let details: unknown = undefined;
  let isOperational = false;

  if (err instanceof AppError) {
    status = err.status;
    message = err.message;
    details = err.details;
    isOperational = err.isOperational;
  } 
  else if (err instanceof ZodError) {
    status = HTTP_STATUS.BAD_REQUEST;
    message = 'Validation failed';
    details = formatZodErrors(err);
    isOperational = true;
  }
  else if (err instanceof Error) {
    message = isProduction ? 'Internal Server Error' : err.message;
  }

  logger.error(`${req.method} ${req.originalUrl} --> ${status} ${message}`, {
    requestId,
    status,
    message,
    isOperational,
    stack: isProduction ? undefined : err.stack,
    details,
  });

  const response: Record<string, unknown> = {
    status,
    message,
    requestId,
  };

  if (details) {
    response.details = details;
  }

  if (!isProduction && err.stack) {
    response.stack = err.stack;
  }

  res.status(status).json(response);
};
