import { createBrowserRouter, Navigate } from 'react-router';
import type { RouteObject } from 'react-router';
import { AdminPage } from '@/features/admin';
import { LoginPage } from '@/features/auth';
import { IntroPage } from '@/features/intro';
import { ProjectDetailPage, SearchPage } from '@/features/projects';

export const routes: RouteObject[] = [
  { path: '/', element: <IntroPage /> },
  { path: '/admin', element: <AdminPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/search', element: <SearchPage /> },
  { path: '/project/:slug', element: <ProjectDetailPage /> },
  // 없는 주소(예전 사이트의 /html/all.html 등)는 첫 화면으로 보낸다
  { path: '*', element: <Navigate to="/" replace /> },
];

export const router = createBrowserRouter(routes, {
  // GitHub Pages 처럼 하위 경로(/portfolio/)에 배포될 때 vite base 와 맞춘다
  basename: import.meta.env.BASE_URL.replace(/\/$/, '') || '/',
});
