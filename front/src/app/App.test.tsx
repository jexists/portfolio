import { render, waitFor } from '@testing-library/react';
import App from './App';

const { recordVisitMock } = vi.hoisted(() => ({ recordVisitMock: vi.fn() }));

vi.mock('@/features/admin', () => ({
  statsService: { recordVisit: recordVisitMock },
}));

vi.mock('react-router', () => ({
  RouterProvider: () => <div>router</div>,
}));

vi.mock('./router', () => ({ router: {} }));

describe('App', () => {
  it('records a visit when mounted', async () => {
    recordVisitMock.mockResolvedValue(undefined);

    render(<App />);

    await waitFor(() => expect(recordVisitMock).toHaveBeenCalledOnce());
  });
});
