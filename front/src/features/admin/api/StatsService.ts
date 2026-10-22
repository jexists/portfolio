import type { AuthProviderName } from '@/features/auth';

export type Purpose = 'recruiter' | 'developer' | 'student' | 'visitor';

export interface VisitorStats {
  totalVisits: number;
  loggedInUsers: number;
  purposeRatios: Record<Purpose, number>;
  providerRatios: Record<AuthProviderName, number>;
  recentVisitors: Array<{
    name: string;
    provider: string;
    purpose: Purpose | null;
    at: string;
  }>;
}

export interface StatsService {
  recordVisit(): Promise<void>;
  savePurpose(
    userId: string,
    purpose: Purpose,
    provider: AuthProviderName,
    name: string,
  ): Promise<void>;
  getPurpose(userId: string): Promise<Purpose | null>;
  getStats(): Promise<VisitorStats>;
}
