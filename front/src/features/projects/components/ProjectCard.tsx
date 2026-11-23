import { Link } from 'react-router';
import type { ProjectMeta } from '@/features/projects/types/project.types';
import styles from './ProjectCard.module.scss';

interface ProjectCardProps {
  project: ProjectMeta;
}

/** team 이 "1명 …"이면 개인, 그 밖에는 협업. 비어 있으면 표시하지 않는다 */
const teamKind = (team?: string) => (!team ? '' : /^1명/.test(team) ? '개인' : '협업');

/** 카드·목록 공통 한 줄 정보: 연도 · 작업 기간 · 개인/협업 (예: 2026 · 4일 · 개인) */
export const projectFacts = (project: ProjectMeta) =>
  [project.period.start.slice(0, 4), project.duration, teamKind(project.team)].filter(Boolean).join(' · ');

/** 썸네일 타일. 대표 이미지가 없으면 제목 첫 글자를 보여 준다. */
export function ProjectCard({ project }: ProjectCardProps) {
  const body = (
    <>
      <ProjectThumbnail project={project} />
      <div className={styles.content}>
        <h3>{project.title}</h3>
        {project.subtitle ? <p className={styles.subtitle}>{project.subtitle}</p> : null}
        <p className={styles.meta}>{projectFacts(project)}</p>
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
