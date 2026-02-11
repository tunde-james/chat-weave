import type { Request, Response } from 'express';

import { getAuth } from '../../config/clerk';
import {
  createThread,
  listCategories,
  listThreads,
  parseThreadListFilter,
} from './threads.repository';
import { BadRequestError, UnauthorizedError } from '../../lib/app-error';
import { getUserFromClerk } from '../users/user.service';
import {
  createReply,
  deleteReplyById,
  findReplyAuthor,
  getThreadDetailsWithCount,
  likeThreadOnce,
  listRepliesForThread,
  unlikeThreadOnce,
} from './replies.repository';
import { createThreadSchema } from './threads.schema';
import { HTTP_STATUS } from '../../config/http-status.config';
import {
  createLikeNotification,
  createReplyNotification,
} from '../notifications/notification.service';

export const getCategoriesController = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  const categories = await listCategories();

  res.json({ data: categories });
};

export const listThreadsController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const filter = parseThreadListFilter({
    page: req.query.page,
    pageSize: req.query.pageSize,
    category: req.query.category,
    q: req.query.q,
    sort: req.query.sort,
  });

  const threads = await listThreads(filter);

  res.json({ data: threads });
};

export const getThreadByIdController = async (
  req: Request,
  res: Response,
): Promise<void> => {
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
};

export const getRepliesController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const auth = getAuth(req);
  if (!auth.userId) {
    throw new UnauthorizedError('Unauthorized');
  }

  const threadId = Number(req.params.threadId);
  if (!Number.isInteger(threadId) || threadId <=0) {
    throw new BadRequestError('Invalid thread id')
  }

  const replies = await listRepliesForThread(threadId);

  res.json({ data: replies });
};

export const createThreadController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const auth = getAuth(req);
  if (!auth.userId) {
    throw new UnauthorizedError('Unauthorized');
  }

  const parsedBody = createThreadSchema.parse(req.body);
  const profile = await getUserFromClerk(auth.userId);

  const newThread = await createThread({
    categorySlug: parsedBody.categorySlug,
    authorUserId: profile.user.id,
    title: parsedBody.title,
    body: parsedBody.body,
  });

  res.status(HTTP_STATUS.CREATED).json({ data: newThread });
};

export const createReplyController = async (
  req: Request,
  res: Response,
): Promise<void> => {
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

  await createReplyNotification({
    threadId,
    actorUserId: profile.user.id,
  });

  res.status(HTTP_STATUS.CREATED).json({ data: reply });
};

export const deleteReplyController = async (
  req: Request,
  res: Response,
): Promise<void> => {
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

  res.status(HTTP_STATUS.NO_CONTENT).send();
};

export const likeThreadController = async (
  req: Request,
  res: Response,
): Promise<void> => {
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

  await createLikeNotification({
    threadId,
    actorUserId: profile.user.id,
  });

  res.status(HTTP_STATUS.NO_CONTENT).send();
};

export const unlikeThreadController = async (
  req: Request,
  res: Response,
): Promise<void> => {
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

  res.status(HTTP_STATUS.NO_CONTENT).send();
};
