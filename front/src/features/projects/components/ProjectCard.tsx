import { Link } from 'react-router';
import { Chip } from '@/components/ui/Chip';
import type { ProjectMeta } from '@/features/projects/types/project.types';
import styles from './ProjectCard.module.scss';

interface ProjectCardProps {
  project: ProjectMeta;
}

export function ProjectCard({ project }: ProjectCardProps) {
  if (project.draft) {
    return (
      <article
        className={styles.card}
        data-draft="true"
        data-testid="project-card"
        aria-label={`${project.title} 준비중`}
      >
        <ProjectThumbnail project={project} />
        <div className={styles.content}>
          <span className={styles.badge}>{project.kind ?? '프로젝트'}</span>
          <h2>{project.title}</h2>
          <p>{project.summary}</p>
          <strong className={styles.pending}>준비중...</strong>
        </div>
      </article>
    );
  }

  return (
    <article className={styles.card} data-testid="project-card" aria-label={`${project.title} 프로젝트`}>
      <Link className={styles.link} to={`/project/${project.slug}`}>
        <ProjectThumbnail project={project} />
        <div className={styles.content}>
          <span className={styles.badge}>{project.kind ?? '프로젝트'}</span>
          <h2>{project.title}</h2>
          <p>{project.summary}</p>
          <div className={styles.tags}>
            {project.tags.map((tag) => (
              <Chip key={tag} label={tag} />
            ))}
          </div>
          {project.series ? <span className={styles.series}>{project.series}</span> : null}
        </div>
      </Link>
    </article>
  );
}

function ProjectThumbnail({ project }: ProjectCardProps) {
  return (
    <div className={styles.thumbnail} data-category={project.category}>
      {project.thumbnail ? <img src={project.thumbnail} alt="" /> : <span>{project.title.slice(0, 1)}</span>}
    </div>
  );
}
