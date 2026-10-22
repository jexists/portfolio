import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import type { AuthProviderName, AuthUser } from '../api/AuthService';
import { useAuth } from '../hooks/AuthContext';
import { Logo } from '@/components/layout/Logo';
import { statsService } from '@/features/admin';
import type { Purpose } from '@/features/admin';
import { PURPOSE_OPTIONS } from '@/features/admin/api/labels';
import styles from './LoginPage.module.scss';

interface LoginLocationState {
  from?: string;
}

export function LoginPage() {
  const { user, loading, signIn } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [surveyUser, setSurveyUser] = useState<AuthUser | null>(null);
  const [checkingPurpose, setCheckingPurpose] = useState(false);
  const [savingPurpose, setSavingPurpose] = useState(false);
  const signInStarted = useRef(false);
  const destination = (location.state as LoginLocationState | null)?.from ?? '/search';

  useEffect(() => {
    if (loading || !user || signInStarted.current) return;

    let active = true;
    setCheckingPurpose(true);
    statsService.getPurpose(user.id).then((purpose) => {
      if (!active) return;
      if (purpose) navigate(destination, { replace: true });
      else setSurveyUser(user);
    }).finally(() => {
      if (active) setCheckingPurpose(false);
    });

    return () => { active = false; };
  }, [destination, loading, navigate, user]);

  async function handleSignIn(provider: AuthProviderName) {
    signInStarted.current = true;
    setCheckingPurpose(true);
    const signedInUser = await signIn(provider);
    const purpose = await statsService.getPurpose(signedInUser.id);

    if (purpose) navigate(destination, { replace: true });
    else setSurveyUser(signedInUser);
    setCheckingPurpose(false);
  }

  async function handlePurpose(purpose: Purpose) {
    if (!surveyUser) return;
    setSavingPurpose(true);
    await statsService.savePurpose(
      surveyUser.id,
      purpose,
      surveyUser.provider,
      surveyUser.name,
    );
    navigate(destination, { replace: true });
  }

  function handleBack() {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate('/search');
  }

  if (loading || checkingPurpose || (user && !surveyUser)) {
    return <main className={styles.page} aria-label="로그인 상태 확인 중" />;
  }

  return (
    <main className={styles.page}>
      <section className={styles.card} aria-label="소셜 로그인">
        <button className={styles.backButton} type="button" onClick={handleBack} aria-label="이전 화면으로">
          <BackIcon />
        </button>
        {surveyUser ? (
          <div className={styles.survey}>
            <h1 className={styles.surveyTitle}>어떤 목적으로 방문하셨나요?</h1>
            <div className={styles.purposeGrid}>
              {PURPOSE_OPTIONS.map((choice) => (
                <button
                  className={styles.purposeButton}
                  disabled={savingPurpose}
                  key={choice.purpose}
                  onClick={() => handlePurpose(choice.purpose)}
                  type="button"
                >
                  <span className={styles.purposeEmoji} aria-hidden="true">{choice.emoji}</span>
                  <span>{choice.label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className={styles.logoBlock}>
              <Link className={styles.logoLink} to="/" aria-label="첫페이지로 이동">
                <Logo variant="compact" />
              </Link>
              <p className={styles.tagline}>성장과 경험을 담은 공간</p>
            </div>
            <div className={styles.providers}>
              <button className={`${styles.providerButton} ${styles.kakao}`} type="button" onClick={() => handleSignIn('kakao')}>
                <KakaoIcon />
                카카오로 시작하기
              </button>
              <button className={`${styles.providerButton} ${styles.github}`} type="button" onClick={() => handleSignIn('github')}>
                <GithubIcon />
                GitHub로 시작하기
              </button>
              <p className={styles.signupHint}>로그인하고 둘러보세요.</p>
            </div>
          </>
        )}
      </section>
    </main>
  );
}

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}

function KakaoIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4C6.9 4 3 7.1 3 10.9c0 2.5 1.7 4.7 4.3 5.9L6.2 21l4.8-3.2h1c5.1 0 9-3.1 9-6.9S17.1 4 12 4Z" /></svg>;
}

function GithubIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.8a9.4 9.4 0 0 0-3 18.3c.5.1.6-.2.6-.5v-1.8c-2.7.6-3.3-1.1-3.3-1.1-.4-1.1-1.1-1.4-1.1-1.4-.9-.6.1-.6.1-.6 1 0 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.6.3-1.1.6-1.3-2.2-.2-4.5-1.1-4.5-4.6 0-1 .4-1.9 1-2.5-.1-.2-.4-1.2.1-2.5 0 0 .8-.3 2.6 1a9 9 0 0 1 4.8 0c1.8-1.2 2.6-1 2.6-1 .5 1.3.2 2.3.1 2.5.6.6 1 1.5 1 2.5 0 3.6-2.3 4.4-4.5 4.6.4.3.7.9.7 1.8v2.5c0 .3.2.6.7.5A9.4 9.4 0 0 0 12 2.8Z" /></svg>;
}
