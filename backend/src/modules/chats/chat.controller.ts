import type { Request, Response } from 'express';

import { getAuth } from '../../config/clerk';
import { BadRequestError, UnauthorizedError } from '../../lib/app-error';
import { getUserFromClerk } from '../users/user.service';
import { listChatUsers, listDirectMessages } from './chat.service';

/**
 * @swagger
 * /api/v1/chat/users:
 *   get:
 *     summary: Get chat users list
 *     tags: [Chat]
 *     responses:
 *       200:
 *         description: List of users for chat
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
export const getChatUsersController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const auth = getAuth(req);
  if (!auth.userId) {
    throw new UnauthorizedError('Not authenticated');
  }

  const profile = await getUserFromClerk(auth.userId);
  const currentUserId = profile.user.id as number;

  const users = await listChatUsers(currentUserId);

  res.json({ data: users });
};

/**
 * @swagger
 * /api/v1/chat/conversations/{otherUserId}/messages:
 *   get:
 *     summary: Get messages with a user
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: otherUserId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of messages to return
 *     responses:
 *       200:
 *         description: List of messages
 */
export const getConversationMessagesController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const auth = getAuth(req);
  if (!auth.userId) {
    throw new UnauthorizedError('Not authenticated');
  }

  const profile = await getUserFromClerk(auth.userId);
  const currentUserId = profile.user.id as number;

  const rawOtherUserId = req.params.otherUserId;
  const otherUserId = Number(rawOtherUserId);

  if (!Number.isInteger(otherUserId) || otherUserId <= 0) {
    throw new BadRequestError('Invalid otherUserId');
  }

  const limitParam = req.query.limit;
  const limit = typeof limitParam === 'string' ? parseInt(limitParam, 10) : 100;

  const messages = await listDirectMessages({
    userId: currentUserId,
    otherUserId,
    limit: limit || 50,
  });

  res.json({ data: messages });
};
