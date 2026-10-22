import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router';
import { vi } from 'vitest';
import { AuthProvider } from '@/features/auth';
import { SearchHeader } from './SearchHeader';

function LocationProbe() {
  const location = useLocation();

  return <span data-testid="pathname">{location.pathname}</span>;
}

function renderHeader(tabs?: React.ReactNode) {
  return render(
    <AuthProvider initialUser={null}><MemoryRouter initialEntries={['/search']}>
      <SearchHeader tabs={tabs} />
      <LocationProbe />
    </MemoryRouter></AuthProvider>,
  );
}

describe('SearchHeader', () => {
  beforeEach(() => {
    vi.useRealTimers();
    Object.defineProperty(window.navigator, 'clipboard', {
      configurable: true,
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
  });

  it('renders readonly portfolio search query', () => {
    renderHeader();

    expect(screen.getByLabelText('PortFolio')).toBeInTheDocument();
    expect(screen.getByLabelText('검색어')).toHaveValue('정주애 포트폴리오');
    expect(screen.getByLabelText('검색어')).toHaveAttribute('readonly');
  });

  it('copies the current URL and shows feedback for two seconds', async () => {
    renderHeader();
    vi.useFakeTimers();

    fireEvent.click(screen.getByRole('button', { name: '공유' }));

    expect(window.navigator.clipboard.writeText).toHaveBeenCalledWith(window.location.href);
    await act(async () => {
      await Promise.resolve();
    });
    expect(screen.getByRole('button', { name: '복사됨' })).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(2000));
    expect(screen.getByRole('button', { name: '공유' })).toBeInTheDocument();
  });

  it('moves to the first page when the clear button is clicked', async () => {
    renderHeader();

    fireEvent.click(screen.getByRole('button', { name: '검색어 지우기' }));

    expect(screen.getByTestId('pathname')).toHaveTextContent('/');
  });

  it('renders the tabs slot only when it is provided', () => {
    const { rerender } = renderHeader(<nav aria-label="테스트 탭">전체</nav>);

    expect(screen.getByTestId('search-header-tabs')).toContainElement(
      screen.getByRole('navigation', { name: '테스트 탭' }),
    );

    rerender(
      <AuthProvider initialUser={null}><MemoryRouter initialEntries={['/search']}>
        <SearchHeader />
        <LocationProbe />
      </MemoryRouter></AuthProvider>,
    );
    expect(screen.queryByTestId('search-header-tabs')).not.toBeInTheDocument();
  });
});
