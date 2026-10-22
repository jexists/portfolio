import { http, HttpResponse } from 'msw';
import categories from '@mockup/categories.json';
import profiles from '@mockup/profiles.json';
import projects from '@mockup/projects.json';
import type { ProjectDto } from '@/features/projects/types/project.types';
import { findProject, listProjects, listSeries, listTags } from './queries';

const API = '*/api/v1';
const projectDocs = projects as ProjectDto[];

function notFound(message: string) {
  return HttpResponse.json({ error: { code: 'NOT_FOUND', message } }, { status: 404 });
}

export const handlers = [
  http.get(`${API}/health`, () => HttpResponse.json({ status: 'ok', source: 'msw' })),

  http.get(`${API}/profile`, () => {
    const [profile] = profiles;
    return profile ? HttpResponse.json(profile) : notFound('profile not found');
  }),

  http.get(`${API}/categories`, () => HttpResponse.json([...categories].sort((a, b) => a.order - b.order))),

  http.get(`${API}/projects`, ({ request }) => {
    const params = new URL(request.url).searchParams;
    return HttpResponse.json(
      listProjects(projectDocs, {
        category: params.get('category'),
        tag: params.get('tag'),
        includeDrafts: params.get('includeDrafts') === 'true',
      }),
    );
  }),

  http.get(`${API}/projects/:slug`, ({ params }) => {
    const project = findProject(projectDocs, String(params.slug));
    return project ? HttpResponse.json(project) : notFound(`project ${String(params.slug)} not found`);
  }),

  http.get(`${API}/tags`, () => HttpResponse.json(listTags(projectDocs))),

  http.get(`${API}/series`, () => HttpResponse.json(listSeries(projectDocs))),
];
