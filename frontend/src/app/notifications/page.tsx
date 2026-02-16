'use client';

import { useRouter } from 'next/navigation';

import { Notification } from '@/types/notification.types';
import {
  AlertCircle,
  CheckCheck,
  Inbox,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from '@/hooks/use-notifications';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import NotificationItem from '@/components/notifications/notification-item';

const NotificationPage = () => {
  const router = useRouter();
  const { data: notifications = [], isLoading, error } = useNotifications();
  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();

  const openNotification = async (n: Notification) => {
    if (!n.readAt) {
      try {
        await markReadMutation.mutateAsync(n.id);
      } catch (error) {
        toast.error('Failed to mark notification as read');
      }
    }

    router.push(`/threads/${n.threadId}`);
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllReadMutation.mutateAsync();
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all notifications as read');
    }
  };

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  return (
    <div className="mx-auto flex w-full flex-col gap-6 py-8 px-4">
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-foreground">
          <Inbox className="h-7 w-7 text-primary" />
          Notifications
          {unreadCount > 0 && (
            <Badge className="ml-2 bg-primary text-primary-foreground">
              {unreadCount} unread
            </Badge>
          )}
        </h1>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            disabled={markAllReadMutation.isPending}
          >
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark all read
          </Button>
        )}
      </div>

      <Card className="border-border/70 bg-card">
        {error && (
          <CardContent className="flex items-center gap-3 py-6">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <p className="text-sm text-destructive">
              {error.message ||
                'Failed to load notifications. Please try again.'}
            </p>
          </CardContent>
        )}

        {isLoading && !error ? (
          <CardContent className="py-10 text-center">
            <p className="text-sm text-muted-foreground">
              Loading notifications...
            </p>
          </CardContent>
        ) : null}

        {!isLoading && !error && notifications.length === 0 ? (
          <CardContent className="py-10 text-center">
            <p className="text-sm text-muted-foreground">
              No new notifications...
            </p>
          </CardContent>
        ) : null}

        {!isLoading && !error && notifications.length > 0 ? (
          <CardContent className="divide-y divide-border/70 p-0">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onOpen={openNotification}
              />
            ))}
          </CardContent>
        ) : null}
      </Card>
    </div>
  );
};

export default NotificationPage;
