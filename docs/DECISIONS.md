# DECISIONS

> 중요한 설계 결정을 최신순으로 쌓는다. 형식: `## YYYY-MM-DD 제목` → 결정 / 이유 / 대안(버린 것). 뒤집을 때는 지우지 말고 새 항목에서 "대체: <이전 제목>"으로 연결한다.

## 2026-11-23 학력에 초·중·고 공개, 이력서 화면 추가
- 결정: `educations`에 `kind: "school"`(초·중·고 4건)을 더하고 학력 탭 더보기로 초등학교까지 보인다(사용자 결정). 이력서는 검색 탭에 넣지 않고 인물정보 카드 `이력서 보기 →`(`/search?tab=resume`)로만 들어가며, 오른쪽 사이드 없이 문서만 보인다. 내용은 원본 v16 이력서(`resume/wip/resume/resume_v16`)를 전화번호·증명사진만 빼고 그대로 옮긴 고정 컴포넌트다(거주지 "서울특별시 관악구"도 원본대로 공개, 사용자 확인). 인물정보 요약의 경력은 상세 기록(responsibilities)이 있는 주요 경력만 `careers.summaryLine`(회사 + 직무 한 줄, 비면 company + role)으로, 자격은 order 앞 2개(웹디자인기능사·운전면허)만 보인다.
- 대체: 2026-11-23 디자인 시안 계획의 "초·중학교 기록 공개 제외".
- 이유: 학력 흐름(군산 → 필리핀 유학)을 한눈에 보여 주려는 사용자 요청. 이력서는 제출용 문서와 문구가 같아야 해서 이력 컬렉션으로 조합하지 않고 원본을 옮긴다.
- 대안: 이력서 탭으로 노출(사용자가 빼기로 함), 이력 컬렉션으로 이력서 조합(원본 문구와 어긋남), mockup 컬렉션 + API(관리자 편집이 필요해지면 전환).

## 2026-11-23 통합검색형 정보 구조: 고정 탭 6개 + 이력 컬렉션 분리
- 결정: 검색결과 탭을 전체/경력/기술/학력/자격·수상/프로젝트로 고정 UI로 두고, `categories`는 프로젝트 구분(edu·personal·archive)으로 의미를 바꾼다. 이력은 `careers`·`skills`·`educations`·`credentials` 컬렉션으로 나누고 관계는 id 배열로 둔다. Go는 같은 모양의 목록 API 4개를 제네릭 `ListRepo[T]`·`ListService[T]`·`handler.List[T]`로 처리한다. 프로젝트 상세 본문은 원본 프로젝트 문서(md)를 그대로 옮기고 표 렌더를 위해 `remark-gfm`을 쓴다.
- 이유: 탭마다 데이터 모양이 달라 프로젝트 카테고리로 표현할 수 없다. 컬렉션을 나눠 두면 관리자 편집·API 전환 때 그대로 쓴다. 원본 md를 옮기면 내용이 자료와 어긋나지 않는다.
- 대안: profile 문서에 배열로 넣기(관리·관계 표현이 어려움), 직무 렌즈(이번 범위에서 제외), 컬렉션마다 handler·service·repo 복제(반복 코드).
- 대체: `refactor/category-ids` 브랜치의 카테고리 id 변경(career·project·skills·education·etc)은 merge하지 않는다.

## 2026-11-03 첫 공개 배포는 GitHub Pages + MSW 목업
- 결정: 프론트만 GitHub Actions로 빌드해 GitHub Pages(`/portfolio/` 하위 경로)에 올리고, API는 브라우저의 MSW가 mockup JSON으로 응답한다. 하위 경로는 `VITE_BASE_PATH` 하나로 맞추고 기본값은 `/`로 둔다.
- 이유: 저장소가 public이라 추가 비용·계정 없이 바로 공개 URL을 얻는다. 백엔드·DB 호스팅을 정하기 전에도 포트폴리오를 보여 줄 수 있다.
- 제약: Pages는 정적 호스팅이라 Go API·MongoDB는 올릴 수 없고, 딥링크 첫 응답은 404 상태코드다(404.html 방식). 로그인·통계는 localStorage mock이다.
- 대안: Vercel(계정 연동 필요, `vercel.json`은 남겨 둔다), HashRouter(URL에 `#`이 붙어 sitemap·공유 링크가 어색함).

## 2026-10-22 GitHub 워크플로: hook 알림 + 스킬 + devflow.py, merge는 항상 사용자 승인
- 결정: 계획 승인 → (PostToolUse hook이 보관하고 Workflow 블록이 있으면 additionalContext로 알림) → `dev-start`(Issue·브랜치) → `/dev-finish`(검증·커밋·PR·CI) → `/dev-merge`(승인 후 squash). GitHub 조작과 중복 방지 로직은 `scripts/devflow.py` 하나에 모으고, 상태는 GitHub·git·`docs/plans/<id>/meta.json`에서 다시 읽는다.
- 이유: Claude Code가 공식으로 지원하는 승인 후 자동 실행 수단은 PostToolUse hook뿐이다. hook에서 바로 Issue를 만들면 계획을 해석할 수 없고 실패를 복구하기 어렵다. 원격을 바꾸는 단계는 명시적으로 호출하는 스킬(`disable-model-invocation`)과 권한 `ask` 규칙으로 막는다.
- 제약: private + Free 플랜이라 Rulesets와 Branch protection을 쓸 수 없다(403) → 로컬 가드(권한 deny·ask, merge-check)로 대체하고, Auto-merge는 쓰지 않는다.
- 대안: hook에서 gh 직접 호출(모든 계획에 Issue 강제), GitHub Actions 봇(외부 상태·권한 관리 부담), 저장소 public 전환(개인정보 공개).

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
