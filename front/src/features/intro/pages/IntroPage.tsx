import { useCallback, useEffect } from 'react';
import type { CSSProperties, MouseEvent } from 'react';
import { useNavigate } from 'react-router';
import { projectsApi } from '@/features/projects';
import { IntroHeader } from '@/features/intro/components/IntroHeader';
import { IntroShortcuts } from '@/features/intro/components/IntroShortcuts';
import { Logo } from '@/components/layout/Logo';
import styles from './IntroPage.module.scss';
import { useIntroSequence } from '@/features/intro/hooks/useIntroSequence';

interface IntroProps {
  onComplete?: () => void;
}

type SuggestionStyle = CSSProperties & {
  '--suggestion-index': number;
};

const SUGGESTIONS = [
  '정주애 포트폴리오',
  '정주애 개발 기록 ',
  '정주애 프로젝트',
  '정주애 성장과정',
];

export function IntroPage({ onComplete }: IntroProps) {
  const navigate = useNavigate();
  const complete = useCallback(() => {
    if (onComplete) {
      onComplete();
      return;
    }

    navigate('/search', { state: { fromIntro: true } });
  }, [navigate, onComplete]);
  const { phase, typedText, suggestOpen, skip } = useIntroSequence({ onComplete: complete });
  const isSelectingFirstSuggestion = phase === 'cursor';

  const handleSkip = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    skip();
  };

  const handleLucky = async (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    try {
      const projects = await projectsApi.listProjects({ includeDrafts: false });
      const publishedProjects = projects.filter((project) => !project.draft);
      const project = publishedProjects[Math.floor(Math.random() * publishedProjects.length)];

      if (project) {
        navigate(`/project/${project.slug}`);
        return;
      }
    } catch {
      // 콘텐츠 조회 실패는 일반 검색 동작으로 안전하게 대체한다.
    }

    skip();
  };

  useEffect(() => {
    window.addEventListener('keydown', skip);
    return () => window.removeEventListener('keydown', skip);
  }, [skip]);

  return (
    <main
      className={styles.page}
      data-phase={phase}
      onClick={skip}
      onKeyDown={skip}
      role="main"
      tabIndex={-1}
    >
      <IntroHeader onSkip={skip} />
      <section className={styles.searchPanel} aria-label="포트폴리오 인트로">
        <div className={styles.logoWrap}>
          <Logo variant={phase === 'static' ? 'intro-static' : 'intro'} />
        </div>

        <form
          className={styles.searchArea}
          role="search"
          onSubmit={(event) => event.preventDefault()}
        >
            <label className={styles.srOnly} htmlFor="intro-search">
              검색어
            </label>
            <div className={styles.searchSurface} data-suggest-open={suggestOpen}>
              <div className={styles.searchBox}>
                <span className={styles.plusIcon} aria-hidden="true">
                  <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>
                </span>
                <input
                  className={styles.srOnly}
                  id="intro-search"
                  type="search"
                  aria-label="검색어"
                  readOnly
                  value={typedText}
                />
                <span className={styles.visibleQuery} aria-hidden="true">
                  {typedText ? (
                    <>
                      <span data-testid="visible-query">{typedText}</span>
                      <span className={styles.textCursor} data-text-cursor="true" />
                    </>
                  ) : (
                    <span className={styles.placeholder}></span>
                  )}
                </span>
                <span className={styles.searchActions}>
                  <span className={styles.actionIcon} aria-hidden="true">
                    <svg viewBox="0 0 24 24"><path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Z" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3M8 21h8" /></svg>
                  </span>
                  <span className={styles.actionIcon} aria-hidden="true">
                    <svg viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="13" rx="3" /><path d="m8 6 1.5-2h5L16 6" /><circle cx="12" cy="12.5" r="3.5" /></svg>
                  </span>
                  <button className={styles.aiButton} type="button" onClick={handleSkip}>
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 10.7 7.7 6 9l4.7 1.3L12 15l1.3-4.7L18 9l-4.7-1.3Z" /><path d="m18 15-.7 2.3L15 18l2.3.7L18 21l.7-2.3L21 18l-2.3-.7Z" /></svg>
                    AI 모드
                  </button>
                </span>
              </div>
              <div className={styles.suggestions} role="listbox" aria-hidden={!suggestOpen}>
                <div className={styles.suggestionsInner}>
                  <ul className={styles.suggestionList}>
                    {SUGGESTIONS.map((suggestion, index) => (
                      <li
                        className={styles.suggestion}
                        role="option"
                        aria-selected={isSelectingFirstSuggestion && index === 0}
                        style={{ '--suggestion-index': index } as SuggestionStyle}
                        key={suggestion}
                      >
                        <svg className={styles.suggestionIcon} data-testid="suggestion-search-icon" viewBox="0 0 24 24" aria-hidden="true">
                          <circle cx="11" cy="11" r="7" />
                          <path d="m16.5 16.5 4 4" />
                        </svg>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                  <div className={styles.suggestionActions}>
                    <button type="button" tabIndex={suggestOpen ? 0 : -1} onClick={handleSkip}>Juae 검색</button>
                    <button type="button" tabIndex={suggestOpen ? 0 : -1} onClick={handleLucky}>I'm Feeling Lucky</button>
                  </div>
                  <button className={styles.reportButton} type="button" tabIndex={suggestOpen ? 0 : -1} onClick={handleSkip}>
                    부적절한 예상 검색어 신고
                  </button>
                </div>
              </div>
            </div>
        </form>

        <div className={styles.shortcutStage}>
          <IntroShortcuts onSkip={skip} />
        </div>

        <p className={styles.skipHint} aria-hidden={phase !== 'static'}>
          화면을 클릭해 포트폴리오 보기
        </p>
      </section>
      <button className={styles.customizeButton} type="button" onClick={skip}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 16-.5 4.5L8 20l11-11-4-4Z" /><path d="m13 7 4 4" /></svg>
        포트폴리오 맞춤설정
      </button>
    </main>
  );
}
