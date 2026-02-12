'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { ReactNode, useState } from 'react';

export const QueryProvider = ({ children }: { children: ReactNode }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: process.env.NODE_ENV === 'production',
          },
          mutations: {
            retry: 2,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};
