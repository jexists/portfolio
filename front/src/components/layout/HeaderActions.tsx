import { useEffect, useRef, useState } from 'react';
import type { SyntheticEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useAuth } from '@/features/auth';
import { LinkIcon, useProfile } from '@/features/profile';
import styles from './HeaderActions.module.scss';

interface HeaderActionsProps {
  /** 인트로처럼 화면 아무 곳이나 누르면 넘어가는 곳에서, 버튼·메뉴 클릭이 부모로 번지지 않게 한다 */
  stopProfileClickPropagation?: boolean;
}

const PROVIDER_LABEL = {
  kakao: '카카오',
  github: 'GitHub',
} as const;

export function HeaderActions({ stopProfileClickPropagation = false }: HeaderActionsProps) {
  const { user, isAdmin, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [linksOpen, setLinksOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen && !linksOpen) return;
    function closeOutside(event: globalThis.MouseEvent) {
      if (!profileRef.current?.contains(event.target as Node)) setMenuOpen(false);
      if (!linksRef.current?.contains(event.target as Node)) setLinksOpen(false);
    }
    function closeOnEscape(event: globalThis.KeyboardEvent) {
      if (event.key !== 'Escape') return;
      setMenuOpen(false);
      setLinksOpen(false);
    }
    document.addEventListener('mousedown', closeOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [menuOpen, linksOpen]);

  function stopProfileInteraction(event: SyntheticEvent<HTMLDivElement>) {
    if (stopProfileClickPropagation) event.stopPropagation();
  }

  function handleProfileClick() {
    if (!user) {
      navigate('/login', { state: { from: `${location.pathname}${location.search}` } });
      return;
    }
    setMenuOpen((open) => !open);
  }

  async function handleSignOut() {
    await signOut();
    setMenuOpen(false);
  }

  return (
    <div className={styles.actions} onClick={stopProfileInteraction} onKeyDown={stopProfileInteraction}>
      <div className={styles.profile} ref={linksRef}>
        <button
          className={styles.iconButton}
          type="button"
          aria-label="내 링크"
          aria-expanded={linksOpen}
          onClick={() => setLinksOpen((open) => !open)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            {Array.from({ length: 9 }, (_, index) => (
              <circle cx={4 + (index % 3) * 8} cy={4 + Math.floor(index / 3) * 8} r="2" key={index} />
            ))}
          </svg>
        </button>
        {linksOpen ? <MyLinksMenu onNavigate={() => setLinksOpen(false)} /> : null}
      </div>
      <div className={styles.profile} ref={profileRef}>
        <button
          className={styles.avatarButton}
          type="button"
          aria-label={user ? `${user.name} 계정 메뉴` : '로그인'}
          aria-expanded={user ? menuOpen : undefined}
          onClick={handleProfileClick}
        >
          <span>{user ? user.name.trim().charAt(0) : 'J'}</span>
        </button>
        {user && menuOpen ? (
          <div className={styles.menu} role="menu">
            <strong>{user.name}</strong>
            <span className={styles.providerLabel}>{PROVIDER_LABEL[user.provider]} 계정</span>
            {isAdmin ? (
              <Link to="/admin" role="menuitem" onClick={() => setMenuOpen(false)}>관리자 대시보드</Link>
            ) : null}
            <button type="button" role="menuitem" onClick={handleSignOut}>로그아웃</button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/** 구글 앱 메뉴처럼 이력서·경력기술서·외부 링크를 아이콘 격자로 보여 준다. 열 때만 프로필을 불러온다 */
function MyLinksMenu({ onNavigate }: { onNavigate: () => void }) {
  const { data: profile } = useProfile();

  return (
    <div className={styles.linksMenu} role="dialog" aria-label="내 링크">
      <strong>내 링크</strong>
      <ul>
        <li>
          <Link to="/search?tab=resume" onClick={onNavigate}>
            <span className={styles.linkIcon}><LinkIcon href="/search?tab=resume" label="이력서" icon="doc" /></span>
            이력서
          </Link>
        </li>
        <li>
          <Link to="/search?tab=careerdoc" onClick={onNavigate}>
            <span className={styles.linkIcon}><LinkIcon href="/search?tab=careerdoc" label="경력기술서" icon="doc" /></span>
            경력기술서
          </Link>
        </li>
        {profile?.links.map((link) => (
          <li key={link.url}>
            <a href={link.url} target="_blank" rel="noopener noreferrer" onClick={onNavigate}>
              <span className={styles.linkIcon}><LinkIcon href={link.url} label={link.label} icon="web" /></span>
              {link.label}
            </a>
          </li>
        ))}
        {profile ? (
          <li>
            <a href={`mailto:${profile.email}`} onClick={onNavigate}>
              <span className={styles.linkIcon}><LinkIcon href={`mailto:${profile.email}`} label="이메일" /></span>
              이메일
            </a>
          </li>
        ) : null}
      </ul>
    </div>
  );
}
