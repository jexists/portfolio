// Node 스크립트(scripts/generate-feeds.ts)에서도 그대로 불러 쓰므로 별칭 없이 타입과 상대 경로만 import 한다.
import type { ProjectDto, ProjectMeta } from '@/features/projects/types/project.types';
// Node 스크립트에서도 불러 쓰므로 @ 별칭 대신 상대 경로
import { assetUrl } from '../../../lib/assetUrl';

/** 빈 문자열(Go 의 zero value)은 값이 없는 것으로 본다 */
const optional = (value?: string) => value || undefined;

/** API 문서(ProjectDto)를 화면용 ProjectMeta 로 변환한다. 본문(body)은 포함하지 않는다. */
export function toProjectMeta(dto: ProjectDto): ProjectMeta {
  return {
    slug: dto._id,
    title: dto.title,
    subtitle: optional(dto.subtitle),
    category: dto.categoryId,
    kind: optional(dto.kind),
    course: optional(dto.course),
    period: dto.period,
    duration: optional(dto.duration),
    publishedAt: dto.publishedAt,
    featured: dto.featured,
    draft: dto.draft,
    tags: dto.tags,
    summary: dto.summary,
    team: optional(dto.team),
    role: optional(dto.role),
    highlights: dto.highlights ?? [],
    links: dto.links ?? [],
    linkNote: optional(dto.linkNote),
    linkStatus: optional(dto.linkStatus),
    images: (dto.images ?? []).map((image) => ({ ...image, src: assetUrl(image.src) })),
    series: dto.series?.name,
    seriesOrder: dto.series?.order,
  };
}
