import type { ReactNode } from 'react';
import { Link } from 'react-router';
import styles from './Card.module.scss';

interface CardProps {
  title?: string;
  /** 제목 오른쪽 화살표 링크 (예: 전체 보기) */
  moreTo?: string;
  /** 제목 오른쪽 끝의 작은 설명 (예: 집계 기준) */
  note?: string;
  /** 제목 바로 옆 작은 회색 상태 (예: 배포 종료) */
  badge?: string;
  /** 제목 오른쪽 끝에 두는 조작 요소 (예: 정렬 토글) */
  action?: ReactNode;
  className?: string;
  ariaLabel?: string;
  children: ReactNode;
}

/** 검색 결과 화면의 흰 카드. 제목이 있으면 section 의 이름이 된다. */
export function Card({ title, moreTo, note, badge, action, className, ariaLabel, children }: CardProps) {
  return (
    <section className={[styles.card, className].filter(Boolean).join(' ')} aria-label={ariaLabel ?? title}>
      {title ? (
        <div className={styles.head}>
          <h2>
            {title}
            {badge ? <span className={styles.badge}>{badge}</span> : null}
          </h2>
          {note ? <span className={styles.note}>{note}</span> : null}
          {action}
          {moreTo ? (
            <Link className={styles.more} to={moreTo} aria-label={`${title} 더보기`}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
          ) : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}
