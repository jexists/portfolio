import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { vi } from 'vitest';
import { profileFixture } from '@/test/fixtures';
import { LinksCard, ProfileCard, StrengthsCard } from './ProfileCard';

const facts = [
  { label: '경력', values: ['2020.08.~2026.04. 브레이스 웹 풀스택 개발'] },
  { label: '학력', values: ['대학교 졸업'] },
];

function renderWithRouter(node: React.ReactNode) {
  return render(<MemoryRouter>{node}</MemoryRouter>);
}

describe('ProfileCard', () => {
  it('renders identity, profile facts and the resume link without tab chips', () => {
    renderWithRouter(<ProfileCard profile={profileFixture} facts={facts} />);

    expect(screen.getByRole('heading', { level: 1, name: '정주애' })).toBeInTheDocument();
    expect(screen.getByText('Jeong, Juae')).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: '인물정보 탭' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /이력서 보기/ })).toHaveAttribute('href', '/search?tab=resume');
    expect(screen.getByText('2020.08.~2026.04. 브레이스 웹 풀스택 개발')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: '정주애 이니셜' })).toHaveTextContent('J');
  });

  it('shows the photo when avatarUrl exists', () => {
    renderWithRouter(
      <ProfileCard profile={{ ...profileFixture, avatarUrl: '/images/profile.jpg' }} facts={[]} />,
    );

    expect(screen.getByRole('img', { name: '정주애 사진' })).toHaveAttribute('src', '/images/profile.jpg');
  });

  it('opens site links in a new tab and copies the email', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(window.navigator, 'clipboard', { configurable: true, value: { writeText } });
    renderWithRouter(<ProfileCard profile={profileFixture} facts={facts} />);

    const github = screen.getByRole('link', { name: 'GitHub' });
    expect(github).toHaveAttribute('target', '_blank');
    expect(github).toHaveAttribute('rel', 'noopener noreferrer');

    await act(async () => fireEvent.click(screen.getByRole('button', { name: '이메일 주소 복사' })));

    expect(writeText).toHaveBeenCalledWith('jexists486@gmail.com');
    const copied = screen.getByRole('button', { name: '이메일 주소 복사됨' });
    expect(copied).toHaveTextContent('');
    expect(copied.querySelector('svg')).not.toBeNull();
  });
});

describe('side cards', () => {
  it('opens one strength at a time like an accordion', () => {
    renderWithRouter(
      <StrengthsCard strengths={[...profileFixture.strengths, { title: '두번째', text: '두번째 설명' }]} />,
    );

    const first = screen.getByRole('button', { name: /역량/ });
    const second = screen.getByRole('button', { name: /두번째/ });
    expect(first).toHaveAttribute('aria-expanded', 'false');
    expect(second).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('설명')).not.toBeVisible();

    fireEvent.click(first);
    expect(first).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('설명')).toBeVisible();

    fireEvent.click(second);

    expect(second).toHaveAttribute('aria-expanded', 'true');
    expect(first).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByText('두번째 설명')).toBeVisible();
    expect(screen.queryByText('설명')).not.toBeVisible();
  });

  it('lists external links and email', () => {
    renderWithRouter(<LinksCard profile={profileFixture} />);

    expect(screen.getByRole('link', { name: /블로그/ })).toHaveAttribute('href', 'https://jexists.tistory.com/');
    expect(screen.getByRole('link', { name: /이메일/ })).toHaveAttribute('href', 'mailto:jexists486@gmail.com');
  });
});
