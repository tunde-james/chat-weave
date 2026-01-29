import { z } from 'zod';

export const newThreadSchema = z.object({
  title: z.string().trim().min(5, 'Title is too short'),
  body: z.string().trim().min(15, 'Body is too short'),
  categorySlug: z.string().trim().min(1, 'Category is required'),
});

export type NewThreadFormValues = z.infer<typeof newThreadSchema>;
