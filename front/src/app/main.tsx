import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import '@/styles/global.scss';

/**
 * 백엔드가 준비되기 전까지 기본값은 MSW(mockup/*.json)가 /api/v1 을 응답한다.
 * 실제 API 를 쓰려면 VITE_USE_MOCK=false 와 VITE_API_BASE_URL 을 설정한다.
 */
async function enableMocking() {
  if (import.meta.env.VITE_USE_MOCK === 'false') return;
  const { worker } = await import('@/mocks/browser');
  await worker.start({ onUnhandledRequest: 'bypass' });
}

void enableMocking().then(() => {
  createRoot(document.getElementById('root') as HTMLElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
