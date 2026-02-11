import type { Request, Response } from 'express';

import { getAuth } from '../../config/clerk';
import { BadRequestError, UnauthorizedError } from '../../lib/app-error';
import { getUserFromClerk } from '../users/user.service';
import { listChatUsers, listDirectMessages } from './chat.service';

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
