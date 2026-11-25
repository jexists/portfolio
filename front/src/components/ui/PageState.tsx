import { useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import styles from './PageState.module.scss';

/** 검색결과·상세 화면 로딩 중: 제목 카드 + 본문 카드 두 장 (반짝이는 회색 막대) */
export function PageSkeleton({ label }: { label: string }) {
  return (
    <div className={styles.skeleton} role="status" aria-label={label}>
      <div className={styles.card}>
        <span className={styles.bar} data-size="title" />
        <span className={styles.bar} data-size="half" />
        <span className={styles.bar} />
        <span className={styles.bar} data-size="long" />
      </div>
      {[0, 1].map((key) => (
        <div key={key} className={styles.card}>
          <span className={styles.bar} data-size="heading" />
          <span className={styles.bar} />
          <span className={styles.bar} data-size="long" />
          <span className={styles.bar} data-size="half" />
        </div>
      ))}
    </div>
  );
}

/** 오류 원인을 사람이 읽을 말로: 인터넷 끊김 / 시간 초과 / 서버 오류 / 그 밖 */
export function describeLoadError(error: unknown): string {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return '인터넷 연결이 끊겨 있습니다.';
  if (isAxiosError(error)) {
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') return '응답이 너무 늦어 중단했습니다. 인터넷이 느릴 수 있습니다.';
    if (!error.response) return '서버에 연결하지 못했습니다. 인터넷 연결을 확인해 주세요.';
    return `서버가 오류로 응답했습니다 (HTTP ${error.response.status}).`;
  }
  return '데이터를 읽는 중 문제가 생겼습니다.';
}

/** 불러오기 실패: 원인 + 다시 시도 (실패한 요청을 다시 보낸다) */
export function LoadError({ error }: { error: unknown }) {
  const queryClient = useQueryClient();
  return (
    <section className={styles.error} role="alert">
      <h1>내용을 불러오지 못했습니다</h1>
      <p>{describeLoadError(error)}</p>
      {error instanceof Error ? <code>{error.message}</code> : null}
      <button type="button" onClick={() => void queryClient.refetchQueries({ type: 'active' })}>
        다시 시도
      </button>
    </section>
  );
}
