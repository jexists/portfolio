# PROGRESS

> 세션 시작 때 이 문서부터 읽는다. 세션 종료 때 `session-wrapup` 스킬로 갱신한다.
> 마지막 갱신: 2026-10-22 (워크플로우 구축)

## 현재 상태
- main: 초기 설정 merge 완료 (PR #1).
- 진행 중: Issue #2 GitHub 연동 개발 워크플로우 → 브랜치 `chore/2-dev-workflow`, PR에서 CI 확인 후 사용자 승인을 받아 merge한다.
- 인증(소셜 로그인)과 방문 통계는 아직 프론트 localStorage mock이다.

## 완료
- 2026-10-22 개발 워크플로우 구현: Issue Forms·PR 템플릿·CI, `scripts/devflow.py`, 스킬 dev-start/finish/status/merge, Plan hook 알림 (Issue #2, 계획 `docs/plans/2026-10-22_1319_78b0fe28`)
- 2026-10-22 모노레포 초기 설정 merge (PR #1): front·back·mockup, AI 공용 환경, Plan 자동 보관 hook

## 진행 중
- Issue #2 PR: CI 통과 → `/dev-merge` (사용자 승인) → Issue 자동 종료 확인
- 저장소 설정 변경 제안(squash 기본값, merge 후 브랜치 자동 삭제): 사용자 승인 대기

## 다음 할 일
1. 다음 기능 계획을 승인할 때 hook 알림 → dev-start 자동 실행이 실제로 동작하는지 확인한다(이번에는 기능 추가 전에 승인돼서 수동으로 실행했다).
2. 인증 방식을 결정한다 (Kakao/GitHub OAuth + 세션/JWT) → DECISIONS에 기록하고 `back/internal/{service,handler,middleware}/auth.go`를 구현한다.
3. 방문 통계 API(`visits`, `users.purpose`)를 만들고 프론트 `features/admin/api/stats.api.ts` 구현체를 API로 바꾼다.
4. 번들 크기 경고(index 약 620kB)를 줄인다: 라우트 단위 `lazy()` 분할.
5. Codex에서 `/skills`로 스킬 7개가 인식되는지 확인한다(Claude 전용 frontmatter 키가 섞여 있다).

## 메모
- Node 26 환경에서 jsdom localStorage가 Node 내장 localStorage에 가려지는 문제가 있어 vitest에 `--no-experimental-webstorage`를 넣었다 (`front/vite.config.ts`).
- Go는 go.mod 기준 1.26이다. 로컬 1.24에서는 `GOTOOLCHAIN=auto`가 1.26을 자동으로 받는다.
