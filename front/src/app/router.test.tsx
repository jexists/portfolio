import { render, screen } from '@testing-library/react';
import { MemoryRouter, useLocation, useRoutes } from 'react-router';
import { routes } from './router';

vi.mock('@/features/intro', () => ({ IntroPage: () => <div>첫 화면</div> }));
vi.mock('@/features/admin', () => ({ AdminPage: () => <div>관리자</div> }));
vi.mock('@/features/auth', () => ({ LoginPage: () => <div>로그인</div> }));
vi.mock('@/features/projects', () => ({
  SearchPage: () => <div>검색 결과</div>,
  ProjectDetailPage: () => <div>상세</div>,
}));

// data router(createMemoryRouter)는 jsdom 의 AbortSignal 과 Node Request 가 맞지 않아
// 같은 routes 를 useRoutes 로 렌더해 확인한다
function AppRoutes() {
  const location = useLocation();

  return (
    <>
      {useRoutes(routes)}
      <span data-testid="pathname">{location.pathname}</span>
    </>
  );
}

function renderAt(path: string) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>,
  );
}

describe('routes', () => {
  it('redirects unknown paths to the first page', async () => {
    renderAt('/html/all.html');

    expect(await screen.findByText('첫 화면')).toBeInTheDocument();
    expect(screen.getByTestId('pathname')).toHaveTextContent(/^\/$/);
  });

  it('keeps defined routes as they are', () => {
    renderAt('/search');

    expect(screen.getByText('검색 결과')).toBeInTheDocument();
    expect(screen.getByTestId('pathname')).toHaveTextContent('/search');
  });
});
