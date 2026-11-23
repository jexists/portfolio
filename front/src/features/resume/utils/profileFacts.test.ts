import type { Career, Education } from '@/features/resume/types/resume.types';
import { buildProfileFacts } from './profileFacts';

const career = (over: Partial<Career>): Career => ({
  id: 'c', order: 1, company: '회사', period: { start: '2020.08', end: '2026.04' }, duration: '', role: '개발',
  responsibilities: [], metrics: [], achievements: [], extras: [], skillIds: [], minor: false, ...over,
});

describe('buildProfileFacts', () => {
  it('summarizes detailed main careers, the degree and main skills', () => {
    const careers = [
      career({ id: 'a', company: '브레이스', role: '웹 풀스택 개발', summaryLine: '브레이스 웹 풀스택', responsibilities: ['역할'] }),
      career({ id: 'b', order: 2, company: '성진', period: { start: '2020.02', end: '2020.04' }, role: '퍼블리싱' }),
      career({ id: 'c', order: 3, company: '뉴스게이트', period: { start: '2016.08', end: '2019.03' }, role: '편집디자인', responsibilities: ['역할'] }),
      career({ id: 'd', order: 4, company: '아르바이트', minor: true }),
    ];
    const educations: Education[] = [
      { id: 'u', kind: 'degree', order: 1, name: '대학교', org: '', major: '단과대 · 산업디자인', degree: '학사 졸업', period: { start: '2012', end: '2016' }, notes: [] },
      { id: 's', kind: 'school', order: 3, name: '고등학교', org: '', period: { start: '', end: '' }, notes: [] },
      { id: 'k', kind: 'course', order: 2, name: '과정', org: '', period: { start: '', end: '' }, notes: [] },
    ];

    expect(buildProfileFacts(careers, educations)).toEqual([
      {
        label: '경력',
        values: ['브레이스 웹 풀스택', '뉴스게이트 편집디자인'],
        periods: ['2020.08.~2026.04.', '2016.08.~2019.03.'],
      },
      { label: '학력', values: ['대학교 산업디자인 졸업'] },
      { label: '기술', values: [], badges: ['Angular', 'Go', 'MongoDB'] },
    ]);
  });

  it('omits rows without data', () => {
    expect(buildProfileFacts([], []).map((fact) => fact.label)).toEqual(['기술']);
  });
});
