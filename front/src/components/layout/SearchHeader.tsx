import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { HeaderActions } from './HeaderActions';
import { Logo } from './Logo';
import styles from './SearchHeader.module.scss';

interface SearchHeaderProps {
  tabs?: ReactNode;
}

export function SearchHeader({ tabs }: SearchHeaderProps) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;

    const timeout = window.setTimeout(() => setCopied(false), 2000);

    return () => window.clearTimeout(timeout);
  }, [copied]);

  async function shareCurrentPage() {
    try {
      await window.navigator.clipboard?.writeText(window.location.href);
      setCopied(true);
    } catch {
      // Clipboard failures should not interrupt browsing.
    }
  }

  return (
    <header className={styles.header}>
      <div className={styles.topRow}>
        <a className={styles.logoLink} href="/" aria-label="첫페이지로 이동">
          <Logo />
        </a>
        <div className={styles.search} role="search">
          <input aria-label="검색어" value="정주애 포트폴리오" readOnly />
          <button className={styles.clearButton} type="button" aria-label="검색어 지우기" onClick={() => navigate('/')}>
            <CloseIcon />
          </button>
          <span className={styles.divider} aria-hidden="true" />
          <KeyboardIcon />
          <MicrophoneIcon />
          <LensIcon />
          <SearchIcon />
        </div>
        <div className={styles.rightActions}>
          <button className={styles.shareButton} type="button" aria-label={copied ? '복사됨' : '공유'} onClick={shareCurrentPage}>
            <ShareIcon />
            <span>{copied ? '복사됨' : '공유'}</span>
          </button>
          <HeaderActions onAppClick={() => undefined} />
        </div>
      </div>
      {tabs ? (
        <div className={styles.tabsRow} data-testid="search-header-tabs">
          <div className={styles.tabsSlot}>{tabs}</div>
        </div>
      ) : null}
    </header>
  );
}

function CloseIcon() {
  return <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>;
}

function KeyboardIcon() {
  return <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="6" width="18" height="12" rx="2" /><path d="M7 10h.01M11 10h.01M15 10h.01M18 10h.01M7 14h10" /></svg>;
}

function MicrophoneIcon() {
  return <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M6 11a6 6 0 0 0 12 0M12 17v4M9 21h6" /></svg>;
}

function LensIcon() {
  return <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3" /><circle cx="12" cy="12" r="4" /><path d="m7 5 1-2h3" /></svg>;
}

function SearchIcon() {
  return <svg className={`${styles.icon} ${styles.searchIcon}`} viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m15.5 15.5 4.5 4.5" /></svg>;
}

function ShareIcon() {
  return <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true"><circle cx="18" cy="5" r="2.5" /><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="19" r="2.5" /><path d="m8.2 10.8 7.6-4.5M8.2 13.2l7.6 4.5" /></svg>;
}
