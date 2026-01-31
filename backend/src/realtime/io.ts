import { Server } from 'socket.io';
import { Server as HttpServer } from 'node:http';

import { getUserFromClerk } from '../modules/users/user.service';

let io: Server | null = null;

const onlineUsers = new Map<number, Set<string>>();

function addOnlineUser(rawUserId: unknown, socketId: string) {
  const userId = Number(rawUserId);
  if (!Number.isFinite(userId) || userId <= 0) return;

  const existing = onlineUsers.get(userId);

  if (existing) {
    existing.add(socketId);
  } else {
    onlineUsers.set(userId, new Set([socketId]));
  }
}

function removeOnlineUser(rawUserId: unknown, socketId: string) {
  const userId = Number(rawUserId);
  if (!Number.isFinite(userId) || userId <= 0) return;

  const existing = onlineUsers.get(userId);

  if (!existing) return;

  existing.delete(socketId);

  if (existing.size === 0) {
    onlineUsers.delete(userId);
  }
}

function getOnlineUserIds(): number[] {
  return Array.from(onlineUsers.keys());
}

function broadcastPresence() {
  io?.emit('presence:update', {
    onlineUserIds: getOnlineUserIds(),
  });
}

export function initIO(httpServer: HttpServer) {
  if (io) return io;

  io = new Server(httpServer, {
    cors: {
      origin: 'http://localhost:3001/',
      credentials: true,
    },
  });

  io.on('connection', async (socket) => {
    console.log(`[io connection] =====> ${socket.id}`);

    try {
      const clerkUserId = socket.handshake.auth?.userId;

      if (!clerkUserId || typeof clerkUserId !== 'string') {
        console.log(`[Missing Clerk User ID] =====> ${socket.id}`);

        socket.disconnect(true);
        return;
      }

      const profile = await getUserFromClerk(clerkUserId);
      const rawLocalUserId = profile.user.id;
      const localUserId = Number(rawLocalUserId);
      const displayName = profile.user.displayName ?? null;
      const handle = profile.user.handle ?? null;

      if (!Number.isFinite(localUserId) || localUserId <= 0) {
        console.log(`[Invalid User ID] =====> ${socket.id}`);

        socket.disconnect(true);
        return;
      }

      (socket.data as {
        userId: number;
        displayName: string | null;
        handle: string | null;
      }) = {
        userId: localUserId,
        displayName,
        handle,
      };

      // Join notification room
      const notificationRoom = `notifications:user:${localUserId}`;
      socket.join(notificationRoom);

      addOnlineUser(localUserId, socket.id);
      broadcastPresence();
    } catch (error) {
      console.log(`[Error while socket connection]------> ${error}`);
      socket.disconnect(true);
    }
  });
}

export function getIO() {
  return io;
}
