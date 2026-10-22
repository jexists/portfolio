// @vitest-environment node
/**
 * 같은 계약을 두 대상에 돌린다.
 * - 기본: MSW(mockup JSON)
 * - CONTRACT_API_URL=http://localhost:8080/api/v1 npm test -- apiContract : 실제 Go 백엔드
 */
import { profileApi } from '@/features/profile/api/profile.api';
import { projectsApi } from '@/features/projects/api/projects.api';
import { http } from '@/lib/axios';
import { runContentApiContract } from './apiContract';
import { server } from './server';

const realApi = process.env.CONTRACT_API_URL;

beforeAll(() => {
  http.defaults.baseURL = realApi ?? 'http://localhost/api/v1';
  if (!realApi) server.listen({ onUnhandledRequest: 'error' });
});
afterEach(() => {
  if (!realApi) server.resetHandlers();
});
afterAll(() => {
  if (!realApi) server.close();
});

runContentApiContract(realApi ? `Go API (${realApi})` : 'MSW mockup', () => ({ ...projectsApi, ...profileApi }));
