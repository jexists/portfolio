import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { vi } from 'vitest';
import { IntroShortcuts } from './IntroShortcuts';

function renderShortcuts(onSkip = vi.fn()) {
  return render(
    <MemoryRouter>
      <div onClick={onSkip}>
        <IntroShortcuts onSkip={onSkip} />
      </div>
    </MemoryRouter>,
  );
}

describe('IntroShortcuts', () => {
  it('links each search tab shortcut to its tab', () => {
    renderShortcuts();

    expect(screen.getByRole('link', { name: '경력' })).toHaveAttribute('href', '/search?tab=career');
    expect(screen.getByRole('link', { name: '프로젝트' })).toHaveAttribute('href', '/search?tab=projects');
    expect(screen.getByRole('link', { name: '기술' })).toHaveAttribute('href', '/search?tab=skills');
    expect(screen.getByRole('link', { name: '자격·수상' })).toHaveAttribute('href', '/search?tab=certs');
    expect(screen.getByRole('link', { name: '학력' })).toHaveAttribute('href', '/search?tab=education');
  });

  it('keeps external shortcuts as links without calling skip', () => {
    const onSkip = vi.fn();
    renderShortcuts(onSkip);

    const github = screen.getByRole('link', { name: 'GitHub' });
    const email = screen.getByRole('link', { name: '이메일' });

    expect(github).toHaveAttribute('href', 'https://github.com/jexists/');
    expect(github).toHaveAttribute('target', '_blank');
    expect(github).toHaveAttribute('rel', 'noopener noreferrer');
    expect(email).toHaveAttribute('href', 'mailto:jexists486@gmail.com');

    fireEvent.click(github);
    fireEvent.click(screen.getByRole('link', { name: '경력' }));
    expect(onSkip).not.toHaveBeenCalled();
  });
});
