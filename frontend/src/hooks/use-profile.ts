import { useAuth } from '@clerk/nextjs';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiGet, apiPatch } from '@/lib/api-client';
import { ProfileFormValues, UserResponse } from '@/app/profile/profile.schema';
import { useApiClient } from './use-api-client';

export const profileKeys = {
  all: ['profile'] as const,
  me: () => [...profileKeys.all, 'me'] as const,
};

export const useProfile = () => {
  const { isSignedIn } = useAuth();
  const apiClient = useApiClient();

  return useQuery({
    queryKey: profileKeys.me(),
    queryFn: () => apiGet<UserResponse>(apiClient, '/api/v1/users/me'),
    enabled: !!isSignedIn,
  });
};

export const useUpdateProfile = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      return apiPatch<ProfileFormValues, UserResponse>(
        apiClient,
        '/api/v1/users/me',
        data,
      );
    },
    onSuccess: (data) => {
      queryClient.setQueryData(profileKeys.me(), data);
    },
  });
};
