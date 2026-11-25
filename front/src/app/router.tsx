import { createBrowserRouter, Navigate, Outlet, ScrollRestoration } from 'react-router';
import type { RouteObject } from 'react-router';
import { AdminPage } from '@/features/admin';
import { LoginPage } from '@/features/auth';
import { IntroPage } from '@/features/intro';
import { ProjectDetailPage, SearchPage } from '@/features/projects';
import { CareerDetailPage } from '@/features/resume';

export const routes: RouteObject[] = [
  { path: '/', element: <IntroPage /> },
  { path: '/admin', element: <AdminPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/search', element: <SearchPage /> },
  { path: '/project/:slug', element: <ProjectDetailPage /> },
  { path: '/career/:id', element: <CareerDetailPage /> },
  // 없는 주소(예전 사이트의 /html/all.html 등)는 첫 화면으로 보낸다
  { path: '*', element: <Navigate to="/" replace /> },
];

// 새 화면은 맨 위에서, 뒤로가기는 보던 위치에서 시작한다 (ScrollRestoration 은 data router 안에서만 동작)
function RootLayout() {
  return (
    <>
      <ScrollRestoration />
      <Outlet />
    </>
  );
}

export const router = createBrowserRouter([{ element: <RootLayout />, children: routes }], {
  // GitHub Pages 처럼 하위 경로(/portfolio/)에 배포될 때 vite base 와 맞춘다
  basename: import.meta.env.BASE_URL.replace(/\/$/, '') || '/',
});
