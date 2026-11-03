import { useEffect, useState } from 'react';
import type { Profile } from '@/features/profile/types/profile.types';
import styles from './ProfileCard.module.scss';

interface ProfileCardProps {
  profile: Profile;
  activeKeyword?: string | null;
  onKeywordClick?: (keyword: string | null) => void;
}

export function ProfileCard({ profile, activeKeyword = null, onKeywordClick }: ProfileCardProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timeout = window.setTimeout(() => setCopied(false), 2000);

    return () => window.clearTimeout(timeout);
  }, [copied]);

  async function copyEmail() {
    try {
      await window.navigator.clipboard?.writeText(profile.email);
      setCopied(true);
    } catch {
      // Clipboard failures should not interrupt exploration.
    }
  }

  return (
    <section className={styles.card} aria-label={`${profile.name} 인물정보 카드`}>
      <header className={styles.header}>
        <div className={styles.identity}>
          <h1>{profile.name}</h1>
          <p className={styles.subtitle}>{profile.nameEn} · {profile.role}</p>
        </div>
        <span className={styles.more} aria-hidden="true">⋮</span>
      </header>

      <div className={styles.keywords} aria-label="인물 키워드">
        <button
          type="button"
          className={styles.keyword}
          data-active={activeKeyword === null}
          aria-label="전체 인물 키워드"
          aria-pressed={activeKeyword === null}
          onClick={() => onKeywordClick?.(null)}
        >
          전체
        </button>
        {profile.keywords.map((keyword) => (
          <button
            type="button"
            className={styles.keyword}
            data-active={activeKeyword === keyword}
            aria-label={`${keyword} 인물 키워드`}
            aria-pressed={activeKeyword === keyword}
            onClick={() => onKeywordClick?.(keyword)}
            key={keyword}
          >
            {keyword}
          </button>
        ))}
      </div>

      <div className={styles.details}>
        <dl className={styles.meta} aria-label={`${profile.name} 인물정보`}>
          <MetaRow label="거주지">{profile.location}</MetaRow>
          <MetaRow label="카톡">{profile.kakaoId}</MetaRow>
          <MetaRow label="이메일">
            <button
              type="button"
              className={styles.textButton}
              aria-label={copied ? '이메일 복사됨' : '이메일 복사'}
              onClick={copyEmail}
            >
              <span>{profile.email}</span>
              <span className={styles.copyFeedback}>{copied ? '복사됨' : '복사'}</span>
            </button>
          </MetaRow>
          <MetaRow label="사이트">
            <a href={profile.github} target="_blank" rel="noreferrer">GitHub</a>
            <span aria-hidden="true">, </span>
            <a href={profile.website} target="_blank" rel="noreferrer">웹사이트</a>
          </MetaRow>
        </dl>

        {profile.avatarUrl ? (
          <img className={styles.avatar} src={profile.avatarUrl} alt={`${profile.name} 프로필 사진`} />
        ) : (
          <div className={styles.avatar} aria-hidden="true">{profile.name.slice(0, 1)}</div>
        )}
      </div>

      <footer className={styles.footer}>
        <p>2026.07.14.</p>
      </footer>
    </section>
  );
}

function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}
