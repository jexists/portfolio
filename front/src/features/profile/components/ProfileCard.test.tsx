import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import type { Profile } from '@/features/profile/types/profile.types';
import { ProfileCard } from './ProfileCard';

const profile: Profile = {
  name: '정주애',
  nameEn: 'Jeong, Ju Ae',
  role: '웹디자이너 · 퍼블리셔',
  location: '서울',
  kakaoId: 'juae7',
  email: 'jexists486@gmail.com',
  website: 'https://example.com',
  github: 'https://github.com/jexists',
  keywords: ['웹디자이너', 'UX', 'UI'],
  body: '첫 문장입니다.\n두 번째 문장입니다.',
};

describe('ProfileCard', () => {
  it('renders the Naver-style identity header and profile information list', () => {
    render(<ProfileCard profile={profile} />);

    expect(screen.getByRole('heading', { name: '정주애' })).toBeInTheDocument();
    expect(screen.getByText('Jeong, Ju Ae · 웹디자이너 · 퍼블리셔')).toBeInTheDocument();
    expect(screen.queryByText('첫 문장입니다.')).not.toBeInTheDocument();

    const information = screen.getByLabelText('정주애 인물정보');
    for (const [label, value] of [
      ['거주지', '서울'],
      ['카톡', 'juae7'],
      ['이메일', 'jexists486@gmail.com'],
      ['사이트', 'GitHub, 웹사이트'],
    ]) {
      const term = within(information).getByText(label);
      expect(term.tagName).toBe('DT');
      expect(term.nextElementSibling).toHaveTextContent(value);
    }
    expect(within(information).queryByText('출생')).not.toBeInTheDocument();
  });

  it('renders an email address with a copy label and copies from either text', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(window.navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    render(<ProfileCard profile={profile} />);
    const copyButton = screen.getByRole('button', { name: '이메일 복사' });
    const emailAddress = within(copyButton).getByText(profile.email);
    const copyLabel = within(copyButton).getByText('복사');

    expect(emailAddress.tagName).toBe('SPAN');
    expect(copyLabel.tagName).toBe('SPAN');
    fireEvent.click(copyLabel);

    await waitFor(() => expect(writeText).toHaveBeenCalledWith('jexists486@gmail.com'));
    fireEvent.click(emailAddress);
    await waitFor(() => expect(writeText).toHaveBeenCalledTimes(2));
    expect(screen.getByRole('button', { name: '이메일 복사됨' })).toBeInTheDocument();
  });

  it('renders site links in a new tab', () => {
    render(<ProfileCard profile={profile} />);

    expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute('href', profile.github);
    expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute('target', '_blank');
    expect(screen.getByRole('link', { name: '웹사이트' })).toHaveAttribute('href', profile.website);
    expect(screen.getByRole('link', { name: '웹사이트' })).toHaveAttribute('target', '_blank');
  });

  it('renders keyword pills and reports keyword selections', async () => {
    const user = userEvent.setup();
    const onKeywordClick = vi.fn();
    render(<ProfileCard profile={profile} activeKeyword={null} onKeywordClick={onKeywordClick} />);

    expect(screen.getByRole('button', { name: '전체 인물 키워드' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: '웹디자이너 인물 키워드' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'UX 인물 키워드' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'UI 인물 키워드' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'UX 인물 키워드' }));
    expect(onKeywordClick).toHaveBeenCalledWith('UX');
  });

  it('renders only the update date below the divider', () => {
    render(<ProfileCard profile={profile} />);

    expect(screen.getByText('2026.07.14.')).toBeInTheDocument();
    expect(screen.queryByText('본인 또는 대리인이 직접 관리하는 정보입니다.')).not.toBeInTheDocument();
    expect(screen.queryByText(/본인참여/)).not.toBeInTheDocument();
  });
});
