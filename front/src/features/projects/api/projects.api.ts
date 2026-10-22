import { isAxiosError } from 'axios';
import { http } from '@/lib/axios';
import type {
  Category,
  Project,
  ProjectDto,
  ProjectMeta,
  Series,
  SeriesDto,
} from '@/features/projects/types/project.types';
import { toProjectMeta } from './projectMapper';

export { toProjectMeta };

export interface ProjectFilters {
  category?: Category;
  tag?: string;
  includeDrafts?: boolean;
}

function toSeries(dto: SeriesDto): Series {
  return { name: dto.name, order: dto.order, projects: dto.projects.map(toProjectMeta) };
}

export const projectsApi = {
  async listProjects(filters: ProjectFilters = {}): Promise<ProjectMeta[]> {
    const { data } = await http.get<ProjectDto[]>('/projects', {
      params: {
        category: filters.category,
        tag: filters.tag,
        includeDrafts: filters.includeDrafts ? 'true' : undefined,
      },
    });
    return data.map(toProjectMeta);
  },

  async getProject(slug: string): Promise<Project | null> {
    try {
      const { data } = await http.get<ProjectDto>(`/projects/${encodeURIComponent(slug)}`);
      return { meta: toProjectMeta(data), body: data.body ?? '' };
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  async listTags(): Promise<string[]> {
    const { data } = await http.get<string[]>('/tags');
    return data;
  },

  async listSeries(): Promise<Series[]> {
    const { data } = await http.get<SeriesDto[]>('/series');
    return data.map(toSeries);
  },
};

export type ProjectsApi = typeof projectsApi;
