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
]);
