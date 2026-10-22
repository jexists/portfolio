# DECISIONS

> 중요한 설계 결정을 최신순으로 쌓는다. 형식: `## YYYY-MM-DD 제목` → 결정 / 이유 / 대안(버린 것). 뒤집을 때는 지우지 말고 새 항목에서 "대체: <이전 제목>"으로 연결한다.

## 2026-10-22 승인된 Plan은 PostToolUse hook으로 docs/plans에 원문 보관
- 결정: `ExitPlanMode` PostToolUse hook(`.claude/hooks/archive_plan.py`)이 `docs/plans/<날짜>_<시분>_<sha8>/plan.md`(원문 그대로)와 `meta.json`을 만든다. 구현 결과(`result.md`)는 `plan-report` 스킬로 따로 작성한다.
- 이유: Plan 원문이 `~/.claude/plans`(프로젝트 밖)에만 남아 추적이 안 된다. 승인 후에만 실행되는 PostToolUse라 승인 흐름을 바꾸지 않는다.
- 대안: PreToolUse(승인 전이라 거부된 계획도 저장됨), Stop hook으로 결과 자동 요약(구현 범위를 자동으로 판단할 수 없음).

## 2026-10-22 AGENTS.md를 원본으로, CLAUDE.md는 import
- 결정: 공통 지침은 `AGENTS.md`(Codex 자동 인식)에만 쓰고, `CLAUDE.md`는 `@AGENTS.md` + Claude 전용 몇 줄로 둔다. 영역별 지침은 `front/`, `back/`에 같은 쌍으로 둔다. 스킬 원본은 `.agents/skills`, Claude는 심볼릭 링크로 읽는다.
- 이유: 두 AI가 같은 규칙을 읽게 하고 중복을 없앤다. 설치된 Claude Code(2.1.202)는 AGENTS.md를 직접 읽지 못한다(2.1.277부터 지원).
- 대안: `.claude/rules/`(Codex가 읽지 못함), 두 파일에 같은 내용 복사(어긋나기 쉬움).

## 2026-10-22 프론트는 MSW + axios + React Query, 화면 타입은 DTO와 분리
- 결정: 프론트는 처음부터 `/api/v1`을 호출하고, 개발 중에는 MSW가 mockup JSON으로 응답한다. API 문서(DTO, `_id`, `categoryId`, `series{}`)는 `features/*/api`에서 기존 화면 타입(`slug`, `category`, `series`, `seriesOrder`)으로 바꾼다.
- 이유: 백엔드로 바꿀 때 env만 바꾸면 된다. 기존 portfolio_2026 컴포넌트와 테스트를 그대로 살린다.
- 대안: ContentSource 추상화 유지(목업 → API 전환 때 구현체를 새로 써야 함), 화면 타입을 DTO에 맞춤(컴포넌트·테스트 수정 범위가 큼).

## 2026-10-22 목업은 컬렉션별 JSON 배열
- 결정: `mockup/<컬렉션>.json` = Mongo 컬렉션 = API 응답 모양. `_id`는 사람이 읽을 수 있는 키(slug 등)를 쓴다. 태그와 시리즈는 projects 안에 넣는다.
- 이유: 시드할 때 변환이 필요 없고(`cmd/seed`, `mongoimport --jsonArray` 모두 가능), 목업이 곧 API 계약이 된다.
- 대안: 마크다운 + frontmatter(글쓰기는 편하지만 시드할 때 변환해야 함), 파일 하나에 전체 데이터(컬렉션 경계가 흐려짐).

## 2026-10-22 back은 cmd/ + internal/ 계층 구조, Gin
- 결정: `cmd/server`, `cmd/seed` + `internal/{handler,service,repo,db,model,middleware,config,router}`. interface는 쓰는 쪽(service, handler)에 정의한다. 라우터는 Gin.
- 이유: go.dev "Organizing a Go module"의 서버 권장안(cmd + internal). 계층을 나누면 Mongo 없이 단위 테스트를 할 수 있다. Gin은 자료와 예제가 많다.
- 대안: 표준 net/http(의존성 최소), chi, Echo.

## 2026-10-22 스택: React + Go + MongoDB
- 결정: front는 Vite + React 19 + TS(portfolio_2026 이식), back은 Go, DB는 MongoDB(로컬 docker, 배포 Atlas).
- 이유: 콘텐츠(프로필, 프로젝트 = 메타 + 마크다운 + 배열)가 문서형이라 Mongo와 잘 맞는다. 본인이 실무에서 쓴 Go와 Mongo 역량을 보여 줄 수 있다.
- 대안: 정적 사이트 + Supabase(portfolio_2026의 원래 계획).
