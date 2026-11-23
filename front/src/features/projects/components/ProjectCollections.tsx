import { useState } from 'react';
import { Link } from 'react-router';
import { Card } from '@/components/ui/Card';
import { RailButton } from '@/components/ui/RailButton';
import { useRail } from '@/hooks/useRail';
import { CATEGORY_LABEL } from '@/features/projects/types/project.types';
import type { Category, ProjectLinkType, ProjectMeta } from '@/features/projects/types/project.types';
import { ProjectCard, projectFacts } from './ProjectCard';
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
  const { ref: railRef, edge, update: updateEdge, scroll: scrollRail } = useRail([projects]);

  if (!projects.length) return null;

  return (
    <Card title="대표 프로젝트" moreTo="/search?tab=projects">
      <div className={styles.carousel}>
        <div className={styles.rail} ref={railRef} onScroll={updateEdge} data-testid="featured-rail">
          {projects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
        {edge.start ? null : <RailButton side="prev" label="이전 프로젝트" onClick={() => scrollRail(-1)} />}
        {edge.end ? null : <RailButton side="next" label="다음 프로젝트" onClick={() => scrollRail(1)} />}
      </div>
    </Card>
  );
}

interface ProjectsTabProps {
  projects: ProjectMeta[];
  /** ?tag= 로 들어오면 그 기술로 거른다 */
  tag: string | null;
  onClearTag: () => void;
}

/** 목록 항목 아래 캡처 줄: 넘치면 양 끝 화살표로 넘긴다 (버튼은 링크 밖에 둔다) */
function ImageStrip({ images, to }: { images: ProjectMeta['images']; to: string }) {
  const rail = useRail<HTMLAnchorElement>([images]);

  return (
    <div className={styles.stripWrap}>
      <Link className={styles.strip} to={to} tabIndex={-1} aria-hidden="true" ref={rail.ref} onScroll={rail.update}>
        {images.map((image) => (
          <img key={image.src} src={image.src} alt="" loading="lazy" onLoad={rail.update} />
        ))}
      </Link>
      {rail.edge.start ? null : <RailButton side="prev" label="이전 화면" onClick={() => rail.scroll(-1)} />}
      {rail.edge.end ? null : <RailButton side="next" label="다음 화면" onClick={() => rail.scroll(1)} />}
    </div>
  );
}

/** 프로젝트 탭: 전체 + 구분(categories) 칩으로 거르는 최신순 목록 */
const PAGE_SIZE = 10;

export function ProjectsTab({ projects, tag, onClearTag }: ProjectsTabProps) {
  const [group, setGroup] = useState<Category | 'all'>('all');
  // 구글 검색결과처럼 처음 PAGE_SIZE 개만 보이고 더보기를 누를 때마다 PAGE_SIZE 개씩 늘린다
  const [limit, setLimit] = useState(PAGE_SIZE);
  // API 는 대표작 우선 정렬이라, 이 탭에서는 시작일 기준 최신순으로 다시 정렬한다
  const sorted = [...projects].sort((a, b) => b.period.start.localeCompare(a.period.start));
  const groups = (Object.keys(CATEGORY_LABEL) as Category[]).filter((value) => projects.some((project) => project.category === value));
  const visible = sorted
    .filter((project) => group === 'all' || project.category === group)
    .filter((project) => !tag || project.tags.includes(tag));

  return (
    <Card title="프로젝트">
      <div className={styles.filters} role="group" aria-label="프로젝트 구분">
        {(['all', ...groups] as const).map((value) => (
          <button key={value} className={styles.chip} type="button" aria-pressed={group === value} onClick={() => {
              setGroup(value);
              setLimit(PAGE_SIZE);
            }}>
            {value === 'all' ? '전체' : CATEGORY_LABEL[value]}
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
          {visible.slice(0, limit).map((project) => {
            // 검색결과처럼 캡처가 1~2장이면 오른쪽 썸네일 하나, 3장 이상이면 설명 아래 가로 줄
            const strip = project.images.length >= 3;
            const thumb = !strip ? project.images[0] : undefined;
            const to = `/project/${project.slug}`;
            return (
              <li key={project.slug} data-thumb={thumb ? 'true' : undefined}>
                <div className={styles.itemText}>
                  <h3>
                    <Link to={to}>
                      {project.title}
                      {project.subtitle ? ` - ${project.subtitle}` : ''}
                    </Link>
                  </h3>
                  <p>{project.summary}</p>
                  <p className={styles.meta}>
                    <span>{projectFacts(project)}</span>
                    <span>{project.tags.slice(0, 3).join(' · ')}</span>
                    {project.links.slice(0, 2).map((link) => (
                      <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer">
                        {LINK_KIND[link.type]}
                      </a>
                    ))}
                  </p>
                </div>
                {/* 이미지 링크는 제목 링크와 같은 곳이라 탭 순서·읽기에서 뺀다 */}
                {thumb ? (
                  <Link className={styles.thumb} to={to} tabIndex={-1} aria-hidden="true">
                    <img src={thumb.src} alt="" loading="lazy" />
                  </Link>
                ) : null}
                {strip ? <ImageStrip images={project.images} to={to} /> : null}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className={styles.empty}>해당하는 프로젝트가 없습니다</p>
      )}
      {visible.length > limit ? (
        <button className={styles.moreButton} type="button" onClick={() => setLimit((value) => value + PAGE_SIZE)}>
          더보기
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      ) : null}
    </Card>
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
