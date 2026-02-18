// components/chat/direct-chat-panel.tsx
'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect, useMemo, useState } from 'react';

import { apiGet, createApiClient } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Wifi, WifiOff } from 'lucide-react';
import { toast } from 'sonner';
import {
  DirectChatPanelProps,
  DirectMessage,
  mapDirectMessage,
  mapDirectMessagesResponse,
  RawDirectMessage,
} from '@/types/chat.types';
import MessageList from './message-list';
import MessageInput from './message-input';

function DirectChatPanel({
  otherUser,
  otherUserId,
  socket,
  connected,
}: DirectChatPanelProps) {
  const { getToken } = useAuth();
  const apiClient = useMemo(() => createApiClient(getToken), [getToken]);

  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typingLabel, setTypingLabel] = useState<string | null>(null);

  // Load messages on mount or when otherUserId changes
  useEffect(() => {
    let isMounted = true;

    async function load() {
      setIsLoading(true);

      try {
        const res = await apiGet<DirectMessage[]>(
          apiClient,
          `/api/v1/chat/conversations/${otherUserId}/messages`,
          { params: { limit: 100 } },
        );

        if (!isMounted) return;
        setMessages(mapDirectMessagesResponse(res));
      } catch (err) {
        console.error('Failed to load messages:', err);
      } finally {
        setIsLoading(false);
      }
    }

    if (otherUserId) {
      load();
    }

    return () => {
      isMounted = false;
    };
  }, [apiClient, otherUserId]);

  // Handle incoming socket messages
  useEffect(() => {
    if (!socket) return;

    function handleMessage(payload: RawDirectMessage) {
      const mapped = mapDirectMessage(payload);

      // Only add messages relevant to this conversation
      if (
        mapped.senderUserId !== otherUserId &&
        mapped.recipientUserId !== otherUserId
      ) {
        return;
      }

      setMessages((prev) => [...prev, mapped]);
    }

    function handleTyping(payload: {
      senderUserId?: number;
      recipientUserId?: number;
      isTyping?: boolean;
    }) {
      const senderId = Number(payload.senderUserId);

      if (senderId !== otherUserId) return;

      if (payload.isTyping) {
        setTypingLabel('Typing...');
      } else {
        setTypingLabel(null);
      }
    }

    socket.on('dm:message', handleMessage);
    socket.on('dm:typing', handleTyping);

    return () => {
      socket.off('dm:message', handleMessage);
      socket.off('dm:typing', handleTyping);
    };
  }, [socket, otherUserId]);

  function setSendTyping(isTyping: boolean) {
    if (!socket) return;
    socket.emit('dm:typing', { recipientUserId: otherUserId, isTyping });
  }

  function handleSendMessage(body: string, imageUrl: string | null) {
    if (!socket || !connected) {
      toast.error('Not connected', {
        description: 'Realtime connection is not established yet!',
      });
      return;
    }

    if (!body && !imageUrl) return;

    setSending(true);

    try {
      socket.emit('dm:send', {
        recipientUserId: otherUserId,
        body: body || null,
        imageUrl: imageUrl || null,
      });

      setSendTyping(false);
    } finally {
      setSending(false);
    }
  }

  const title =
    otherUser?.handle && otherUser?.handle !== ''
      ? `@${otherUser?.handle}`
      : (otherUser?.displayName ?? 'Conversation');

  return (
    <Card className="flex h-full flex-col overflow-hidden border-border/70 bg-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-border pb-3">
        <div>
          <CardTitle className="text-base text-foreground">{title}</CardTitle>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Direct message conversation
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-medium ${
              connected
                ? 'bg-primary/10 text-primary'
                : 'bg-accent text-accent-foreground'
            }`}
          >
            {connected ? (
              <>
                <Wifi className="w-3 h-3" />
                Online
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3" />
                Offline
              </>
            )}
          </span>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-3 overflow-y-auto bg-background/60 p-4">
        <MessageList
          messages={messages}
          isLoading={isLoading}
          otherUserIdValue={otherUserId}
          otherUserName={title}
          typingLabel={typingLabel}
        />
      </CardContent>

      <MessageInput
        onSendMessage={handleSendMessage}
        onTyping={setSendTyping}
        connected={connected}
        sending={sending}
      />
    </Card>
  );
}

export default DirectChatPanel;
