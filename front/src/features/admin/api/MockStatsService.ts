import type { AuthProviderName } from '@/features/auth';
import type { Purpose, StatsService, VisitorStats } from './StatsService';

const STORAGE_KEY = 'portfolio.stats';
const SESSION_VISIT_KEY = 'portfolio.stats.visit-recorded';
const PURPOSES: Purpose[] = ['recruiter', 'developer', 'student', 'visitor'];
const PROVIDERS: AuthProviderName[] = ['kakao', 'github'];

interface StoredUser {
  name: string;
  provider: AuthProviderName;
  purpose: Purpose;
}

interface StoredStats {
  totalVisits: number;
  users: Record<string, StoredUser>;
  recentVisitors: VisitorStats['recentVisitors'];
}

function emptyStats(): StoredStats {
  return { totalVisits: 0, users: {}, recentVisitors: [] };
}

function isPurpose(value: unknown): value is Purpose {
  return PURPOSES.includes(value as Purpose);
}

function isProvider(value: unknown): value is AuthProviderName {
  return PROVIDERS.includes(value as AuthProviderName);
}

function readStats(): StoredStats {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return emptyStats();

  try {
    const parsed: unknown = JSON.parse(stored);
    if (!parsed || typeof parsed !== 'object') return emptyStats();
    const candidate = parsed as Partial<StoredStats>;
    if (!Number.isFinite(candidate.totalVisits) || !candidate.users || typeof candidate.users !== 'object') {
      return emptyStats();
    }

    const users = Object.fromEntries(
      Object.entries(candidate.users).filter((entry): entry is [string, StoredUser] => {
        const user = entry[1] as Partial<StoredUser>;
        return typeof user?.name === 'string' && isProvider(user.provider) && isPurpose(user.purpose);
      }),
    );
    const recentVisitors = Array.isArray(candidate.recentVisitors)
      ? candidate.recentVisitors.slice(0, 10)
      : [];

    return { totalVisits: candidate.totalVisits as number, users, recentVisitors };
  } catch {
    return emptyStats();
  }
}

function writeStats(stats: StoredStats): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
}

function ratios<Key extends string>(keys: readonly Key[], values: Key[]): Record<Key, number> {
  const result = Object.fromEntries(keys.map((key) => [key, 0])) as Record<Key, number>;
  if (values.length === 0) return result;

  const exact = keys.map((key) => ({
    key,
    value: (values.filter((value) => value === key).length / values.length) * 100,
  }));
  let remaining = 100;
  for (const item of exact) {
    result[item.key] = Math.floor(item.value);
    remaining -= result[item.key];
  }

  exact
    .map((item, index) => ({ ...item, index, fraction: item.value - Math.floor(item.value) }))
    .sort((left, right) => right.fraction - left.fraction || left.index - right.index)
    .slice(0, remaining)
    .forEach(({ key }) => { result[key] += 1; });

  return result;
}

export class MockStatsService implements StatsService {
  async recordVisit(): Promise<void> {
    if (sessionStorage.getItem(SESSION_VISIT_KEY)) return;

    const stats = readStats();
    stats.totalVisits += 1;
    writeStats(stats);
    sessionStorage.setItem(SESSION_VISIT_KEY, 'true');
  }

  async savePurpose(
    userId: string,
    purpose: Purpose,
    provider: AuthProviderName,
    name: string,
  ): Promise<void> {
    const stats = readStats();
    stats.users[userId] = { name, provider, purpose };
    stats.recentVisitors = [
      { name, provider, purpose, at: new Date().toISOString() },
      ...stats.recentVisitors,
    ].slice(0, 10);
    writeStats(stats);
  }

  async getPurpose(userId: string): Promise<Purpose | null> {
    return readStats().users[userId]?.purpose ?? null;
  }

  async getStats(): Promise<VisitorStats> {
    const stats = readStats();
    const users = Object.values(stats.users);

    return {
      totalVisits: stats.totalVisits,
      loggedInUsers: users.length,
      purposeRatios: ratios(PURPOSES, users.map(({ purpose }) => purpose)),
      providerRatios: ratios(PROVIDERS, users.map(({ provider }) => provider)),
      recentVisitors: stats.recentVisitors,
    };
  }
}
