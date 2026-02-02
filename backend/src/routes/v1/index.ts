import { Router } from 'express';

import { userRouter } from './user.routes';
import { threadsRouter } from './threads.routes';
import { notificationRouter } from './notifications.routes';
import { chatRouter } from './chat.routes';
import { uploadRouter } from './upload.routes';

export const apiRouter = Router();

apiRouter.use('/users/me', userRouter);
apiRouter.use('/threads', threadsRouter);
apiRouter.use('/notifications', notificationRouter);
apiRouter.use('/chat', chatRouter);
apiRouter.use('/upload', uploadRouter);
