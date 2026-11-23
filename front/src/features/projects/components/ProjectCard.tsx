import { Link } from 'react-router';
import type { ProjectMeta } from '@/features/projects/types/project.types';
import styles from './ProjectCard.module.scss';

interface ProjectCardProps {
  project: ProjectMeta;
  /** 프로젝트 탭: 요약·기술 태그까지, 전체 탭 레일: 제목·기간만 */
  detailed?: boolean;
}

const year = (project: ProjectMeta) => project.period.start.slice(0, 7);

/** 썸네일 타일. 대표 이미지가 없으면 제목 첫 글자를 보여 준다. */
export function ProjectCard({ project, detailed = false }: ProjectCardProps) {
  const body = (
    <>
      <ProjectThumbnail project={project} />
      <div className={styles.content}>
        <h3>
          {project.title}
          {project.subtitle ? <span> · {project.subtitle}</span> : null}
        </h3>
        {detailed ? <p className={styles.summary}>{project.summary}</p> : null}
        {detailed && project.highlights.length ? (
          <ul className={styles.highlights}>
            {project.highlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : null}
        <p className={styles.meta}>
          {[project.kind, year(project), project.team?.replace(/ \(.*\)$/, '')].filter(Boolean).join(' · ')}
        </p>
        {detailed ? (
          <div className={styles.tags}>
            {project.tags.slice(0, 5).map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        ) : null}
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
