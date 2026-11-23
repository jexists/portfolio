import styles from './RailButton.module.scss';

interface RailButtonProps {
  side: 'prev' | 'next';
  label: string;
  onClick: () => void;
}

/** 가로 레일 양 끝에 걸친 원형 화살표 버튼 (대표 프로젝트·타임라인 공용). 부모는 position: relative */
export function RailButton({ side, label, onClick }: RailButtonProps) {
  return (
    <button className={styles.button} data-side={side} type="button" aria-label={label} onClick={onClick}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d={side === 'prev' ? 'm15 6-6 6 6 6' : 'm9 6 6 6-6 6'} />
      </svg>
    </button>
  );
}
