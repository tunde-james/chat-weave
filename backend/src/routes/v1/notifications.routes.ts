import { Router } from 'express';

import { asyncHandler } from '../../lib/async-handler';
import {
  getNotificationsController,
  markAllNotificationsReadController,
  markNotificationReadController,
} from '../../modules/notifications/notification.controller';

export const notificationRouter = Router();

notificationRouter.get('/', asyncHandler(getNotificationsController));
notificationRouter.post(
  '/:id/read',
  asyncHandler(markNotificationReadController),
);
notificationRouter.post(
  '/read-all',
  asyncHandler(markAllNotificationsReadController),
);
