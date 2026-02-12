import type { Request, Response } from 'express';

import { getAuth } from '../../config/clerk';
import { UnauthorizedError } from '../../lib/app-error';
import { getUserFromClerk, updateUserProfile } from './user.service';
import { toResponse, userProfileUpdateSchema } from './user.schema';

/**
 * @swagger
 * /api/v1/users/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: User profile data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
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

/**
 * @swagger
 * /api/v1/users/me:
 *   patch:
 *     summary: Update current user profile
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               displayName:
 *                 type: string
 *               handle:
 *                 type: string
 *               bio:
 *                 type: string
 *               avatarUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated user profile
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 */
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
