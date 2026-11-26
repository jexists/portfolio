# PROGRESS

> 세션 시작 때 이 문서부터 읽는다. 세션 종료 때 `session-wrapup` 스킬로 갱신한다.
> 마지막 갱신: 2026-11-23 (통합검색형 리디자인)

## 현재 상태
- main: 통합검색형 화면 merge (PR #11).
- 진행 중: Issue #12 검색결과 화면 다듬기(정렬·인물정보·학력·이력서 탭) → 브랜치 `feat/12-search-refine`, 구현·검증 완료, 커밋 전.
- 인증(소셜 로그인)과 방문 통계는 아직 프론트 localStorage mock이다.

## 완료
- 2026-11-23 검색결과 화면 다듬기 (Issue #12, 계획 `docs/plans/2026-11-23_1544_9d010bb0`): 본문·검색창 정렬(상세 페이지 포함), 모바일 P 마크, 인물정보 칩 삭제·이력서 링크·복사 아이콘, 핵심역량 아코디언, 레일 끝 버튼 숨김, 학력 탭 재구성(`kind: school`), 이력서 화면(`이력서 보기`로만 진입, v16 원본에서 전화·사진 제외)
- 2026-11-23 통합검색형 리디자인 구현 (Issue #10, 계획 `docs/plans/2026-11-23_1152_c97ee194`): 탭 6개, 이력 컬렉션 4개·Go 목록 API, 프로젝트 20건(원본 md 본문), 인트로 키보드 수정. 계약 테스트 MSW·Go 통과
- 2026-11-23 Phase 1 분석·Phase 2 디자인 시안 (PR #9, 계획 `docs/plans/2026-11-23_1053_05ad2e25`)
- 2026-11-03 GitHub Pages 배포 설정: `deploy-pages.yml`, 하위 경로(base·basename·MSW worker) 대응 (Issue #5, 계획 `docs/plans/2026-11-03_1716_b3fb7822`)
- 2026-10-22 개발 워크플로우 구현: Issue Forms·PR 템플릿·CI, `scripts/devflow.py`, 스킬 dev-start/finish/status/merge, Plan hook 알림 (Issue #2, 계획 `docs/plans/2026-10-22_1319_78b0fe28`)
- 2026-10-22 모노레포 초기 설정 merge (PR #1): front·back·mockup, AI 공용 환경, Plan 자동 보관 hook

## 진행 중
- Issue #12: 커밋 → PR → CI → 사용자 승인 후 merge

## 다음 할 일
1. Phase 5 프로젝트 캡처: Playwright로 공개 URL 화면을 캡처해 `front/public/images/projects/<slug>/`에 두고 `images[]` 연결.
2. 프로필 사진: 사용자가 주면 `front/public/images/profile.jpg` + `profiles.avatar`.
3. 세부 디자인 다듬기(사용자 피드백), 비공개 저장소(plog·instapic·photo_organizer) 공개 여부 확인.
1. 다음 기능 계획을 승인할 때 hook 알림 → dev-start 자동 실행이 실제로 동작하는지 확인한다(이번에는 기능 추가 전에 승인돼서 수동으로 실행했다).
2. 인증 방식을 결정한다 (Kakao/GitHub OAuth + 세션/JWT) → DECISIONS에 기록하고 `back/internal/{service,handler,middleware}/auth.go`를 구현한다.
3. 방문 통계 API(`visits`, `users.purpose`)를 만들고 프론트 `features/admin/api/stats.api.ts` 구현체를 API로 바꾼다.
4. 번들 크기 경고(index 약 620kB)를 줄인다: 라우트 단위 `lazy()` 분할.
5. Codex에서 `/skills`로 스킬 7개가 인식되는지 확인한다(Claude 전용 frontmatter 키가 섞여 있다).

## 나중에 할 계획
1. 문의 기능
2. 백엔드 연결 (프론트 mock → Go API)
3. 로그인
4. 로그인한 사람이 본인일 때만 웹사이트에서 바로 추가·수정·삭제
5. 저장소 비공개 전환 + 배포 전용 공개 저장소: 지금 저장소를 `portfolio-src`(가칭)로 바꿔 비공개로 두고, main push 때 Actions가 빌드 결과물(`front/dist`)만 공개 저장소 `portfolio`에 올린다. 링크 `jexists.github.io/portfolio/` 유지. 배포 키 1개 필요.
6. 카카오톡 공유 미리보기(SEO): `index.html` og 태그와 `front/public/images/og.png`(1200×630) 추가함. 남은 일: 배포 후 카카오 개발자 사이트의 공유 디버거에서 캐시 초기화. SPA라 모든 경로가 같은 미리보기다(경로별로 바꾸려면 빌드 때 경로별 HTML 생성 필요).
7. AI 수집 차단 보강: `robots.txt`는 도메인 루트에서만 읽힌다. 지금은 `front/public/robots.txt`(루트 배포용)와 `index.html`의 `noai` 메타만 있다. 확실히 막으려면 `jexists.github.io` 저장소를 만들어 루트에 같은 `robots.txt`를 두거나 개인 도메인을 쓴다.

## 메모
- 브라우저 패널 화면 확인: `.claude/launch.json`의 `back-api-local`(로컬 mongod 27017, DB `portfolio_contract`, :8089) + `front-api-local`(:5174, 목업 끔). 먼저 `MONGO_URI=mongodb://localhost:27017 MONGO_DB=portfolio_contract go run ./cmd/seed -drop`.
- Node 26 환경에서 jsdom localStorage가 Node 내장 localStorage에 가려지는 문제가 있어 vitest에 `--no-experimental-webstorage`를 넣었다 (`front/vite.config.ts`).
- 브라우저 패널에서는 MSW service worker가 등록되지 않는다. 화면 확인은 Go API(`VITE_USE_MOCK=false`)로 하거나 일반 브라우저에서 한다.
- 로컬 docker가 꺼져 있으면 계약 검사는 로컬 mongod(27017)의 별도 DB `portfolio_contract`로 했다(`MONGO_DB=portfolio_contract`).
- Go는 go.mod 기준 1.26이다. 로컬 1.24에서는 `GOTOOLCHAIN=auto`가 1.26을 자동으로 받는다.
