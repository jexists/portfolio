@AGENTS.md

## Claude 전용

### 개발 계획 형식 (Plan Mode)
기능 개발 계획에는 Context(배경·목표), 관련 코드·현재 구조, 범위 / 제외 범위, 단계, 영향 파일, 위험·호환성, 테스트, Acceptance Criteria를 넣고 **맨 끝에** 다음 블록을 둔다. 질문이나 분석만 하는 경우에는 넣지 않는다.
```
## Workflow
- type: feat            # feat|fix|refactor|docs|chore|test
- issue: new            # new | #번호(재사용) | none(사소한 작업)
- title: feat: 기능 설명
- slug: short-name
```
승인되면 hook이 계획을 보관하고 "dev-start를 실행하라"는 알림을 준다. 알림을 받으면 **코드를 고치기 전에** `dev-start`를 실행한다.

### 기타
- 스킬: `/dev-start`, `/dev-finish`, `/dev-status`, `/dev-merge`, `/session-start`, `/session-wrapup`, `/plan-report` (원본은 `.agents/skills/`, Codex와 공유)
- Plan Mode에서 승인된 계획은 hook이 `docs/plans/<id>/plan.md`로 자동 보관한다 (`.claude/hooks/archive_plan.py`). 실패 경고가 보이면 사용자에게 알린다.
- 개인 메모는 `CLAUDE.local.md`(gitignore)에 둔다.
