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

  it('shows four purpose choices after a first sign in', async () => {
    const service = new LoginAuthService();
    const user = userEvent.setup();
    renderLogin(service, { pathname: '/login', state: { from: '/project/naver-clone' } });

    await user.click(await screen.findByRole('button', { name: '카카오로 시작하기' }));

    expect(service.signIn).toHaveBeenCalledWith('kakao');
    expect(await screen.findByRole('heading', { name: '어떤 목적으로 방문하셨나요?' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /채용 담당자/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /개발자/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /학생/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /둘러보기/ })).toBeInTheDocument();
  });

  it('saves the selected purpose and redirects to the route in location state', async () => {
    const service = new LoginAuthService();
    const user = userEvent.setup();
    renderLogin(service, { pathname: '/login', state: { from: '/project/naver-clone' } });

    await user.click(await screen.findByRole('button', { name: 'GitHub로 시작하기' }));
    await user.click(await screen.findByRole('button', { name: /개발자/ }));

    expect(savePurposeMock).toHaveBeenCalledWith('user', 'developer', 'github', '정주애');
    expect(navigateMock).toHaveBeenCalledWith('/project/naver-clone', { replace: true });
  });

  it('skips the survey for a returning user', async () => {
    getPurposeMock.mockResolvedValue('student');
    const service = new LoginAuthService();
    const user = userEvent.setup();
    renderLogin(service);

    await user.click(await screen.findByRole('button', { name: '카카오로 시작하기' }));

    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/search', { replace: true }));
    expect(screen.queryByRole('heading', { name: '어떤 목적으로 방문하셨나요?' })).not.toBeInTheDocument();
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
