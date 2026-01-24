import { Router } from 'express';

import { getAuth } from '../../config/clerk';
import { UnauthorizedError } from '../../lib/errors';
import { toResponse } from '../../modules/users/user.schema';
import { getUserFromClerk } from '../../modules/users/user.service';

export const userRouter = Router();

userRouter.get('/', async (req, res, next) => {
  try {
    const auth = getAuth(req);
    if (!auth.userId) {
      throw new UnauthorizedError('Unauthorized');
    }

    const profile = await getUserFromClerk(auth.userId);
    const response = toResponse(profile);

    res.json({ data: response });
  } catch (err) {
    next(err);
  }
});
