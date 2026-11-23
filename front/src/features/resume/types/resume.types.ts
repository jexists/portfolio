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
  /** 경력 카드 회사명 앞 작은 로고 (public 이미지 경로) */
  logo?: string;
  /** 인물정보 카드의 한 줄 요약(회사 + 직무). 비어 있으면 company + role */
  summaryLine?: string;
  period: Period;
  duration: string;
  role: string;
  service?: string;
  responsibilities: string[];
  /** 경력 카드 위쪽 항목·내용 표 (재직 기간, 서비스 등) */
  facts?: Array<{ label: string; text: string; links?: Array<{ text: string; url: string }> }>; // links.text 와 같은 글자를 링크로
  /** 경력 카드 협업 줄 */
  collaboration?: string[];
  metrics: CareerMetric[];
  achievements: CareerAchievement[];
  extras: string[];
  skillIds: string[];
  /** 짧은 경력(아르바이트·OJT)은 "그 밖의 경력"에 모아 보여 준다 */
  minor: boolean;
  /** 전체 탭 경력 결과 카드에만 쓰는 문구 (없으면 role) */
  highlight?: { line: string; notes: string[] };
  /** 경력 상세 화면(/career/:id) 본문 마크다운. 있을 때만 "자세히 보기"가 보인다 */
  body?: string;
}

export type SkillUsage = 'work' | 'project' | 'study';

export interface SkillDetail {
  /** 비면 제목 없이 목록만 */
  title: string;
  items: string[];
}

export type SkillSection = 'work' | 'project' | 'ai' | 'design' | 'other';

export interface Skill {
  id: string;
  order: number;
  name: string;
  group: string;
  usage: SkillUsage;
  context: string;
  projectIds: string[];
  careerIds: string[];
  /** 기술 탭 배치: 카드 → 소제목 → 박스 */
  section: SkillSection;
  subgroup: string;
  /** 박스에 늘 보이는 한 줄 설명 */
  summary: string;
  /** 화살표로 펼쳐 보는 세부 내용 */
  details: SkillDetail[];
}

export interface Education {
  id: string;
  kind: 'degree' | 'course' | 'school';
  order: number;
  name: string;
  /** 주요 타임라인 점 자리 동그란 로고 (public 이미지 경로) */
  logo?: string;
  /** 인물정보 카드의 한 줄 요약. 비어 있으면 name + 전공 + 상태 */
  summaryLine?: string;
  org: string;
  major?: string;
  degree?: string;
  period: Period;
  hours?: string;
  notes: string[];
  /** 교육(course) 중 "중요" 필터에 보일 과정 */
  featured?: boolean;
  /** 이 과정에서 만든 프로젝트 slug */
  projectIds?: string[];
  /** 전체 탭 학력 결과 카드에만 쓰는 자세한 문구 (없으면 name·major·degree·notes) */
  highlight?: { title: string; line: string; notes: string[] };
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
