import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProjectGallery } from './ProjectGallery';

const images = [
  { src: '/a.webp', caption: '첫 화면' },
  { src: '/b.webp', caption: '둘째 화면' },
  { src: '/c.webp', caption: '셋째 화면' },
];

const current = () => screen.getByRole('group', { name: '화면 캐러셀' });

describe('ProjectGallery', () => {
  it('shows one screen at a time and moves with the arrow buttons', async () => {
    const user = userEvent.setup();
    render(<ProjectGallery images={images} />);

    expect(within(current()).getByText('1 / 3')).toBeInTheDocument();
    expect(within(current()).getByText('첫 화면')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '이전 화면' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '다음 화면' }));
    await user.click(screen.getByRole('button', { name: '다음 화면' }));

    expect(within(current()).getByText('3 / 3')).toBeInTheDocument();
    expect(within(current()).getByText('셋째 화면')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '다음 화면' })).not.toBeInTheDocument();
  });

  it('jumps straight to a screen from the thumbnail strip and splits the phase badge', async () => {
    const user = userEvent.setup();
    render(<ProjectGallery images={[...images, { src: '/d.webp', caption: '4차 · AI 챗봇' }]} />);

    await user.click(screen.getByRole('button', { name: '4차 · AI 챗봇 보기' }));

    expect(within(current()).getByText('4 / 4')).toBeInTheDocument();
    expect(within(current()).getByText('4차')).toBeInTheDocument();
    expect(within(current()).getByText('AI 챗봇')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '4차 · AI 챗봇 보기' })).toHaveAttribute('aria-current', 'true');
  });

  it('opens the clicked screen in a full view dialog and closes it', async () => {
    const user = userEvent.setup();
    render(<ProjectGallery images={images} />);

    await user.click(screen.getByRole('button', { name: '첫 화면 크게 보기' }));
    const dialog = screen.getByRole('dialog', { name: '첫 화면' });
    expect(within(dialog).getByRole('img', { name: '첫 화면' })).toHaveAttribute('src', '/a.webp');

    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('dialog', { name: '둘째 화면' })).toBeInTheDocument();
    expect(within(current()).getByText('2 / 3')).toBeInTheDocument();

    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: '닫기' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
