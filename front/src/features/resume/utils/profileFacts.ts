import type { Career, Credential, Education } from '@/features/resume/types/resume.types';

export interface ProfileFact {
  label: string;
  values: string[];
}

const MAIN_CAREER_COUNT = 2;
const CERTIFICATE_COUNT = 3;

/** 인물정보 카드·사이드 프로필에 보여 줄 경력·학력·자격 요약 (이력 데이터에서 계산) */
export function buildProfileFacts(careers: Career[], educations: Education[], credentials: Credential[]): ProfileFact[] {
  const careerValues = careers
    .filter((career) => !career.minor)
    .slice(0, MAIN_CAREER_COUNT)
    .map((career) => `${career.period.start}.~${career.period.end}. ${career.company} ${career.role}`);
  const degree = educations.find((education) => education.kind === 'degree');
  const certificates = credentials.filter((credential) => credential.kind === 'certificate').slice(0, CERTIFICATE_COUNT);

  const facts: ProfileFact[] = [
    { label: '경력', values: careerValues },
    {
      label: '학력',
      values: degree
        ? [[degree.name, degree.major?.split(' · ').pop(), degree.degree].filter(Boolean).join(' ')]
        : [],
    },
    { label: '자격', values: certificates.length ? [certificates.map((item) => item.name).join(', ')] : [] },
  ];
  return facts.filter((fact) => fact.values.length > 0);
}
