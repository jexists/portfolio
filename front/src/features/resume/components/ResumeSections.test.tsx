import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import type { Education } from '@/features/resume/types/resume.types';
import { buildGlance, EducationSection } from './ResumeSections';

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
  within(region).getAllByRole('listitem').map((node) => node.querySelector('h3, b')?.textContent);
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
