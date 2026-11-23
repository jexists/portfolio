import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { vi } from 'vitest';
import { profileFixture } from '@/test/fixtures';
import { LinksCard, ProfileCard, ProfileSide, StrengthsCard } from './ProfileCard';

const facts = [
  { label: '경력', values: ['2020.08.~2026.04. 브레이스 웹 풀스택 개발'] },
  { label: '학력', values: ['대학교 졸업'] },
];
const tabs = [
  { value: 'all', label: '전체' },
  { value: 'career', label: '경력' },
];

function renderWithRouter(node: React.ReactNode) {
  return render(<MemoryRouter>{node}</MemoryRouter>);
}

describe('ProfileCard', () => {
  it('renders identity, tab chips and profile facts', () => {
    renderWithRouter(<ProfileCard profile={profileFixture} facts={facts} tabs={tabs} activeTab="all" />);

    expect(screen.getByRole('heading', { level: 1, name: '정주애' })).toBeInTheDocument();
    expect(screen.getByText('Jeong, Juae')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '전체' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: '경력' })).toHaveAttribute('href', '/search?tab=career');
    expect(screen.getByText('2020.08.~2026.04. 브레이스 웹 풀스택 개발')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: '정주애 이니셜' })).toHaveTextContent('J');
  });

  it('shows the photo when avatarUrl exists', () => {
    renderWithRouter(
      <ProfileCard profile={{ ...profileFixture, avatarUrl: '/images/profile.jpg' }} facts={[]} tabs={tabs} activeTab="all" />,
    );

    expect(screen.getByRole('img', { name: '정주애 사진' })).toHaveAttribute('src', '/images/profile.jpg');
  });

  it('opens site links in a new tab and copies the email', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(window.navigator, 'clipboard', { configurable: true, value: { writeText } });
    renderWithRouter(<ProfileSide profile={profileFixture} facts={facts} />);

    const github = screen.getByRole('link', { name: 'GitHub' });
    expect(github).toHaveAttribute('target', '_blank');
    expect(github).toHaveAttribute('rel', 'noopener noreferrer');

    await act(async () => fireEvent.click(screen.getByRole('button', { name: '이메일 주소 복사' })));

    expect(writeText).toHaveBeenCalledWith('jexists486@gmail.com');
    expect(screen.getByRole('button', { name: '이메일 주소 복사' })).toHaveTextContent('복사됨');
  });
});

describe('side cards', () => {
  it('lists strengths', () => {
    renderWithRouter(<StrengthsCard strengths={profileFixture.strengths} />);

    expect(screen.getByRole('region', { name: '핵심 역량' })).toHaveTextContent('역량설명');
  });

  it('lists external links and email', () => {
    renderWithRouter(<LinksCard profile={profileFixture} />);

    expect(screen.getByRole('link', { name: /블로그/ })).toHaveAttribute('href', 'https://jexists.tistory.com/');
    expect(screen.getByRole('link', { name: /이메일/ })).toHaveAttribute('href', 'mailto:jexists486@gmail.com');
  });
});
