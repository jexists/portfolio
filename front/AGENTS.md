# front/ 지침

Vite + React 19 + TypeScript(strict) · SCSS Modules · react-router v7 · @tanstack/react-query · axios · MSW · Vitest + RTL

## 명령어 (front/ 에서)
```bash
npm run dev     # :5173. 기본은 MSW 목업, 실제 API는 .env 에 VITE_USE_MOCK=false
npm test        # vitest run (Node 25+ 는 vite.config 의 --no-experimental-webstorage 로 jsdom localStorage 사용)
npm run lint
npm run build   # tsc -b + vite build + dist/feed.xml, sitemap.xml (원본: ../mockup/projects.json)
CONTRACT_API_URL=http://localhost:8080/api/v1 npx vitest run src/mocks/apiContract.test.ts   # Go API 계약 검사
```

## 구조 규칙
- `src/app/` 진입점·라우터·Provider. `src/components/{ui,layout}` 공용 컴포넌트. `src/features/<기능>/{api,components,hooks,pages,types}`.
- 다른 feature는 **index.ts(공개 API)로만** import한다 (`@/features/profile`). feature 내부끼리는 상대 경로를 쓰고, 자기 index를 import하지 않는다(순환 참조 방지).
- 데이터: `api/*.api.ts`(axios, DTO → 화면 타입 변환) → `hooks/use*.ts`(React Query) → 컴포넌트. 컴포넌트에서 axios를 직접 부르지 않는다.
- 새 API를 쓰면 `src/mocks/handlers.ts`에 MSW 핸들러를, 필요하면 `src/mocks/apiContract.ts`에 계약을 추가한다.
- 파일 배치: `Button.tsx` 옆에 `Button.module.scss`, `Button.test.tsx`. 경로 alias `@/` = `src/`, `@mockup/` = `../mockup/`.
- 맥 기본 파일시스템은 대소문자를 구분하지 않는다. `AuthService.ts`와 `authService.ts`처럼 대소문자만 다른 파일 이름을 만들지 않는다.

## 디자인 규칙
- 색·간격·라운드·그림자·모션은 `src/styles/tokens.json` → CSS 변수로만 쓴다(SCSS에 하드코딩 금지).
- 공용 컴포넌트나 페이지를 추가·이동하면 `src/styles/manifest.json`을 갱신한다(경로 존재 여부를 테스트가 확인).
- 애니메이션은 `prefers-reduced-motion`을 존중한다.
