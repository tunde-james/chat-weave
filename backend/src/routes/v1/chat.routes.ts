import { Router } from 'express';

import { asyncHandler } from '../../lib/async-handler';
import {
  getChatUsersController,
  getConversationMessagesController,
} from '../../modules/chats/chat.controller';

export const chatRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Chat
 *   description: Real-time chat endpoints
 */

chatRouter.get('/users', asyncHandler(getChatUsersController));
chatRouter.get(
  '/conversations/:otherUserId/messages',
  asyncHandler(getConversationMessagesController),
);
