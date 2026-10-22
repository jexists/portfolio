import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router';
import { vi } from 'vitest';
import type { AuthProviderName, AuthService, AuthUser } from '@/features/auth';
import { AuthProvider } from '@/features/auth';
import { HeaderActions } from './HeaderActions';

class HeaderAuthService implements AuthService {
  constructor(public user: AuthUser | null = null) {}
  getUser = vi.fn(async () => this.user);
  signIn = vi.fn(async (provider: AuthProviderName) => ({ id: 'user', name: '정주애', provider }));
  signOut = vi.fn(async () => { this.user = null; });
}

function LocationProbe() {
  const location = useLocation();
  return <span data-testid="location">{location.pathname}</span>;
}

function renderActions(service: HeaderAuthService, stopProfileClickPropagation = false, parentClick = vi.fn()) {
  render(
    <AuthProvider service={service}>
      <MemoryRouter initialEntries={['/search']}>
        <div onClick={parentClick}>
          <HeaderActions onAppClick={vi.fn()} stopProfileClickPropagation={stopProfileClickPropagation} />
        </div>
        <LocationProbe />
      </MemoryRouter>
    </AuthProvider>,
  );
  return { parentClick };
}

describe('HeaderActions', () => {
  it('moves a signed-out user to login without bubbling when requested', async () => {
    const user = userEvent.setup();
    const { parentClick } = renderActions(new HeaderAuthService(), true);

    await user.click(await screen.findByRole('button', { name: '로그인' }));

    expect(screen.getByTestId('location')).toHaveTextContent('/login');
    expect(parentClick).not.toHaveBeenCalled();
  });

  it('shows the signed-in account menu and signs out', async () => {
    const service = new HeaderAuthService({ id: 'user', name: '정주애', provider: 'github' });
    const user = userEvent.setup();
    renderActions(service);

    await user.click(await screen.findByRole('button', { name: '정주애 계정 메뉴' }));
    expect(screen.getByRole('menu')).toHaveTextContent('정주애');
    expect(screen.getByRole('menu')).toHaveTextContent('GitHub 계정');

    await user.click(screen.getByRole('menuitem', { name: '로그아웃' }));

    await waitFor(() => expect(service.signOut).toHaveBeenCalledTimes(1));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '로그인' })).toBeInTheDocument();
  });

  it('closes the account menu on an outside click', async () => {
    const user = userEvent.setup();
    renderActions(new HeaderAuthService({ id: 'user', name: '정주애', provider: 'kakao' }));

    await user.click(await screen.findByRole('button', { name: '정주애 계정 메뉴' }));
    await user.click(document.body);

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('shows the admin dashboard link and navigates from the account menu', async () => {
    const user = userEvent.setup();
    renderActions(new HeaderAuthService({ id: 'admin', name: '정주애', provider: 'github' }));

    await user.click(await screen.findByRole('button', { name: '정주애 계정 메뉴' }));
    const dashboardLink = screen.getByRole('menuitem', { name: '관리자 대시보드' });
    const signOut = screen.getByRole('menuitem', { name: '로그아웃' });
    expect(dashboardLink.compareDocumentPosition(signOut) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    await user.click(dashboardLink);

    expect(screen.getByTestId('location')).toHaveTextContent('/admin');
  });
});
