# 없는 경로로 들어오면 첫 화면으로 보내기 (GitHub Pages)

## Context
사용자가 `https://jexists.github.io/portfolio/html/all.html`을 열었더니 GitHub 기본 404가 나왔다. 원인은 두 가지다.
1. **아직 배포되지 않았다**: PR #6(Pages 배포)이 merge 전이라 `deploy-pages.yml`이 main에 없고, Pages에 올라간 파일이 하나도 없다. 지금은 `/portfolio/`도 404다.
2. **`/html/all.html`은 앱 라우트가 아니다**(예전 사이트 구조의 주소로 보임). merge 후에는 `404.html`(index.html 복사본)이 SPA를 띄우지만, 라우터에 맞는 경로가 없어 React Router 기본 에러 화면이 나온다.

목표: 배포 후 정의되지 않은 주소(`/portfolio/html/all.html` 등)로 들어오면 첫 화면(IntroPage)으로 보낸다.

## 관련 코드·현재 구조
- `front/src/app/router.tsx`: `/`, `/admin`, `/login`, `/search`, `/project/:slug`만 정의, catch-all 없음. `router`를 `createBrowserRouter`로 바로 만든다.
- `front/src/app/App.test.tsx`: `./router`를 mock하므로 라우트 자체는 테스트하지 않는다.
- `.github/workflows/deploy-pages.yml`(PR #6 브랜치): `cp dist/index.html dist/404.html` 이미 있음.

## 범위 / 제외 범위
- 범위: catch-all 라우트(`*`) → `<Navigate to="/" replace />`. 같은 PR #6 브랜치(`chore/5-gh-pages-deploy`)에 커밋을 추가한다(Issue #5 AC "딥링크" 범위).
- 제외: 별도 404 안내 페이지 디자인, 예전 주소별 개별 매핑.

## 단계
1. (TDD) `front/src/app/router.test.tsx` 신규: `routes`를 `createMemoryRouter(routes, { initialEntries: ['/html/all.html'] })`로 렌더하고 위치가 `/`가 되는지 확인(페이지 컴포넌트는 vi.mock으로 가볍게 대체). 실패 확인.
2. `router.tsx`: 라우트 배열을 `export const routes`로 분리하고 `{ path: '*', element: <Navigate to="/" replace /> }` 추가. `router`는 그대로 `createBrowserRouter(routes, { basename })`.
3. lint·test·build, `VITE_BASE_PATH=/portfolio/` 빌드 + 404.html로 preview 확인.
4. 커밋 `feat(front): 없는 경로를 첫 화면으로 리다이렉트` (Refs #5) → push → PR #6 Changes/Testing 갱신 → CI 확인.
5. 사용자 승인 후 PR #4, #6 merge → deploy-pages 실행 확인 → `https://jexists.github.io/portfolio/`와 `/portfolio/html/all.html` 확인.

## 영향 파일
`front/src/app/router.tsx`, `front/src/app/router.test.tsx`(신규), PR #6 본문

## 위험·호환성
- 오타 난 프로젝트 주소도 조용히 첫 화면으로 간다(사용자 의도와 일치). `/project/<없는slug>`는 기존 상세 페이지 처리 그대로.
- 404.html 방식이라 HTTP 상태코드는 여전히 404(화면은 정상).

## 테스트
- `cd front && npm run lint && npm test && npm run build`
- 배포 후 브라우저로 `/portfolio/html/all.html` → `/portfolio/` 첫 화면 표시 확인

## Acceptance Criteria
- 라우터에 없는 경로로 들어오면 첫 화면(IntroPage)이 보이고 주소가 `/portfolio/`로 바뀐다.
- 기존 라우트(`/search`, `/project/:slug` 등)는 그대로 동작한다.
- merge 후 `https://jexists.github.io/portfolio/`가 열린다.

## Workflow
- type: chore
- issue: #5
- title: chore: GitHub Pages 배포 (프론트 MSW 목업)
- slug: gh-pages-deploy
