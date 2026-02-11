import { Router } from 'express';

import { asyncHandler } from '../../lib/async-handler';
import {
  getCurrentUserController,
  updateCurrentUserController,
} from '../../modules/users/user.controller';

export const userRouter = Router();

userRouter.get('/', asyncHandler(getCurrentUserController));
userRouter.patch('/', asyncHandler(updateCurrentUserController));
