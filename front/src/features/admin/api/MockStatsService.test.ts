import { MockStatsService } from './MockStatsService';
import { runStatsServiceContract } from './statsService.contract';

describe('MockStatsService', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  runStatsServiceContract('MockStatsService', () => new MockStatsService());
});
