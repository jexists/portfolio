import { QueryClient } from '@tanstack/react-query';

/** 테스트마다 새로 만든다: 캐시 공유와 재시도를 막는다 */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity, staleTime: Infinity } },
  });
}
