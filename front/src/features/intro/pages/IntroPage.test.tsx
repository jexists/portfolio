import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router';
import { vi } from 'vitest';
import { AuthProvider } from '@/features/auth';
import type { ProjectMeta } from '@/features/projects/types/project.types';
import { IntroPage } from './IntroPage';

const mocks = vi.hoisted(() => ({
  contentSource: {
    listProjects: vi.fn(),
  },
}));

vi.mock('@/features/projects/api/projects.api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/features/projects/api/projects.api')>()),
  projectsApi: mocks.contentSource,
}));

const publishedProject: ProjectMeta = {
  slug: 'published-project',
  title: '공개 프로젝트',
  category: 'design',
  publishedAt: '2026-07-13',
  tags: ['UI'],
  summary: '공개 프로젝트 요약',
};

const draftProject: ProjectMeta = {
  ...publishedProject,
  slug: 'draft-project',
  title: '비공개 프로젝트',
  draft: true,
};

function setReducedMotion(matches: boolean): void {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

function renderIntro(onComplete?: () => void) {
  return render(
    <AuthProvider initialUser={null}><MemoryRouter>
      <IntroPage onComplete={onComplete} />
    </MemoryRouter></AuthProvider>,
  );
}

function LocationProbe() {
  const location = useLocation();

  return (
    <>
      <span data-testid="location-pathname">{location.pathname}</span>
      <span data-testid="location-state">{JSON.stringify(location.state)}</span>
    </>
  );
}

function renderIntroWithLocation() {
  return render(
    <AuthProvider initialUser={null}><MemoryRouter>
      <IntroPage />
      <LocationProbe />
    </MemoryRouter></AuthProvider>,
  );
}

describe('Intro page', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    setReducedMotion(false);
    mocks.contentSource.listProjects.mockResolvedValue([draftProject, publishedProject]);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('renders the animated search intro shell', () => {
    renderIntro();

    expect(screen.getByLabelText('PortFolio')).toBeInTheDocument();
    expect(screen.getByLabelText('빨간 나비')).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: '검색어' })).toHaveValue('');
    expect(screen.getByText('화면을 클릭해 포트폴리오 보기')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByRole('button', { name: 'AI 모드' })).toBeInTheDocument();
  });

  it('shows the search placeholder before typing begins', () => {
    renderIntro();

    expect(screen.getByText('정주애 포트폴리오')).toBeInTheDocument();
  });

  it('skips to search when AI mode is clicked', () => {
    const onComplete = vi.fn();
    renderIntro(onComplete);

    fireEvent.click(screen.getByRole('button', { name: 'AI 모드' }));

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('places the visible cursor immediately after the typed text', () => {
    setReducedMotion(true);
    renderIntro();

    const visibleQuery = screen.getByTestId('visible-query');

    expect(visibleQuery).toHaveTextContent('정주애 포트폴리오');
    expect(visibleQuery.nextElementSibling).toHaveAttribute('data-text-cursor', 'true');
  });

  it('skips to search when the page is clicked', () => {
    const onComplete = vi.fn();
    renderIntro(onComplete);

    fireEvent.click(screen.getByRole('main'));

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('navigates to search with the intro transition state', () => {
    renderIntroWithLocation();

    fireEvent.click(screen.getByRole('main'));

    expect(screen.getByTestId('location-pathname')).toHaveTextContent('/search');
    expect(screen.getByTestId('location-state')).toHaveTextContent('{"fromIntro":true}');
  });

  it('skips to search when any key is pressed', () => {
    const onComplete = vi.fn();
    renderIntro(onComplete);

    fireEvent.keyDown(window, { key: 'Enter' });

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('selects the first suggestion with the keyboard-style cursor phase', () => {
    renderIntro();

    act(() => vi.advanceTimersByTime(1200));

    const listbox = screen.getByRole('listbox', { hidden: true });
    expect(listbox).toHaveAttribute('aria-hidden', 'true');

    act(() => vi.advanceTimersByTime(700));

    expect(listbox).toHaveAttribute('aria-hidden', 'false');

    act(() => vi.advanceTimersByTime(350));

    const suggestions = within(listbox).getAllByRole('option');
    const searchbox = screen.getByRole('searchbox', { name: '검색어' });

    expect(suggestions[0]).toHaveTextContent('정주애 포트폴리오');
    expect(suggestions[0]).toHaveAttribute('aria-selected', 'false');
    expect(searchbox).toHaveValue('정주애');

    act(() => vi.advanceTimersByTime(350));

    expect(screen.getByRole('main')).toHaveAttribute('data-phase', 'cursor');
    expect(suggestions[0]).toHaveAttribute('aria-selected', 'true');
    expect(searchbox).toHaveValue('정주애 포트폴리오');
    expect(screen.getByTestId('visible-query')).toHaveTextContent('정주애 포트폴리오');
    suggestions.slice(1).forEach((suggestion) => {
      expect(suggestion).toHaveAttribute('aria-selected', 'false');
    });
  });

  it('renders Google-style suggestion icons, action buttons, and report text', () => {
    renderIntro();

    act(() => vi.advanceTimersByTime(1900));

    expect(screen.getAllByTestId('suggestion-search-icon')).toHaveLength(4);
    expect(screen.getByRole('button', { name: 'Juae 검색' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: "I'm Feeling Lucky" })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '부적절한 예상 검색어 신고' })).toBeInTheDocument();
  });

  it('skips to search when Juae search is clicked', () => {
    const onComplete = vi.fn();
    renderIntro(onComplete);

    act(() => vi.advanceTimersByTime(1900));
    fireEvent.click(screen.getByRole('button', { name: 'Juae 검색' }));

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("navigates I'm Feeling Lucky to a random published project", async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    renderIntroWithLocation();

    act(() => vi.advanceTimersByTime(1900));
    fireEvent.click(screen.getByRole('button', { name: "I'm Feeling Lucky" }));
    await act(async () => {
      await Promise.resolve();
    });

    expect(mocks.contentSource.listProjects).toHaveBeenCalledWith({ includeDrafts: false });
    expect(screen.getByTestId('location-pathname')).toHaveTextContent('/project/published-project');
  });

  it.each([
    ['비어 있으면', []],
    ['draft만 있으면', [draftProject]],
  ])("skips when I'm Feeling Lucky projects are %s", async (_scenario, projects) => {
    const onComplete = vi.fn();
    mocks.contentSource.listProjects.mockResolvedValue(projects);
    renderIntro(onComplete);

    act(() => vi.advanceTimersByTime(1900));
    fireEvent.click(screen.getByRole('button', { name: "I'm Feeling Lucky" }));
    await act(async () => {
      await Promise.resolve();
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("skips when I'm Feeling Lucky project loading fails", async () => {
    const onComplete = vi.fn();
    mocks.contentSource.listProjects.mockRejectedValue(new Error('load failed'));
    renderIntro(onComplete);

    act(() => vi.advanceTimersByTime(1900));
    fireEvent.click(screen.getByRole('button', { name: "I'm Feeling Lucky" }));
    await act(async () => {
      await Promise.resolve();
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('keeps the selected suggestion visible until the sequence completes', () => {
    const onComplete = vi.fn();
    renderIntro(onComplete);

    act(() => vi.advanceTimersByTime(3799));

    expect(screen.getByRole('main')).toHaveAttribute('data-phase', 'cursor');
    expect(screen.getByRole('search')).not.toHaveAttribute('aria-hidden');
    expect(screen.getByRole('listbox')).toHaveAttribute('aria-hidden', 'false');
    expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    expect(onComplete).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(1));

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('keeps the static hint as a click target through the page skip handler', () => {
    setReducedMotion(true);
    const onComplete = vi.fn();
    renderIntro(onComplete);

    const hint = screen.getByText('화면을 클릭해 포트폴리오 보기');
    expect(hint).toHaveAttribute('aria-hidden', 'false');

    fireEvent.click(hint);

    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
