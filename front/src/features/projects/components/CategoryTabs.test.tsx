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

vi.mock('swiper/modules', () => ({ FreeMode: Symbol('FreeMode') }));

describe('CategoryTabs', () => {
  beforeEach(() => {
    slideTo.mockClear();
  });

  it('renders an accessible free-mode auto-width tab list', () => {
    render(<CategoryTabs value="all" onChange={vi.fn()} />);

    const tabList = screen.getByRole('tablist', { name: '프로젝트 카테고리' });

    expect(tabList).toHaveAttribute('data-slides-per-view', 'auto');
    expect(tabList).toHaveAttribute('data-free-mode', 'true');
    expect(tabList).toHaveAttribute('data-grab-cursor', 'true');
    expect(tabList).toHaveAttribute('data-simulate-touch', 'true');
    expect(tabList).toHaveAttribute('data-module-count', '1');
    expect(screen.getAllByRole('tab')).toHaveLength(6);
    expect(screen.getByRole('tab', { name: '전체' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: '전체' })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('tab', { name: '이력서' })).toHaveAttribute('tabindex', '-1');
  });

  it('emits the selected category', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(<CategoryTabs value="all" onChange={onChange} />);

    await user.click(screen.getByRole('tab', { name: '퍼블리싱' }));

    expect(onChange).toHaveBeenCalledWith('publishing');
  });

  it('moves focus and selection with the arrow keys', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(<CategoryTabs value="publishing" onChange={onChange} />);

    const currentTab = screen.getByRole('tab', { name: '퍼블리싱' });
    currentTab.focus();
    await user.keyboard('{ArrowRight}');

    expect(screen.getByRole('tab', { name: '디자인' })).toHaveFocus();
    expect(onChange).toHaveBeenCalledWith('design');
  });

  it('slides to the selected tab when the controlled value changes', async () => {
    const { rerender } = render(<CategoryTabs value="all" onChange={vi.fn()} />);

    await waitFor(() => expect(slideTo).toHaveBeenCalledWith(0));
    slideTo.mockClear();

    rerender(<CategoryTabs value="study" onChange={vi.fn()} />);

    await waitFor(() => expect(slideTo).toHaveBeenCalledWith(4));
  });
});
