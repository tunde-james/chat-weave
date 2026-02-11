import { Router } from 'express';
import { getAuth } from '../../config/clerk';

import {
  createThread,
  getThreadById,
  listCategories,
  listThreads,
  parseThreadListFilter,
} from '../../modules/threads/threads.repository';
import { createThreadSchema } from '../../modules/threads/threads.schema';
import { getUserFromClerk } from '../../modules/users/user.service';
import {
  createReply,
  deleteReplyById,
  findReplyAuthor,
  getThreadDetailsWithCount,
  likeThreadOnce,
  listRepliesForThread,
  unlikeThreadOnce,
} from '../../modules/threads/replies.repository';
import {
  createLikeNotification,
  createReplyNotification,
} from '../../modules/notifications/notification.service';
import { BadRequestError, UnauthorizedError } from '../../lib/app-error';

export const threadsRouter = Router();

threadsRouter.get('/categories', async (_req, res, next) => {
  try {
    const extractListOfCategories = await listCategories();

    res.json({ data: extractListOfCategories });
  } catch (error) {
    next(error);
  }
});

threadsRouter.post('/', async (req, res, next) => {
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

threadsRouter.get('/:threadId', async (req, res, next) => {
  try {
    const threadId = Number(req.params.threadId);

    if (!Number.isInteger(threadId) || threadId <= 0) {
      throw new BadRequestError('Invalid thread id');
    }

    const auth = getAuth(req);
    if (!auth.userId) {
      throw new UnauthorizedError('Unauthorized');
    }

    const profile = await getUserFromClerk(auth.userId);
    const viewerUserId = profile.user.id;

    const thread = await getThreadDetailsWithCount({
      threadId,
      viewerUserId,
    });

    res.json({ data: thread });
  } catch (error) {
    next(error);
  }
});

threadsRouter.get('/', async (req, res, next) => {
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

// Replies and Likes Endpoints
threadsRouter.get('/:threadId/replies', async (req, res, next) => {
  try {
    const auth = getAuth(req);
    if (!auth.userId) {
      throw new UnauthorizedError('Unauthorized');
    }

    const threadId = Number(req.params.threadId);
    const replies = await listRepliesForThread(threadId);

    res.json({ data: replies });
  } catch (error) {
    next(error);
  }
});

threadsRouter.post('/:threadId/replies', async (req, res, next) => {
  try {
    const auth = getAuth(req);
    if (!auth.userId) {
      throw new UnauthorizedError('Unauthorized');
    }

    const threadId = Number(req.params.threadId);

    if (!Number.isInteger(threadId) || threadId <= 0) {
      throw new BadRequestError('Invalid thread Id');
    }

    const bodyRaw = typeof req.body?.body === 'string' ? req.body.body : '';
    if (bodyRaw.trim().length <= 2) {
      throw new BadRequestError('Reply is too short!');
    }

    const profile = await getUserFromClerk(auth.userId);

    const reply = await createReply({
      threadId,
      authorUserId: profile.user.id,
      body: bodyRaw,
    });

    // TODO: Trigger notification here later
    await createReplyNotification({
      threadId,
      actorUserId: profile.user.id,
    });

    res.status(201).json({ data: reply });
  } catch (error) {
    next(error);
  }
});

threadsRouter.delete('/replies/:replyId', async (req, res, next) => {
  try {
    const auth = getAuth(req);
    if (!auth.userId) {
      throw new UnauthorizedError('Unauthorized');
    }

    const replyId = Number(req.params.replyId);

    if (!Number.isInteger(replyId) || replyId <= 0) {
      throw new BadRequestError('Invalid replyId');
    }

    const profile = await getUserFromClerk(auth.userId);
    const authorUserId = await findReplyAuthor(replyId);

    if (authorUserId !== profile.user.id) {
      throw new UnauthorizedError('You can only delete your replies');
    }

    await deleteReplyById(replyId);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

threadsRouter.post('/:threadId/like', async (req, res, next) => {
  try {
    const auth = getAuth(req);
    if (!auth.userId) {
      throw new UnauthorizedError('Unauthorized');
    }

    const threadId = Number(req.params.threadId);

    if (!Number.isInteger(threadId) || threadId <= 0) {
      throw new BadRequestError('Invalid threadId');
    }

    const profile = await getUserFromClerk(auth.userId);

    await likeThreadOnce({
      threadId,
      userId: profile.user.id,
    });

    // Notification -> logic here
    await createLikeNotification({
      threadId,
      actorUserId: profile.user.id,
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

threadsRouter.delete('/:threadId/like', async (req, res, next) => {
  try {
    const auth = getAuth(req);
    if (!auth.userId) {
      throw new UnauthorizedError('Unauthorized');
    }

    const threadId = Number(req.params.threadId);

    if (!Number.isInteger(threadId) || threadId <= 0) {
      throw new BadRequestError('Invalid threadId');
    }

    const profile = await getUserFromClerk(auth.userId);

    await unlikeThreadOnce({
      threadId,
      userId: profile.user.id,
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
