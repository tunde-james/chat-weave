import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.string().default('5000'),

  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.string().default('6450'),
  DB_NAME: z.string().default('chat_weave'),
  DB_USER: z.string().default('postgres'),
  DB_PASSWORD: z.string(),

  CLERK_PUBLISHABLE_KEY: z.string(),
  CLERK_SECRET_KEY: z.string(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  process.exit(1);
}

export const env = parsed.data;
