import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import styles from './SiteFooter.module.scss';

// shortcut: profiles.json 의 email 과 같은 값을 직접 둔다, 문의 폼으로 바꿀 때 이 링크를 폼 열기로 교체
const CONTACT_MAIL = `mailto:jexists486@gmail.com?subject=${encodeURIComponent('[포트폴리오] 채용·커피챗 문의')}`;

function scrollToTop() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
}

/** 검색결과·상세 화면 맨 아래: 회색 바탕에 맨위로, 그 아래 흰 풋터(저작권 · 이력서·경력기술서 · 문의 메일) */
export function SiteFooter() {
  // 모바일 떠 있는 맨위로 버튼: 한 화면 넘게 내려가면 보인다 (PC 에서는 CSS 로 숨긴다)
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > window.innerHeight);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  return (
    <>
      {scrolled ? (
        <button type="button" className={styles.floatingTop} aria-label="맨위로" onClick={scrollToTop}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m6 15 6-6 6 6" />
          </svg>
        </button>
      ) : null}
      <div className={`${styles.inner} ${styles.topRow}`}>
        <button type="button" className={styles.top} onClick={scrollToTop}>
          맨위로
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m6 15 6-6 6 6" />
          </svg>
        </button>
      </div>
      <footer className={styles.footer}>
        <div className={styles.inner}>
          <small>© 2026 jexists. All rights reserved.</small>
          <nav className={styles.links} aria-label="문서·문의">
            <Link to="/search?tab=resume">이력서</Link>
            <Link to="/search?tab=careerdoc">경력기술서</Link>
            <a href={CONTACT_MAIL}>채용·커피챗 문의</a>
          </nav>
        </div>
      </footer>
    </>
  );
}
