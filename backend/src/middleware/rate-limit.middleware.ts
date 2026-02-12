import rateLimit from 'express-rate-limit';

import { HTTP_STATUS } from '../config/http-status.config';

export const generalRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: HTTP_STATUS.TOO_MANY_REQUESTS,
    message: 'Too many requests, please try again later',
  },
});

export const uploadRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: HTTP_STATUS.TOO_MANY_REQUESTS,
    message: 'Too many upload requests, please try again later',
  },
});

export const createActionRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: HTTP_STATUS.TOO_MANY_REQUESTS,
    message: 'Too many actions, please slow down',
  },
});
