import { Link } from 'react-router';
import type { ProjectMeta } from '@/features/projects/types/project.types';
import styles from './ProjectCard.module.scss';

interface ProjectCardProps {
  project: ProjectMeta;
}

const year = (project: ProjectMeta) => project.period.start.slice(0, 7);

/** 썸네일 타일. 대표 이미지가 없으면 제목 첫 글자를 보여 준다. */
export function ProjectCard({ project }: ProjectCardProps) {
  const body = (
    <>
      <ProjectThumbnail project={project} />
      <div className={styles.content}>
        <h3>
          {project.title}
          {project.subtitle ? <span> · {project.subtitle}</span> : null}
        </h3>
        <p className={styles.meta}>
          {[project.kind, year(project), project.team?.replace(/ \(.*\)$/, '')].filter(Boolean).join(' · ')}
        </p>
      </div>
    </>
  );

  if (project.draft) {
    return (
      <article className={styles.card} data-draft="true" data-testid="project-card" aria-label={`${project.title} 준비중`}>
        {body}
      </article>
    );
  }

  return (
    <article className={styles.card} data-testid="project-card" aria-label={`${project.title} 프로젝트`}>
      <Link className={styles.link} to={`/project/${project.slug}`}>
        {body}
      </Link>
    </article>
  );
}

export function ProjectThumbnail({ project, caption }: { project: ProjectMeta; caption?: string }) {
  const [cover] = project.images;
  return (
    <div className={styles.thumbnail}>
      {cover ? <img src={cover.src} alt={caption ?? cover.caption} /> : <span aria-hidden="true">{project.title.slice(0, 1)}</span>}
    </div>
  );
}
