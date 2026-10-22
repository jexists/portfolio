import type { ProfileApi } from '@/features/profile/api/profile.api';
import type { ProjectsApi } from '@/features/projects/api/projects.api';

/** 프론트가 기대하는 API 계약. MSW 목업과 (향후) 실제 Go 백엔드가 모두 통과해야 한다. */
export type ContentApi = ProjectsApi & ProfileApi;

export function runContentApiContract(
  name: string,
  createSource: () => ContentApi,
): void {
  describe(`${name} content API contract`, () => {
    it('returns required profile fields', async () => {
      const profile = await createSource().getProfile();

      expect(profile).toEqual(
        expect.objectContaining({
          name: '정주애',
          nameEn: 'Jeong, Ju Ae',
          role: expect.any(String),
          email: expect.stringContaining('@'),
          body: expect.any(String),
        }),
      );
      expect(profile.keywords.length).toBeGreaterThan(0);
    });

    it('filters projects by category and tag', async () => {
      const source = createSource();
      const publishing = await source.listProjects({ category: 'publishing' });
      const scss = await source.listProjects({ tag: 'SCSS' });

      expect(publishing.length).toBeGreaterThan(0);
      expect(publishing.every((project) => project.category === 'publishing')).toBe(
        true,
      );
      expect(scss.length).toBeGreaterThan(0);
      expect(scss.every((project) => project.tags.includes('SCSS'))).toBe(true);
    });

    it('sorts featured projects first, then by publishedAt descending', async () => {
      const projects = await createSource().listProjects();

      expect(projects.map((project) => project.slug).slice(0, 3)).toEqual([
        'cocacola-redesign',
        'asiana-clone',
        'naver-clone',
      ]);
      for (let index = 1; index < projects.length; index += 1) {
        const previous = projects[index - 1];
        const current = projects[index];

        if (Boolean(previous.featured) === Boolean(current.featured)) {
          expect(previous.publishedAt >= current.publishedAt).toBe(true);
        } else {
          expect(Boolean(previous.featured)).toBe(true);
        }
      }
    });

    it('excludes drafts by default and includes them when requested', async () => {
      const source = createSource();
      const visible = await source.listProjects();
      const all = await source.listProjects({ includeDrafts: true });

      expect(visible.some((project) => project.draft)).toBe(false);
      expect(all.some((project) => project.slug === 'coming-soon-1')).toBe(true);
      expect(all.some((project) => project.slug === 'coming-soon-2')).toBe(true);
    });

    it('returns project lists without markdown body content', async () => {
      const projects = await createSource().listProjects({ includeDrafts: true });
      const series = await createSource().listSeries();

      expect(projects.length).toBeGreaterThan(0);
      expect(projects.every((project) => !('body' in project))).toBe(true);
      expect(
        series.every((group) => group.projects.every((project) => !('body' in project))),
      ).toBe(true);
    });

    it('returns required project summaries in list metadata', async () => {
      const projects = await createSource().listProjects({ includeDrafts: true });

      expect(projects.every((project) => typeof project.summary === 'string')).toBe(true);
      expect(projects.every((project) => project.summary.length > 0)).toBe(true);
    });

    it('parses project metadata when optional kind is absent', async () => {
      const projects = await createSource().listProjects({ includeDrafts: true });

      expect(projects).toContainEqual(
        expect.objectContaining({
          slug: 'coming-soon-2',
          kind: undefined,
          summary: expect.any(String),
        }),
      );
    });

    it('looks up projects by slug and returns null for missing slugs', async () => {
      const source = createSource();

      await expect(source.getProject('naver-clone')).resolves.toEqual(
        expect.objectContaining({
          meta: expect.objectContaining({ slug: 'naver-clone' }),
        }),
      );
      await expect(source.getProject('missing-project')).resolves.toBeNull();
    });

    it('lists tags and series from non-draft projects', async () => {
      const source = createSource();
      const tags = await source.listTags();
      const series = await source.listSeries();

      expect(tags).toContain('SCSS');
      expect(series).toEqual([
        expect.objectContaining({
          name: '클론 코딩',
          projects: [
            expect.objectContaining({ slug: 'naver-clone' }),
            expect.objectContaining({ slug: 'asiana-clone' }),
          ],
        }),
      ]);
    });
  });
}
