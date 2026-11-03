import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react';
import { MemoryRouter, useLocation } from 'react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import { createTestQueryClient } from '@/test/queryClient';
import { AuthProvider } from '@/features/auth';
import type { ProfileApi } from '@/features/profile/api/profile.api';
import type { ProjectsApi } from '@/features/projects/api/projects.api';
import type { InitialEntry } from 'react-router';
import type { Profile } from '@/features/profile/types/profile.types';
import type { ProjectMeta } from '@/features/projects/types/project.types';
import { SearchPage } from './SearchPage';

type ContentSource = ProjectsApi & ProfileApi;

const mocks = vi.hoisted(() => ({
  contentSource: {
    getProfile: vi.fn(),
    listProjects: vi.fn(),
    listTags: vi.fn(),
  },
}));

let clipboardWriteText: ReturnType<typeof vi.fn>;

vi.mock('@/features/projects/api/projects.api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/features/projects/api/projects.api')>()),
  projectsApi: mocks.contentSource,
}));
vi.mock('@/features/profile/api/profile.api', () => ({
  profileApi: mocks.contentSource,
}));

const profile: Profile = {
  name: '정주애',
  nameEn: 'Jeong, Ju Ae',
  role: '웹디자이너 · 퍼블리셔',
  location: '서울',
  kakaoId: 'juae7',
  email: 'jexists486@gmail.com',
  website: 'https://jexists.github.io/portfolio/',
  github: 'https://github.com/jexists/',
  keywords: ['퍼블리싱', 'UX', '그래픽디자인'],
  body: '프로필 본문입니다.',
};

const projects: ProjectMeta[] = [
  {
    slug: 'naver-clone',
    title: '(클론) 네이버 포털 사이트',
    category: 'publishing',
    kind: '클론',
    publishedAt: '2026-07-05',
    featured: true,
    tags: ['HTML', '퍼블리싱'],
    summary: '네이버 메인 화면 클론 코딩',
    series: '클론 코딩',
    seriesOrder: 1,
  },
  {
    slug: 'cocacola-redesign',
    title: '코카콜라 캠페인 리디자인',
    category: 'design',
    kind: '리디자인',
    publishedAt: '2026-07-02',
    tags: ['UI', '그래픽디자인'],
    summary: '브랜드 캠페인 페이지 리디자인',
  },
  {
    slug: 'todo-app',
    title: '투두 앱 스터디',
    category: 'study',
    kind: '스터디',
    publishedAt: '2026-07-01',
    tags: ['React', 'UX'],
    summary: '상태 관리를 학습한 앱',
  },
  {
    slug: 'paint-app',
    title: '페인트 앱',
    category: 'publishing',
    kind: '클론',
    publishedAt: '2026-07-03',
    tags: ['SCSS', '퍼블리싱'],
    summary: 'SCSS로 구성한 페인트 앱',
  },
  {
    slug: 'coming-soon',
    title: '준비 중인 프로젝트',
    category: 'publishing',
    kind: '클론',
    publishedAt: '2026-07-10',
    draft: true,
    tags: ['HTML'],
    summary: '곧 공개됩니다',
  },
];

function mockContentSource(overrides: Partial<ContentSource> = {}) {
  mocks.contentSource.getProfile.mockResolvedValue(profile);
  mocks.contentSource.listProjects.mockResolvedValue(projects);
  mocks.contentSource.listTags.mockResolvedValue(['HTML', 'React', 'SCSS', 'UX', '그래픽디자인', '퍼블리싱']);

  Object.assign(mocks.contentSource, overrides);
}

function LocationProbe() {
  const location = useLocation();

  return <span data-testid="location-search">{location.search}</span>;
}

function renderSearch(initialEntries: InitialEntry[] = [{ pathname: '/search', state: { fromIntro: true } }], showLocation = false) {
  return render(
    <QueryClientProvider client={createTestQueryClient()}><AuthProvider initialUser={null}><MemoryRouter initialEntries={initialEntries}>
      <SearchPage />
      {showLocation ? <LocationProbe /> : null}
    </MemoryRouter></AuthProvider></QueryClientProvider>,
  );
}

describe('Search page', () => {
  beforeEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.clearAllMocks();
    mockContentSource();
    clipboardWriteText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(window.navigator, 'clipboard', {
      configurable: true,
      value: { writeText: clipboardWriteText },
    });
  });

  it('shows the profile, tag filter, and project sections on the initial all tab', async () => {
    renderSearch();

    expect(await screen.findByRole('tab', { name: '전체' })).toHaveAttribute('aria-selected', 'true');
    expect(await screen.findByLabelText('정주애 인물정보 카드')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: '태그 필터' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '프로젝트' })).toBeInTheDocument();
  });

  it('shows all three content sections again after returning from publishing to all', async () => {
    const user = userEvent.setup();
    renderSearch();

    await user.click(await screen.findByRole('tab', { name: '퍼블리싱' }));

    expect(screen.queryByLabelText('정주애 인물정보 카드')).not.toBeInTheDocument();
    expect(screen.queryByRole('region', { name: '태그 필터' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: '프로젝트' })).not.toBeInTheDocument();
    expect(screen.queryByText('검색결과 로딩 중')).not.toBeInTheDocument();
    expect(screen.queryByText('검색결과가 없습니다')).not.toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: '전체' }));

    expect(screen.getByLabelText('정주애 인물정보 카드')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: '태그 필터' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '프로젝트' })).toBeInTheDocument();
  });

  it('syncs the publishing tab selection to the tab query parameter', async () => {
    const user = userEvent.setup();
    renderSearch(undefined, true);

    await user.click(await screen.findByRole('tab', { name: '퍼블리싱' }));

    expect(screen.getByTestId('location-search')).toHaveTextContent('?tab=publishing');
  });

  it('removes the tab query parameter when the all tab is selected', async () => {
    const user = userEvent.setup();
    renderSearch(['/search?tab=publishing'], true);

    await user.click(await screen.findByRole('tab', { name: '전체' }));

    expect(screen.getByTestId('location-search')).toBeEmptyDOMElement();
  });

  it('selects the resume tab from the query and hides all three content sections', async () => {
    renderSearch(['/search?tab=resume']);

    expect(await screen.findByRole('tab', { name: '이력서' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.queryByLabelText('정주애 인물정보 카드')).not.toBeInTheDocument();
    expect(screen.queryByRole('region', { name: '태그 필터' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: '프로젝트' })).not.toBeInTheDocument();
  });

  it('treats an unknown tab query as all and shows all three content sections', async () => {
    renderSearch(['/search?tab=foo']);

    expect(await screen.findByRole('tab', { name: '전체' })).toHaveAttribute('aria-selected', 'true');
    expect(await screen.findByLabelText('정주애 인물정보 카드')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: '태그 필터' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '프로젝트' })).toBeInTheDocument();
  });

  it('preserves the tag query parameter when the all tab is selected', async () => {
    const user = userEvent.setup();
    renderSearch(['/search?tab=publishing&tag=HTML'], true);

    await user.click(await screen.findByRole('tab', { name: '전체' }));

    expect(screen.getByTestId('location-search')).toHaveTextContent('?tag=HTML');
  });

  it('applies the tag query parameter as the active tag filter on initial render', async () => {
    renderSearch(['/search?tag=SCSS']);

    const tagFilter = await screen.findByRole('button', { name: 'SCSS 태그 필터' });

    expect(tagFilter).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('heading', { name: '페인트 앱' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: '(클론) 네이버 포털 사이트' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: '코카콜라 캠페인 리디자인' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: '투두 앱 스터디' })).not.toBeInTheDocument();
  });

  it('syncs tag chip toggles to the query parameter without leaving a stale tag', async () => {
    const user = userEvent.setup();
    renderSearch(['/search?tag=SCSS'], true);

    await user.click(await screen.findByRole('button', { name: 'SCSS 태그 필터' }));

    expect(screen.getByTestId('location-search')).toHaveTextContent('');
    expect(screen.getByRole('button', { name: 'SCSS 태그 필터' })).toHaveAttribute('aria-pressed', 'false');

    await user.click(screen.getByRole('button', { name: 'React 태그 필터' }));

    expect(screen.getByTestId('location-search')).toHaveTextContent('?tag=React');
    expect(screen.getByRole('button', { name: 'React 태그 필터' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('ignores unknown tag query parameters', async () => {
    renderSearch(['/search?tag=Unknown']);

    await screen.findByRole('button', { name: 'SCSS 태그 필터' });

    expect(screen.getAllByTestId('project-card')).toHaveLength(projects.length);
    expect(screen.getByRole('button', { name: 'SCSS 태그 필터' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('heading', { name: '페인트 앱' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '(클론) 네이버 포털 사이트' })).toBeInTheDocument();
  });

  it('moves related keywords into the profile card and applies matching keywords as tag filters', async () => {
    const user = userEvent.setup();
    renderSearch();

    const profileCard = await screen.findByLabelText('정주애 인물정보 카드');

    expect(screen.queryByRole('region', { name: '연관검색어' })).not.toBeInTheDocument();
    await user.click(within(profileCard).getByRole('button', { name: 'UX 인물 키워드' }));

    expect(screen.getByRole('heading', { name: '투두 앱 스터디' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: '(클론) 네이버 포털 사이트' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'UX 태그 필터' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('shows draft projects as non-link placeholder cards at the end', async () => {
    renderSearch();

    const draftCard = await screen.findByLabelText('준비 중인 프로젝트 준비중');

    expect(within(draftCard).getByText('준비중...')).toBeInTheDocument();
    expect(within(draftCard).queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getAllByTestId('project-card').at(-1)).toBe(draftCard);
  });

  it('copies email and shows feedback', async () => {
    renderSearch();
    const copyButton = await screen.findByRole('button', { name: '이메일 복사' });

    vi.useFakeTimers();

    fireEvent.click(copyButton);

    expect(clipboardWriteText).toHaveBeenCalledWith('jexists486@gmail.com');
    await act(async () => {
      await Promise.resolve();
    });
    expect(screen.getByRole('button', { name: '이메일 복사됨' })).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.getByRole('button', { name: '이메일 복사' })).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('removes all three content sections when the resume tab is selected', async () => {
    const user = userEvent.setup();
    renderSearch();

    await user.click(await screen.findByRole('tab', { name: '이력서' }));

    expect(screen.queryByLabelText('정주애 인물정보 카드')).not.toBeInTheDocument();
    expect(screen.queryByRole('region', { name: '태그 필터' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: '프로젝트' })).not.toBeInTheDocument();
    expect(screen.queryByText('검색결과 로딩 중')).not.toBeInTheDocument();
    expect(screen.queryByText('검색결과가 없습니다')).not.toBeInTheDocument();
  });

  it('renders project card metadata required by AC-L3', async () => {
    renderSearch();

    const card = await screen.findByLabelText('(클론) 네이버 포털 사이트 프로젝트');

    expect(within(card).getByText('클론')).toBeInTheDocument();
    expect(within(card).getByText('HTML')).toBeInTheDocument();
    expect(within(card).getByText('퍼블리싱')).toBeInTheDocument();
    expect(within(card).getByText('클론 코딩')).toBeInTheDocument();
  });
});
