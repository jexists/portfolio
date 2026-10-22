import type { ReactNode } from 'react';
import { QueryClientProvider, type QueryClient } from '@tanstack/react-query';
import { AuthProvider } from '@/features/auth';
import { queryClient as defaultQueryClient } from '@/lib/queryClient';

interface AppProvidersProps {
  children: ReactNode;
  queryClient?: QueryClient;
}

export function AppProviders({ children, queryClient = defaultQueryClient }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}
