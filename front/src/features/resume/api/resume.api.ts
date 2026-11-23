import { http } from '@/lib/axios';
import type { Career, Credential, Dto, Education, Skill } from '@/features/resume/types/resume.types';

/** API 문서의 _id 를 화면 타입의 id 로 바꾼다 */
export function fromDto<T extends { id: string }>({ _id, ...rest }: Dto<T>): T {
  return { id: _id, ...rest } as unknown as T;
}

async function list<T extends { id: string }>(path: string): Promise<T[]> {
  const { data } = await http.get<Dto<T>[]>(path);
  return data.map((item) => fromDto<T>(item));
}

export const resumeApi = {
  listCareers: () => list<Career>('/careers'),
  listSkills: () => list<Skill>('/skills'),
  listEducations: () => list<Education>('/educations'),
  listCredentials: () => list<Credential>('/credentials'),
};

export type ResumeApi = typeof resumeApi;
