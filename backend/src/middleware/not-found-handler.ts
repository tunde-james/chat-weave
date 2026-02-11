import { NextFunction, Request, Response } from 'express';

import { NotFoundError } from '../lib/app-error';

export const notFoundHandler = (
  _req: Request,
  _res: Response,
  next: NextFunction,
) => {
  next(new NotFoundError('Route Not FOund'));
};
