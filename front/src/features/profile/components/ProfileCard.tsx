import { useEffect, useId, useState } from 'react';
import { Link } from 'react-router';
import { siGithub, siGmail, siTistory } from 'simple-icons';
import { Card } from '@/components/ui/Card';
import type { Profile, Strength } from '@/features/profile/types/profile.types';
import { TechBadge } from '@/components/ui/TechBadge';
import styles from './ProfileCard.module.scss';

/** 경력·학력·기술 요약 한 줄 (resume feature 의 buildProfileFacts 결과와 같은 모양) */
export interface ProfileFactRow {
  label: string;
  values: string[];
  periods?: string[];
  badges?: string[];
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

function Avatar({ profile }: { profile: Profile }) {
  return profile.avatarUrl ? (
    <img className={styles.photo} src={profile.avatarUrl} alt={`${profile.name} 사진`} />
  ) : (
    <span className={styles.photo} role="img" aria-label={`${profile.name} 이니셜`}>
      {profile.nameEn.slice(0, 1)}
    </span>
  );
}

/** contacts=false 면 사이트·이메일 줄을 뺀다 (사이드에서는 아래 링크 카드가 대신한다) */
function FactList({ profile, facts, contacts = true }: { profile: Profile; facts: ProfileFactRow[]; contacts?: boolean }) {
  const { copied, copy } = useCopy(profile.email);

  return (
    <dl className={styles.facts}>
      {facts.map((fact) => (
        <div key={fact.label}>
          <dt>{fact.label}</dt>
          <dd>
            {fact.badges?.length ? (
              <p className={styles.badgeRow}>
                {fact.badges.map((name) => (
                  <TechBadge key={name} name={name} size="sm" />
                ))}
                <Link className={styles.moreSkills} to="/search?tab=skills" aria-label="기술 전체 보기" title="기술 전체 보기">
                  …
                </Link>
              </p>
            ) : null}
            {fact.values.map((value, index) => {
              const period = fact.periods?.[index];
              return (
                <p key={value} title={period ? `${period} ${value}` : value}>
                  {period ? <span className={styles.period}>{period} </span> : null}
                  {value}
                </p>
              );
            })}
          </dd>
        </div>
      ))}
      {contacts ? (
        <>
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
              <button
                className={styles.copy}
                type="button"
                onClick={copy}
                aria-label={copied ? '이메일 주소 복사됨' : '이메일 주소 복사'}
                title={copied ? '복사됨' : '복사'}
              >
                {copied ? <CheckIcon /> : <CopyIcon />}
              </button>
            </dd>
          </div>
        </>
      ) : null}
    </dl>
  );
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V6a2 2 0 0 1 2-2h9" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m5 12 5 5 9-10" />
    </svg>
  );
}

interface ProfileCardProps {
  profile: Profile;
  facts: ProfileFactRow[];
}

/** 전체 탭 맨 위 인물정보 카드: 이름, 요약 정보, 사진, 이력서 링크 */
export function ProfileCard({ profile, facts }: ProfileCardProps) {
  return (
    <section className={styles.card} aria-label={`${profile.name} 인물정보 카드`}>
      <h1>{profile.name}</h1>
      <p className={styles.subtitle}>
        <span>{profile.nameEn}</span> · {profile.role}, {profile.years}
      </p>
      <div className={styles.body}>
        <FactList profile={profile} facts={facts} />
        <Avatar profile={profile} />
      </div>
      <Link className={styles.resumeLink} to="/search?tab=resume">
        이력서 보기 <span aria-hidden="true">→</span>
      </Link>
    </section>
  );
}

/** 전체 외 탭의 사이드 첫 카드: 이름과 경력·학력·기술 요약 + 이력서 보기 (사진·연락처는 뺀다) */
export function ProfileSide({ profile, facts }: { profile: Profile; facts: ProfileFactRow[] }) {
  return (
    <Card ariaLabel="프로필" className={styles.side}>
      <div className={styles.sideHead}>
        <h2>{profile.name}</h2>
        <p className={styles.subtitle}>
          {profile.role} · {profile.years}
        </p>
      </div>
      <FactList profile={profile} facts={facts} contacts={false} />
      <Link className={styles.resumeLink} to="/search?tab=resume">
        이력서 보기 <span aria-hidden="true">→</span>
      </Link>
    </Card>
  );
}

/** 핵심 역량 아코디언: 처음엔 모두 닫혀 있고, 한 번에 한 줄만 펼친다 */
export function StrengthsCard({ strengths }: { strengths: Strength[] }) {
  const [open, setOpen] = useState(-1);
  const baseId = useId();

  return (
    <Card title="핵심 역량">
      <ul className={styles.strengths}>
        {strengths.map((strength, index) => {
          const expanded = open === index;
          const panelId = `${baseId}-${index}`;
          return (
            <li key={strength.title} data-open={expanded}>
              <button type="button" aria-expanded={expanded} aria-controls={panelId} onClick={() => setOpen(expanded ? -1 : index)}>
                {/* 네 항목 모두 같은 반짝임 아이콘 */}
                <svg className={styles.strengthIcon} viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 3c.6 5.4 3.6 8.4 9 9-5.4.6-8.4 3.6-9 9-.6-5.4-3.6-8.4-9-9 5.4-.6 8.4-3.6 9-9Z" />
                </svg>
                <b>{strength.title}</b>
                <svg className={styles.strengthArrow} viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              <p id={panelId} hidden={!expanded}>
                {strength.text}
              </p>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

// simple-icons 는 LinkedIn 요청으로 LinkedIn 로고를 뺐다. 예전 simple-icons(CC0) 경로를 그대로 둔다
const LINKEDIN = {
  hex: '0A66C2',
  path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
};

/** 링크 주소로 브랜드 로고를 고른다. 모르는 주소는 null (첫 글자로 대신) */
function linkLogo(href: string) {
  if (href.startsWith('mailto:')) return siGmail;
  if (href.includes('github.com')) return siGithub;
  if (href.includes('linkedin.com')) return LINKEDIN;
  if (href.includes('tistory.com')) return siTistory;
  return null;
}

const linkHost = (url: string) => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');

export interface LinkRow {
  key: string;
  href: string;
  label: string;
  /** 없으면 주소에서 http·www 를 뗀 값 */
  sub?: string;
  external: boolean;
  /** 브랜드 로고가 없는 주소에 쓸 선 아이콘 (web: 지구본, doc: 문서) */
  icon?: 'web' | 'doc';
}

const LINE_ICONS = {
  web: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3Z" />
    </>
  ),
  doc: (
    <>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" />
      <path d="M14 3v5h5M9 13h6M9 17h6" />
    </>
  ),
};

/** 로고 + 이름 + 주소 + › 줄 목록 (프로필 링크 카드, 프로젝트 링크 카드가 같이 쓴다) */
export function LinkRows({ rows }: { rows: LinkRow[] }) {
  return (
    <ul className={styles.linkRows}>
      {rows.map((row) => {
        const logo = linkLogo(row.href);
        return (
          <li key={row.key}>
            <a href={row.href} {...(row.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
              <span className={styles.linkIcon} aria-hidden="true">
                {logo ? (
                  <svg viewBox="0 0 24 24" style={{ fill: `#${logo.hex}` }}>
                    <path d={logo.path} />
                  </svg>
                ) : row.icon ? (
                  <svg className={styles.lineIcon} viewBox="0 0 24 24">
                    {LINE_ICONS[row.icon]}
                  </svg>
                ) : (
                  row.label.slice(0, 1)
                )}
              </span>
              <span className={styles.linkText}>
                <b>{row.label}</b>
                <span>{row.sub ?? linkHost(row.href)}</span>
              </span>
              <span className={styles.chevron} aria-hidden="true">
                ›
              </span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}

export function LinksCard({ profile }: { profile: Profile }) {
  const rows: LinkRow[] = [
    ...profile.links.map((link) => ({ key: link.url, href: link.url, label: link.label, external: true })),
    { key: 'email', href: `mailto:${profile.email}`, label: '이메일', sub: profile.email, external: false },
  ];

  return (
    <Card ariaLabel="외부 링크">
      <LinkRows rows={rows} />
    </Card>
  );
}
