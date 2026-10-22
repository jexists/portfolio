import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import { createTestQueryClient } from '@/test/queryClient';
import { AuthProvider } from '@/features/auth';
import type { ProfileApi } from '@/features/profile/api/profile.api';
import type { ProjectsApi } from '@/features/projects/api/projects.api';
import type { Project, Series } from '@/features/projects/types/project.types';
import { ProjectDetailPage } from './ProjectDetailPage';

type ContentSource = ProjectsApi & ProfileApi;

const mocks = vi.hoisted(() => ({
  contentSource: {
    getProject: vi.fn(),
    listSeries: vi.fn(),
  },
}));

vi.mock('@/features/projects/api/projects.api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/features/projects/api/projects.api')>()),
  projectsApi: mocks.contentSource,
}));

const project: Project = {
  meta: {
    slug: 'naver-clone',
    title: '(클론) 네이버 포털 사이트',
    category: 'publishing',
    kind: '클론',
    publishedAt: '2026-07-05',
    tags: ['HTML', 'SCSS'],
    summary: '네이버 메인 화면 클론 코딩',
    series: '클론 코딩',
    seriesOrder: 2,
    link: 'https://example.com/naver',
    github: 'https://github.com/jexists/naver-clone',
  },
  body: '## 구현 내용\n\n- 반응형 레이아웃\n- 접근성 개선\n\n[작업 기록](https://example.com/log)\n\n`SCSS` 모듈을 사용했습니다.',
};

const series: Series[] = [
  {
    name: '클론 코딩',
    order: 1,
    projects: [
      {
        slug: 'asiana-clone',
        title: '(클론) 아시아나항공',
        category: 'publishing',
        kind: '클론',
        publishedAt: '2026-07-01',
        tags: ['HTML'],
        summary: '항공사 사이트 클론',
        series: '클론 코딩',
        seriesOrder: 1,
      },
      project.meta,
      {
        slug: 'paint-app',
        title: '페인트 앱 스터디',
        category: 'study',
        kind: '스터디',
        publishedAt: '2026-07-08',
        tags: ['Canvas'],
        summary: '캔버스 드로잉 도구',
        series: '클론 코딩',
        seriesOrder: 3,
      },
    ],
  },
];

function mockContentSource(overrides: Partial<ContentSource> = {}) {
  mocks.contentSource.getProject.mockResolvedValue(project);
  mocks.contentSource.listSeries.mockResolvedValue(series);
  Object.assign(mocks.contentSource, overrides);
}

let currentLocation = { pathname: '', search: '' };

function LocationProbe() {
  const location = useLocation();
  currentLocation = { pathname: location.pathname, search: location.search };

  return null;
}

function renderProjectDetail(initialPath = '/project/naver-clone') {
  return render(
    <QueryClientProvider client={createTestQueryClient()}><AuthProvider initialUser={null}><MemoryRouter initialEntries={[initialPath]}>
      <LocationProbe />
      <Routes>
        <Route path="/project/:slug" element={<ProjectDetailPage />} />
        <Route path="/search" element={<p>검색결과 페이지</p>} />
      </Routes>
    </MemoryRouter></AuthProvider></QueryClientProvider>,
  );
}

describe('ProjectDetail page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentLocation = { pathname: '', search: '' };
    mockContentSource();
  });

  it('renders project title, markdown body, kind badge, and metadata', async () => {
    renderProjectDetail();

    expect(await screen.findByRole('heading', { name: '(클론) 네이버 포털 사이트' })).toBeInTheDocument();
    expect(screen.getByText('클론')).toBeInTheDocument();
    expect(screen.getByText('네이버 메인 화면 클론 코딩')).toBeInTheDocument();
    expect(screen.getByText('2026-07-05')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '구현 내용' })).toBeInTheDocument();
    expect(screen.getByRole('list')).toHaveTextContent('반응형 레이아웃');
    expect(screen.getByRole('link', { name: '작업 기록' })).toHaveAttribute('href', 'https://example.com/log');
    expect(screen.getAllByText('SCSS')).toHaveLength(2);
  });

  it('renders live and GitHub links only when URLs exist', async () => {
    const { unmount } = renderProjectDetail();

    expect(await screen.findByRole('link', { name: '라이브 보기' })).toHaveAttribute('href', project.meta.link);
    expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute('href', project.meta.github);

    unmount();
    mockContentSource({
      getProject: vi.fn().mockResolvedValue({
        ...project,
        meta: { ...project.meta, link: undefined, github: undefined },
      }),
    });

    renderProjectDetail();

    expect(await screen.findByRole('heading', { name: '(클론) 네이버 포털 사이트' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: '라이브 보기' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'GitHub' })).not.toBeInTheDocument();
  });

  it('shows not found state for missing projects', async () => {
    mockContentSource({ getProject: vi.fn().mockResolvedValue(null) });
    renderProjectDetail('/project/missing');

    expect(await screen.findByText('프로젝트를 찾을 수 없습니다')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '검색결과로 돌아가기' })).toHaveAttribute('href', '/search');
  });

  it('shows not found state when a draft project is accessed directly', async () => {
    mockContentSource({
      getProject: vi.fn().mockResolvedValue({ ...project, meta: { ...project.meta, draft: true } }),
    });
    renderProjectDetail();

    expect(await screen.findByText('프로젝트를 찾을 수 없습니다')).toBeInTheDocument();
  });

  it('renders series position with previous and next project links', async () => {
    renderProjectDetail();

    const nav = await screen.findByRole('navigation', { name: '시리즈 내비게이션' });

    expect(within(nav).getByText('시리즈: 클론 코딩 (2/3)')).toBeInTheDocument();
    expect(within(nav).getByRole('link', { name: '이전 프로젝트 (클론) 아시아나항공' })).toHaveAttribute(
      'href',
      '/project/asiana-clone',
    );
    expect(within(nav).getByRole('link', { name: '다음 프로젝트 페인트 앱 스터디' })).toHaveAttribute(
      'href',
      '/project/paint-app',
    );
  });

  it('disables missing previous or next series links', async () => {
    mockContentSource({
      getProject: vi.fn().mockResolvedValue({ ...project, meta: { ...project.meta, slug: 'asiana-clone', seriesOrder: 1 } }),
    });
    renderProjectDetail('/project/asiana-clone');

    const nav = await screen.findByRole('navigation', { name: '시리즈 내비게이션' });

    expect(within(nav).getByText('이전 프로젝트 없음')).toHaveAttribute('aria-disabled', 'true');
    expect(within(nav).getByRole('link', { name: '다음 프로젝트 (클론) 네이버 포털 사이트' })).toBeInTheDocument();
  });

  it('navigates to search when a tag chip is clicked', async () => {
    const user = userEvent.setup();
    renderProjectDetail();

    await user.click(await screen.findByRole('button', { name: 'HTML 태그' }));

    expect(currentLocation.pathname).toBe('/search');
    expect(currentLocation.search).toBe('?tag=HTML');
  });
});
