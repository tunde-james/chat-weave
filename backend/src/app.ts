import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import { notFoundHandler } from './middleware/not-found-handler';
import { errorHandler } from './middleware/error-handler';
import { clerkMiddleware } from './config/clerk';
import { apiRouter } from './routes/v1';
import { requestIdMiddleware } from './middleware/request-id.middleware';
import { requestLoggerMiddleware } from './middleware/request-logger.middleware';

export function createApp() {
  const app = express();

  app.set('trust proxy', 1)

  
  app.use(helmet());
  app.use(
    cors({
      origin: ['http://localhost:3001'],
      credentials: true,
    }),
  );
  app.use(express.json({limit: '10kb'}));
  
  app.use(requestIdMiddleware)
  app.use(requestLoggerMiddleware)
  
  app.use(clerkMiddleware());

  app.use('/api/v1', apiRouter);


  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
