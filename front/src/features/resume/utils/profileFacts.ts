import type { Career, Education } from '@/features/resume/types/resume.types';

export interface ProfileFact {
  label: string;
  values: string[];
  /** values 와 같은 순서의 기간 (경력만). 좁은 사이드 카드에서는 숨긴다 */
  periods?: string[];
  /** 글자 대신 기술 배지로 보여 줄 이름 (기술만) */
  badges?: string[];
}

const MAIN_CAREER_COUNT = 2;
export const CERTIFICATE_COUNT = 2;
// shortcut: 인물정보 카드의 대표 기술 배지는 고정, 자주 바뀌면 profiles.json 필드로 옮긴다
const MAIN_SKILL_BADGES = ['Angular', 'Go', 'MongoDB'];

/** 인물정보 카드·사이드 프로필에 보여 줄 경력·학력·기술 요약 (이력 데이터에서 계산, 항목마다 한 줄 길이) */
export function buildProfileFacts(careers: Career[], educations: Education[]): ProfileFact[] {
  // 상세 기록(역할)이 있는 주요 경력만: 3개월짜리 성진은 빠지고 브레이스·뉴스게이트가 남는다
  const mainCareers = careers.filter((career) => !career.minor && career.responsibilities.length > 0).slice(0, MAIN_CAREER_COUNT);
  const degree = educations.find((education) => education.kind === 'degree');

  const facts: ProfileFact[] = [
    {
      label: '경력',
      values: mainCareers.map((career) => career.summaryLine || `${career.company} ${career.role}`),
      periods: mainCareers.map((career) => `${career.period.start}.~${career.period.end}.`),
    },
    {
      label: '학력',
      values: degree
        ? // 한 줄에 들어가도록 학교 + 전공 + 상태(degree 의 마지막 단어, 예: 졸업)
          [degree.summaryLine || [degree.name, degree.major?.split(' · ').pop(), degree.degree?.split(' ').pop()].filter(Boolean).join(' ')]
        : [],
    },
    { label: '기술', values: [], badges: MAIN_SKILL_BADGES },
  ];
  return facts.filter((fact) => fact.values.length > 0 || fact.badges?.length);
}
