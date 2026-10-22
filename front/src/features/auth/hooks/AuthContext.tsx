import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { authService } from '../api/auth.api';
import type { AuthProviderName, AuthService, AuthUser } from '@/features/auth/api/AuthService';

interface AuthContextValue {
  user: AuthUser | null;
  isAdmin: boolean;
  loading: boolean;
  signIn(provider: AuthProviderName): Promise<AuthUser>;
  signOut(): Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
  service?: AuthService;
  initialUser?: AuthUser | null;
}

export function AuthProvider({ children, service = authService, initialUser }: AuthProviderProps) {
  const hasInitialUser = initialUser !== undefined;
  const [user, setUser] = useState<AuthUser | null>(initialUser ?? null);
  const [loading, setLoading] = useState(!hasInitialUser);

  useEffect(() => {
    if (hasInitialUser) return;
    let active = true;
    service.getUser().then((currentUser) => {
      if (active) setUser(currentUser);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [hasInitialUser, service]);

  const signIn = useCallback(async (provider: AuthProviderName) => {
    const signedInUser = await service.signIn(provider);
    setUser(signedInUser);
    return signedInUser;
  }, [service]);

  const signOut = useCallback(async () => {
    await service.signOut();
    setUser(null);
  }, [service]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isAdmin: Boolean(user),
    loading,
    signIn,
    signOut,
  }), [loading, signIn, signOut, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
