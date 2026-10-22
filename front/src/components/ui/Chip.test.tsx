import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { Chip } from './Chip';

describe('Chip', () => {
  it('renders a clickable pill chip with active state', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(<Chip label="React" ariaLabel="React 태그 필터" active onClick={onClick} />);

    const chip = screen.getByRole('button', { name: 'React 태그 필터' });
    expect(chip).toHaveAttribute('aria-pressed', 'true');

    await user.click(chip);

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
