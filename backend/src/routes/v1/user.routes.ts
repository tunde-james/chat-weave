import { Router } from 'express';

import { getAuth } from '../../config/clerk';
import {
  toResponse,
  userProfileUpdateSchema,
} from '../../modules/users/user.schema';
import { getUserFromClerk, updateUserProfile } from '../../modules/users/user.service';
import { UnauthorizedError } from '../../lib/app-error';

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

userRouter.patch('/', async (req, res, next) => {
  try {
    const auth = getAuth(req);
    if (!auth.userId) {
      throw new UnauthorizedError('Unauthorized');
    }

    const parsedBody = userProfileUpdateSchema.parse(req.body);

    const displayName =
      parsedBody.displayName && parsedBody.displayName.trim().length > 0
        ? parsedBody.displayName.trim()
        : undefined;

    const handle =
      parsedBody.handle && parsedBody.handle.trim().length > 0
        ? parsedBody.handle.trim()
        : undefined;

    const bio =
      parsedBody.bio && parsedBody.bio.trim().length > 0
        ? parsedBody.bio.trim()
        : undefined;

    const avatarUrl =
      parsedBody.avatarUrl && parsedBody.avatarUrl.trim().length > 0
        ? parsedBody.avatarUrl.trim()
        : undefined;

    try {
      const profile = await updateUserProfile({
        clerkUserId: auth.userId,
        displayName,
        handle,
        bio,
        avatarUrl,
      });

      const response = toResponse(profile);

      res.json({ data: response });
    } catch (err) {
      throw err;
    }
  } catch (err) {
    next(err);
  }
});
