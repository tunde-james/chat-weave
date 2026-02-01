'use client';

import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useSocket } from './use-socket';

type NotificationCountContextValue = {
  unreadCount: number;
  setUnreadCount: Dispatch<SetStateAction<number>>;
  incrementUnread: (val?: number) => void;
  decrementUnread: (val?: number) => void;
};

const NotificationCountContext =
  createContext<NotificationCountContextValue | null>(null);

export const NotificationCountProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const { socket, connected } = useSocket();

  const incrementUnread = useCallback((val: number = 1) => {
    if (val <= 0) return;
    setUnreadCount((prev) => prev + val);
  }, []);

  const decrementUnread = useCallback((val: number = 1) => {
    if (val <= 0) return;
    setUnreadCount((prev) => Math.max(0, prev - val));
  }, []);

  useEffect(() => {
    if (!socket || !connected) return;

    const handleNewNotification = (payload: any) => {
      console.log('[Real-time notification received]', payload);
      incrementUnread(1);
    };

    socket.on('notification:new', handleNewNotification);

    return () => {
      socket.off('notification:new', handleNewNotification);
    };
  }, [socket, connected, incrementUnread]);

  const value = useMemo(
    () => ({
      unreadCount,
      setUnreadCount,
      incrementUnread,
      decrementUnread,
    }),
    [unreadCount, incrementUnread, decrementUnread],
  );

  return (
    <NotificationCountContext.Provider value={value}>
      {children}
    </NotificationCountContext.Provider>
  );
};

export const useNotificationCount = () => {
  const ctx = useContext(NotificationCountContext);

  if (!ctx) {
    throw new Error('Context error occurred');
  }

  return ctx;
};
