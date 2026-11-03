import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { toProjectMeta } from '../src/features/projects/api/projectMapper';
import type { ProjectDto, ProjectMeta } from '../src/features/projects/types/project.types';

export const DEFAULT_SITE_URL = 'https://jexists.github.io/portfolio';
const CHANNEL_TITLE = '정주애 포트폴리오';

function normalizeSiteUrl(siteUrl: string): string {
  return siteUrl.replace(/\/+$/, '');
}

function projectUrl(siteUrl: string, slug: string): string {
  return `${normalizeSiteUrl(siteUrl)}/project/${slug}`;
}

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function publishedProjects(projects: ProjectMeta[]): ProjectMeta[] {
  return projects
    .filter((project) => !project.draft)
    .sort((left, right) => right.publishedAt.localeCompare(left.publishedAt));
}

export function buildRss(projects: ProjectMeta[], siteUrl = DEFAULT_SITE_URL): string {
  const baseUrl = normalizeSiteUrl(siteUrl);
  const items = publishedProjects(projects)
    .map((project) => {
      const url = projectUrl(baseUrl, project.slug);
      const pubDate = new Date(`${project.publishedAt}T00:00:00.000Z`).toUTCString();

      return [
        '    <item>',
        `      <title>${xmlEscape(project.title)}</title>`,
        `      <link>${xmlEscape(url)}</link>`,
        `      <description>${xmlEscape(project.summary)}</description>`,
        `      <pubDate>${xmlEscape(pubDate)}</pubDate>`,
        `      <guid>${xmlEscape(url)}</guid>`,
        '    </item>',
      ].join('\n');
    })
    .join('\n');

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0">',
    '  <channel>',
    `    <title>${xmlEscape(CHANNEL_TITLE)}</title>`,
    `    <link>${xmlEscape(baseUrl)}</link>`,
    `    <description>${xmlEscape('정주애 포트폴리오 프로젝트 피드')}</description>`,
    items,
    '  </channel>',
    '</rss>',
    '',
  ].join('\n');
}

export function buildSitemap(projects: ProjectMeta[], siteUrl = DEFAULT_SITE_URL): string {
  const baseUrl = normalizeSiteUrl(siteUrl);
  const urls = [
    `${baseUrl}/`,
    `${baseUrl}/search`,
    ...publishedProjects(projects).map((project) => projectUrl(baseUrl, project.slug)),
  ];

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map((url) => ['  <url>', `    <loc>${xmlEscape(url)}</loc>`, '  </url>'].join('\n')),
    '</urlset>',
    '',
  ].join('\n');
}

/** 피드 원본은 mockup/projects.json (= Mongo projects 컬렉션 시드) */
export async function readProjectsFromMockup(
  mockupFile = path.resolve('../mockup/projects.json'),
): Promise<ProjectMeta[]> {
  const docs = JSON.parse(await readFile(mockupFile, 'utf8')) as ProjectDto[];

  return docs.map(toProjectMeta);
}

export async function generateFeeds() {
  const siteUrl = process.env.SITE_URL ?? DEFAULT_SITE_URL;
  const distDir = path.resolve('dist');
  const projects = await readProjectsFromMockup();

  await mkdir(distDir, { recursive: true });
  await Promise.all([
    writeFile(path.join(distDir, 'feed.xml'), buildRss(projects, siteUrl), 'utf8'),
    writeFile(path.join(distDir, 'sitemap.xml'), buildSitemap(projects, siteUrl), 'utf8'),
  ]);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await generateFeeds();
}
