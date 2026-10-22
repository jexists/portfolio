export type Category = 'resume' | 'publishing' | 'design' | 'study' | 'etc';

export interface ProjectMeta {
  slug: string;
  title: string;
  category: Category;
  kind?: string;
  publishedAt: string;
  featured?: boolean;
  draft?: boolean;
  tags: string[];
  summary: string;
  thumbnail?: string;
  link?: string;
  github?: string;
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
  categoryId: Category;
  kind?: string;
  summary: string;
  tags: string[];
  series?: { name: string; order: number };
  publishedAt: string;
  thumbnail?: string;
  link?: string;
  github?: string;
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
