---
name: dev-start
description: 승인된 개발 계획(docs/plans/<id>/plan.md 의 "## Workflow" 블록)으로 GitHub Issue 를 재사용·생성하고 Issue 와 연결된 작업 브랜치를 준비한다. 계획 승인 직후 hook 알림을 받았을 때나 /dev-start 로 실행한다. 승인되지 않은 계획, 질문·분석 요청에는 실행하지 않는다.
argument-hint: "[docs/plans/<id>]"
---

# dev-start — 승인된 계획 → Issue → Branch

## 실행 조건
- 대상 계획: 인자로 받은 `docs/plans/<id>`. 없으면 이번 세션에서 가장 최근에 승인되어 보관된 계획(`meta.json`의 `status: approved`, `approved_at` 최신).
- 계획에 `## Workflow` 블록이 있어야 한다. 없으면 실행하지 않고 "개발 계획이 아니다"라고 알린다.
- Workflow 형식: `type`(feat|fix|refactor|docs|chore|test), `issue`(new | #번호 | none), `title`(`<type>: 설명`), `slug`(영문 소문자·하이픈).

## 절차
1. **사전 확인**: `python3 scripts/devflow.py context`. gh 인증이 실패하거나 미커밋 변경이 있으면 **멈추고** 사용자에게 알린다(파일을 지우거나 stash 하지 않는다).
2. **Issue** (`issue: none`이면 건너뛴다)
   - `issue: #번호` → `gh issue view <번호>`로 열려 있는지 확인하고 재사용한다.
   - `issue: new` → 계획 본문으로 아래 형식의 Issue 본문을 임시 파일(scratchpad)에 작성한다. 계획을 요약하되 바꾸지 않는다.
     ```md
     ## Background
     ## Objective
     ## Scope
     - 
     ## Out of Scope
     - 
     ## Acceptance Criteria
     - [ ] 
     ## Technical Notes
     ## References
     - 계획: docs/plans/<id>/plan.md
     ```
   - `python3 scripts/devflow.py issue-ensure --title "<title>" --body-file <파일> --plan-id <id> --label <label>`
     - label: feat → `enhancement`, fix → `bug`, docs → `documentation`. 없는 label은 스크립트가 자동으로 뺀다.
     - plan-id 마커와 제목으로 기존 Issue를 먼저 찾아 **재사용**한다. 생성이 실패해도 다시 시도하지 않는다. 스크립트가 실제 생성 여부를 다시 조회한 결과를 그대로 보고한다.
   - 작업이 독립적인 부분으로 확실히 나뉠 때만 Issue를 나눈다(기본은 1개).
3. **Branch**: `python3 scripts/devflow.py branch-ensure --type <type> --slug <slug> [--issue <번호>]`
   - 이름은 `<type>/<번호>-<slug>`(Issue가 없으면 `<type>/<slug>`)이고, 기본 브랜치에서 만든다. Issue가 있으면 `gh issue develop`으로 연결한다. 이미 있으면 재사용한다.
4. **기록**: `docs/plans/<id>/meta.json`에 `"issue": {"number", "url"}`, `"branch": "<이름>"`을 추가한다(다른 필드는 건드리지 않는다).
5. **보고**: Issue 번호와 URL, 브랜치, 재사용인지 새로 만들었는지를 3줄 이내로 알리고 구현을 시작한다.

## 완료 기준
- 현재 브랜치가 작업 브랜치이고, Issue가 있으면 브랜치와 연결돼 있다(`gh issue develop --list <번호>`).
- 같은 계획으로 다시 실행해도 Issue와 브랜치가 새로 생기지 않는다.
- 코드는 아직 수정하지 않았다.
