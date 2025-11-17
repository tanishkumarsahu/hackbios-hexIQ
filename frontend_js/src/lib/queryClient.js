import { QueryClient } from '@tanstack/react-query';

// Create a client with optimized defaults
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Keep in cache for 10 minutes
      gcTime: 10 * 60 * 1000,
      // Retry failed requests 3 times
      retry: 3,
      // Retry delay with exponential backoff
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch on window focus
      refetchOnWindowFocus: false,
      // Refetch on reconnect
      refetchOnReconnect: true,
      // Background refetch interval (5 minutes)
      refetchInterval: 5 * 60 * 1000,
    },
    mutations: {
      // Retry mutations once
      retry: 1,
    },
  },
});
