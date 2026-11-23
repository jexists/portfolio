import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Card } from '@/components/ui/Card';
import type { Profile, Strength } from '@/features/profile/types/profile.types';
import styles from './ProfileCard.module.scss';

/** 경력·학력·자격 요약 한 줄 (resume feature 의 buildProfileFacts 결과와 같은 모양) */
export interface ProfileFactRow {
  label: string;
  values: string[];
}

export interface ProfileTab {
  value: string;
  label: string;
}

function useCopy(text: string) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timeout = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  async function copy() {
    try {
      await window.navigator.clipboard?.writeText(text);
      setCopied(true);
    } catch {
      // 복사에 실패해도 탐색은 계속한다.
    }
  }

  return { copied, copy };
}

function Avatar({ profile, size }: { profile: Profile; size: 'large' | 'small' }) {
  return profile.avatarUrl ? (
    <img className={styles.photo} data-size={size} src={profile.avatarUrl} alt={`${profile.name} 사진`} />
  ) : (
    <span className={styles.photo} data-size={size} role="img" aria-label={`${profile.name} 이니셜`}>
      {profile.nameEn.slice(0, 1)}
    </span>
  );
}

function FactList({ profile, facts }: { profile: Profile; facts: ProfileFactRow[] }) {
  const { copied, copy } = useCopy(profile.email);

  return (
    <dl className={styles.facts}>
      {facts.map((fact) => (
        <div key={fact.label}>
          <dt>{fact.label}</dt>
          <dd>
            {fact.values.map((value) => (
              <p key={value}>{value}</p>
            ))}
          </dd>
        </div>
      ))}
      <div>
        <dt>사이트</dt>
        <dd className={styles.links}>
          {profile.links.map((link) => (
            <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer">
              {link.label}
            </a>
          ))}
        </dd>
      </div>
      <div>
        <dt>이메일</dt>
        <dd>
          <a href={`mailto:${profile.email}`}>{profile.email}</a>
          <button className={styles.copy} type="button" onClick={copy} aria-label="이메일 주소 복사">
            {copied ? '복사됨' : '복사'}
          </button>
        </dd>
      </div>
    </dl>
  );
}

interface ProfileCardProps {
  profile: Profile;
  facts: ProfileFactRow[];
  tabs: ProfileTab[];
  activeTab: string;
}

/** 전체 탭 맨 위 인물정보 카드: 이름, 칩 탭, 요약 정보, 사진 */
export function ProfileCard({ profile, facts, tabs, activeTab }: ProfileCardProps) {
  return (
    <section className={styles.card} aria-label={`${profile.name} 인물정보 카드`}>
      <h1>{profile.name}</h1>
      <p className={styles.subtitle}>
        <span>{profile.nameEn}</span> · {profile.role}, {profile.years}
      </p>
      <nav className={styles.chips} aria-label="인물정보 탭">
        {tabs.map((tab) => (
          <Link
            key={tab.value}
            className={styles.chip}
            to={tab.value === 'all' ? '/search' : `/search?tab=${tab.value}`}
            aria-current={tab.value === activeTab ? 'page' : undefined}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
      <div className={styles.body}>
        <FactList profile={profile} facts={facts} />
        <Avatar profile={profile} size="large" />
      </div>
    </section>
  );
}

/** 전체 외 탭의 사이드 첫 카드: 내 정보 */
export function ProfileSide({ profile, facts }: { profile: Profile; facts: ProfileFactRow[] }) {
  return (
    <Card ariaLabel="프로필" className={styles.side}>
      <div className={styles.sideHead}>
        <Avatar profile={profile} size="small" />
        <div>
          <h2>{profile.name}</h2>
          <p className={styles.subtitle}>
            {profile.role} · {profile.years}
          </p>
        </div>
      </div>
      <FactList profile={profile} facts={facts} />
    </Card>
  );
}

export function StrengthsCard({ strengths }: { strengths: Strength[] }) {
  return (
    <Card title="핵심 역량">
      <ul className={styles.strengths}>
        {strengths.map((strength) => (
          <li key={strength.title}>
            <b>{strength.title}</b>
            <span>{strength.text}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

const linkHost = (url: string) => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');

export function LinksCard({ profile }: { profile: Profile }) {
  const rows = [
    ...profile.links.map((link) => ({ key: link.url, href: link.url, label: link.label, sub: linkHost(link.url), external: true })),
    { key: 'email', href: `mailto:${profile.email}`, label: '이메일', sub: profile.email, external: false },
  ];

  return (
    <Card ariaLabel="외부 링크">
      <ul className={styles.linkRows}>
        {rows.map((row) => (
          <li key={row.key}>
            <a href={row.href} {...(row.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
              <span className={styles.linkIcon} aria-hidden="true">
                {row.external ? row.label.slice(0, 1) : '@'}
              </span>
              <span className={styles.linkText}>
                <b>{row.label}</b>
                <span>{row.sub}</span>
              </span>
              <span className={styles.chevron} aria-hidden="true">
                ›
              </span>
            </a>
          </li>
        ))}
      </ul>
    </Card>
  );
}
