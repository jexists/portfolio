import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import type { AuthService, AuthUser, AuthProviderName } from '@/features/auth/api/AuthService';
import { AuthProvider } from '@/features/auth/hooks/AuthContext';
import { LoginPage } from './LoginPage';

const { getPurposeMock, navigateMock, savePurposeMock } = vi.hoisted(() => ({
  getPurposeMock: vi.fn(),
  navigateMock: vi.fn(),
  savePurposeMock: vi.fn(),
}));

vi.mock('@/features/admin', () => ({
  statsService: {
    getPurpose: getPurposeMock,
    savePurpose: savePurposeMock,
  },
}));

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();
  return { ...actual, useNavigate: () => navigateMock };
});

class LoginAuthService implements AuthService {
  constructor(public user: AuthUser | null = null) {}
  signIn = vi.fn(async (provider: AuthProviderName) => {
    this.user = { id: 'user', name: '정주애', provider };
    return this.user;
  });
  getUser = vi.fn(async () => this.user);
  signOut = vi.fn(async () => { this.user = null; });
}

function renderLogin(service: LoginAuthService, entry: string | { pathname: string; state: unknown } = '/login') {
  render(
    <AuthProvider service={service}>
      <MemoryRouter initialEntries={[entry]}>
        <LoginPage />
      </MemoryRouter>
    </AuthProvider>,
  );
}

describe('Login', () => {
  beforeEach(() => {
    navigateMock.mockReset();
    getPurposeMock.mockReset();
    getPurposeMock.mockResolvedValue(null);
    savePurposeMock.mockReset();
    savePurposeMock.mockResolvedValue(undefined);
  });

  it('renders the tagline, benefits, home logo link, and social sign-in buttons', async () => {
    renderLogin(new LoginAuthService());

    expect(await screen.findByRole('button', { name: '카카오로 시작하기' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'GitHub로 시작하기' })).toBeInTheDocument();
    expect(screen.getByText('성장과 경험을 담은 공간')).toBeInTheDocument();
    const signupHint = screen.getByText('로그인하고 둘러보세요.');
    expect(signupHint).toBeInTheDocument();
    expect(signupHint.tagName).toBe('P');
    expect(screen.getByRole('link', { name: '첫페이지로 이동' })).toHaveAttribute('href', '/');
    expect(screen.getByLabelText('PortFolio')).toHaveAttribute('data-variant', 'compact');
  });

  it('navigates to the previous history entry from the back button', async () => {
    vi.spyOn(window.history, 'length', 'get').mockReturnValue(2);
    const user = userEvent.setup();
    renderLogin(new LoginAuthService());

    await user.click(await screen.findByRole('button', { name: '이전 화면으로' }));

    expect(navigateMock).toHaveBeenCalledWith(-1);
  });

  it('navigates to search when the back button has no previous history entry', async () => {
    vi.spyOn(window.history, 'length', 'get').mockReturnValue(1);
    const user = userEvent.setup();
    renderLogin(new LoginAuthService());

    await user.click(await screen.findByRole('button', { name: '이전 화면으로' }));

    expect(navigateMock).toHaveBeenCalledWith('/search');
  });

  it.each(['카카오로 시작하기', 'GitHub로 시작하기'])('shows a toast instead of signing in from %s', async (name) => {
    const service = new LoginAuthService();
    const user = userEvent.setup();
    renderLogin(service);

    await user.click(await screen.findByRole('button', { name }));

    expect(screen.getByRole('status')).toHaveTextContent('개발중입니다.');
    expect(service.signIn).not.toHaveBeenCalled();
  });

  it('saves the selected purpose and redirects to the route in location state', async () => {
    const service = new LoginAuthService({ id: 'user', name: '정주애', provider: 'github' });
    const user = userEvent.setup();
    renderLogin(service, { pathname: '/login', state: { from: '/project/naver-clone' } });

    await user.click(await screen.findByRole('button', { name: /개발자/ }));

    expect(screen.queryByRole('button', { name: 'GitHub로 시작하기' })).not.toBeInTheDocument();
    expect(savePurposeMock).toHaveBeenCalledWith('user', 'developer', 'github', '정주애');
    expect(navigateMock).toHaveBeenCalledWith('/project/naver-clone', { replace: true });
  });

  it('checks the survey before redirecting an already signed-in user', async () => {
    getPurposeMock.mockResolvedValue('visitor');
    renderLogin(new LoginAuthService({ id: 'user', name: '정주애', provider: 'github' }));

    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/search', { replace: true }));
  });

  it('shows the survey for an already signed-in user who has not answered', async () => {
    renderLogin(new LoginAuthService({ id: 'user', name: '정주애', provider: 'github' }));

    expect(await screen.findByRole('heading', { name: '어떤 목적으로 방문하셨나요?' })).toBeInTheDocument();
    expect(navigateMock).not.toHaveBeenCalled();
  });
});
