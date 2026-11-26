import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { projectMeta } from '@/test/fixtures';
import { FeaturedRail, ProjectsTab, SORTS } from './ProjectCollections';

function setScroll(rail: HTMLElement, scrollLeft: number) {
  Object.defineProperty(rail, 'scrollWidth', { configurable: true, value: 900 });
  Object.defineProperty(rail, 'clientWidth', { configurable: true, value: 300 });
  rail.scrollLeft = scrollLeft;
  fireEvent.scroll(rail);
}

describe('FeaturedRail (AC-8)', () => {
  it('hides the next button once the rail reaches the end', () => {
    render(
      <MemoryRouter>
        <FeaturedRail projects={[projectMeta({ slug: 'a' }), projectMeta({ slug: 'b' }), projectMeta({ slug: 'c' })]} />
      </MemoryRouter>,
    );
    const rail = screen.getByTestId('featured-rail');

    setScroll(rail, 0);
    expect(screen.getByRole('button', { name: '다음 프로젝트' })).toBeInTheDocument();

    setScroll(rail, 600);
    expect(screen.queryByRole('button', { name: '다음 프로젝트' })).not.toBeInTheDocument();
  });
});

describe('ProjectsTab', () => {
  const projects = [
    projectMeta({
      slug: 'a',
      title: 'A',
      category: 'skn30',
      links: [
        { type: 'doc', label: 'API 문서', url: 'https://docs.example.com/a' },
        { type: 'github', label: 'PR 기록', url: 'https://github.com/a/pulls' },
        { type: 'github', label: '코드', url: 'https://github.com/a' },
      ],
    }),
    projectMeta({ slug: 'b', title: 'B', category: 'uiux' }),
  ];

  function renderAt(path: string) {
    render(
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/search" element={<ProjectsTab projects={projects} tag={null} onClearTag={() => {}} />} />
        </Routes>
      </MemoryRouter>,
    );
  }

  it('keeps the chosen group in the address so going back restores it', () => {
    renderAt('/search?tab=projects&group=uiux');

    expect(screen.getByRole('button', { name: 'UI/UX' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.queryByRole('link', { name: 'A' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '전체' }));
    expect(screen.getByRole('link', { name: 'A' })).toBeInTheDocument();
  });

  it('names result links by their label, not by the link type', () => {
    renderAt('/search?tab=projects');

    expect(screen.getByRole('link', { name: '코드' })).toHaveAttribute('href', 'https://github.com/a');
  });

  it('leaves record and extra-document links to the detail page', () => {
    renderAt('/search?tab=projects');

    expect(screen.queryByRole('link', { name: 'API 문서' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'PR 기록' })).not.toBeInTheDocument();
  });
});

describe('ProjectsTab SORTS', () => {
  const solo = projectMeta({ slug: 'solo', team: '1명', recommend: 30, period: { start: '2026.01.01', end: '2026.01.02' } });
  const team = projectMeta({ slug: 'team', team: '4명 (2명 중도 이탈)', recommend: 10, period: { start: '2025.01.01', end: '2025.01.02' } });
  const fresh = projectMeta({ slug: 'fresh', team: '5명', recommend: undefined, period: { start: '2026.05.01', end: '2026.05.02' } });
  const order = (key: keyof typeof SORTS) => [solo, team, fresh].sort(SORTS[key]).map((project) => project.slug);

  it('orders by recommend number, then latest, then headcount', () => {
    expect(order('recommend')).toEqual(['solo', 'team', 'fresh']);
    expect(order('latest')).toEqual(['fresh', 'solo', 'team']);
    expect(order('team')).toEqual(['solo', 'team', 'fresh']);
  });
});
