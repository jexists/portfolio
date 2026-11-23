import { render } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { MemoryRouter, Route, Routes, useLocation, type InitialEntry } from 'react-router';
import { AuthProvider } from '@/features/auth';
import { http } from '@/lib/axios';
import { server } from '@/mocks/server';
import { createTestQueryClient } from './queryClient';

/** MSW(mockup JSON) API 를 켜고 끈다. describe 안에서 한 번 호출한다. */
export function useMockApi(): void {
  beforeAll(() => {
    http.defaults.baseURL = 'http://localhost/api/v1';
    server.listen({ onUnhandledRequest: 'error' });
  });
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());
}

function LocationProbe() {
  const location = useLocation();
  return <span data-testid="location">{`${location.pathname}${location.search}`}</span>;
}

/** 라우터·React Query·Auth 를 감싸서 렌더한다. 현재 주소는 data-testid="location" 으로 확인한다. */
export function renderRoute(path: string, routePattern: string, element: ReactNode, initial: InitialEntry = path) {
  return render(
    <QueryClientProvider client={createTestQueryClient()}>
      <AuthProvider initialUser={null}>
        <MemoryRouter initialEntries={[initial]}>
          <Routes>
            <Route path={routePattern} element={element} />
            <Route path="*" element={null} />
          </Routes>
          <LocationProbe />
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>,
  );
}
