import { MockAuthService } from './MockAuthService';
import { runAuthServiceContract } from './authService.contract';

runAuthServiceContract('MockAuthService', () => {
  localStorage.clear();
  return new MockAuthService();
});

describe('MockAuthService persistence', () => {
  beforeEach(() => localStorage.clear());

  it('restores a signed-in user from localStorage in a new instance', async () => {
    const first = new MockAuthService();
    const user = await first.signIn('github');

    await expect(new MockAuthService().getUser()).resolves.toEqual(user);
  });

  it('creates the portfolio owner mock user', async () => {
    await expect(new MockAuthService().signIn('kakao')).resolves.toEqual(
      expect.objectContaining({ name: '정주애' }),
    );
  });
});
