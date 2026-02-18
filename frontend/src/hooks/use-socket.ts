'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { io, type Socket } from 'socket.io-client';

type UseSocketResult = {
  socket: Socket | null;
  connected: boolean;
};

export function useSocket(): UseSocketResult {
  const { userId, isLoaded } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;

    if (!userId) {
      setConnected(false);
      setSocket((prev) => {
        if (prev) {
          prev.disconnect();
        }

        return null;
      });

      return;
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000';

    const socketInstance: Socket = io(baseUrl, {
      auth: { userId }, // Backend is going to read the userId
      withCredentials: true,
      transports: ['websocket'],
    });

    setSocket(socketInstance);

    const handleConnect = () => {
      console.log(`[Socket], ${socketInstance.id}`);

      setConnected(true);
    };

    const handleDisconnect = () => {
      setConnected(false);
    };

    const handleConnectionError = (err: any) => {
      console.error(err);
    };

    socketInstance.on('connect', handleConnect);
    socketInstance.on('disconnect', handleDisconnect);
    socketInstance.on('connection_error', handleConnectionError);

    return () => {
      socketInstance.off('connect', handleConnect);
      socketInstance.off('disconnect', handleDisconnect);
      socketInstance.off('connection_error', handleConnectionError);
      socketInstance.disconnect();
      setConnected(false);
      setSocket(null);
    };
  }, [userId, isLoaded]);

  return { socket, connected };
}
