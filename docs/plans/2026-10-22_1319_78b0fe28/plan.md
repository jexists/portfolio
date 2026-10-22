# GitHub 연동 개발 워크플로우 (Plan → Issue → Branch → PR → CI → Merge)

## Context
Claude Code로 기능을 개발할 때 Plan 승인부터 Issue, Branch, Commit, PR, CI, Merge, Issue 종료까지를 매번 같은 방식으로, 안전하게(중복 생성·무단 Merge 없이) 반복하고 싶다. 결과물은 문서가 아니라 실제로 쓰는 설정·템플릿·스킬·스크립트다.

## 1. 사전 분석 결과
| 항목 | 상태 |
|---|---|
| 저장소 | `jexists/portfolio` **private**, 기본 브랜치 `main`(API 확인), 권한 ADMIN |
| 브랜치 | 현재 `chore/init-setup` = `origin/chore/init-setup`(초기 설정 커밋 5개, main 미병합), 작업 트리 깨끗함 |
| gh | 2.88.1, `jexists` 로그인, scope `repo, workflow, read:org, gist` |
| 보호 규칙 | Rulesets·Branch protection 조회 시 **403**(Free 플랜 private은 불가) → **로컬 가드로 대체**(사용자 선택) |
| Merge 설정 | merge·squash·rebase 모두 허용, 기본값 MERGE, `delete_branch_on_merge=false`, `allow_auto_merge=false`, squash 제목=PR_TITLE |
| Issue/PR | 0건. Label은 GitHub 기본 9종(bug, enhancement, documentation 등) |
| `.github/` | 없음 → 템플릿·CI를 새로 만든다. Actions 허용(all) |
| 기존 AI 설정 | AGENTS.md(Git 규칙: 한국어 Conventional Commits, main 직접 커밋 금지, 커밋·push는 요청 시) / CLAUDE.md(import) / 스킬 session-start·session-wrapup·plan-report(`.agents/skills` 원본 + `.claude/skills` 심볼릭 링크) / hook `archive_plan.py`(PostToolUse ExitPlanMode → `docs/plans/<id>/`, `meta.git.base_commit` 기록) |
| 검증 명령 | front: `npm ci`, `npm run lint`, `npm test`, `npm run build`(tsc 타입 검사 포함) / back: `make lint`(gofmt + vet), `make test`, `make build`. Node 로컬 26, Go 1.26(go.mod) |
| Actions 최신 | checkout v7, setup-node v7, setup-go v7 |

### Claude Code 공식 기능 확인
- Plan 승인 시점에 외부 명령을 실행하는 공식 수단은 **PostToolUse hook(matcher `ExitPlanMode`)**이다. 이미 쓰고 있다. 이 hook은 승인 후에만 실행되고, `hookSpecificOutput.additionalContext`로 Claude에게 다음 할 일을 전달할 수 있다(공식 문서 "Add context for Claude").
- hook 안에서 바로 `gh issue create`를 실행하는 방식은 **채택하지 않는다**. hook은 계획을 해석할 수 없고, 모든 작업에 Issue를 강제하게 되며, 실패를 복구하기 어렵다.
- 대신 hook은 **보관 + 알림**만 한다. 계획에 `## Workflow` 블록이 있으면 additionalContext로 "코드 수정 전에 dev-start를 실행하라"고 전달하고, Claude가 같은 턴에 `dev-start` 스킬로 Issue와 Branch를 준비한다. 계획 승인 자체가 그 원격 작업에 대한 승인이다(Workflow 블록에 명시).
- 커스텀 commands는 skills로 통합됐다(`/name`). 원격 상태를 바꾸는 스킬에는 `disable-model-invocation: true`를 붙여 **명시적으로 호출할 때만** 실행한다. Codex에는 `agents/openai.yaml`의 `allow_implicit_invocation: false`를 쓴다.

## 2. 구성 (최소 변경)
```
.github/
  ISSUE_TEMPLATE/feature.yml     # Issue Form: Background, Objective(필수), Scope, Out of Scope, Acceptance Criteria(필수), Technical Notes, References → label enhancement, 제목 "feat: "
  ISSUE_TEMPLATE/bug.yml         # 현상(필수), 재현 절차(필수), 기대 동작, 환경 → label bug, 제목 "fix: "
  pull_request_template.md       # Summary / Changes / Testing(Lint·Tests·Build + 명령·결과) / Risks·Impact / Related Issue
  workflows/ci.yml               # PR(모든 브랜치)·main push: job "front"(npm ci·lint·test·build, Node 24 LTS), job "back"(setup-go go.mod·make lint·make test·go build). permissions read, concurrency로 이전 실행 취소
scripts/devflow.py               # gh·git 래퍼(표준 라이브러리). 멱등·중복 방지 로직을 한 곳에 모음
scripts/test_devflow.py          # unittest (gh·git 실행기를 fake로 주입)
.agents/skills/dev-start|dev-finish|dev-status|dev-merge/   (+ agents/openai.yaml) → .claude/skills 심볼릭 링크
.claude/hooks/archive_plan.py    # (수정) Workflow 블록이 있으면 additionalContext 추가
.claude/settings.json            # (수정) 권한 규칙 추가
docs/WORKFLOW.md                 # 흐름, 명령, 예외 대응, GitHub 설정 안내 (명시적으로 읽는 문서)
AGENTS.md, CLAUDE.md, docs/{ARCHITECTURE,DECISIONS,PROGRESS}.md   # (수정) 짧은 규칙과 링크만 추가
```
`/dev-plan`은 만들지 않는다. 내장 Plan Mode가 그 역할을 하고, 계획 형식은 CLAUDE.md에 규칙으로 둔다.

### 계획 형식 (CLAUDE.md에 추가)
기능 개발 계획에는 다음 절을 포함한다: Context(배경·목표), 관련 코드·현재 구조, 범위/제외 범위, 단계, 영향 파일, 위험·호환성, 테스트, Acceptance Criteria, 그리고 마지막에
```
## Workflow
- type: feat            # feat|fix|refactor|docs|chore|test
- issue: new            # new | #번호(재사용) | none(사소한 작업: Branch + PR만)
- title: feat: 이메일 로그인
- slug: email-login
```
질문과 분석 요청, Workflow 블록이 없는 계획은 개발 실행으로 취급하지 않는다(hook이 알림을 보내지 않음).

### scripts/devflow.py 하위 명령
| 명령 | 동작 | 원격 변경 |
|---|---|---|
| `context [--json]` | 기본 브랜치(gh API), 현재 브랜치, 미커밋 파일, ahead/behind, 브랜치 이름의 issue 번호, 열린 PR, 체크 상태, gh 인증 | 없음 |
| `issue-ensure --title --body-file [--label]... [--plan-id]` | ① 본문 마커 `<!-- plan-id: … -->`로 찾기 ② 같은 제목의 열린 Issue 찾기 → 있으면 재사용. 없으면 생성. 존재하는 label만 붙인다(없거나 권한이 없으면 label 없이 생성). **생성 실패 시 재시도하지 않고** 다시 조회해 실제로 생성됐는지 확인한 뒤 보고 | Issue 생성 |
| `branch-ensure --type --slug [--issue N]` | 이름 `<type>/<N>-<slug>`(issue 없으면 `<type>/<slug>`), 정규식 검증. 미커밋 변경이 있으면 **중단**(삭제·stash 안 함). 로컬에 있으면 switch → 원격에 있으면 추적 switch → 없으면 `gh issue develop N --name … --base <기본> --checkout`(issue 없으면 `git switch -c … origin/<기본>`) | 브랜치 생성(issue 연결) |
| `pr-ensure --title --body-file [--draft] [--update]` | 본문 필수 절 검사. 같은 head의 열린 PR이 있으면 재사용(`--update`일 때만 본문 갱신). 이미 merge된 PR이 있으면 중단. 없으면 `git push -u` 후 `gh pr create --base <기본>` | push, PR 생성 |
| `merge-check <PR>` | OPEN, draft 아님, mergeable, base=기본 브랜치, 모든 체크 성공(체크가 0개면 실패. `--allow-no-checks`는 명시할 때만), head SHA 출력 | 없음 |
| `merge <PR> --sha <SHA> [--allow-no-checks]` | merge-check를 다시 통과해야 `gh pr merge --squash --delete-branch --match-head-commit SHA` 실행. 이후 연결된 Issue가 닫혔는지 확인 | Merge |
상태는 GitHub(Issue·PR·브랜치 연결)와 git에서 매번 다시 조회한다. 별도 상태 파일은 두지 않는다. 계획 연결은 기존 `docs/plans/<id>/meta.json`에 `issue`, `branch`, `pr` 필드를 추가하는 것으로 한다.

### 스킬
| 스킬 | 호출 | 하는 일 |
|---|---|---|
| `dev-start` | 계획 승인 후 hook 알림으로 Claude가 자동 실행, 또는 `/dev-start` | 승인된 plan.md의 Workflow 블록과 본문으로 Issue 본문(지정 형식) 작성 → `issue-ensure` → `branch-ensure` → meta.json에 issue·branch 기록 → 번호와 URL 보고 |
| `dev-finish` | `/dev-finish`만 (명시 호출) | 바뀐 영역의 lint·test·build를 실제로 실행 → plan과 diff 대조 → 비밀값 검사 → 논리 단위로 **파일을 지정해** 커밋(한국어 Conventional Commits, `git add .` 금지, amend·force 금지) → `plan-report`로 result.md 작성 → PR 본문 작성(검증 실패나 미완성이면 Draft, 일부만 구현했으면 `Refs #N`) → `pr-ensure` → CI watch → 결과 요약 |
| `dev-status` | `/dev-status` 또는 "지금 상태" 질문 시 | `devflow context` 결과 요약 (읽기 전용) |
| `dev-merge` | `/dev-merge [PR]`만 | `merge-check` → PR 변경 요약과 CI 결과 제시 → **AskUserQuestion으로 승인** → `merge` → Issue 종료 확인 → `main`으로 돌아가 `pull --ff-only`, 로컬 작업 브랜치 삭제(merge된 경우만) |
`session-start`, `session-wrapup`은 그대로 두고, 진행 중인 PR이나 Issue가 있으면 `dev-status`를 쓰도록 한 줄만 추가한다.

### 로컬 가드 (`.claude/settings.json`)
- `ask`(항상 확인): `Bash(gh pr merge:*)`, `Bash(python3 scripts/devflow.py merge:*)`, `Bash(gh repo edit:*)`, `Bash(gh api -X PATCH:*)`
- `deny`: `Bash(git push origin main:*)`, `Bash(git push origin HEAD:main:*)`, `Bash(git push -u origin main:*)` (기존 force push deny는 유지)
- `allow`(읽기 전용): `Bash(python3 scripts/devflow.py context:*)`, `Bash(python3 scripts/devflow.py merge-check:*)`, `Bash(gh pr view:*)`, `Bash(gh pr checks:*)`, `Bash(gh pr list:*)`, `Bash(gh issue view:*)`, `Bash(gh issue list:*)`, `Bash(gh run view:*)`
- Auto-merge는 켜지 않는다. 켜는 방법(저장소 설정 + `gh pr merge --auto --squash`)과 필요한 전제(필수 체크는 Rulesets가 있어야 함)는 WORKFLOW.md에만 적는다.

## 3. 실행 순서
1. **로컬 구현**: `chore/init-setup`에서 임시 로컬 브랜치 `wip/dev-workflow`를 만들어 위 파일을 구현하고 커밋한다(push 안 함).
   - scripts·hook 단위 테스트, 템플릿·CI YAML 검증, 스킬 frontmatter 검증, `devflow context`/`merge-check` 실제 실행(읽기 전용)
2. **[승인 1] init-setup PR**: `/dev-finish`의 PR 부분을 `chore/init-setup`에 적용(Issue 없는 경로). PR #?(→ main) 생성. 이 브랜치에는 아직 CI가 없으므로 로컬 검증 결과만 본문에 적는다. → **[승인 2] squash merge**(`--allow-no-checks`, 사용자 확인).
3. **첫 실사용 (dogfooding)**: 이 계획의 Workflow 블록대로 `dev-start` → Issue 생성 → `gh issue develop`로 `chore/<N>-dev-workflow` 생성(main 기준). `wip/dev-workflow` 커밋을 main 위로 rebase한 뒤(로컬·미push라 안전) 이 브랜치로 fast-forward한다.
4. `/dev-finish` → push, PR(`Closes #N`) 생성 → **CI 실제 실행 확인**.
5. **[승인 3] merge**: `/dev-merge` → squash merge → Issue 자동 종료 확인 → 로컬 정리, `wip/dev-workflow` 삭제.
6. **[승인 4, 별도] 저장소 설정**: 기본 merge 방식 squash, merge 후 브랜치 자동 삭제(`delete_branch_on_merge=true`). merge commit·rebase를 끌지는 그때 묻는다. 거절해도 워크플로우는 동작한다(스크립트가 `--squash --delete-branch`를 명시).
각 [승인] 지점에서는 AskUserQuestion으로 변경 내용과 영향을 설명한 뒤 진행한다. 거절하면 그 지점에서 멈추고 복구 방법을 안내한다.

## 4. 검증
- `python3 -m unittest scripts/test_devflow.py`: 브랜치 이름 생성·검증, Issue 재사용(마커·제목), 생성 실패 후 재조회(중복 없음), label 필터링, 미커밋 변경 시 중단, 기존 브랜치 재사용, 열린 PR 재사용, merge된 PR이면 중단, merge-check 거부 조건(draft, 체크 실패, 체크 0개, SHA 불일치), PR/Issue 본문 필수 절 검사
- hook 테스트: Workflow 블록이 있으면 additionalContext가 나오고, 없으면 나오지 않음(기존 11개 + 추가). 실제 승인 이벤트는 이 계획 승인으로 보관 동작, 3단계에서 알림 동작 확인
- YAML: Issue Forms·CI를 파서로 구문 검사하고, `actionlint`(go run으로 일회 실행)로 workflow 검사. Issue Form은 원격 반영 후 `gh api .../contents`와 웹 "New issue" 화면으로 확인
- 스킬: frontmatter 파싱, `/skills` 목록에 4개가 보이는지 확인. JSON 설정은 `python3 -m json.tool`로 검사
- 기존 흐름 영향 없음: front `npm test`/`lint`/`build`, back `make test`/`make lint` 그대로 통과
- 원격: 2~5단계에서 실제 PR·CI·merge·Issue 종료를 확인한다(각 승인 후). 실행하지 못한 항목은 최종 보고에 따로 적는다.

## Workflow
- type: chore
- issue: new
- title: chore: GitHub 연동 개발 워크플로우 구축
- slug: dev-workflow
