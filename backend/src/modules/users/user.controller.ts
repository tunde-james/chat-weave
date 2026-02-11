import type { Request, Response } from 'express';

import { getAuth } from '../../config/clerk';
import { UnauthorizedError } from '../../lib/app-error';
import { getUserFromClerk, updateUserProfile } from './user.service';
import { toResponse, userProfileUpdateSchema } from './user.schema';

export const getCurrentUserController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const auth = getAuth(req);
  if (!auth.userId) {
    throw new UnauthorizedError('Unauthorized');
  }

  const profile = await getUserFromClerk(auth.userId);
  const response = toResponse(profile);

  res.json({ data: response });
};

export const updateCurrentUserController = async (
  req: Request,
  res: Response,
): Promise<void> => {
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

  const profile = await updateUserProfile({
    clerkUserId: auth.userId,
    displayName,
    handle,
    bio,
    avatarUrl,
  });

  const response = toResponse(profile);

  res.json({ data: response });
};
