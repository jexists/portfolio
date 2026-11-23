import type { Profile } from '@/features/profile/types/profile.types';
import type { ProjectMeta } from '@/features/projects/types/project.types';

/** 단위 테스트용 최소 프로젝트 메타. 필요한 필드만 덮어쓴다. */
export function projectMeta(overrides: Partial<ProjectMeta> = {}): ProjectMeta {
  return {
    slug: 'sample',
    title: '샘플 프로젝트',
    category: 'edu',
    kind: '교육',
    period: { start: '2026.11.01', end: '2026.11.05' },
    publishedAt: '2026-11-05',
    tags: ['React'],
    summary: '샘플 요약',
    highlights: [],
    links: [],
    images: [],
    ...overrides,
  };
}

export const profileFixture: Profile = {
  name: '정주애',
  nameEn: 'Jeong, Juae',
  role: '웹 풀스택 개발자',
  years: '5년 차',
  location: '서울',
  email: 'jexists486@gmail.com',
  headline: '한 줄 소개',
  summary: ['요약 1'],
  links: [
    { type: 'github', label: 'GitHub', url: 'https://github.com/jexists' },
    { type: 'blog', label: '블로그', url: 'https://jexists.tistory.com/' },
  ],
  strengths: [{ title: '역량', text: '설명' }],
};
