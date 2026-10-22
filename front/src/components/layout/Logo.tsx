import styles from './Logo.module.scss';
import type { CSSProperties } from 'react';

const LETTERS = ['P', 'o', 'r', 't', 'F', 'o', 'l', 'i', 'o'];
const COLORS = ['blue', 'red', 'yellow', 'blue', 'green', 'red', 'yellow', 'blue', 'green'];

interface LogoProps {
  variant?: 'default' | 'compact' | 'intro' | 'intro-static';
}

type LogoLetterStyle = CSSProperties & {
  '--logo-letter-index': number;
};

export function Logo({ variant = 'default' }: LogoProps) {
  return (
    <div className={styles.logo} aria-label="PortFolio" data-variant={variant}>
      {variant !== 'default' ? <Butterfly /> : null}
      {LETTERS.map((letter, index) => (
        <span
          className={styles.letter}
          data-color={COLORS[index]}
          data-testid="logo-letter"
          style={{ '--logo-letter-index': index } as LogoLetterStyle}
          key={`${letter}-${index}`}
        >
          {letter}
        </span>
      ))}
    </div>
  );
}

function Butterfly() {
  return (
    <span className={styles.butterflyAnchor}>
      <span className={styles.butterflyFlight}>
        <svg className={styles.butterfly} viewBox="0 0 48 36" aria-label="빨간 나비" role="img">
          <g className={styles.leftWing}>
            <path d="M23 18 C14 2, 2 5, 8 18 C2 24, 9 34, 23 21Z" />
          </g>
          <g className={styles.rightWing}>
            <path d="M25 18 C34 2, 46 5, 40 18 C46 24, 39 34, 25 21Z" />
          </g>
          <path className={styles.butterflyBody} d="M24 14 C22.5 19, 22.5 24, 24 29" />
        </svg>
      </span>
    </span>
  );
}
