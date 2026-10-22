import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { IntroShortcuts } from './IntroShortcuts';

describe('IntroShortcuts', () => {
  it('renders all portfolio shortcuts', () => {
    render(<IntroShortcuts onSkip={vi.fn()} />);

    ['프로젝트', '퍼블리싱', '디자인', '스터디', 'GitHub', '이메일', '자세히 보기'].forEach(
      (label) => expect(screen.getByText(label)).toBeInTheDocument(),
    );
  });

  it('calls skip from an internal shortcut', () => {
    const onSkip = vi.fn();
    render(<IntroShortcuts onSkip={onSkip} />);

    fireEvent.click(screen.getByRole('button', { name: '프로젝트' }));

    expect(onSkip).toHaveBeenCalledTimes(1);
  });

  it('keeps external shortcuts as links without calling skip', () => {
    const onSkip = vi.fn();
    render(<div onClick={onSkip}><IntroShortcuts onSkip={onSkip} /></div>);

    const github = screen.getByRole('link', { name: 'GitHub' });
    const email = screen.getByRole('link', { name: '이메일' });

    expect(github).toHaveAttribute('href', 'https://github.com/jexists/');
    expect(github).toHaveAttribute('target', '_blank');
    expect(email).toHaveAttribute('href', 'mailto:jexists486@gmail.com');

    fireEvent.click(github);
    expect(onSkip).not.toHaveBeenCalled();
  });
});
