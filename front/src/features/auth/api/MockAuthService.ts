import type { AuthProviderName, AuthService, AuthUser } from './AuthService';

const STORAGE_KEY = 'portfolio.auth.user';

function isAuthUser(value: unknown): value is AuthUser {
  if (!value || typeof value !== 'object') return false;
  const user = value as Partial<AuthUser>;
  return typeof user.id === 'string'
    && typeof user.name === 'string'
    && (user.provider === 'kakao' || user.provider === 'github')
    && (user.avatarUrl === undefined || typeof user.avatarUrl === 'string');
}

export class MockAuthService implements AuthService {
  async getUser(): Promise<AuthUser | null> {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    try {
      const user: unknown = JSON.parse(stored);
      if (isAuthUser(user)) return user;
    } catch {
      // Invalid mock sessions are discarded below.
    }

    localStorage.removeItem(STORAGE_KEY);
    return null;
  }

  async signIn(provider: AuthProviderName): Promise<AuthUser> {
    const user: AuthUser = {
      id: `mock-${provider}`,
      name: '정주애',
      provider,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    return user;
  }

  async signOut(): Promise<void> {
    localStorage.removeItem(STORAGE_KEY);
  }
}
