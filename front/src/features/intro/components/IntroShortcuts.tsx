import type { ReactNode, SyntheticEvent } from 'react';
import styles from './IntroShortcuts.module.scss';

interface IntroShortcutsProps {
  onSkip: () => void;
}

interface Shortcut {
  label: string;
  icon: ReactNode;
  href?: string;
  external?: boolean;
}

const iconProps = {
  viewBox: '0 0 24 24',
  'aria-hidden': true,
} as const;

const SHORTCUTS: Shortcut[] = [
  {
    label: '프로젝트',
    icon: <svg {...iconProps}><path d="M4 7h6l2 2h8v10H4z" /><path d="M4 7V5h6l2 2" /></svg>,
  },
  {
    label: '퍼블리싱',
    icon: <svg {...iconProps}><path d="m8 7-5 5 5 5M16 7l5 5-5 5M14 4l-4 16" /></svg>,
  },
  {
    label: '디자인',
    icon: <svg {...iconProps}><path d="M12 3a9 9 0 1 0 0 18h2a2 2 0 0 0 0-4h-1a2 2 0 0 1 0-4h4a4 4 0 0 0 4-4c0-3-4-6-9-6Z" /><path d="M7.5 9h.01M10 6.5h.01M15 7h.01" /></svg>,
  },
  {
    label: '스터디',
    icon: <svg {...iconProps}><path d="M4 5h7a3 3 0 0 1 3 3v11a3 3 0 0 0-3-3H4z" /><path d="M20 5h-3a3 3 0 0 0-3 3v11a3 3 0 0 1 3-3h3z" /></svg>,
  },
  {
    label: 'GitHub',
    href: 'https://github.com/jexists/',
    external: true,
    icon: <svg {...iconProps}><path d="M9 19c-4 1.2-4-2-5-2.5M14 22v-3.1c0-.9.3-1.6.8-2-2.8-.3-5.8-1.4-5.8-6A4.7 4.7 0 0 1 10.2 7 4.3 4.3 0 0 1 10.3 3s1-.3 3.7 1.5a13 13 0 0 1 6 0C22.7 2.7 23.7 3 23.7 3a4.3 4.3 0 0 1 .1 4A4.7 4.7 0 0 1 25 10.9c0 4.6-3 5.7-5.8 6 .5.4.8 1.2.8 2V22" transform="translate(-5)" /></svg>,
  },
  {
    label: '이메일',
    href: 'mailto:jexists486@gmail.com',
    icon: <svg {...iconProps}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></svg>,
  },
  {
    label: '자세히 보기',
    icon: <svg {...iconProps}><circle cx="12" cy="12" r="9" /><path d="M8 12h8M13 8l4 4-4 4" /></svg>,
  },
];

function stopPageSkip(event: SyntheticEvent<HTMLAnchorElement>): void {
  event.stopPropagation();
}

export function IntroShortcuts({ onSkip }: IntroShortcutsProps) {
  return (
    <nav className={styles.shortcuts} aria-label="포트폴리오 바로가기">
      {SHORTCUTS.map(({ label, icon, href, external }) =>
        href ? (
          <a
            className={styles.shortcut}
            href={href}
            target={external ? '_blank' : undefined}
            rel={external ? 'noreferrer' : undefined}
            onClick={stopPageSkip}
            onKeyDown={stopPageSkip}
            key={label}
          >
            <span className={styles.icon}>{icon}</span>
            <span>{label}</span>
          </a>
        ) : (
          <button className={styles.shortcut} type="button" onClick={onSkip} key={label}>
            <span className={styles.icon}>{icon}</span>
            <span>{label}</span>
          </button>
        ),
      )}
    </nav>
  );
}
