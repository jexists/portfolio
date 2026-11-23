import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import type { Career, Education } from '@/features/resume/types/resume.types';
import { buildGlance, CareerSection, EducationSection, ResumeResultCards, ResumeTimeline } from './ResumeSections';

const edu = (over: Partial<Education>): Education => ({
  id: 'x', kind: 'school', order: 1, name: '', org: '', period: { start: '', end: '' }, notes: [], ...over,
});

const educations: Education[] = [
  edu({ id: 'ust', kind: 'degree', name: '대학교', org: '필리핀 마닐라', major: '산업디자인', degree: '학사 졸업', period: { start: '2012.06', end: '2016.06' } }),
  edu({ id: 'skn', kind: 'course', name: 'AI 캠프', org: '플레이데이터', hours: '960시간', featured: true, period: { start: '2026.03.27', end: '2026.09.23' },
    notes: ['머신러닝 학습', '회고: 판단 기준이 생김'], projectIds: ['salesluv'] }),
  edu({ id: 'uxui', kind: 'course', name: 'UX/UI 과정', org: '그린', hours: '700시간', featured: true, period: { start: '2019.08.13', end: '2019.12.20' } }),
  edu({ id: 'vibe', kind: 'course', name: '바이브 코딩 모임', org: '모두의연구소', major: '학습 모임', period: { start: '2026.01', end: '2026.04' } }),
  edu({ id: 'job', kind: 'course', name: '취업희망프로그램', org: '고용센터', period: { start: '2019.07', end: '2019.07' } }),
  edu({ id: 'high-4', name: 'Fountain', org: '필리핀 마닐라', major: '고등학교', degree: '졸업', period: { start: '2011.06', end: '2012.03' }, notes: ['4학년', '개근상'] }),
  edu({ id: 'high-3', name: 'Claire', org: '필리핀 마닐라', major: '고등학교', period: { start: '2010', end: '2010' }, notes: ['3학년'] }),
  edu({ id: 'middle', name: '중학교', org: '대한민국 군산', major: '중학교', degree: '중퇴', period: { start: '2007.03', end: '2007.12' }, notes: ['1학년'] }),
  edu({ id: 'elem', name: '초등학교', org: '대한민국 군산', major: '초등학교', degree: '졸업', period: { start: '2004.09', end: '2007.02' }, notes: ['4~6학년'] }),
];

const projects = [{ slug: 'salesluv', title: 'SalesLuv', subtitle: '영업 운영 에이전트' }];

const renderSection = () =>
  render(
    <MemoryRouter>
      <EducationSection educations={educations} projects={projects} />
    </MemoryRouter>,
  );
const schoolNames = (region: HTMLElement) =>
  within(region).getAllByRole('listitem').map((node) => node.querySelector('b')?.textContent);
const courseNames = (region: HTMLElement) => within(region).getAllByRole('heading', { level: 3 }).map((node) => node.textContent);

describe('buildGlance (숨겨 둔 한눈에 보기)', () => {
  it('groups schools by level, keeps featured courses only and sorts newest first', () => {
    const nodes = buildGlance(educations);

    expect(nodes.map((node) => node.name)).toEqual(['AI 캠프', 'UX/UI 과정', '대학교', 'Fountain', '중학교', '초등학교']);
    expect(nodes.find((node) => node.label === '고등학교')?.years).toBe('2010–2012');
  });
});

describe('EducationSection (AC-9)', () => {
  it('shows the degree and latest school first, then the rest newest first with 더보기', () => {
    renderSection();

    const region = screen.getByRole('region', { name: '학력' });
    expect(schoolNames(region)).toEqual(['대학교', 'Fountain']);
    expect(region).toHaveTextContent('필리핀 마닐라 · 고등학교 4학년 · 개근상');

    fireEvent.click(within(region).getByRole('button', { name: '더보기' }));

    expect(schoolNames(region)).toEqual(['대학교', 'Fountain', 'Claire', '중학교', '초등학교']);
    expect(region).toHaveTextContent('대한민국 군산 · 초등학교 4~6학년');
    expect(within(region).getByRole('button', { name: '접기' })).toHaveAttribute('aria-expanded', 'true');
  });

  it('splits courses into 교육 과정 / 학습 모임·온라인 / 기타', () => {
    renderSection();

    const region = screen.getByRole('region', { name: '교육' });
    expect(courseNames(region)).toEqual(['AI 캠프', 'UX/UI 과정']);

    fireEvent.click(within(region).getByRole('button', { name: '학습 모임·온라인' }));
    expect(courseNames(region)).toEqual(['바이브 코딩 모임']);

    fireEvent.click(within(region).getByRole('button', { name: '기타' }));
    expect(courseNames(region)).toEqual(['취업희망프로그램']);
  });

  it('keeps course details closed until the arrow is clicked, then shows notes and project cards', () => {
    renderSection();

    const region = screen.getByRole('region', { name: '교육' });
    expect(within(region).queryByText('머신러닝 학습')).not.toBeVisible();
    expect(within(region).queryByRole('button', { name: /UX\/UI 과정 내용/ })).not.toBeInTheDocument();

    fireEvent.click(within(region).getByRole('button', { name: 'AI 캠프 내용 펼치기' }));

    expect(within(region).getByText('머신러닝 학습')).toBeVisible();
    expect(within(region).getByText('회고')).toBeVisible();
    const card = within(region).getByRole('link', { name: /SalesLuv/ });
    expect(card).toHaveAttribute('href', '/project/salesluv');
    expect(card).toHaveTextContent('프로젝트SalesLuv영업 운영 에이전트');
  });
});

const career = (over: Partial<Career>): Career => ({
  id: 'x', order: 1, company: '', period: { start: '', end: '' }, duration: '', role: '',
  responsibilities: [], metrics: [], achievements: [], extras: [], skillIds: [], minor: false, ...over,
});

const careers: Career[] = [
  career({ id: 'brace', company: '주식회사 브레이스', companyNote: '구 아유레디', role: '웹 풀스택 개발', duration: '5년 8개월', period: { start: '2020.08', end: '2026.04' }, body: '## 서비스 개요' }),
  career({ id: 'sungjin', order: 2, company: '성진에이치디에스', role: '웹 퍼블리싱', period: { start: '2020.02', end: '2020.04' } }),
  career({ id: 'newsgate', order: 3, company: '뉴스게이트', role: '편집디자인', period: { start: '2016.05', end: '2019.05' } }),
];

const inRouter = (node: React.ReactNode) => render(<MemoryRouter>{node}</MemoryRouter>);

describe('ResumeTimeline', () => {
  it('shows company name without note and logos in place of dots for careers and educations', () => {
    const ust = edu({ id: 'ust', kind: 'degree', name: 'UST', logo: '/images/educations/ust.png', period: { start: '2010.06', end: '2014.03' } });
    inRouter(<ResumeTimeline careers={[{ ...careers[0], logo: '/images/careers/brace.png' }]} educations={[ust]} />);

    const brace = screen.getByRole('link', { name: '주식회사 브레이스' });
    expect(brace.closest('li')?.querySelector('img')).toHaveAttribute('src', '/images/careers/brace.png');
    expect(screen.getByRole('link', { name: 'UST' }).closest('li')?.querySelector('img')).toHaveAttribute('src', '/images/educations/ust.png');
    // 경력·학력이 섞여 있어 종류 태그는 남긴다
    expect(screen.getByText('경력')).toBeInTheDocument();
  });
});

describe('ResumeResultCards (전체 탭 경력 카드)', () => {
  it('shows 경력 as source, company with period as title linking to the detail page, and other careers with role', () => {
    inRouter(<ResumeResultCards careers={careers} educations={[]} mainSkills={[]} skillHighlights={[]} />);

    const card = screen.getByRole('article', { name: '경력 검색결과' });
    expect(card.querySelector('p')).toHaveTextContent(/^경경력$/);
    expect(within(card).getByRole('link', { name: '주식회사 브레이스' })).toHaveAttribute('href', '/career/brace');
    expect(card).toHaveTextContent('2020.08 – 2026.04 (5년 8개월)');
    expect(within(card).getByRole('link', { name: '성진에이치디에스 - 웹 퍼블리싱' })).toHaveAttribute('href', '/search?tab=career#career-sungjin');
  });
});

describe('CareerSection (경력 탭)', () => {
  it('career timeline shows the logo instead of the company note and no 경력 tag', () => {
    inRouter(
      <CareerSection
        careers={[{ ...careers[0], logo: '/images/careers/brace.png' }, careers[1]]}
        skills={[]}
      />,
    );

    const timeline = screen.getByRole('region', { name: '경력 타임라인' });
    const brace = within(timeline).getByRole('link', { name: '주식회사 브레이스' });
    expect(brace.closest('li')?.querySelector('img')).toHaveAttribute('src', '/images/careers/brace.png');
    expect(within(timeline).getByRole('link', { name: '성진에이치디에스' }).closest('li')?.querySelector('img')).toBeNull();
    expect(timeline).not.toHaveTextContent('구 아유레디');
    expect(timeline).not.toHaveTextContent('경력웹');
    expect(within(timeline).queryByText('경력')).toBeNull();
    // 카드 로고는 주석 처리해 두었다
    expect(document.querySelector('#career-brace > img')).toBeNull();
  });

  it('shows a career timeline with 경력기술서 보기, then each company with 자세히 보기 for detailed ones', () => {
    inRouter(<CareerSection careers={careers} skills={[]} />);

    expect(screen.getByRole('region', { name: '경력 타임라인' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '경력기술서 보기' })).toHaveAttribute('href', '/search?tab=careerdoc');
    expect(screen.queryByRole('region', { name: '경력 요약' })).toBeNull();
    expect(screen.getByRole('link', { name: '프로젝트 보기' })).toHaveAttribute('href', '/career/brace');
    expect(screen.getAllByRole('link', { name: '프로젝트 보기' })).toHaveLength(1);
    expect(screen.queryByRole('link', { name: '자세히 보기 →' })).toBeNull();
    expect(document.getElementById('career-sungjin')).not.toBeNull();
  });
});
