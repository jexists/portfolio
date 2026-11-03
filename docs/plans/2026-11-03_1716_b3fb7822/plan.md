# GitHub Pages 배포 (프론트 + MSW 목업)

## Context
저장소 Settings → Pages가 비활성 상태다. 사용자가 포트폴리오를 GitHub에 올려 공개 URL로 보고 싶어 한다.
GitHub Pages는 정적 파일만 호스팅하므로 Go API·MongoDB는 올릴 수 없다. 대신 지금 개발 기본값처럼 **MSW가 mockup/*.json으로 /api/v1을 응답하는 프론트 빌드**를 배포한다.
목표 URL: `https://jexists.github.io/portfolio/` (저장소 public, 이름 `portfolio`).

## 관련 코드·현재 구조
- `front/vite.config.ts`: `base` 미설정 → 루트(`/`) 기준 경로라 `/portfolio/` 하위에서 JS·CSS가 404 난다.
- `front/src/app/router.tsx`: `createBrowserRouter` basename 없음.
- `front/src/app/main.tsx`: `worker.start()`가 기본 `/mockServiceWorker.js`를 찾는다 → 하위 경로에서 실패.
- `front/src/components/layout/SearchHeader.tsx:36`: 로고 `<a href="/">` 하드코딩.
- `front/scripts/generate-feeds.ts`: `DEFAULT_SITE_URL = https://jexists.github.io/portfolio_2026` (저장소 이름과 다름), `SITE_URL` env로 덮어쓸 수 있다.
- `front/vercel.json`: Vercel용 SPA rewrite (유지).
- `.github/workflows/ci.yml`: lint·test·build만 하고 배포는 없다.

## 범위 / 제외 범위
- 범위: 프론트를 GitHub Actions로 빌드해 Pages에 배포. main push 시 자동 배포 + 수동 실행(workflow_dispatch).
- 제외: Go 백엔드·MongoDB 배포, 실제 인증, 커스텀 도메인, Vercel 설정 변경.

## 단계
1. (TDD) 실패 테스트 먼저
   - `generate-feeds.test.ts`: 기본 SITE_URL이 `https://jexists.github.io/portfolio`인지.
   - `SearchHeader` 테스트: 로고 링크가 라우터 기준 `/`로 이동(`Link to="/"`)하는지.
2. `vite.config.ts`: `base: process.env.VITE_BASE_PATH ?? '/'` — 로컬·Vercel은 `/`, Pages 빌드에서만 `/portfolio/`.
3. `router.tsx`: `createBrowserRouter(routes, { basename: import.meta.env.BASE_URL })`.
4. `main.tsx`: `worker.start({ serviceWorker: { url: \`${import.meta.env.BASE_URL}mockServiceWorker.js\` }, onUnhandledRequest: 'bypass' })`.
5. `SearchHeader.tsx`: `<a href="/">` → react-router `<Link to="/">`.
6. `generate-feeds.ts`: `DEFAULT_SITE_URL` → `https://jexists.github.io/portfolio`.
7. `.github/workflows/deploy-pages.yml` 추가
   - trigger: `push: main`, `workflow_dispatch`; permissions `pages: write`, `id-token: write`; concurrency `pages`.
   - build: `npm ci` → `VITE_BASE_PATH=/portfolio/ VITE_USE_MOCK=true SITE_URL=https://jexists.github.io/portfolio npm run build` → `cp dist/index.html dist/404.html`(딥링크 새로고침 대응) → `actions/upload-pages-artifact`(front/dist).
   - deploy: `actions/deploy-pages`, environment `github-pages`.
8. 저장소 설정: Pages Source를 **GitHub Actions**로 변경 (`gh api -X POST repos/jexists/portfolio/pages -f build_type=workflow`, 실패 시 사용자에게 Settings에서 선택 요청).
9. 문서: `docs/ARCHITECTURE.md`(배포 구조), `docs/DECISIONS.md`(Pages+MSW 선택 이유), `docs/PROGRESS.md`, `README`의 배포 URL.

## 영향 파일
`front/vite.config.ts`, `front/src/app/router.tsx`, `front/src/app/main.tsx`, `front/src/components/layout/SearchHeader.tsx`(+테스트), `front/scripts/generate-feeds.ts`(+테스트), `.github/workflows/deploy-pages.yml`(신규), `docs/*`

## 위험·호환성
- 공개 배포다: mockup의 내용(profiles·users·visits JSON)이 누구나 볼 수 있게 된다 → 개인정보·비밀값이 없는지 배포 전 확인.
- 로그인·관리자 화면은 localStorage mock이라 누구나 "로그인"된 것처럼 보일 수 있다(실데이터 없음).
- 404.html 방식은 딥링크 첫 응답 상태코드가 404다(SEO 영향 미미, 화면은 정상).
- base 기본값을 `/`로 두므로 로컬 dev·Vercel·테스트 동작은 바뀌지 않는다.
- 미추적 `backend.sh`, `frontend.sh`는 이번 커밋에 넣지 않는다.

## 테스트
- `cd front && npm run lint && npm test && npm run build`
- Pages 조건 로컬 확인: `VITE_BASE_PATH=/portfolio/ npm run build && npx vite preview --base /portfolio/` → `/portfolio/`, `/portfolio/search?q=...`, `/portfolio/project/<slug>` 열어 목업 데이터 표시 확인.
- 배포 후 `https://jexists.github.io/portfolio/` 및 딥링크 새로고침 확인, Actions 로그 확인.

## Acceptance Criteria
- main merge 후 deploy-pages 워크플로가 성공하고 `https://jexists.github.io/portfolio/`에서 첫 화면·검색·상세가 목업 데이터로 동작한다.
- 상세 페이지 URL을 직접 열거나 새로고침해도 화면이 뜬다.
- 로고 클릭 시 `/portfolio/`로 돌아간다.
- 로컬 `npm run dev`와 기존 CI는 그대로 통과한다.

## Workflow
- type: chore
- issue: new
- title: chore: GitHub Pages 배포 (프론트 MSW 목업)
- slug: gh-pages-deploy
