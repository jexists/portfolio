import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { projectMeta } from '@/test/fixtures';
import { ProjectCard } from './ProjectCard';

const project = projectMeta({
  slug: 'hanbit-math',
  title: '한빛수학',
  subtitle: '학원 관리',
  summary: '수강 신청 서비스',
  highlights: ['테스트 71개'],
  tags: ['Next.js', 'NestJS'],
  team: '1명 (구현은 AI 활용)',
});

function renderCard(props: Parameters<typeof ProjectCard>[0]) {
  return render(
    <MemoryRouter>
      <ProjectCard {...props} />
    </MemoryRouter>,
  );
}

describe('ProjectCard', () => {
  it('links published projects to detail pages with title and period meta', () => {
    renderCard({ project });

    expect(screen.getByRole('link')).toHaveAttribute('href', '/project/hanbit-math');
    expect(screen.getByRole('heading', { name: '한빛수학 · 학원 관리' })).toBeInTheDocument();
    expect(screen.getByText('교육 · 2026.11 · 1명')).toBeInTheDocument();
    expect(screen.queryByText('수강 신청 서비스')).not.toBeInTheDocument();
  });

  it('shows summary, highlights and tags in detailed mode', () => {
    renderCard({ project, detailed: true });

    expect(screen.getByText('수강 신청 서비스')).toBeInTheDocument();
    expect(screen.getByText('테스트 71개')).toBeInTheDocument();
    expect(screen.getByText('NestJS')).toBeInTheDocument();
  });

  it('uses the first image as thumbnail when one exists', () => {
    renderCard({ project: { ...project, images: [{ src: '/images/a.png', caption: '첫 화면' }] } });

    expect(screen.getByRole('img', { name: '첫 화면' })).toHaveAttribute('src', '/images/a.png');
  });

  it('does not link draft placeholder projects', () => {
    renderCard({ project: { ...project, draft: true } });

    const card = screen.getByLabelText('한빛수학 준비중');
    expect(within(card).queryByRole('link')).not.toBeInTheDocument();
  });
});
