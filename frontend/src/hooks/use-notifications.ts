import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';

import { useApiClient } from './use-api-client';
import { apiGet, apiPost } from '@/lib/api-client';
import { Notification } from '@/types/notification.types';

export const notificationKeys = {
  all: ['notifications'] as const,
  list: (unreadOnly?: boolean) =>
    [...notificationKeys.all, { unreadOnly }] as const,
  unreadCount: () => [...notificationKeys.all, 'unread-count'] as const,
};

export const useNotifications = (unreadOnly = false) => {
  const { isSignedIn } = useAuth();
  const apiClient = useApiClient();

  return useQuery({
    queryKey: notificationKeys.list(unreadOnly),
    queryFn: () =>
      apiGet<Notification[]>(apiClient, '/api/v1/notifications', {
        params: { unreadOnly: unreadOnly ? true : undefined },
      }),
    enabled: !!isSignedIn,
  });
};

export const useUnreadNotificationCount = () => {
  const { isSignedIn } = useAuth();
  const apiClient = useApiClient();

  return useQuery({
    queryKey: [...notificationKeys.all, 'unread-count'],
    queryFn: async () => {
      const data = await apiGet<Notification[]>(
        apiClient,
        '/api/v1/notifications',
        {
          params: { unreadOnly: 'true' },
        },
      );

      return data.length;
    },
    enabled: !!isSignedIn,
    refetchInterval: 60_000,
  });
};

export const useIncrementUnreadCount = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.setQueryData<number>(
      notificationKeys.unreadCount(),
      (old) => (old ?? 0) + 1,
    );
  };
};

export const useDecrementUnreadCount = () => {
  const queryClient = useQueryClient();

  return (amount: number = 1) => {
    queryClient.setQueryData<number>(notificationKeys.unreadCount(), (old) =>
      Math.max(0, (old ?? 0) - amount),
    );
  };
};

export const useMarkNotificationRead = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: number) => {
      await apiPost(
        apiClient,
        `/api/v1/notifications/${notificationId}/read`,
        {},
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await apiPost(apiClient, '/api/v1/notifications/read-all', {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
};
