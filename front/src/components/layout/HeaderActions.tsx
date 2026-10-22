import { useEffect, useRef, useState } from 'react';
import type { SyntheticEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useAuth } from '@/features/auth';
import styles from './HeaderActions.module.scss';

interface HeaderActionsProps {
  onAppClick: () => void;
  stopProfileClickPropagation?: boolean;
}

const PROVIDER_LABEL = {
  kakao: '카카오',
  github: 'GitHub',
} as const;

export function HeaderActions({ onAppClick, stopProfileClickPropagation = false }: HeaderActionsProps) {
  const { user, isAdmin, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function closeOutside(event: globalThis.MouseEvent) {
      if (!profileRef.current?.contains(event.target as Node)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', closeOutside);
    return () => document.removeEventListener('mousedown', closeOutside);
  }, [menuOpen]);

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
    <div className={styles.actions}>
      <button className={styles.iconButton} type="button" aria-label="Google 앱" onClick={onAppClick}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          {Array.from({ length: 9 }, (_, index) => (
            <circle cx={4 + (index % 3) * 8} cy={4 + Math.floor(index / 3) * 8} r="2" key={index} />
          ))}
        </svg>
      </button>
      <div className={styles.profile} ref={profileRef} onClick={stopProfileInteraction} onKeyDown={stopProfileInteraction}>
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
