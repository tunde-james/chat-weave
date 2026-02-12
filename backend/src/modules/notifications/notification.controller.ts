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

/**
 * @swagger
 * /api/v1/notifications:
 *   get:
 *     summary: Get user notifications
 *     tags: [Notifications]
 *     parameters:
 *       - in: query
 *         name: unreadOnly
 *         schema:
 *           type: boolean
 *         description: Filter to unread notifications only
 *     responses:
 *       200:
 *         description: List of notifications
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
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

/**
 * @swagger
 * /api/v1/notifications/{id}/read:
 *   post:
 *     summary: Mark a notification as read
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Notification marked as read
 */
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

/**
 * @swagger
 * /api/v1/notifications/read-all:
 *   post:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 *     responses:
 *       204:
 *         description: All notifications marked as read
 */
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
