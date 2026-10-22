# 포트폴리오 모노레포 초기 설정: 폴더 구조 + front/back 골격 + AI(Claude·Codex) + Git

## Context
`/Volumes/Jexists/resume/portfolio`는 `README.md`만 있는 빈 repo다(`main` = `origin/main`, 커밋 1개). 이걸 React(front) + Go/Gin(back) + MongoDB 포트폴리오로 시작한다.
진행 순서는 ① 컬렉션별 목업 JSON으로 프론트 완성 → ② 같은 JSON을 Mongo에 시드 → ③ Go API 개발 → ④ 프론트를 MSW에서 실제 API로 전환이다.
이번 작업은 **기본 설정 전부**를 한 번에 만든다: 루트 폴더, front/back 골격(사용자가 확정한 트리), mockup 스키마, Claude·Codex 공용 AI 설정, Git 설정.
프론트 디자인과 코드는 `jexists/portfolio_2026`(Vite+React19+TS, SCSS Modules, react-router v7, Vitest)에서 가져온다.

## 1. 환경 분석 (조사 결과)
- 기존 AI 설정은 프로젝트에 하나도 없어서 충돌할 파일이 없다. 전역에는 `~/.codex/AGENTS.md`(비어 있음), `~/.agents/skills/`(superpowers 11개), claude-mem 플러그인이 있다.
- Claude Code **2.1.202**: `CLAUDE.md`를 자동으로 읽는다. `AGENTS.md`를 직접 읽는 기능은 v2.1.277부터라서 지금은 `@AGENTS.md` import가 필요하다. `.agents/`는 읽지 않는다. `.claude/rules/`는 Claude만 읽는다.
- Codex **0.145.0**: `AGENTS.md`를 cwd에서 repo 루트까지 자동으로 읽는다. 스킬은 `.agents/skills/<이름>/SKILL.md`(name과 description 필수)에서 찾는다.
- SKILL.md 형식이 두 도구에서 같으므로 원본은 `.agents/skills`에 두고 `.claude/skills`에서 symlink로 연결한다.
- claude-mem은 Claude만 볼 수 있으므로 두 AI가 함께 보는 진행 상태는 `docs/PROGRESS.md`에 둔다.

## 2. 전체 구조
```
portfolio/
├── AGENTS.md                 # [자동: Codex] 공통 지침 원본
├── CLAUDE.md                 # [자동: Claude] @AGENTS.md + Claude 전용
├── .agents/skills/           # [Codex] session-start/, session-wrapup/  ← 원본
├── .claude/
│   ├── settings.json         # 권한 allow/deny만 (hooks·agents 없음)
│   └── skills/               # session-start, session-wrapup → .agents/skills symlink
├── docs/                     # [명시적으로 읽음] ARCHITECTURE.md, PROGRESS.md, DECISIONS.md, PRD.md
├── front/                    # React (아래 트리)
├── back/                     # Go (아래 트리)
├── mockup/                   # 컬렉션별 JSON = Mongo 시드 = API 응답 계약
├── design/                   # 시안, Figma export, 스크린샷
├── reference/                # 참고 자료 (큰 파일은 gitignore)
├── docker-compose.yml        # 로컬 mongo:7
├── .gitignore  .gitattributes  README.md
```
영역별 지침은 한 쌍으로 둔다: `front/AGENTS.md`(원본)와 `front/CLAUDE.md`(`@AGENTS.md` 한 줄). back도 같다. 이렇게 하면 두 AI가 같은 규칙을 읽는다. `.claude/rules/`는 Codex가 읽지 못해서 만들지 않는다.

### front/ (사용자 확정안)
```
front/
├── public/mockServiceWorker.js          # npx msw init public --save
├── src/
│   ├── app/          App.tsx, main.tsx, router.tsx, providers.tsx
│   ├── assets/       images/, icons/
│   ├── components/   ui/(Button, Chip, Modal), layout/(Header, Logo)
│   ├── features/
│   │   ├── intro/     components/, hooks/, pages/IntroPage.tsx
│   │   ├── projects/  api/projects.api.ts, components/(ProjectCard, CategoryTabs, SeriesNav),
│   │   │              hooks/useProjects.ts, pages/(SearchPage, ProjectDetailPage), types/project.types.ts
│   │   ├── profile/   api/, components/, hooks/, types/
│   │   ├── auth/      api/, components/, hooks/, pages/LoginPage.tsx, types/
│   │   └── admin/     api/, components/, hooks/, pages/AdminPage.tsx
│   ├── hooks/  lib/(axios.ts, queryClient.ts)  mocks/(handlers.ts, browser.ts)
│   ├── types/  utils/  styles/(global.scss, tokens.json)
│   └── test/setup.ts
├── .env.example      # VITE_API_BASE_URL, VITE_USE_MOCK (.env는 커밋하지 않음)
├── index.html, package.json, vite.config.ts, tsconfig*.json, eslint.config.js
├── AGENTS.md, CLAUDE.md
```
- 스타일과 테스트는 컴포넌트 옆에 둔다: `Button.tsx`, `Button.module.scss`, `Button.test.tsx`.
- 각 feature는 `index.ts`를 공개 API로 쓴다. 다른 feature를 쓸 때는 `@/features/profile`처럼 index만 import한다.
- `mocks/handlers.ts`는 vite alias `@mockup`(`../mockup`)으로 JSON을 읽어 `/api/v1/*`에 응답한다. `VITE_USE_MOCK=false`로 바꾸면 실제 API를 호출한다.

### back/ (사용자 확정안 + ★ 보완)
```
back/
├── cmd/server/main.go   cmd/seed/main.go         # seed: ../mockup/*.json → 컬렉션 upsert
├── internal/
│   ├── handler/     auth.go, project.go, profile.go, category.go
│   ├── service/     auth.go, project.go          # repo interface는 여기에 정의(테스트 시 mock 주입)
│   ├── repo/        user.go, project.go, profile.go, category.go, ★visit.go
│   ├── db/          mongo.go, ★indexes.go
│   ├── model/       user.go, project.go, profile.go, category.go, ★visit.go
│   ├── middleware/  auth.go, ★cors.go            # front(Vercel)와 도메인이 달라서 CORS 필요
│   ├── config/config.go
│   └── router/router.go                          # /api/v1/...
├── .env.example  .air.toml  Dockerfile  Makefile  go.mod  go.sum
├── AGENTS.md, CLAUDE.md
```
- auth: 기존 PRD는 Kakao/GitHub 소셜 로그인이라 비밀번호가 없다. 이번에는 파일 골격만 만들고, 인증 방식은 auth를 구현할 때 결정해서 DECISIONS.md에 남긴다.
- `.gitignore`는 루트 하나로 관리한다(back 전용 ignore 파일은 만들지 않는다).

### mockup/ (파일 1개 = 컬렉션 1개, JSON 배열)
`profiles.json`, `projects.json`(_id=slug, categoryId, tags[], series{name, order}, body=md 문자열…), `categories.json`, `users.json`, `visits.json`. 필드는 `docs/ARCHITECTURE.md`의 스키마 표에 적는다. portfolio_2026의 `content/*.md`를 1회 변환해서 채운다.

## 3. AI 설정 내용
- **AGENTS.md (루트, 100줄 이내)**: 프로젝트 소개, 스택, 폴더 지도, 세션 규칙(시작할 때 PROGRESS.md 읽기, 끝낼 때 wrapup), TDD, "mockup = 컬렉션 = API 계약" 원칙, 비밀값은 `.env`에만, Git 규칙(아래).
- **CLAUDE.md**: `@AGENTS.md` + Claude 전용 2~3줄(스킬 이름, CLAUDE.local.md 안내).
- **front/AGENTS.md**: 명령어(`npm run dev/test/build/lint`), 컴포넌트·feature 규칙, 토큰만 사용(하드코딩 금지), `prefers-reduced-motion`.
- **back/AGENTS.md**: 명령어(`make run/test/seed`, `go test ./...`), 계층 의존 방향(handler → service → repo), context timeout, 에러를 HTTP 코드로 매핑하는 규칙.
- **session-start skill**: 새 세션을 시작하거나 "이어서"라고 할 때 실행한다. PROGRESS·DECISIONS 최근 항목과 `git status -sb`, `git log --oneline -10`을 읽는다. 완료 기준: 브랜치, 커밋되지 않은 변경, 마지막 완료 작업, 다음 할 일 1~3개를 5줄 이내로 보고한다. 파일은 수정하지 않는다.
- **session-wrapup skill**: "마무리"나 "정리"라고 할 때 실행한다. `git diff --stat`을 확인하고 PROGRESS.md를 갱신하며, 결정이 있었으면 DECISIONS.md, 구조가 바뀌었으면 ARCHITECTURE.md도 갱신한다. 커밋 메시지는 제안만 한다. 완료 기준: 다음 할 일이 바로 시작할 수 있을 만큼 구체적이고, 문서에 비밀값이 없으며, 커밋·push는 하지 않았다.
- **docs/**: ARCHITECTURE.md(위 트리와 데이터 흐름, 배포 계획), DECISIONS.md(이번 대화의 결정: 스택, Gin, 컬렉션별 mockup, MSW, internal 계층, AGENTS 원본 + CLAUDE import), PROGRESS.md, PRD.md(portfolio_2026에서 옮기고 Supabase 언급을 Go+Mongo로 수정).
- **.claude/settings.json**: allow는 `git status/diff/log/branch`, `npm run *`, `go test/build/vet ./...`, `make *`, `docker compose *`. deny는 `Read(./**/.env)`, `Bash(git push --force*)`.

## 3-1. 승인된 Plan 자동 보관 (PostToolUse Hook)

### 조사 결과
- 플랫폼: macOS(darwin). Python은 `/usr/local/bin/python3` 3.14.7을 표준 라이브러리만으로 쓴다(외부 패키지 없음). `jq`도 있다.
- 공식 hooks 문서(ExitPlanMode 항목): PostToolUse 입력에서 `tool_response`가 `plan`(승인된 Markdown 원문)과 `filePath`를 갖는다. `tool_input`에도 `plan`과 `planFilePath`가 주입된다. 공통 필드는 `session_id`, `transcript_path`, `cwd`, `tool_use_id`, `duration_ms`다. PostToolUse는 **승인 후에만** 실행되고, 거부된 계획에는 실행되지 않는다. 승인 흐름을 막거나 바꾸지 않는다.
- 기존 Hook: 전역 `~/.claude/settings.json`에 Orca hook이 있다(PostToolUse `*` 포함). 프로젝트에는 `.claude/`가 없다. Hook 배열은 스코프별로 **합쳐지므로** 프로젝트에 matcher `ExitPlanMode` 항목을 추가해도 전역 설정을 덮어쓰지 않는다.
- 현재 CLI는 2.1.202이고 문서는 그보다 최신이다. 그래서 exec form(`args`) 대신 shell form을 쓰고, 입력 필드는 아래처럼 fallback 순서로 읽는다.

### 구성
```
.claude/settings.json
  "hooks": { "PostToolUse": [ { "matcher": "ExitPlanMode",
     "hooks": [ { "type": "command", "timeout": 15,
       "command": "python3 \"$CLAUDE_PROJECT_DIR/.claude/hooks/archive_plan.py\"" } ] } ] }
.claude/hooks/archive_plan.py        # 표준 라이브러리만 사용, 실패해도 항상 exit 0
.claude/hooks/test_archive_plan.py   # 합성 입력 단위 테스트 (unittest)
docs/plans/
  README.md                          # 폴더 규칙 설명
  2026-10-22_1530_a1b2c3d4/          # <승인 날짜>_<시분>_<plan sha256 앞 8자리>
    plan.md                          # 원문 그대로 (바이트 동일, 헤더도 추가하지 않음)
    meta.json                        # 1단계: hook이 생성
    result.md                        # 2단계: 구현 후 plan-report skill이 생성 (선택)
```

### 1단계: archive_plan.py 동작 (자동)
1. stdin JSON을 읽는다. 원문은 `tool_response.plan` → `tool_input.plan` → `tool_response.filePath` 또는 `tool_input.planFilePath` 파일 읽기 순서로 가져온다. 셋 다 없으면 실패로 처리한다.
2. `sha256(plan)`을 계산한다. **중복 방지**: `docs/plans/*/meta.json` 중 `tool_use_id`가 같거나(같은 이벤트가 두 번 온 경우), 같은 `session_id`에서 `sha256`이 같으면(같은 계획을 재승인한 경우) 저장하지 않고 조용히 종료한다. 다른 세션에서 같은 내용을 승인하면 별도 기록으로 저장한다.
3. 같은 세션에서 같은 원본 계획 파일의 이전 기록이 있으면 `previous` 필드로 연결한다(계획 수정 이력).
4. 임시 디렉터리에 쓴 뒤 `os.rename`으로 원자적으로 확정한다. 이미 있는 폴더는 절대 덮어쓰지 않고, 이름이 겹치면 `-2` 접미사를 붙인다.
5. `meta.json` 내용: `id`, `approved_at`(ISO, 로컬 TZ), `session_id`, `tool_use_id`, `source_plan_path`, `sha256`, `previous`, `git.branch`, `git.base_commit`(`git rev-parse HEAD`, 2단계에서 비교 기준), `git.dirty`, `status: "approved"`, `sensitive_findings`.
6. **민감 정보 검사**: 정규식으로 검사한다(AWS 키, `sk-`/`ghp_`/`github_pat_` 토큰, `-----BEGIN ... PRIVATE KEY`, `mongodb(+srv)://user:pass@`, `password|secret|api_key = 값`). 원문 보존이 원칙이라 **마스킹하지 않고 저장**하되, 걸린 줄 번호와 패턴 이름(값은 기록하지 않음)을 meta에 남기고 `systemMessage`로 "커밋 전에 docs/plans/<id>/plan.md를 확인하라"고 사용자에게 경고한다.
7. **실패 처리**: 모든 예외를 잡아 `.claude/hooks/logs/archive_plan.log`(gitignore)에 기록하고, `{"systemMessage": "⚠️ Plan 자동 보관 실패: <이유> (로그 경로)"}`를 출력한 뒤 exit 0으로 끝낸다. 성공하면 `systemMessage`로 "📁 Plan 보관: docs/plans/<id>/plan.md"를 한 줄 알린다. Claude 컨텍스트에는 아무것도 주입하지 않는다.
8. git 명령은 읽기 전용(`rev-parse`, `status --porcelain`)만 쓴다. commit과 push는 하지 않는다.

### 2단계: 구현 결과 연결 (수동 실행, 선택)
- `.agents/skills/plan-report/SKILL.md`(원본)와 `.claude/skills/plan-report`(symlink). Codex에서도 쓸 수 있다.
- 실행 조건: "계획 결과 정리", "plan report" 요청 또는 session-wrapup 중 `status: approved`인 계획이 있을 때 제안한다.
- 절차: 대상 plan 폴더(기본값은 최신 approved)의 `meta.git.base_commit`을 기준으로 `git log base..HEAD`, `git diff --stat base`(작업 트리 포함)를 확인한다. `result.md`에 ① 변경 파일 ② 주요 변경 이유 ③ 테스트·빌드 명령과 결과(실제로 실행한 출력 요약) ④ 계획 대비 달라진 부분(plan.md 단계별 대조: 완료, 변경, 미실행) ⑤ 관련 커밋 해시를 쓴다. meta의 `status`를 `implemented`로 바꾸고 `result_commits`를 기록한다.
- 완료 기준: result.md의 다섯 항목이 모두 채워져 있다. 테스트 결과는 실제 실행 출력에 근거한다. plan.md는 수정하지 않았다. 커밋은 하지 않았다.

### 첫 기록
이 계획(현재 승인 대기 중)은 hook을 설치하기 전에 승인되므로 자동 보관되지 않는다. 설치 직후 `~/.claude/plans/merry-floating-hellman.md`를 같은 스크립트에 합성 입력으로 넣어 `docs/plans/`의 첫 기록으로 남긴다.

## 4. Git 설정
- 브랜치: `main`에 직접 커밋하지 않는다. 작업은 `feat/*`, `fix/*`, `chore/*`, `docs/*` 브랜치에서 한다.
- 커밋: Conventional Commits + 한국어 `<type>(<scope>): <제목>`. type은 feat, fix, design, refactor, test, docs, chore, perf. scope는 front, back, mockup, docs, ai.
- 커밋 전 해당 영역 테스트·빌드를 통과시킨다. 커밋과 push는 지시가 있을 때만 하고, push 뒤에는 원격 브랜치에 반영됐는지 확인한다.
- `.gitignore`: `node_modules/`, `dist/`, `coverage/`, `.env`, `.env.*`, `!.env.example`, `back/bin/`, `back/tmp/`, `*.test`, `*.out`, `.DS_Store`, `.idea/`, `.vscode/*`, `!.vscode/extensions.json`, `CLAUDE.local.md`, `.claude/settings.local.json`, `.claude/hooks/logs/`, `reference/**/*.{pdf,zip,psd,mp4}`
- `.gitattributes`: `* text=auto eol=lf`, 이미지·pdf·psd는 binary.

## 5. 실행 순서 (승인 후, `chore/init-setup` 브랜치)
0. Plan 보관 hook: archive_plan.py와 테스트, settings.json hooks, docs/plans/README.md 작성 → 단위 테스트 → 이 계획을 첫 기록으로 보관 → **실제 이벤트 테스트**(아래 검증) → 커밋 `chore(ai): 승인된 Plan 자동 보관 hook 추가`
1. Git·AI 설정: .gitignore, .gitattributes, AGENTS.md, CLAUDE.md, skills + symlink, settings.json, docs 3종 → 커밋 `chore(ai): Claude·Codex 공용 AI 환경과 Git 설정 추가`
2. 루트 폴더와 mockup JSON, docker-compose.yml → 커밋 `chore(mockup): 컬렉션별 목업 데이터와 로컬 Mongo 구성 추가`
3. front: Vite+React+TS 생성, 의존성(react-router, axios, @tanstack/react-query, msw, sass, vitest, RTL) 설치, 위 트리 골격, portfolio_2026 코드를 feature 구조로 이식 → 커밋 `chore(front): feature 기반 프론트 골격과 기존 화면 이식`
4. back: `go mod init github.com/jexists/portfolio/back`, gin과 mongo-driver v2 설치, internal 골격, `/api/v1/health`, seed → 커밋 `chore(back): Gin 기반 백엔드 골격과 시드 명령 추가`
5. PROGRESS.md 갱신. push와 PR은 지시가 있을 때만 한다.

## 6. 검증
- Plan hook 단위 테스트(`python3 -m unittest .claude/hooks/test_archive_plan.py`)로 다음을 확인한다. ① 원문과 plan.md가 바이트 동일 ② 같은 tool_use_id를 두 번 넣으면 1개만 저장 ③ 같은 세션·같은 해시는 skip ④ 내용이 다르면 새 폴더 + previous 연결 ⑤ plan 필드 없음 또는 쓰기 불가 디렉터리면 systemMessage가 나오고 exit 0 ⑥ 가짜 키를 넣으면 sensitive_findings와 경고가 생김. 테스트는 임시 디렉터리에서만 쓴다.
- Plan hook 실제 테스트: settings 반영(`/hooks`로 등록 확인, 필요하면 세션 재시작) → 짧은 더미 계획으로 Plan Mode 진입 → **사용자가 직접 승인** → `docs/plans/<id>/plan.md`가 `~/.claude/plans/<원본>.md`와 `cmp`로 동일한지, 성공 systemMessage가 보이는지 확인. 한 번 거부해 보고 저장되지 않는 것도 확인. 더미 기록은 확인 후 사용자에게 지울지 묻는다.
- Claude: 새 세션의 `/context`에 CLAUDE.md와 AGENTS.md가 있고, `/skills`에 두 스킬이 보인다(symlink가 인식되지 않으면 "`.agents/skills/x/SKILL.md`를 따른다"는 래퍼로 교체).
- Codex: `/skills`에 두 스킬이 보이고, front 폴더에서 front/AGENTS.md 규칙대로 답한다.
- front: `npm test && npm run build`가 통과하고, `npm run dev`에서 인트로·검색·상세가 MSW 응답(`/api/v1/projects`)으로 렌더링된다.
- back: `docker compose up -d`, `make seed` 후 각 컬렉션 문서 수가 JSON 배열 길이와 같다. `curl localhost:8080/api/v1/health`가 200이고 `go test ./...`가 통과한다.
- `git check-ignore -v .env front/node_modules .DS_Store CLAUDE.local.md`가 모두 무시로 나오고, 문서·설정에 비밀값이 없다.
