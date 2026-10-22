import { render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { vi } from 'vitest';
import type { AuthUser } from '@/features/auth';
import { AuthProvider } from '@/features/auth';
import type { VisitorStats } from '@/features/admin';
import { AdminPage } from './AdminPage';

const { getStatsMock } = vi.hoisted(() => ({ getStatsMock: vi.fn() }));

vi.mock('@/features/admin/api/stats.api', () => ({
  statsService: { getStats: getStatsMock },
}));

const adminUser: AuthUser = {
  id: 'admin',
  name: '정주애',
  provider: 'github',
};

const stats: VisitorStats = {
  totalVisits: 128,
  loggedInUsers: 42,
  purposeRatios: { recruiter: 40, developer: 30, student: 20, visitor: 10 },
  providerRatios: { kakao: 55, github: 45 },
  recentVisitors: [
    {
      name: '김채용',
      provider: 'kakao',
      purpose: 'recruiter',
      at: '2026-07-14T02:00:00.000Z',
    },
  ],
};

function LocationProbe() {
  const location = useLocation();
  return <output data-testid="location">{location.pathname}|{JSON.stringify(location.state)}</output>;
}

function renderAdmin(initialUser: AuthUser | null) {
  return render(
    <AuthProvider initialUser={initialUser}>
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/login" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  );
}

describe('Admin', () => {
  beforeEach(() => {
    getStatsMock.mockReset();
  });

  it('redirects a signed-out visitor to login and preserves the admin destination', async () => {
    renderAdmin(null);

    expect(await screen.findByTestId('location')).toHaveTextContent('/login|{"from":"/admin"}');
    expect(getStatsMock).not.toHaveBeenCalled();
  });

  it('renders all statistics for an admin', async () => {
    getStatsMock.mockResolvedValue(stats);
    renderAdmin(adminUser);

    expect(await screen.findByRole('heading', { name: '방문 통계' })).toBeInTheDocument();
    expect(screen.getByText('128')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();

    const purposes = screen.getByRole('region', { name: '방문 목적' });
    for (const [label, ratio] of [
      ['💼 채용 담당자', '40%'],
      ['👨‍💻 개발자', '30%'],
      ['🎓 학생', '20%'],
      ['👀 둘러보기', '10%'],
    ]) {
      expect(within(purposes).getByText(label)).toBeInTheDocument();
      expect(within(purposes).getByText(ratio)).toBeInTheDocument();
    }

    const providers = screen.getByRole('region', { name: '로그인 방식' });
    expect(within(providers).getByText('카카오')).toBeInTheDocument();
    expect(within(providers).getByText('55%')).toBeInTheDocument();
    expect(within(providers).getByText('GitHub')).toBeInTheDocument();
    expect(within(providers).getByText('45%')).toBeInTheDocument();

    const recent = screen.getByRole('region', { name: '최근 방문자' });
    expect(within(recent).getByText('김채용')).toBeInTheDocument();
    expect(within(recent).getByText('카카오')).toBeInTheDocument();
    expect(within(recent).getByText('채용 담당자')).toBeInTheDocument();
    await waitFor(() => expect(getStatsMock).toHaveBeenCalledOnce());
  });

  it('keeps zero-percent labels visible and shows the empty visitor state', async () => {
    getStatsMock.mockResolvedValue({
      totalVisits: 0,
      loggedInUsers: 0,
      purposeRatios: { recruiter: 0, developer: 0, student: 0, visitor: 0 },
      providerRatios: { kakao: 0, github: 0 },
      recentVisitors: [],
    } satisfies VisitorStats);
    renderAdmin(adminUser);

    const purposes = await screen.findByRole('region', { name: '방문 목적' });
    expect(within(purposes).getByText('💼 채용 담당자')).toBeInTheDocument();
    expect(within(purposes).getAllByText('0%')).toHaveLength(4);
    expect(screen.getByText('아직 방문 기록이 없어요')).toBeInTheDocument();
  });
});
