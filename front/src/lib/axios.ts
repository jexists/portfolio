import axios from 'axios';

/** 모든 API 호출의 단일 진입점. MSW 사용 시에도 같은 경로(/api/v1)를 호출한다. */
export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  timeout: 10_000,
});
