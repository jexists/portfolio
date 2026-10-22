export type AuthProviderName = 'kakao' | 'github';

export interface AuthUser {
  id: string;
  name: string;
  provider: AuthProviderName;
  avatarUrl?: string;
}

export interface AuthService {
  getUser(): Promise<AuthUser | null>;
  signIn(provider: AuthProviderName): Promise<AuthUser>;
  signOut(): Promise<void>;
}
