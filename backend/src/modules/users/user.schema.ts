import { z } from 'zod';

import {
  toUserProfileResponse,
  UserProfile,
  UserProfileResponse,
} from './user.types';

export const userProfileUpdateSchema = z.object({
  displayName: z.string().trim().max(50).optional(),
  handle: z.string().trim().max(30).optional(),
  bio: z.string().trim().max(500).optional(),
  avatarUrl: z.url('Avatar must be a valid url').optional(),
});

export const toResponse = (profile: UserProfile): UserProfileResponse => {
  return toUserProfileResponse(profile);
};
