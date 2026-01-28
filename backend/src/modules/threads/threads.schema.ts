import { z } from 'zod';

export const createThreadSchema = z.object({
  title: z.string().trim().min(5).max(200),
  body: z.string().trim().min(10).max(2000),
  categorySlug: z.string().trim().min(1),
});
