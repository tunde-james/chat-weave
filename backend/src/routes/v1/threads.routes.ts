import { Router } from 'express';

import { asyncHandler } from '../../lib/async-handler';
import {
  createReplyController,
  createThreadController,
  deleteReplyController,
  getCategoriesController,
  getRepliesController,
  getThreadByIdController,
  likeThreadController,
  listThreadsController,
  unlikeThreadController,
} from '../../modules/threads/threads.controller';

export const threadsRouter = Router();

threadsRouter.get('/categories', asyncHandler(getCategoriesController));
threadsRouter.get('/', asyncHandler(listThreadsController));
threadsRouter.get('/:threadId', asyncHandler(getThreadByIdController));
threadsRouter.get('/:threadId/replies', asyncHandler(getRepliesController));

threadsRouter.post('/', asyncHandler(createThreadController));
threadsRouter.post('/:threadId/replies', asyncHandler(createReplyController));
threadsRouter.delete('/replies/:replyId', asyncHandler(deleteReplyController));
threadsRouter.post('/:threadId/like', asyncHandler(likeThreadController));
threadsRouter.delete('/:threadId/like', asyncHandler(unlikeThreadController));
