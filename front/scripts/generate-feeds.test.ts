import type { ProjectMeta } from '@/features/projects/types/project.types';
import { buildRss, buildSitemap, DEFAULT_SITE_URL } from './generate-feeds';

const projects: ProjectMeta[] = [
  {
    slug: 'older-project',
    title: '오래된 <프로젝트>',
    category: 'study',
    publishedAt: '2026-07-01',
    tags: ['React'],
    summary: '먼저 공개된 & 스터디',
  },
  {
    slug: 'latest-project',
    title: '최신 프로젝트',
    category: 'publishing',
    publishedAt: '2026-07-10',
    tags: ['HTML'],
    summary: '가장 최근 공개',
  },
  {
    slug: 'draft-project',
    title: '준비중 프로젝트',
    category: 'design',
    publishedAt: '2026-07-20',
    draft: true,
    tags: ['UI'],
    summary: '아직 공개되지 않음',
  },
];

describe('generate feeds', () => {
  it('builds RSS 2.0 excluding drafts sorted by publishedAt descending', () => {
    const xml = buildRss(projects, 'https://example.com/base');

    expect(xml).toContain('<rss version="2.0">');
    expect(xml).toContain('<title>정주애 포트폴리오</title>');
    expect(xml).not.toContain('준비중 프로젝트');
    expect(xml.indexOf('최신 프로젝트')).toBeLessThan(xml.indexOf('오래된 &lt;프로젝트&gt;'));
    expect(xml).toContain('<link>https://example.com/base/project/latest-project</link>');
    expect(xml).toContain('<guid>https://example.com/base/project/latest-project</guid>');
    expect(xml).toContain('<description>먼저 공개된 &amp; 스터디</description>');
    expect(xml).toContain('<pubDate>Wed, 01 Jul 2026 00:00:00 GMT</pubDate>');
  });

  it('builds sitemap with static routes and published project URLs', () => {
    const xml = buildSitemap(projects, 'https://example.com/base/');

    expect(xml).toContain('<loc>https://example.com/base/</loc>');
    expect(xml).toContain('<loc>https://example.com/base/search</loc>');
    expect(xml).toContain('<loc>https://example.com/base/project/latest-project</loc>');
    expect(xml).toContain('<loc>https://example.com/base/project/older-project</loc>');
    expect(xml).not.toContain('draft-project');
  });

  it('defaults to the GitHub Pages URL of this repository', () => {
    expect(DEFAULT_SITE_URL).toBe('https://jexists.github.io/portfolio');
    expect(buildSitemap(projects)).toContain('<loc>https://jexists.github.io/portfolio/search</loc>');
  });
});
