import type { Purpose } from './StatsService';

export const PURPOSE_OPTIONS: ReadonlyArray<{
  emoji: string;
  label: string;
  purpose: Purpose;
}> = [
  { emoji: '💼', label: '채용 담당자', purpose: 'recruiter' },
  { emoji: '👨‍💻', label: '개발자', purpose: 'developer' },
  { emoji: '🎓', label: '학생', purpose: 'student' },
  { emoji: '👀', label: '둘러보기', purpose: 'visitor' },
];

export const PURPOSE_LABELS: Record<Purpose, string> = Object.fromEntries(
  PURPOSE_OPTIONS.map(({ label, purpose }) => [purpose, label]),
) as Record<Purpose, string>;
