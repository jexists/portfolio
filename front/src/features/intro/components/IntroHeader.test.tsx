import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { vi } from 'vitest';
import { AuthProvider } from '@/features/auth';
import { IntroHeader } from './IntroHeader';

describe('IntroHeader', () => {
  it('renders the external GitHub link in a new tab', () => {
    const onSkip = vi.fn();
    render(<AuthProvider initialUser={null}><MemoryRouter><div onClick={onSkip}><IntroHeader onSkip={onSkip} /></div></MemoryRouter></AuthProvider>);

    expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute(
      'href',
      'https://github.com/jexists/',
    );
    expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute('target', '_blank');
    fireEvent.click(screen.getByRole('link', { name: 'GitHub' }));
    expect(onSkip).not.toHaveBeenCalled();
  });

  it('calls skip from the resume link', () => {
    const onSkip = vi.fn();
    render(<AuthProvider initialUser={null}><MemoryRouter><IntroHeader onSkip={onSkip} /></MemoryRouter></AuthProvider>);

    fireEvent.click(screen.getByRole('button', { name: '이력서' }));

    expect(onSkip).toHaveBeenCalledTimes(1);
  });
});
