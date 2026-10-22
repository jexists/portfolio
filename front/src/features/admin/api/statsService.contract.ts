import type { StatsService } from './StatsService';

export function runStatsServiceContract(
  name: string,
  createService: () => StatsService,
): void {
  describe(`${name} StatsService contract`, () => {
    it('counts a visit only once in the same session', async () => {
      const first = createService();

      await first.recordVisit();
      await first.recordVisit();
      await createService().recordVisit();

      await expect(first.getStats()).resolves.toEqual(
        expect.objectContaining({ totalVisits: 1 }),
      );
    });

    it('stores and restores a visitor purpose', async () => {
      const service = createService();

      await service.savePurpose('user-1', 'developer', 'github', '개발자');

      await expect(service.getPurpose('user-1')).resolves.toBe('developer');
      await expect(service.getPurpose('unknown')).resolves.toBeNull();
    });

    it('aggregates purpose and provider ratios by unique signed-in user', async () => {
      const service = createService();

      await service.savePurpose('user-1', 'developer', 'github', '하나');
      await service.savePurpose('user-2', 'recruiter', 'kakao', '둘');
      await service.savePurpose('user-3', 'developer', 'github', '셋');

      await expect(service.getStats()).resolves.toEqual(expect.objectContaining({
        loggedInUsers: 3,
        purposeRatios: { recruiter: 33, developer: 67, student: 0, visitor: 0 },
        providerRatios: { kakao: 33, github: 67 },
      }));
    });

    it('keeps only the 10 most recent visitor records', async () => {
      const service = createService();

      for (let index = 0; index < 12; index += 1) {
        await service.savePurpose(`user-${index}`, 'visitor', 'kakao', `방문자 ${index}`);
      }

      const stats = await service.getStats();
      expect(stats.recentVisitors).toHaveLength(10);
      expect(stats.recentVisitors[0]).toEqual(expect.objectContaining({ name: '방문자 11' }));
      expect(stats.recentVisitors[9]).toEqual(expect.objectContaining({ name: '방문자 2' }));
    });
  });
}
