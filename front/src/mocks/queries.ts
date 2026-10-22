/**
 * mockup JSON 위에서 백엔드 API 동작을 흉내 내는 순수 함수.
 * back/internal/service 의 Go 구현과 같은 규칙을 지켜야 한다 (docs/ARCHITECTURE.md "API").
 */
import type { ProjectDto, SeriesDto } from '@/features/projects/types/project.types';

export interface ProjectQuery {
  category?: string | null;
  tag?: string | null;
  includeDrafts?: boolean;
}

/** featured 우선, 그다음 publishedAt 내림차순 */
export function compareProjects(left: ProjectDto, right: ProjectDto): number {
  const featuredDelta = Number(right.featured) - Number(left.featured);
  return featuredDelta !== 0 ? featuredDelta : right.publishedAt.localeCompare(left.publishedAt);
}

/** 목록 응답에는 본문을 넣지 않는다 */
export function withoutBody(project: ProjectDto): ProjectDto {
  const rest = { ...project };
  delete rest.body;
  return rest;
}

export function listProjects(projects: ProjectDto[], query: ProjectQuery = {}): ProjectDto[] {
  return projects
    .filter((project) => query.includeDrafts || !project.draft)
    .filter((project) => !query.category || project.categoryId === query.category)
    .filter((project) => !query.tag || project.tags.includes(query.tag))
    .sort(compareProjects)
    .map(withoutBody);
}

export function findProject(projects: ProjectDto[], slug: string): ProjectDto | null {
  return projects.find((project) => project._id === slug) ?? null;
}

export function listTags(projects: ProjectDto[]): string[] {
  const tags = new Set(listProjects(projects).flatMap((project) => project.tags));
  return [...tags].sort((left, right) => left.localeCompare(right, 'ko'));
}

export function listSeries(projects: ProjectDto[]): SeriesDto[] {
  const groups = new Map<string, ProjectDto[]>();

  for (const project of listProjects(projects)) {
    if (!project.series) continue;
    const current = groups.get(project.series.name) ?? [];
    current.push(project);
    groups.set(project.series.name, current);
  }

  return [...groups.entries()]
    .map(([name, members]) => {
      const sorted = [...members].sort((left, right) => (left.series?.order ?? 9999) - (right.series?.order ?? 9999));
      return { name, order: sorted[0]?.series?.order ?? 9999, projects: sorted };
    })
    .sort((left, right) => left.order - right.order || left.name.localeCompare(right.name, 'ko'));
}
