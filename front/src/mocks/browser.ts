import axios, { AxiosError, type AxiosResponse } from 'axios';
import { getResponse } from 'msw';
import { http } from '@/lib/axios';
import { handlers } from './handlers';

/**
 * 목업 모드에서 axios 요청을 MSW 핸들러가 페이지 안에서 바로 응답하게 한다.
 * 예전에는 서비스워커(mockServiceWorker.js)를 썼는데, 탭을 오래 두면 브라우저가 워커를 꺼 버리고
 * 다시 켜진 워커는 이 탭을 잊어서 요청을 그대로 GitHub Pages 로 흘려보냈다 → 404 → "프로젝트를 찾을 수 없습니다".
 */
export function installMockAdapter() {
  const network = axios.getAdapter(http.defaults.adapter);

  // 개발 중 스켈레톤 확인용: .env 의 VITE_MOCK_DELAY(ms) 만큼 목업 응답을 늦춘다 (배포 빌드에는 넣지 않는다)
  const delayMs = import.meta.env.DEV ? Number(import.meta.env.VITE_MOCK_DELAY) || 0 : 0;

  http.defaults.adapter = async (config) => {
    if (delayMs) await new Promise((resolve) => setTimeout(resolve, delayMs));
    const url = new URL(http.getUri(config), window.location.href);
    const response = await getResponse(handlers, new Request(url, { method: (config.method ?? 'get').toUpperCase() }));
    // 핸들러가 없는 요청은 실제 네트워크로 보낸다 (예전 onUnhandledRequest: 'bypass' 와 같다)
    if (!response) return network(config);

    const result: AxiosResponse = {
      data: await response.json(),
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers),
      config,
      request: null,
    };
    if (!config.validateStatus || config.validateStatus(result.status)) return result;
    throw new AxiosError(
      `Request failed with status code ${result.status}`,
      result.status >= 500 ? AxiosError.ERR_BAD_RESPONSE : AxiosError.ERR_BAD_REQUEST,
      config,
      null,
      result,
    );
  };

  // 예전 방문자 브라우저에 남은 목업 서비스워커를 지운다
  void navigator.serviceWorker?.getRegistrations().then((registrations) =>
    registrations
      .filter((registration) => registration.active?.scriptURL.endsWith('mockServiceWorker.js'))
      .forEach((registration) => void registration.unregister()),
  );
}
