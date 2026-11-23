import { screen, within } from '@testing-library/react';
import { renderRoute, useMockApi } from '@/test/renderWithApi';
import { ProjectDetailPage } from './ProjectDetailPage';

const renderDetail = (slug: string) => renderRoute(`/project/${slug}`, '/project/:slug', <ProjectDetailPage />);

describe('ProjectDetail page (MSW mockup)', () => {
  useMockApi();

  it('renders the hero, markdown body with tables, and overview (AC-IA5)', async () => {
    renderDetail('hanbit-math');

    expect(await screen.findByRole('heading', { level: 1, name: '한빛수학' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '< 프로젝트' })).toHaveAttribute('href', '/search?tab=projects');
    const body = screen.getByRole('article', { name: '프로젝트 상세 내용' });
    expect(within(body).getAllByRole('table').length).toBeGreaterThan(0);
    expect(within(body).queryByText(/면접 예상 질문|4줄 요약/)).not.toBeInTheDocument();
    const overview = screen.getByRole('region', { name: '개요' });
    expect(overview).toHaveTextContent('2026.11.02 – 2026.11.05');
  });

  it('opens every external link in a new tab with safe rel', async () => {
    renderDetail('hanbit-math');

    const links = within(await screen.findByRole('region', { name: '링크' })).getAllByRole('link');
    expect(links.map((link) => link.textContent)).toContain('발표 자료발표 ↗');
    for (const link of links) {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
    const bodyLinks = within(screen.getByRole('article', { name: '프로젝트 상세 내용' })).getAllByRole('link');
    expect(bodyLinks.every((link) => link.getAttribute('target') === '_blank')).toBe(true);
  });

  it('hides empty fields: no cover, gallery or course when absent', async () => {
    renderDetail('instpic');

    await screen.findByRole('heading', { level: 1, name: 'instpic' });
    expect(screen.queryByRole('img', { name: /대표 화면/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('region', { name: '화면' })).not.toBeInTheDocument();
    expect(screen.getByRole('region', { name: '개요' })).not.toHaveTextContent('과정');
  });

  it('links tags to the filtered projects list', async () => {
    renderDetail('hanbit-math');

    expect(await screen.findByRole('link', { name: 'NestJS' })).toHaveAttribute('href', '/search?tag=NestJS');
  });

  it('renders series navigation for clone projects', async () => {
    renderDetail('asiana-clone');

    const nav = await screen.findByRole('navigation', { name: '시리즈 내비게이션' });
    expect(within(nav).getByRole('link', { name: /네이버 포털/ })).toHaveAttribute('href', '/project/naver-clone');
    expect(within(nav).getByRole('link', { name: /페이플/ })).toHaveAttribute('href', '/project/payple-clone');
  });

  it('shows not found for missing projects', async () => {
    renderDetail('missing-project');

    expect(await screen.findByRole('heading', { name: '프로젝트를 찾을 수 없습니다' })).toBeInTheDocument();
  });
});
