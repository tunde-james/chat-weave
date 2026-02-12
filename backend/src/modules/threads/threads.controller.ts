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

/**
 * @swagger
 * /api/v1/threads/categories:
 *   get:
 *     summary: Get all thread categories
 *     tags: [Threads]
 *     security: []
 *     responses:
 *       200:
 *         description: List of categories
 */
export const getCategoriesController = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  const categories = await listCategories();

  res.json({ data: categories });
};

/**
 * @swagger
 * /api/v1/threads:
 *   get:
 *     summary: Get all threads with filters
 *     tags: [Threads]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *         description: Items per page
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category slug
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Paginated list of threads
 */
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

/**
 * @swagger
 * /api/v1/threads/{threadId}:
 *   get:
 *     summary: Get thread by ID
 *     tags: [Threads]
 *     parameters:
 *       - in: path
 *         name: threadId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Thread details
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
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

/**
 * @swagger
 * /api/v1/threads/{threadId}/replies:
 *   get:
 *     summary: Get replies for a thread
 *     tags: [Threads]
 *     parameters:
 *       - in: path
 *         name: threadId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of replies
 */
export const getRepliesController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const auth = getAuth(req);
  if (!auth.userId) {
    throw new UnauthorizedError('Unauthorized');
  }

  const threadId = Number(req.params.threadId);
  if (!Number.isInteger(threadId) || threadId <= 0) {
    throw new BadRequestError('Invalid thread id');
  }

  const replies = await listRepliesForThread(threadId);

  res.json({ data: replies });
};

/**
 * @swagger
 * /api/v1/threads:
 *   post:
 *     summary: Create a new thread
 *     tags: [Threads]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - body
 *               - categorySlug
 *             properties:
 *               title:
 *                 type: string
 *               body:
 *                 type: string
 *               categorySlug:
 *                 type: string
 *     responses:
 *       201:
 *         description: Thread created successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
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

/**
 * @swagger
 * /api/v1/threads/{threadId}/replies:
 *   post:
 *     summary: Create a reply to a thread
 *     tags: [Threads]
 *     parameters:
 *       - in: path
 *         name: threadId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - body
 *             properties:
 *               body:
 *                 type: string
 *     responses:
 *       201:
 *         description: Reply created successfully
 */
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

/**
 * @swagger
 * /api/v1/threads/replies/{replyId}:
 *   delete:
 *     summary: Delete a reply
 *     tags: [Threads]
 *     parameters:
 *       - in: path
 *         name: replyId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Reply deleted successfully
 */
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

/**
 * @swagger
 * /api/v1/threads/{threadId}/like:
 *   post:
 *     summary: Like a thread
 *     tags: [Threads]
 *     parameters:
 *       - in: path
 *         name: threadId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Thread liked successfully
 */
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

/**
 * @swagger
 * /api/v1/threads/{threadId}/like:
 *   delete:
 *     summary: Unlike a thread
 *     tags: [Threads]
 *     parameters:
 *       - in: path
 *         name: threadId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Thread unliked successfully
 */
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
