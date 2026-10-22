@AGENTS.md

## Claude 전용
- 스킬: `/session-start`, `/session-wrapup`, `/plan-report` (원본은 `.agents/skills/`, Codex와 공유)
- Plan Mode에서 승인된 계획은 hook이 `docs/plans/<id>/plan.md`로 자동 보관한다 (`.claude/hooks/archive_plan.py`). 실패 경고가 보이면 사용자에게 알린다.
- 개인 메모는 `CLAUDE.local.md`(gitignore)에 둔다.
