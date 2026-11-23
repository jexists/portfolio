import { screen, within } from '@testing-library/react';
import { renderRoute, useMockApi } from '@/test/renderWithApi';
import { CareerDetailPage } from './CareerDetailPage';

const renderDetail = (id: string) => renderRoute(`/career/${id}`, '/career/:id', <CareerDetailPage />);

describe('CareerDetail page (MSW mockup)', () => {
  useMockApi();

  it('renders the company header and the project document without interview notes', async () => {
    renderDetail('brace');

    expect(await screen.findByRole('heading', { level: 1, name: '주식회사 브레이스 (구 아유레디)' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '< 경력' })).toHaveAttribute('href', '/search?tab=career');
    const body = screen.getByRole('article', { name: '경력 상세 내용' });
    expect(within(body).getByRole('heading', { name: '서비스 개요' })).toBeInTheDocument();
    expect(within(body).queryByText(/면접 예상 질문|4줄 요약/)).not.toBeInTheDocument();
  });

  it('shows not found for careers without a detail document', async () => {
    renderDetail('sungjin');

    expect(await screen.findByRole('heading', { name: '경력을 찾을 수 없습니다' })).toBeInTheDocument();
  });
});
