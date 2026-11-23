/** 프로젝트 구분 (mockup/categories.json) */
export type Category = 'edu' | 'personal' | 'archive';

export type ProjectLinkType = 'live' | 'github' | 'slides' | 'video' | 'doc' | 'pdf';

export interface ProjectLink {
  type: ProjectLinkType;
  label: string;
  url: string;
}

export interface ProjectImage {
  src: string;
  caption: string;
}

export interface ProjectPeriod {
  start: string;
  end: string;
}

export interface ProjectMeta {
  slug: string;
  title: string;
  subtitle?: string;
  category: Category;
  kind?: string;
  course?: string;
  period: ProjectPeriod;
  publishedAt: string;
  featured?: boolean;
  draft?: boolean;
  tags: string[];
  summary: string;
  team?: string;
  role?: string;
  highlights: string[];
  links: ProjectLink[];
  linkNote?: string;
  images: ProjectImage[];
  series?: string;
  seriesOrder?: number;
}

export interface Project {
  meta: ProjectMeta;
  body: string;
}

export interface Series {
  name: string;
  order: number;
  projects: ProjectMeta[];
}

/** API 응답 문서 (mockup/projects.json, Mongo projects 컬렉션과 같은 모양) */
export interface ProjectDto {
  _id: string;
  title: string;
  subtitle?: string;
  categoryId: Category;
  kind?: string;
  course?: string;
  period: ProjectPeriod;
  summary: string;
  tags: string[];
  team?: string;
  role?: string;
  highlights: string[];
  links: ProjectLink[];
  linkNote?: string;
  images: ProjectImage[];
  series?: { name: string; order: number } | null;
  publishedAt: string;
  featured: boolean;
  draft: boolean;
  /** 상세 조회에만 포함된다 */
  body?: string;
}

export interface SeriesDto {
  name: string;
  order: number;
  projects: ProjectDto[];
}
