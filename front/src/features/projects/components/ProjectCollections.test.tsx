import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { projectMeta } from '@/test/fixtures';
import { FeaturedRail, ProjectsTab } from './ProjectCollections';

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
    projectMeta({ slug: 'a', title: 'A', category: 'skn30', links: [{ type: 'github', label: '팀 저장소', url: 'https://github.com/a' }] }),
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

    expect(screen.getByRole('link', { name: '팀 저장소' })).toHaveAttribute('href', 'https://github.com/a');
  });
});
