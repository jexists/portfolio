import { render, screen } from '@testing-library/react';
import { Logo } from './Logo';

describe('Logo', () => {
  it('renders each PortFolio letter as accessible text', () => {
    render(<Logo />);

    expect(screen.getByLabelText('PortFolio')).toBeInTheDocument();
    expect(screen.getAllByTestId('logo-letter')).toHaveLength(9);
  });

  it('can render the intro animation variant with the butterfly', () => {
    render(<Logo variant="intro" />);

    expect(screen.getByLabelText('PortFolio')).toHaveAttribute('data-variant', 'intro');
    expect(screen.getByLabelText('빨간 나비')).toBeInTheDocument();
  });

  it('can render a compact brand mark with the butterfly', () => {
    render(<Logo variant="compact" />);

    expect(screen.getByLabelText('PortFolio')).toHaveAttribute('data-variant', 'compact');
    expect(screen.getByLabelText('빨간 나비')).toBeInTheDocument();
  });
});
