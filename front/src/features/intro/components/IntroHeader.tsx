import type { SyntheticEvent } from 'react';
import { HeaderActions } from '@/components/layout/HeaderActions';
import styles from './IntroHeader.module.scss';

interface IntroHeaderProps {
  onSkip: () => void;
}

function stopPageSkip(event: SyntheticEvent<HTMLAnchorElement>): void {
  event.stopPropagation();
}

export function IntroHeader({ onSkip }: IntroHeaderProps) {
  return (
    <header className={styles.header} aria-label="인트로 바로가기">
      <a
        className={styles.textLink}
        href="https://github.com/jexists/"
        target="_blank"
        rel="noreferrer"
        onClick={stopPageSkip}
        onKeyDown={stopPageSkip}
      >
        GitHub
      </a>
      <button className={styles.textLink} type="button" onClick={onSkip}>
        이력서
      </button>
      <HeaderActions onAppClick={onSkip} stopProfileClickPropagation />
    </header>
  );
}
