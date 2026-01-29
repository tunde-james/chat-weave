import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import { notFoundHandler } from './middleware/not-found-handler';
import { errorHandler } from './middleware/error-handler';
import { clerkMiddleware } from './config/clerk';
import { apiRouter } from './routes/v1';

export function createApp() {
  const app = express();

  app.use(clerkMiddleware());

  app.use(helmet());
  app.use(
    cors({
      origin: ['http://localhost:3001'],
      credentials: true,
    }),
  );
  app.use(express.json());

  app.use('/api/v1', apiRouter);


  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
