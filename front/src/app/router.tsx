import { createBrowserRouter } from 'react-router';
import { AdminPage } from '@/features/admin';
import { LoginPage } from '@/features/auth';
import { IntroPage } from '@/features/intro';
import { ProjectDetailPage, SearchPage } from '@/features/projects';

export const router = createBrowserRouter([
  { path: '/', element: <IntroPage /> },
  { path: '/admin', element: <AdminPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/search', element: <SearchPage /> },
  { path: '/project/:slug', element: <ProjectDetailPage /> },
], {
  // GitHub Pages 처럼 하위 경로(/portfolio/)에 배포될 때 vite base 와 맞춘다
  basename: import.meta.env.BASE_URL.replace(/\/$/, '') || '/',
});
