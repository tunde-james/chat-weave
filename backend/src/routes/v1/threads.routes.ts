import { Router } from 'express';
import { getAuth } from '../../config/clerk';

import {
  createThread,
  getThreadById,
  listCategories,
  listThreads,
  parseThreadListFilter,
} from '../../modules/threads/threads.repository';
import { BadRequestError, UnauthorizedError } from '../../lib/errors';
import { createThreadSchema } from '../../modules/threads/threads.schema';
import { getUserFromClerk } from '../../modules/users/user.service';

export const threadsRouter = Router();

threadsRouter.get('/categories', async (_req, res, next) => {
  try {
    const extractListOfCategories = await listCategories();

    res.json({ data: extractListOfCategories });
  } catch (error) {
    next(error);
  }
});

threadsRouter.post('/threads', async (req, res, next) => {
  try {
    const auth = getAuth(req);
    if (!auth.userId) {
      throw new UnauthorizedError('Unauthorized');
    }

    const parsedBody = createThreadSchema.parse(req.body);

    const profile = await getUserFromClerk(auth.userId);

    const newlyCreatedThread = await createThread({
      categorySlug: parsedBody.categorySlug,
      authorUserId: profile.user.id,
      title: parsedBody.title,
      body: parsedBody.body,
    });

    res.status(201).json({ data: newlyCreatedThread });
  } catch (error) {
    next(error);
  }
});

threadsRouter.get('/threads/:threadId', async (req, res, next) => {
  try {
    const threadId = Number(req.params.threadId);

    if (!Number.isInteger(threadId) || threadId <= 0) {
      throw new BadRequestError('Invalid thread id');
    }

    const auth = getAuth(req);
    if (!auth.userId) {
      throw new UnauthorizedError('Unauthorized');
    }

    // const profile = await getUserFromClerk(auth.userId);
    // const viewerUserId = profile.user.id;

    const thread = await getThreadById(threadId);

    res.json({ data: thread });
  } catch (error) {
    next(error);
  }
});

threadsRouter.get('/threads', async (req, res, next) => {
  try {
    const filter = parseThreadListFilter({
      page: req.query.page,
      pageSize: req.query.pageSize,
      category: req.query.category,
      q: req.query.q,
      sort: req.query.sort,
    });

    const extractListOfThreads = await listThreads(filter);

    res.json({ data: extractListOfThreads });
  } catch (error) {
    next(error);
  }
});
