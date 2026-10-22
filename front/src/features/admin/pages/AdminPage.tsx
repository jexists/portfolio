import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '@/features/auth';
import { SearchHeader } from '@/components/layout/SearchHeader';
import { statsService } from '../api/stats.api';
import type { VisitorStats } from '../api/StatsService';
import { PURPOSE_LABELS, PURPOSE_OPTIONS } from '@/features/admin/api/labels';
import styles from './AdminPage.module.scss';

const PROVIDERS = [
  { key: 'kakao', label: '카카오', colorClass: styles.kakao },
  { key: 'github', label: 'GitHub', colorClass: styles.github },
] as const;

const PURPOSE_COLORS = [styles.blue, styles.red, styles.yellow, styles.green];

export function AdminPage() {
  const { isAdmin, loading } = useAuth();
  const [stats, setStats] = useState<VisitorStats | null>(null);

  useEffect(() => {
    if (loading || !isAdmin) return;

    let active = true;
    statsService.getStats().then((nextStats) => {
      if (active) setStats(nextStats);
    });
    return () => { active = false; };
  }, [isAdmin, loading]);

  if (loading) return <main className={styles.loading} aria-label="관리자 권한 확인 중" />;
  if (!isAdmin) return <Navigate to="/login" replace state={{ from: '/admin' }} />;
  if (!stats) return <main className={styles.loading} aria-label="방문 통계 불러오는 중" />;

  return (
    <div className={styles.page}>
      <SearchHeader />
      <main className={styles.container}>
        <h1>방문 통계</h1>

        <div className={styles.summaryGrid}>
          <SummaryTile label="전체 방문 수" value={stats.totalVisits} />
          <SummaryTile label="로그인 사용자 수" value={stats.loggedInUsers} />
        </div>

        <div className={styles.statsGrid}>
          <section className={styles.card} aria-label="방문 목적">
            <h2>방문 목적</h2>
            <div className={styles.bars}>
              {PURPOSE_OPTIONS.map((option, index) => (
                <RatioBar
                  colorClass={PURPOSE_COLORS[index]}
                  key={option.purpose}
                  label={`${option.emoji} ${option.label}`}
                  value={stats.purposeRatios[option.purpose]}
                />
              ))}
            </div>
          </section>

          <section className={styles.card} aria-label="로그인 방식">
            <h2>로그인 방식</h2>
            <div className={styles.bars}>
              {PROVIDERS.map((provider) => (
                <RatioBar
                  colorClass={provider.colorClass}
                  key={provider.key}
                  label={provider.label}
                  value={stats.providerRatios[provider.key]}
                />
              ))}
            </div>
          </section>
        </div>

        <section className={`${styles.card} ${styles.recentCard}`} aria-label="최근 방문자">
          <h2>최근 방문자</h2>
          {stats.recentVisitors.length === 0 ? (
            <p className={styles.empty}>아직 방문 기록이 없어요</p>
          ) : (
            <ul className={styles.visitorList}>
              {stats.recentVisitors.slice(0, 10).map((visitor, index) => (
                <li key={`${visitor.at}-${visitor.name}-${index}`}>
                  <strong>{visitor.name}</strong>
                  <span>{providerLabel(visitor.provider)}</span>
                  <span className={styles.purposeLabel}>
                    {visitor.purpose ? PURPOSE_LABELS[visitor.purpose] : '미응답'}
                  </span>
                  <time dateTime={visitor.at}>{relativeTime(visitor.at)}</time>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

function SummaryTile({ label, value }: { label: string; value: number }) {
  return (
    <section className={`${styles.card} ${styles.summaryTile}`} aria-label={label}>
      <strong>{value.toLocaleString('ko-KR')}</strong>
      <span>{label}</span>
    </section>
  );
}

function RatioBar({ colorClass, label, value }: { colorClass: string; label: string; value: number }) {
  const safeValue = Math.min(100, Math.max(0, value));
  const barStyle = { '--admin-ratio': `${safeValue}%` } as CSSProperties;

  return (
    <div className={styles.barRow}>
      <span className={styles.barLabel}>{label}</span>
      <span className={styles.barTrack} aria-hidden="true">
        <span className={`${styles.barFill} ${colorClass}`} style={barStyle} />
      </span>
      <strong>{safeValue}%</strong>
    </div>
  );
}

function providerLabel(provider: string): string {
  if (provider === 'kakao') return '카카오';
  if (provider === 'github') return 'GitHub';
  return provider;
}

function relativeTime(timestamp: string): string {
  const elapsedSeconds = Math.round((new Date(timestamp).getTime() - Date.now()) / 1000);
  const formatter = new Intl.RelativeTimeFormat('ko', { numeric: 'auto' });
  if (Math.abs(elapsedSeconds) < 60) return formatter.format(elapsedSeconds, 'second');

  const elapsedMinutes = Math.round(elapsedSeconds / 60);
  if (Math.abs(elapsedMinutes) < 60) return formatter.format(elapsedMinutes, 'minute');

  const elapsedHours = Math.round(elapsedMinutes / 60);
  if (Math.abs(elapsedHours) < 24) return formatter.format(elapsedHours, 'hour');

  const elapsedDays = Math.round(elapsedHours / 24);
  if (Math.abs(elapsedDays) < 7) return formatter.format(elapsedDays, 'day');

  return new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium' }).format(new Date(timestamp));
}
