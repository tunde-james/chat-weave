import type { Request, Response } from 'express';

import { getAuth } from '../../config/clerk';
import { BadRequestError, UnauthorizedError } from '../../lib/app-error';
import { getUserFromClerk } from '../users/user.service';
import {
  listNotificationsForUser,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from './notification.service';
import { HTTP_STATUS } from '../../config/http-status.config';

export const getNotificationsController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const auth = getAuth(req);

  if (!auth.userId) {
    throw new UnauthorizedError('Please sign in!');
  }

  const profile = await getUserFromClerk(auth.userId);
  const isUnreadOnly = req.query.unreadOnly === 'true';

  const notifications = await listNotificationsForUser({
    userId: profile.user.id,
    unreadOnly: isUnreadOnly,
  });

  res.json({ data: notifications });
};

export const markNotificationReadController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const auth = getAuth(req);
  if (!auth.userId) {
    throw new UnauthorizedError('Please sign in!');
  }

  const notificationId = Number(req.params.id);
  if (!Number.isInteger(notificationId) || notificationId <= 0) {
    throw new BadRequestError('Invalid notification ID');
  }

  const profile = await getUserFromClerk(auth.userId);

  await markNotificationAsRead({
    userId: profile.user.id,
    notificationId,
  });

  res.status(204).send();
};

export const markAllNotificationsReadController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const auth = getAuth(req);
  if (!auth.userId) {
    throw new UnauthorizedError('Please sign in');
  }

  const profile = await getUserFromClerk(auth.userId);

  await markAllNotificationsAsRead(profile.user.id);

  res.status(HTTP_STATUS.NO_CONTENT).send();
};
