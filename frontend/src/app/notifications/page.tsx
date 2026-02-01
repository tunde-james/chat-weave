'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { apiGet, createApiClient } from '@/lib/api-client';
import { useNotificationCount } from '@/hooks/use-notification-count';
import { Notification } from '@/types/notification.types';
import { Inbox, MessageCircle, ThumbsUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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

const NotificationPage = () => {
  const { getToken } = useAuth();
  const router = useRouter();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { decrementUnread } = useNotificationCount();

  const apiClient = useMemo(() => createApiClient(getToken), [getToken]);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        setIsLoading(true);

        const data = await apiGet<Notification[]>(
          apiClient,
          '/api/v1/notifications',
        );

        if (!isMounted) return;

        setNotifications(data);
      } catch (error) {
        console.log(error);
        // TODO -> handle error state in case of error and render
      } finally {
        setIsLoading(false);
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [apiClient, getToken]);

  const openNotification = async (n: Notification) => {
    try {
      if (!n.readAt) {
        await apiClient.post(`/api/v1/notifications/${n.id}/read`);

        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === n.id
              ? { ...n, readAt: new Date().toISOString() }
              : n,
          ),
        );
        decrementUnread();
      }
    } catch (error) {
      console.log(error);
    }

    router.push(`/threads/${n.threadId}`);
  };

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  return (
    <div className="mx-auto flex w-full flex-col gap-6 py-8 px-4">
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-foreground">
          <Inbox className="h-7 w-7 text-primary" />
          Notifications
        </h1>
      </div>

      <Card className="border-border/70 bg-card">
        {isLoading ? (
          <CardContent className="py-10 text-center">
            <p className="text-sm text-muted-foreground">
              Loading notifications...
            </p>
          </CardContent>
        ) : null}

        {!isLoading && notifications.length === 0 ? (
          <CardContent className="py-10 text-center">
            <p className="text-sm text-muted-foreground">
              No new notifications...
            </p>
          </CardContent>
        ) : null}

        {!isLoading && notifications.length > 0 ? (
          <CardContent className="divide-y divide-border/70">
            {notifications.map((notification) => {
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
                  onClick={() => openNotification(notification)}
                  className={`flex w-full items-start gap-4 px-3 py-4 text-left transition-colors duration-200 ${
                    isUnread
                      ? 'bg-primary/5 hover:bg-primary/10'
                      : 'hover:bg-primary/20'
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
                          isUnread
                            ? 'text-primary font-medium'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {new Date(notification.createdAt).toLocaleDateString(
                          'en-US',
                          {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          },
                        )}
                      </span>
                    </div>

                    <p className="mt-1 truncate text-sm text-muted-foreground">
                      {notification.thread.title}
                    </p>

                    {isUnread ? (
                      <div className="mt-2 flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="border-primary/30 bg-primary/10 text-[12px text-primary]"
                        >
                          New
                        </Badge>
                      </div>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </CardContent>
        ) : null}
      </Card>
    </div>
  );
};

export default NotificationPage;
