import http from 'node:http';

import { createApp } from './app';
import { assertDatabaseConnection } from './db/db';
import { logger } from './lib/logger';
import { env } from './config/env.config';
import { initIO } from './realtime/io';

async function bootstrap() {
  try {
    await assertDatabaseConnection();

    const app = createApp();
    const server = http.createServer(app);

    const port = Number(env.PORT) || 3000;

    initIO(server);

    server.listen(port, () => {
      logger.info(`Server is listening to port: http://localhost:${port}`);
    });
  } catch (err) {
    logger.error(`Failed to start the server: ${err}`);
    process.exit(1);
  }
}

bootstrap();
