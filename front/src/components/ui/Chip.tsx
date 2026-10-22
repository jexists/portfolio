import styles from './Chip.module.scss';

interface ChipProps {
  label: string;
  ariaLabel?: string;
  active?: boolean;
  onClick?: () => void;
}

export function Chip({ label, ariaLabel, active = false, onClick }: ChipProps) {
  if (!onClick) {
    return (
      <span className={styles.chip} data-active={active}>
        {label}
      </span>
    );
  }

  return (
    <button
      className={styles.chip}
      type="button"
      aria-label={ariaLabel ?? label}
      aria-pressed={active}
      data-active={active}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
