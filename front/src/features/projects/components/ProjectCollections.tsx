import { useRef, useState } from 'react';
import { Link } from 'react-router';
import { Card } from '@/components/ui/Card';
import type { Category, ProjectLinkType, ProjectMeta } from '@/features/projects/types/project.types';
import { ProjectCard } from './ProjectCard';
import styles from './ProjectCollections.module.scss';

export const LINK_KIND: Record<ProjectLinkType, string> = {
  live: 'Live',
  github: 'GitHub',
  slides: '발표',
  video: '영상',
  doc: '문서',
  pdf: 'PDF',
};

const SearchIcon = () => (
  <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

/** 전체 탭: 대표 프로젝트 가로 썸네일 목록 */
export function FeaturedRail({ projects }: { projects: ProjectMeta[] }) {
  const railRef = useRef<HTMLDivElement>(null);

  if (!projects.length) return null;

  return (
    <Card title="대표 프로젝트" moreTo="/search?tab=projects">
      <div className={styles.carousel}>
        <div className={styles.rail} ref={railRef}>
          {projects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
        <button
          className={styles.next}
          type="button"
          aria-label="다음 프로젝트"
          onClick={() => railRef.current?.scrollBy({ left: railRef.current.clientWidth / 3, behavior: 'smooth' })}
        >
          ›
        </button>
      </div>
    </Card>
  );
}

interface ProjectsTabProps {
  projects: ProjectMeta[];
  /** ?tag= 로 들어오면 전체 목록을 펼치고 그 기술로 거른다 */
  tag: string | null;
  onClearTag: () => void;
}

/** 프로젝트 탭: 대표작 카드 → 더보기로 나머지 목록과 구분 필터 */
export function ProjectsTab({ projects, tag, onClearTag }: ProjectsTabProps) {
  const featured = projects.filter((project) => project.featured);
  const rest = projects.filter((project) => !project.featured);
  const [expanded, setExpanded] = useState(Boolean(tag));
  const [group, setGroup] = useState<Category | 'all'>('all');
  const groups = [...new Map(rest.map((project) => [project.category, project.kind ?? project.category])).entries()];
  const visible = (tag ? projects : rest)
    .filter((project) => group === 'all' || project.category === group)
    .filter((project) => !tag || project.tags.includes(tag));

  return (
    <>
      <Card title="대표 프로젝트">
        <div className={styles.grid}>
          {featured.map((project) => (
            <ProjectCard key={project.slug} project={project} detailed />
          ))}
        </div>
        {expanded ? null : (
          <button className={styles.more} type="button" aria-expanded="false" onClick={() => setExpanded(true)}>
            프로젝트 더보기 {rest.length}개
          </button>
        )}
      </Card>
      {expanded ? (
        <Card title="모든 프로젝트">
          <div className={styles.filters} role="group" aria-label="프로젝트 구분">
            {[['all', '전체'] as const, ...groups].map(([value, label]) => (
              <button
                key={value}
                className={styles.chip}
                type="button"
                aria-pressed={group === value}
                onClick={() => setGroup(value)}
              >
                {label}
              </button>
            ))}
            {tag ? (
              <button className={styles.chip} type="button" aria-pressed="true" onClick={onClearTag} aria-label={`${tag} 필터 해제`}>
                {tag} ✕
              </button>
            ) : null}
          </div>
          {visible.length ? (
            <ul className={styles.list}>
              {visible.map((project) => (
                <li key={project.slug}>
                  <h3>
                    <Link to={`/project/${project.slug}`}>
                      {project.title}
                      {project.subtitle ? ` - ${project.subtitle}` : ''}
                    </Link>
                  </h3>
                  <p>{project.summary}</p>
                  <p className={styles.meta}>
                    <span>
                      {project.period.start} – {project.period.end}
                    </span>
                    <span>{project.tags.slice(0, 3).join(' · ')}</span>
                    {project.links.slice(0, 2).map((link) => (
                      <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer">
                        {LINK_KIND[link.type]}
                      </a>
                    ))}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.empty}>해당하는 프로젝트가 없습니다</p>
          )}
        </Card>
      ) : null}
    </>
  );
}

export interface RelatedQuery {
  label: string;
  to: string;
}

/** 대표 프로젝트와 실무 기술로 "이름 + 키워드" 검색어를 만든다 */
export function buildRelatedQueries(name: string, featured: ProjectMeta[], skillNames: string[], limit = 3): RelatedQuery[] {
  return [
    ...featured.slice(0, limit).map((project) => ({ label: `${name} ${project.title}`, to: `/project/${project.slug}` })),
    ...skillNames.slice(0, limit).map((skill) => ({ label: `${name} ${skill}`, to: '/search?tab=skills' })),
  ];
}

export function RelatedQueries({ queries }: { queries: RelatedQuery[] }) {
  if (!queries.length) return null;

  return (
    <Card title="관련 검색어">
      <ul className={styles.queries}>
        {queries.map((query) => (
          <li key={query.label}>
            <Link to={query.to}>
              <SearchIcon />
              {query.label}
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}
