import { Router } from 'express';

import { userRouter } from './user.routes';
import { threadsRouter } from './threads.routes';
import { notificationRouter } from './notifications.routes';

export const apiRouter = Router();

apiRouter.use('/users/me', userRouter);
apiRouter.use('/threads', threadsRouter);
apiRouter.use('/notifications', notificationRouter);
