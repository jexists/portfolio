import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import type { ProjectMeta } from '@/features/projects/types/project.types';
import { ProjectCard } from './ProjectCard';

const project: ProjectMeta = {
  slug: 'naver-clone',
  title: '네이버 클론',
  category: 'publishing',
  kind: '클론',
  publishedAt: '2026-07-01',
  tags: ['HTML'],
  summary: '메인 화면 클론',
};

describe('ProjectCard', () => {
  it('links published projects to detail pages', () => {
    render(
      <MemoryRouter>
        <ProjectCard project={project} />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link')).toHaveAttribute('href', '/project/naver-clone');
  });

  it('does not link draft placeholder projects', () => {
    render(
      <MemoryRouter>
        <ProjectCard project={{ ...project, draft: true }} />
      </MemoryRouter>,
    );

    const card = screen.getByLabelText('네이버 클론 준비중');
    expect(within(card).queryByRole('link')).not.toBeInTheDocument();
  });
});
