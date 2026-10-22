import { Link } from 'react-router';
import type { ProjectMeta } from '@/features/projects/types/project.types';
import styles from './SeriesNav.module.scss';

interface SeriesNavProps {
  seriesName: string;
  projects: ProjectMeta[];
  currentSlug: string;
}

export function SeriesNav({ seriesName, projects, currentSlug }: SeriesNavProps) {
  const currentIndex = projects.findIndex((project) => project.slug === currentSlug);

  if (currentIndex < 0) {
    return null;
  }

  const previous = projects[currentIndex - 1];
  const next = projects[currentIndex + 1];

  return (
    <nav className={styles.nav} aria-label="시리즈 내비게이션">
      <p className={styles.title}>
        시리즈: {seriesName} ({currentIndex + 1}/{projects.length})
      </p>
      <div className={styles.links}>
        {previous ? (
          <Link to={`/project/${previous.slug}`}>이전 프로젝트 {previous.title}</Link>
        ) : (
          <span aria-disabled="true">이전 프로젝트 없음</span>
        )}
        {next ? (
          <Link to={`/project/${next.slug}`}>다음 프로젝트 {next.title}</Link>
        ) : (
          <span aria-disabled="true">다음 프로젝트 없음</span>
        )}
      </div>
    </nav>
  );
}
