# PROGRESS

> 세션 시작 때 이 문서부터 읽는다. 세션 종료 때 `session-wrapup` 스킬로 갱신한다.
> 마지막 갱신: 2026-10-22

## 현재 상태
- 브랜치 `chore/init-setup`: 모노레포 초기 설정을 마쳤다(커밋 완료, push 안 함). PR과 merge는 사용자 확인 후 진행한다.
- 프론트는 MSW 목업으로 전 화면이 동작한다. Go API는 조회 6종(profile, categories, projects, project, tags, series)과 health를 제공하며, 프론트 계약 테스트를 통과한다.
- 인증(소셜 로그인)과 방문 통계는 프론트 localStorage mock만 있다. 백엔드는 파일 골격만 있다.

## 완료
- 2026-10-22 승인된 Plan 자동 보관 hook (`.claude/hooks/archive_plan.py`, `docs/plans/`) — 계획: `docs/plans/2026-10-22_1216_36330f55`
- 2026-10-22 AI 공용 환경: AGENTS.md(원본) + CLAUDE.md(import), front/back 영역 지침, 공용 스킬 3종(session-start, session-wrapup, plan-report)
- 2026-10-22 Git 기본 설정: .gitignore, .gitattributes, 커밋·브랜치 규칙(AGENTS.md)
- 2026-10-22 mockup 컬렉션 5종(profiles, projects, categories, users, visits), docker-compose(MongoDB 7)
- 2026-10-22 front: portfolio_2026을 feature 구조로 이식하고 axios + React Query + MSW로 전환, 계약 테스트 이식
- 2026-10-22 back: Gin 골격(cmd/server, cmd/seed, internal 계층), 조회 API, 단위 테스트

## 진행 중
- 없음

## 다음 할 일
1. `chore/init-setup` 브랜치를 push하고 PR을 만들지 결정한다 (사용자 확인).
2. 새 세션에서 AI 설정을 확인한다: Claude `/context`(CLAUDE.md + AGENTS.md 로드)와 `/skills`(심볼릭 링크 스킬 인식), Codex `/skills`. 인식되지 않으면 docs/plans 결과 문서의 대안을 적용한다.
3. 인증 방식을 결정한다 (Kakao/GitHub OAuth + 세션/JWT) → DECISIONS에 기록하고 `back/internal/{service,handler,middleware}/auth.go`를 구현한다.
4. 방문 통계 API(`visits`, `users.purpose`)를 만들고 프론트 `features/admin/api/stats.api.ts` 구현체를 API로 바꾼다.
5. 번들 크기 경고(index 약 620kB)를 줄인다: 라우트 단위 `lazy()` 분할.

## 메모
- Node 26 환경에서 jsdom localStorage가 Node 내장 localStorage에 가려지는 문제가 있어 vitest에 `--no-experimental-webstorage`를 넣었다 (`front/vite.config.ts`).
- Go는 go.mod 기준 1.26이다. 로컬 1.24에서는 `GOTOOLCHAIN=auto`가 1.26을 자동으로 받는다.
