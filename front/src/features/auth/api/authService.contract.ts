import type { AuthService } from './AuthService';

export function runAuthServiceContract(
  name: string,
  createService: () => AuthService,
): void {
  describe(`${name} AuthService contract`, () => {
    it.each(['kakao', 'github'] as const)('signs in with %s and returns the current user', async (provider) => {
      const service = createService();

      const signedIn = await service.signIn(provider);

      expect(signedIn).toEqual(expect.objectContaining({
        id: expect.any(String),
        name: expect.any(String),
        provider,
      }));
      await expect(service.getUser()).resolves.toEqual(signedIn);
    });

    it('starts signed out and clears the user on sign out', async () => {
      const service = createService();

      await expect(service.getUser()).resolves.toBeNull();
      await service.signIn('kakao');
      await service.signOut();

      await expect(service.getUser()).resolves.toBeNull();
    });
  });
}
