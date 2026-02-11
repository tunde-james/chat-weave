import { Router } from 'express';
import { getAuth } from '../../config/clerk';
import { getUserFromClerk } from '../../modules/users/user.service';
import {
  listNotificationsForUser,
  markNotificationAsRead,
} from '../../modules/notifications/notification.service';
import { BadRequestError, UnauthorizedError } from '../../lib/app-error';

export const notificationRouter = Router();

notificationRouter.get('/', async (req, res, next) => {
  try {
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
  } catch (error) {
    next(error);
  }
});

notificationRouter.post('/:id/read', async (req, res, next) => {
  try {
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
  } catch (error) {
    next(error);
  }
});

// TODO -> post /api/notifications/read-all
