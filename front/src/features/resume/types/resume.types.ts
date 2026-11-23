/** 이력 컬렉션(careers, skills, educations, credentials)의 화면 타입. API 문서는 id 대신 _id 를 쓴다. */
export interface Period {
  start: string;
  end: string;
}

export interface CareerMetric {
  value: string;
  label: string;
  note: string;
}

export interface CareerAchievement {
  title: string;
  period: string;
  role?: string;
  work: string[];
  problems: string[];
  result?: string;
}

export interface Career {
  id: string;
  order: number;
  company: string;
  companyNote?: string;
  period: Period;
  duration: string;
  role: string;
  service?: string;
  responsibilities: string[];
  metrics: CareerMetric[];
  achievements: CareerAchievement[];
  extras: string[];
  skillIds: string[];
  /** 짧은 경력(아르바이트·OJT)은 "그 밖의 경력"에 모아 보여 준다 */
  minor: boolean;
}

export type SkillUsage = 'work' | 'project' | 'study';

export interface Skill {
  id: string;
  order: number;
  name: string;
  group: string;
  usage: SkillUsage;
  context: string;
  projectIds: string[];
  careerIds: string[];
}

export interface Education {
  id: string;
  kind: 'degree' | 'course';
  order: number;
  name: string;
  org: string;
  major?: string;
  degree?: string;
  period: Period;
  hours?: string;
  notes: string[];
}

export interface Credential {
  id: string;
  kind: 'certificate' | 'award';
  order: number;
  name: string;
  issuer: string;
  date: string;
  note?: string;
}

/** API 응답 문서: 화면 타입의 id 가 _id 로 온다 */
export type Dto<T extends { id: string }> = Omit<T, 'id'> & { _id: string };
