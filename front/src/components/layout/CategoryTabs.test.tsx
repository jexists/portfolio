import type { HTMLAttributes, ReactNode } from 'react';
import { useEffect } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { CategoryTabs } from './CategoryTabs';

const { slideTo } = vi.hoisted(() => ({ slideTo: vi.fn() }));

interface MockSwiperProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  freeMode?: boolean | object;
  grabCursor?: boolean;
  modules?: unknown[];
  onSwiper?: (swiper: { slideTo: typeof slideTo }) => void;
  simulateTouch?: boolean;
  slidesPerView?: number | 'auto';
}

vi.mock('swiper/react', () => ({
  Swiper: ({
    children,
    freeMode,
    grabCursor: _grabCursor,
    modules: _modules,
    onSwiper,
    simulateTouch: _simulateTouch,
    slidesPerView,
    ...props
  }: MockSwiperProps) => {
    useEffect(() => {
      onSwiper?.({ slideTo });
    }, [onSwiper]);

    return (
      <div
        data-free-mode={String(Boolean(freeMode))}
        data-grab-cursor={String(Boolean(_grabCursor))}
        data-module-count={_modules?.length ?? 0}
        data-simulate-touch={String(Boolean(_simulateTouch))}
        data-slides-per-view={slidesPerView}
        {...props}
      >
        {children}
      </div>
    );
  },
  SwiperSlide: ({ children, ...props }: HTMLAttributes<HTMLDivElement>) => (
    <div {...props}>{children}</div>
  ),
}));

vi.mock('swiper/modules', () => ({ FreeMode: Symbol('FreeMode'), Mousewheel: Symbol('Mousewheel') }));

describe('CategoryTabs', () => {
  beforeEach(() => {
    slideTo.mockClear();
  });

  it('renders an accessible free-mode auto-width tab list', () => {
    render(<CategoryTabs value="all" onChange={vi.fn()} />);

    const tabList = screen.getByRole('tablist', { name: '검색 탭' });

    expect(tabList).toHaveAttribute('data-slides-per-view', 'auto');
    expect(tabList).toHaveAttribute('data-free-mode', 'true');
    expect(tabList).toHaveAttribute('data-grab-cursor', 'true');
    expect(tabList).toHaveAttribute('data-simulate-touch', 'true');
    expect(tabList).toHaveAttribute('data-module-count', '2');
    expect(screen.getAllByRole('tab')).toHaveLength(6);
    expect(screen.queryByRole('tab', { name: '이력서' })).not.toBeInTheDocument();
    expect(screen.getByRole('tab', { name: '전체' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: '전체' })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('tab', { name: '경력' })).toHaveAttribute('tabindex', '-1');
  });

  it('emits the selected tab', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(<CategoryTabs value="all" onChange={onChange} />);

    await user.click(screen.getByRole('tab', { name: '경력' }));

    expect(onChange).toHaveBeenCalledWith('career');
  });

  it('moves focus and selection with the arrow keys', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(<CategoryTabs value="career" onChange={onChange} />);

    const currentTab = screen.getByRole('tab', { name: '경력' });
    currentTab.focus();
    await user.keyboard('{ArrowRight}');

    expect(screen.getByRole('tab', { name: '기술' })).toHaveFocus();
    expect(onChange).toHaveBeenCalledWith('skills');
  });

  it('selects no tab for a page outside the tab list (이력서)', () => {
    render(<CategoryTabs value="resume" onChange={vi.fn()} />);

    expect(screen.getAllByRole('tab').every((tab) => tab.getAttribute('aria-selected') === 'false')).toBe(true);
    expect(screen.getByRole('tab', { name: '전체' })).toHaveAttribute('tabindex', '0');
  });

  it('slides to the selected tab when the controlled value changes', async () => {
    const { rerender } = render(<CategoryTabs value="all" onChange={vi.fn()} />);

    await waitFor(() => expect(slideTo).toHaveBeenCalledWith(0));
    slideTo.mockClear();

    rerender(<CategoryTabs value="certs" onChange={vi.fn()} />);

    await waitFor(() => expect(slideTo).toHaveBeenCalledWith(4));
  });
});
