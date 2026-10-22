import type { AuthService } from './AuthService';
import { MockAuthService } from './MockAuthService';

/** 현재는 localStorage mock. 백엔드 인증이 생기면 구현체만 교체한다. */
export const authService: AuthService = new MockAuthService();
