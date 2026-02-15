import { useAuth } from '@clerk/nextjs';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import { apiGet, apiPatch, createApiClient } from '@/lib/api-client';
import { ProfileFormValues, UserResponse } from '@/app/profile/profile.schema';

export const profileKeys = {
  all: ['profile'] as const,
  me: () => [...profileKeys.all, 'me'] as const,
};

export const useProfile = () => {
  const { getToken, isSignedIn } = useAuth();
  const apiClient = useMemo(() => createApiClient(getToken), [getToken]);

  return useQuery({
    queryKey: profileKeys.me(),
    queryFn: () => apiGet<UserResponse>(apiClient, '/api/v1/users/me'),
    enabled: !!isSignedIn,
  });
};

export const useUpdateProfile = () => {
  const { getToken } = useAuth();
  const apiClient = useMemo(() => createApiClient(getToken), [getToken]);
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
