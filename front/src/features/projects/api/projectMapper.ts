// 값 import 없이 타입만 사용한다: Node 스크립트(scripts/generate-feeds.ts)에서도 그대로 불러 쓴다.
import type { ProjectDto, ProjectMeta } from '@/features/projects/types/project.types';

/** API 문서(ProjectDto)를 화면용 ProjectMeta 로 변환한다. 본문(body)은 포함하지 않는다. */
export function toProjectMeta(dto: ProjectDto): ProjectMeta {
  return {
    slug: dto._id,
    title: dto.title,
    category: dto.categoryId,
    kind: dto.kind,
    publishedAt: dto.publishedAt,
    featured: dto.featured,
    draft: dto.draft,
    tags: dto.tags,
    summary: dto.summary,
    thumbnail: dto.thumbnail,
    link: dto.link,
    github: dto.github,
    series: dto.series?.name,
    seriesOrder: dto.series?.order,
  };
}
