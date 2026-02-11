import { HTTP_STATUS, type HttpStatusCode } from '../config/http-status.config';

export class AppError extends Error {
  public readonly status: HttpStatusCode;
  public readonly isOperational: boolean;
  public readonly details?: unknown;
  public readonly timestamp: string;

  constructor(
    status: HttpStatusCode,
    message: string,
    options: {
      isOperational?: boolean;
      details?: unknown;
    } = {},
  ) {
    super(message);
    this.status = status;
    this.isOperational = options.isOperational ?? true;
    this.details = options.details;
    this.timestamp = new Date().toISOString();

    Error.captureStackTrace(this, this.constructor);
    Object.setPrototypeOf(this, new.target.prototype);
  }

  toJSON(): Record<string, unknown> {
    const result: Record<string, unknown> = {
      status: this.status,
      message: this.message,
      timestamp: this.timestamp,
    };

    if (this.details !== undefined) {
      result.details = this.details;
    }

    return result;
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad Request', details?: unknown) {
    super(HTTP_STATUS.BAD_REQUEST, message, { details });
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(HTTP_STATUS.UNAUTHORIZED, message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(HTTP_STATUS.FORBIDDEN, message);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Not Found') {
    super(HTTP_STATUS.NOT_FOUND, message);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(HTTP_STATUS.CONFLICT, message);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed', details?: unknown) {
    super(HTTP_STATUS.UNPROCESSABLE_ENTITY, message, { details });
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Too many requests, please try again later') {
    super(HTTP_STATUS.TOO_MANY_REQUESTS, message);
  }
}

export class InternalError extends AppError {
  constructor(message = 'Internal Server Error') {
    super(HTTP_STATUS.INTERNAL_SERVER_ERROR, message, { isOperational: false });
  }
}
