import { useEffect, useRef } from 'react';
import { DirectMessage } from '@/types/chat.types';

interface MessageListProps {
  messages: DirectMessage[];
  isLoading: boolean;
  otherUserIdValue: number;
  otherUserName: string;
  typingLabel: string | null;
}

const MessageList = ({
  messages,
  isLoading,
  otherUserIdValue,
  otherUserName,
  typingLabel,
}: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef?.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]); // Only scroll when message count changes

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-xs text-muted-foreground">Loading messages...</p>
      </div>
    );
  }

  if (!isLoading && messages.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-xs text-muted-foreground">
          No messages yet. Start the first initiative
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {messages.map((msg) => {
        const isOther = msg.senderUserId === otherUserIdValue;
        const label = isOther ? otherUserName : 'You';

        const time = new Date(msg.createdAt).toLocaleDateString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        });

        return (
          <div
            className={`flex gap-2 text-xs ${
              isOther ? 'justify-start' : 'justify-end'
            }`}
            key={msg.id}
          >
            <div className={`max-w-xs ${isOther ? '' : 'order-2'}`}>
              <div
                className={`mb-1 text-[12px] font-medium ${
                  isOther
                    ? 'text-muted-foreground'
                    : 'text-muted-foreground text-right'
                }`}
              >
                {label} - {time}
              </div>

              {msg?.body && (
                <div
                  className={`inline-block rounded-lg px-3 py-2 transition-colors duration-150 ${
                    isOther
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-primary/80 text-primary-foreground'
                  }`}
                >
                  <p className="wrap-break-word text-[16px] leading-relaxed">
                    {msg.body}
                  </p>
                </div>
              )}

              {msg?.imageUrl && (
                <div className="mt-2 overflow-hidden rounded-lg border border-border">
                  <img
                    src={msg.imageUrl}
                    alt="attachment"
                    className="max-h-52 max-w-xs rounded-lg object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        );
      })}

      {typingLabel && (
        <div className="flex justify-start gap-2 text-xs">
          <div className="italic text-muted-foreground">{typingLabel}</div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
