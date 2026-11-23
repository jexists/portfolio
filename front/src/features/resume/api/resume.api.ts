import { assetUrl } from '@/lib/assetUrl';
import { http } from '@/lib/axios';
import type { Career, Credential, Dto, Education, Skill } from '@/features/resume/types/resume.types';

/** API 문서의 _id 를 화면 타입의 id 로 바꾼다 */
export function fromDto<T extends { id: string }>({ _id, ...rest }: Dto<T>): T {
  const item = { id: _id, ...rest } as unknown as T & { logo?: string };
  // 로고(경력·학력)는 public 이미지라 배포 base 경로를 붙인다
  return (item.logo ? { ...item, logo: assetUrl(item.logo) } : item) as T;
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
