import { Notification } from '@/types/notification.types';
import { MessageCircle, ThumbsUp } from 'lucide-react';
import { Badge } from '../ui/badge';

const formatText = (n: Notification) => {
  const actor =
    n.actor.handle !== null && n.actor.handle !== ''
      ? `@${n.actor.handle}`
      : (n.actor.displayName ?? 'Someone');

  if (n.type === 'REPLY_ON_THREAD') {
    return `${actor} commented on your thread`;
  }

  if (n.type === 'LIKE_ON_THREAD') {
    return `${actor} liked your thread`;
  }

  return `${actor} interacted with your thread`;
};

const NotificationItem = ({
  notification,
  onOpen,
}: {
  notification: Notification;
  onOpen: (n: Notification) => void;
}) => {
  const text = formatText(notification);
  const icon =
    notification.type === 'REPLY_ON_THREAD' ? (
      <MessageCircle className="h-4 w-4 text-chart-2" />
    ) : (
      <ThumbsUp className="h-4 w-4 text-primary" />
    );

  const isUnread = !notification.readAt;

  return (
    <button
      key={notification.id}
      type="button"
      onClick={() => onOpen(notification)}
      className={`flex w-full items-start gap-4 px-3 py-4 text-left transition-colors duration-200 ${
        isUnread ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-primary/20'
      }`}
    >
      <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-background/60">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
          <p
            className={`text-sm ${
              isUnread
                ? 'font-semibold text-foreground'
                : 'text-muted-foreground'
            }`}
          >
            {text}
          </p>

          <span
            className={`shrink-0 text-xs ${
              isUnread ? 'text-primary font-medium' : 'text-muted-foreground'
            }`}
          >
            {new Date(notification.createdAt).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>

        <p className="mt-1 truncate text-sm text-muted-foreground">
          {notification.thread.title}
        </p>

        {isUnread ? (
          <div className="mt-2 flex items-center gap-2">
            <Badge
              variant="outline"
              className="border-primary/30 bg-primary/10 text-[12px] text-primary"
            >
              New
            </Badge>
          </div>
        ) : null}
      </div>
    </button>
  );
};

export default NotificationItem;
