import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { projectMeta } from '@/test/fixtures';
import { FeaturedRail } from './ProjectCollections';

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
