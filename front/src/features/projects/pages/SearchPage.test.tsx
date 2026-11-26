import { act, fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { renderRoute, useMockApi } from '@/test/renderWithApi';
import { SearchPage } from './SearchPage';

const renderSearch = (path = '/search') => renderRoute(path, '/search', <SearchPage />);

describe('Search page (MSW mockup)', () => {
  useMockApi();

  it('shows the person card, featured rail, result cards and strengths on the all tab (AC-IA2)', async () => {
    renderSearch();

    expect(await screen.findByRole('region', { name: '정주애 인물정보 카드' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: '전체' })).toHaveAttribute('aria-selected', 'true');
    const rail = screen.getByRole('region', { name: '대표 프로젝트' });
    expect(within(rail).getAllByTestId('project-card').length).toBeGreaterThan(1);
    expect(screen.getByRole('article', { name: '경력 검색결과' })).toHaveTextContent('주식회사 브레이스');
    expect(screen.getByRole('article', { name: '기술 검색결과' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: '핵심 역량' })).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: '관련 검색어' })).not.toBeInTheDocument();
    expect(screen.getByRole('region', { name: '외부 링크' })).toBeInTheDocument();
  });

  it.each([
    ['career', '주식회사 브레이스'],
    ['skills', '주요 실무 기술'],
    ['education', 'University of Santo Tomas (UST)'],
    ['certs', '웹디자인기능사'],
    ['projects', '바이브코딩'],
  ])('fills the %s tab and shows my profile in the side (AC-IA1)', async (tab, text) => {
    renderSearch(`/search?tab=${tab}`);

    expect(await screen.findByRole('region', { name: '프로필' })).toBeInTheDocument();
    expect(screen.getAllByText(text).length).toBeGreaterThan(0);
    expect(screen.queryByRole('region', { name: '정주애 인물정보 카드' })).not.toBeInTheDocument();
    expect(screen.queryByRole('region', { name: '핵심 역량' })).not.toBeInTheDocument();
  });

  it('treats an unknown tab as all', async () => {
    renderSearch('/search?tab=publishing');

    expect(await screen.findByRole('region', { name: '정주애 인물정보 카드' })).toBeInTheDocument();
  });

  it('shows career metrics with notes and keeps 레사모 out of projects (AC-IA3)', async () => {
    renderSearch('/search?tab=careerdoc');

    expect(await screen.findByText(/8만 명/)).toBeInTheDocument();
    expect(screen.getAllByText(/회사 내부 집계/).length).toBeGreaterThan(0);
  });

  it('groups skills by usage without percentages (AC-IA4)', async () => {
    renderSearch('/search?tab=skills');

    expect((await screen.findAllByText('실무')).length).toBeGreaterThan(0);
    expect(screen.getAllByText('프로젝트 기반 기술').length).toBeGreaterThan(0);
    expect(screen.queryByText(/%$/)).not.toBeInTheDocument();
  });

  it('lists all projects in recommend order, switchable to newest, with group filters (AC-IA5)', async () => {
    const user = userEvent.setup();
    renderSearch('/search?tab=projects');

    const all = await screen.findByRole('region', { name: '프로젝트' });
    expect(within(all).getAllByRole('heading', { level: 3 })[0]).toHaveTextContent('SalesLuv');
    await user.click(within(all).getByRole('button', { name: '최신순' }));
    expect(within(all).getAllByRole('heading', { level: 3 })[0]).toHaveTextContent('흙의 온도');
    expect(within(all).getByRole('link', { name: /흙의 온도/ })).toHaveAttribute('href', '/project/heuk-studio');
    expect(within(all).queryByText(/레사모/)).not.toBeInTheDocument();

    await user.click(within(all).getByRole('button', { name: '바이브코딩' }));
    expect(within(all).getByRole('link', { name: /plog/ })).toBeInTheDocument();
    expect(within(all).queryByRole('link', { name: /흙의 온도/ })).not.toBeInTheDocument();
  });

  it('opens the projects list filtered by ?tag=', async () => {
    renderSearch('/search?tag=Kotlin');

    const all = await screen.findByRole('region', { name: '프로젝트' });
    expect(within(all).getAllByRole('listitem')).toHaveLength(2);
    expect(within(all).getByRole('button', { name: 'Kotlin 필터 해제' })).toBeInTheDocument();
  });

  it('links the person card to the resume tab and shows only detailed careers (AC-10, AC-4)', async () => {
    const user = userEvent.setup();
    renderSearch();

    const card = await screen.findByRole('region', { name: '정주애 인물정보 카드' });
    expect(within(card).queryByRole('navigation', { name: '인물정보 탭' })).not.toBeInTheDocument();
    expect(card).toHaveTextContent('필리핀 산토 토마스 대학교');
    expect(card).toHaveTextContent('주식회사 브레이스 웹 풀스택');

    await user.click(within(card).getByRole('link', { name: /이력서 보기/ }));

    expect(screen.getByTestId('location')).toHaveTextContent('/search?tab=resume');
    const resume = await screen.findByRole('article', { name: '정주애 이력서' });
    expect(resume).toHaveTextContent('주식회사 브레이스 (구 아유레디)');
    expect(resume).toHaveTextContent('보유기술');
    expect(resume).not.toHaveTextContent('010-');
    expect(within(resume).queryByRole('img')).not.toBeInTheDocument();
    expect(screen.queryByRole('complementary', { name: '사이드 정보' })).not.toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: '이력서' })).not.toBeInTheDocument();
  });

  it('syncs tab selection to the query string', async () => {
    const user = userEvent.setup();
    renderSearch();

    await user.click(await screen.findByRole('tab', { name: '경력' }));

    expect(screen.getByTestId('location')).toHaveTextContent('/search?tab=career');
  });

  it('copies the email from the person card', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(window.navigator, 'clipboard', { configurable: true, value: { writeText } });
    renderSearch();

    const card = await screen.findByRole('region', { name: '정주애 인물정보 카드' });
    await act(async () => fireEvent.click(within(card).getByRole('button', { name: '이메일 주소 복사' })));

    expect(writeText).toHaveBeenCalledWith('jexists486@gmail.com');
  });
});
