import { setupServer } from 'msw/node';
import { handlers } from './handlers';

/** 테스트(Node) 환경에서 같은 목업 API를 띄운다 */
export const server = setupServer(...handlers);
