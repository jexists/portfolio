import { MockStatsService } from './MockStatsService';
import type { StatsService } from './StatsService';

/** 현재는 localStorage mock. 백엔드 visits API 가 생기면 구현체만 교체한다. */
export const statsService: StatsService = new MockStatsService();
