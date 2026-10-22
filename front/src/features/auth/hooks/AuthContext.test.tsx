import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { AuthService, AuthUser, AuthProviderName } from '@/features/auth/api/AuthService';
import { AuthProvider, useAuth } from './AuthContext';

class TestAuthService implements AuthService {
  user: AuthUser | null = null;

  async getUser() { return this.user; }
  async signIn(provider: AuthProviderName) {
    this.user = { id: 'test-user', name: '정주애', provider };
    return this.user;
  }
  async signOut() { this.user = null; }
}

function Probe() {
  const { user, isAdmin, loading, signIn, signOut } = useAuth();
  return (
    <div>
      <span>{loading ? '로딩 중' : user?.name ?? '비로그인'}</span>
      <span>{isAdmin ? '관리자' : '일반'}</span>
      <button onClick={() => signIn('kakao')}>login</button>
      <button onClick={signOut}>logout</button>
    </div>
  );
}

describe('AuthProvider', () => {
  it('loads the session and transitions through sign in and sign out', async () => {
    const user = userEvent.setup();
    render(<AuthProvider service={new TestAuthService()}><Probe /></AuthProvider>);

    await screen.findByText('비로그인');
    expect(screen.getByText('일반')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'login' }));
    expect(await screen.findByText('정주애')).toBeInTheDocument();
    expect(screen.getByText('관리자')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'logout' }));
    await waitFor(() => expect(screen.getByText('비로그인')).toBeInTheDocument());
    expect(screen.getByText('일반')).toBeInTheDocument();
  });
});
