// TODO: Revisit

// import { useAuth } from '@clerk/nextjs';
// import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// import { useApiClient } from './use-api-client';
// import { ChatUser, DirectMessage } from '@/types/chat.types';
// import { apiGet, apiPost } from '@/lib/api-client';

// export const chatKeys = {
//   all: ['chat'] as const,
//   users: () => [...chatKeys.all, 'users'] as const,
//   messages: (otherUserId: number) =>
//     [...chatKeys.all, 'messages', otherUserId] as const,
// };

// export const useChatUsers = () => {
//   const { isSignedIn } = useAuth();
//   const apiClient = useApiClient();

//   return useQuery({
//     queryKey: chatKeys.users(),
//     queryFn: () => apiGet<ChatUser[]>(apiClient, '/api/v1/chat/users'),
//     enabled: !!isSignedIn,
//   });
// };

// export const useConversationMessages = (otherUserId: number, limit = 100) => {
//   const { isSignedIn } = useAuth();
//   const apiClient = useApiClient();

//   return useQuery({
//     queryKey: chatKeys.messages(otherUserId),
//     queryFn: () =>
//       apiGet<DirectMessage[]>(
//         apiClient,
//         `/api/v1/chat/conversations/${otherUserId}/messages`,
//         { params: { limit } },
//       ),
//     enabled: !!isSignedIn && !!otherUserId && otherUserId > 0,
//   });
// };

// export const updateMessagesCache = (
//   oldData: DirectMessage[] = [],
//   newMessage: DirectMessage,
// ): DirectMessage[] => {
//   console.log('[updateMessagesCache] Old data length:', oldData.length);
//   console.log('[updateMessagesCache] New message:', newMessage);

//   if (newMessage.tempId) {
//     const optimisticIndex = oldData.findIndex(
//       (m) => m.tempId === newMessage.tempId,
//     );

//     if (optimisticIndex !== -1) {
//       console.log(
//         '[updateMessagesCache] Replacing optimistic message at index:',
//         optimisticIndex,
//       );
//       const newCache = [...oldData];
//       newCache[optimisticIndex] = newMessage;
//       return newCache.sort(
//         (a, b) =>
//           new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
//       );
//     }
//   }

//   const exists = oldData.some((m) => m.id === newMessage.id);
//   if (exists) {
//     console.log('[updateMessagesCache] Message already exists, skipping');
//     return oldData;
//   }

//   return [...oldData, newMessage].sort(
//     (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
//   );
// };

// export const useAddMessageToCache = () => {
//   const queryClient = useQueryClient();

//   return (otherUserId: number, message: DirectMessage) => {
//     queryClient.setQueryData<DirectMessage[]>(
//       chatKeys.messages(otherUserId),
//       (old = []) => updateMessagesCache(old, message),
//     );
//   };
// };

// export const useSendMessage = (otherUserId: number) => {
//   const apiClient = useApiClient();
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async (data: {
//       body: string | null;
//       imageUrl: string | null;
//     }) => {
//       const res = apiPost<typeof data, DirectMessage>(
//         apiClient,
//         `/api/v1/chat/conversations/${otherUserId}/messages`,
//         data,
//       );

//       return res;
//     },
//     onSuccess: (newMessage: DirectMessage) => {
//       queryClient.setQueryData<DirectMessage[]>(
//         chatKeys.messages(otherUserId),
//         (old = []) => updateMessagesCache(old, newMessage),
//       );
//     },
//   });
// };
