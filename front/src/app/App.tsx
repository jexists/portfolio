import { useEffect } from 'react';
import { RouterProvider } from 'react-router';
import { statsService } from '@/features/admin';
import { applyTokens } from '@/styles/applyTokens';
import { AppProviders } from './providers';
import { router } from './router';

applyTokens();

export default function App() {
  useEffect(() => {
    void statsService.recordVisit();
  }, []);

  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  );
}
