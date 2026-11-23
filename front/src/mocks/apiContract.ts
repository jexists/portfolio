import type { ProfileApi } from '@/features/profile/api/profile.api';
import type { ProjectsApi } from '@/features/projects/api/projects.api';
import type { ResumeApi } from '@/features/resume/api/resume.api';

/** 프론트가 기대하는 API 계약. MSW 목업과 (향후) 실제 Go 백엔드가 모두 통과해야 한다. */
export type ContentApi = ProjectsApi & ProfileApi & ResumeApi;

const isAscending = (values: number[]) => values.every((value, index) => index === 0 || values[index - 1] <= value);

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
          nameEn: 'Jeong, Juae',
          role: expect.any(String),
          email: expect.stringContaining('@'),
          headline: expect.any(String),
        }),
      );
      expect(profile.summary.length).toBeGreaterThan(0);
      expect(profile.strengths.length).toBeGreaterThan(0);
      expect(profile.links).toContainEqual(expect.objectContaining({ type: 'github', url: expect.stringMatching(/^https:\/\//) }));
    });

    it('lists resume collections sorted by order with ids', async () => {
      const source = createSource();
      const lists = await Promise.all([
        source.listCareers(),
        source.listSkills(),
        source.listEducations(),
        source.listCredentials(),
      ]);

      for (const list of lists) {
        expect(list.length).toBeGreaterThan(0);
        expect(list.every((item) => typeof item.id === 'string' && item.id.length > 0)).toBe(true);
        expect(isAscending(list.map((item) => item.order))).toBe(true);
      }
    });

    it('returns career details with metrics and achievements', async () => {
      const careers = await createSource().listCareers();
      const main = careers[0];

      expect(main.minor).toBe(false);
      expect(main.metrics.length).toBeGreaterThan(0);
      expect(main.achievements.length).toBeGreaterThan(0);
      expect(main.achievements.every((item) => Array.isArray(item.work) && Array.isArray(item.problems))).toBe(true);
      expect(careers.some((career) => career.minor)).toBe(true);
    });

    it('links skills to existing projects and careers', async () => {
      const source = createSource();
      const [skills, projects, careers] = await Promise.all([
        source.listSkills(),
        source.listProjects(),
        source.listCareers(),
      ]);
      const projectIds = new Set(projects.map((project) => project.slug));
      const careerIds = new Set(careers.map((career) => career.id));

      expect(skills.every((skill) => ['work', 'project', 'study'].includes(skill.usage))).toBe(true);
      expect(skills.every((skill) => skill.projectIds.every((id) => projectIds.has(id)))).toBe(true);
      expect(skills.every((skill) => skill.careerIds.every((id) => careerIds.has(id)))).toBe(true);
    });

    it('splits educations and credentials by kind', async () => {
      const source = createSource();
      const [educations, credentials] = await Promise.all([source.listEducations(), source.listCredentials()]);

      expect(new Set(educations.map((item) => item.kind))).toEqual(new Set(['degree', 'course', 'school']));
      const projectSlugs = new Set((await source.listProjects()).map((project) => project.slug));
      expect(educations.every((item) => (item.projectIds ?? []).every((id) => projectSlugs.has(id)))).toBe(true);
      expect(new Set(credentials.map((item) => item.kind))).toEqual(new Set(['certificate', 'award']));
    });

    it('filters projects by category and tag', async () => {
      const source = createSource();
      const edu = await source.listProjects({ category: 'edu' });
      const react = await source.listProjects({ tag: 'React' });

      expect(edu.length).toBeGreaterThan(0);
      expect(edu.every((project) => project.category === 'edu')).toBe(true);
      expect(react.length).toBeGreaterThan(0);
      expect(react.every((project) => project.tags.includes('React'))).toBe(true);
    });

    it('sorts featured projects first, then by publishedAt descending', async () => {
      const projects = await createSource().listProjects();

      expect(projects[0].featured).toBe(true);
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
      expect(all.length).toBeGreaterThanOrEqual(visible.length);
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

    it('returns project metadata with period, links and images', async () => {
      const projects = await createSource().listProjects();

      expect(projects.every((project) => project.summary.length > 0)).toBe(true);
      expect(projects.every((project) => project.period.start.length > 0)).toBe(true);
      expect(projects.every((project) => Array.isArray(project.links) && Array.isArray(project.images))).toBe(true);
      expect(
        projects.every((project) => project.links.every((link) => /^https?:\/\//.test(link.url))),
      ).toBe(true);
    });

    it('looks up projects by slug with body and returns null for missing slugs', async () => {
      const source = createSource();
      const project = await source.getProject('hanbit-math');

      expect(project?.meta.slug).toBe('hanbit-math');
      expect(project?.body.length).toBeGreaterThan(0);
      await expect(source.getProject('missing-project')).resolves.toBeNull();
    });

    it('lists tags and series from non-draft projects', async () => {
      const source = createSource();
      const tags = await source.listTags();
      const series = await source.listSeries();

      expect(tags).toContain('React');
      expect(series).toEqual([
        expect.objectContaining({
          name: '클론 코딩',
          projects: [
            expect.objectContaining({ slug: 'naver-clone' }),
            expect.objectContaining({ slug: 'asiana-clone' }),
            expect.objectContaining({ slug: 'payple-clone' }),
            expect.objectContaining({ slug: 'trello-clone' }),
          ],
        }),
      ]);
    });
  });
}
