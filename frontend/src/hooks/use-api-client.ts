import { createApiClient } from '@/lib/api-client';
import { useAuth } from '@clerk/nextjs';
import { AxiosInstance } from 'axios';
import { useRef } from 'react';

export const useApiClient = (): AxiosInstance => {
  const { getToken } = useAuth();
  const clientRef = useRef<AxiosInstance | null>(null);

  if (!clientRef.current) {
    clientRef.current = createApiClient(getToken);
  }

  return clientRef.current;
};
