# AGENTS.md — Portfolio (공통 AI 지침)

정주애(jexists)의 "검색엔진에서 정주애를 검색한다" 컨셉 포트폴리오. React(front) + Go/Gin(back) + MongoDB 모노레포.
Codex는 이 파일을 자동으로 읽고, Claude는 `CLAUDE.md`의 `@AGENTS.md` import로 읽는다. **공통 규칙은 이 파일에만 쓴다.**

## 세션 규칙
- 시작: `docs/PROGRESS.md`(현재 상태·다음 할 일)를 먼저 읽는다. 필요하면 `docs/DECISIONS.md`, `docs/ARCHITECTURE.md`를 읽는다. → skill `session-start`
- 종료: PROGRESS를 갱신하고, 설계 결정은 DECISIONS, 구조 변경은 ARCHITECTURE에 남긴다. → skill `session-wrapup`
- 승인된 계획과 구현 결과 기록: `docs/plans/` (→ skill `plan-report`)

## 폴더 지도 (상세: docs/ARCHITECTURE.md)
| 경로 | 내용 | 영역 지침 |
|---|---|---|
| `front/` | Vite + React 19 + TS, feature 기반 구조, MSW 목업 | `front/AGENTS.md` |
| `back/` | Go + Gin, `cmd/` + `internal/`(handler → service → repo) | `back/AGENTS.md` |
| `mockup/` | 컬렉션별 JSON = Mongo 시드 = API 응답 계약 | — |
| `docs/` | ARCHITECTURE, PROGRESS, DECISIONS, PRD, plans/ | — |
| `design/`, `reference/` | 시안·참고 자료 (코드가 읽지 않음) | — |

## 핵심 원칙
- **mockup = 컬렉션 = API 계약**: `mockup/<컬렉션>.json` 한 파일이 Mongo 컬렉션 하나이고, 그 문서 모양이 곧 API 응답이다. 필드를 바꿀 때는 mockup, `back/internal/model`, `front/src/features/*/types`를 함께 바꾼다.
- 프론트는 항상 실제 API 경로(`/api/v1/*`)를 호출한다. 백엔드가 없을 때는 MSW가 mockup으로 응답한다.
- 계약 테스트(`front/src/mocks/apiContract.ts`)는 MSW와 Go API가 모두 통과해야 한다.
- **TDD**: 요구사항(docs/PRD.md의 AC)에서 시작해 실패하는 테스트를 먼저 쓴다. 테스트 없는 기능 코드는 커밋하지 않는다.
- 비밀값(API 키, DB 비밀번호, 토큰)은 `.env`에만 둔다. 문서, 코드, 커밋 메시지, `docs/plans/`에 쓰지 않는다.
- UI 텍스트는 한국어. 코드 식별자는 영어.

## 명령어
```bash
docker compose up -d                 # 로컬 MongoDB
cd back && make seed                 # mockup → MongoDB
cd back && make run                  # API :8080  (make test / make lint)
cd front && npm run dev              # :5173, 기본 MSW 목업 (npm test / npm run lint / npm run build)
```

## Git 규칙
- `main`에 직접 커밋하지 않는다. 작업 브랜치: `feat/*`, `fix/*`, `chore/*`, `docs/*`, `refactor/*`
- 커밋 메시지: Conventional Commits + **한국어** `<type>(<scope>): <제목>`
  - type: `feat` `fix` `design`(UI/스타일) `refactor` `test` `docs` `chore` `perf`
  - scope: `front` `back` `mockup` `docs` `ai` (필요하면 `front/search`처럼 세분화)
  - 제목은 50자 이내, 명사형 종결("~추가", "~수정"), 마침표 없음. 본문은 무엇을·왜 바꿨는지 불릿으로
- 커밋 전 바뀐 영역의 테스트·린트·빌드를 통과시킨다.
- 서로 관계없는 변경은 한 커밋에 섞지 않는다.
- **커밋·push·PR은 사용자가 요청할 때만** 한다. force push 금지. push 후에는 `git log origin/<branch> -1`로 원격 반영을 확인한다.
