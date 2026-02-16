import { useAuth } from '@clerk/nextjs';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import { createApiClient, apiGet, apiPost, apiDelete } from '@/lib/api-client';
import {
  Category,
  Comment,
  ThreadDetail,
  ThreadDetails,
  ThreadSummary,
} from '@/types/threads.types';
import { useApiClient } from './use-api-client';

export const threadKeys = {
  all: ['threads'] as const,
  lists: () => [...threadKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) =>
    [...threadKeys.lists(), filters] as const,
  details: () => [...threadKeys.all, 'detail'] as const,
  detail: (id: number) => [...threadKeys.details(), id] as const,
  categories: () => ['categories'] as const,
  replies: (threadId: number) =>
    [...threadKeys.detail(threadId), 'replies'] as const,
};

interface UseThreadsParams {
  category?: string;
  search?: string;
}

export const useCategories = () => {
  const apiClient = useApiClient();

  return useQuery({
    queryKey: threadKeys.categories(),
    queryFn: async () => {
      return apiGet<Category[]>(apiClient, '/api/v1/threads/categories');
    },
  });
};

export const useThreads = ({ category, search }: UseThreadsParams = {}) => {
  const apiClient = useApiClient();

  return useQuery({
    queryKey: threadKeys.list({ category, search }),
    queryFn: () =>
      apiGet<ThreadSummary[]>(apiClient, '/api/v1/threads', {
        params: {
          category: category && category !== 'all' ? category : undefined,
          q: search || undefined,
        },
      }),
  });
};

export function useThread(threadId: number) {
  const apiClient = useApiClient();

  return useQuery({
    queryKey: threadKeys.detail(threadId),
    queryFn: () =>
      apiGet<ThreadDetails>(apiClient, `/api/v1/threads/${threadId}`),
    enabled: !!threadId && threadId > 0,
  });
}

export const useThreadReplies = (threadId: number) => {
  const apiClient = useApiClient();

  return useQuery({
    queryKey: threadKeys.replies(threadId),
    queryFn: async () => {
      return apiGet<Comment[]>(
        apiClient,
        `/api/v1/threads/${threadId}/replies`,
      );
    },
    enabled: !!threadId && threadId > 0,
  });
};

export const useCreateThread = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      body: string;
      categorySlug: string;
    }) => {
      return apiPost<typeof data, ThreadDetail>(
        apiClient,
        '/api/v1/threads',
        data,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: threadKeys.lists() });
    },
  });
};

export const useCreateComment = (threadId: number) => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: string) => {
      return apiPost<{ body: string }, Comment>(
        apiClient,
        `/api/v1/threads/${threadId}/replies`,
        { body },
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: threadKeys.replies(threadId),
      });
      queryClient.invalidateQueries({ queryKey: threadKeys.detail(threadId) });
    },
  });
};

export const useDeleteComment = (threadId: number) => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentId: number) => {
      return apiDelete(apiClient, `/api/v1/threads/replies/${commentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: threadKeys.replies(threadId),
      });
      queryClient.invalidateQueries({ queryKey: threadKeys.detail(threadId) });
    },
  });
};

export const useToggleLike = (threadId: number) => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ isLiked }: { isLiked: boolean }) => {
      if (isLiked) {
        return apiDelete(apiClient, `/api/v1/threads/${threadId}/like`);
      } else {
        return apiPost(apiClient, `/api/v1/threads/${threadId}/like`, {});
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: threadKeys.detail(threadId) });
      queryClient.invalidateQueries({ queryKey: threadKeys.lists() });
    },
  });
};
