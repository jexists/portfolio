import { useQuery } from '@tanstack/react-query';
import { projectsApi, type ProjectFilters } from '@/features/projects/api/projects.api';

export const projectKeys = {
  all: ['projects'] as const,
  list: (filters: ProjectFilters) => [...projectKeys.all, 'list', filters] as const,
  detail: (slug: string) => [...projectKeys.all, 'detail', slug] as const,
  tags: () => [...projectKeys.all, 'tags'] as const,
  series: () => [...projectKeys.all, 'series'] as const,
};

export function useProjects(filters: ProjectFilters = {}) {
  return useQuery({
    queryKey: projectKeys.list(filters),
    queryFn: () => projectsApi.listProjects(filters),
  });
}

export function useProject(slug: string | undefined) {
  return useQuery({
    queryKey: projectKeys.detail(slug ?? ''),
    queryFn: () => projectsApi.getProject(slug ?? ''),
    enabled: Boolean(slug),
  });
}

export function useTags() {
  return useQuery({ queryKey: projectKeys.tags(), queryFn: () => projectsApi.listTags() });
}

export function useSeries(enabled = true) {
  return useQuery({ queryKey: projectKeys.series(), queryFn: () => projectsApi.listSeries(), enabled });
}
