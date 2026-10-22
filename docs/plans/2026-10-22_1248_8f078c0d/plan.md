# 초기 설정 커밋 (+ Plan 자동 보관 hook 실제 이벤트 테스트)

## Context
모노레포 초기 설정(hook, AI 환경, Git, mockup, front, back)의 구현과 검증이 끝났고, 브랜치 `chore/init-setup`에 커밋만 남았다.
이 계획을 승인하면 PostToolUse(ExitPlanMode) hook이 실제 이벤트로 실행되어 `docs/plans/`에 이 문서가 보관되는지도 함께 확인한다.

## 단계
1. 승인 직후: `docs/plans/<새 id>/plan.md`가 생겼는지, 이 파일(`~/.claude/plans/merry-floating-hellman.md`)과 `cmp`로 같은지, `meta.json`의 `tool_use_id`가 실제 값(`toolu_...`)인지 확인한다.
2. 다음 순서로 커밋한다(push 안 함).
   1. `chore(ai): 승인된 Plan 자동 보관 hook 추가` — `.claude/hooks/`, `.claude/settings.json`, `docs/plans/`
   2. `chore(ai): Claude·Codex 공용 AI 환경과 Git 설정 추가` — `.gitignore`, `.gitattributes`, `AGENTS.md`, `CLAUDE.md`, `.agents/`, `.claude/skills/`, `docs/{ARCHITECTURE,DECISIONS,PROGRESS,PRD}.md`, `README.md`
   3. `chore(mockup): 컬렉션별 목업 데이터와 로컬 Mongo 구성 추가` — `mockup/`, `docker-compose.yml`, `design/`, `reference/`
   4. `chore(front): feature 기반 프론트 골격과 기존 화면 이식` — `front/`
   5. `chore(back): Gin 기반 백엔드 골격과 시드 명령 추가` — `back/`
3. `git log --oneline`과 `git status`로 결과를 확인한다.

## 검증
- hook 저장 결과(위 1번)와 `git status`가 깨끗한지 확인한다.
