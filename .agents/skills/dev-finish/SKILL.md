---
name: dev-finish
description: 구현을 마친 작업 브랜치를 검증(lint·test·build)하고, 논리 단위로 커밋한 뒤 push 하고 PR 을 생성 또는 재사용하고 CI 결과를 확인한다. 사용자가 /dev-finish 로 명시적으로 실행할 때만 쓴다.
argument-hint: "[--draft]"
disable-model-invocation: true
---

# dev-finish — 검증 → Commit → PR → CI

## 실행 조건
- 사용자가 `/dev-finish`를 실행했다.
- 현재 브랜치가 기본 브랜치가 아니다(기본 브랜치라면 멈추고 `dev-start` 또는 `branch-ensure`를 안내한다).

## 절차
1. **상태 확인**: `python3 scripts/devflow.py context`, `git status`, `git diff --stat`. 연결된 계획은 `docs/plans/*/meta.json`의 `branch`가 현재 브랜치와 같은 것이다(Issue 번호도 거기서 찾는다).
2. **범위 확인**: 변경 파일이 계획 범위 안에 있는지 확인한다. 이번 작업과 관계없는 미커밋 변경(다른 작업, 사용자 수정)은 **커밋하지 않고** 목록으로 알린다. 계획과 크게 다른 변경이 있으면 멈추고 사용자에게 묻는다.
3. **검증**: 바뀐 영역만 실제로 실행하고 출력 요약을 기록한다. 실패를 숨기거나 건너뛰지 않는다.
   - front: `cd front && npm run lint && npm test && npm run build`
   - back: `cd back && make lint && make test && make build`
   - scripts·hook: `python3 -m unittest discover -s scripts -p 'test_*.py'`, `python3 -m unittest discover -s .claude/hooks -p 'test_*.py'`
4. **비밀값 확인**: `git diff --cached`와 커밋할 파일에 `.env`, 토큰, 접속 문자열이 없는지 확인한다(`.gitignore`에만 의존하지 않는다).
5. **커밋**: 논리 단위로 **파일을 지정해** `git add <경로>`(`git add .`·`-A` 금지). 메시지는 AGENTS.md 규칙(한국어 Conventional Commits)을 따른다. amend·reset·force push는 하지 않는다.
6. **계획 대비 결과**: 계획이 있으면 `plan-report` 절차로 `docs/plans/<id>/result.md`를 작성하고 같은 브랜치에 커밋한다.
7. **PR 본문** (`.github/pull_request_template.md` 형식): Summary, Changes, Testing(실제로 실행한 명령과 결과. 실행하지 않은 항목은 체크하지 않고 이유를 적는다), Risks / Impact(호환성, 보안, 롤백 방법), Related Issue.
   - Issue를 끝내면 `Closes #N`, 일부만 구현했으면 `Refs #N`(Issue는 닫지 않는다), Issue가 없으면 "없음".
   - UI 변경이면 확인 방법이나 스크린샷 경로를 적는다.
8. **PR**: `python3 scripts/devflow.py pr-ensure --title "<type>(<scope>): <제목>" --body-file <파일> [--draft] [--update]`
   - 검증이 실패했거나 미완성이면 `--draft`를 붙인다. 열린 PR이 이미 있으면 재사용하고, 본문을 고쳐야 할 때만 `--update`를 쓴다.
9. **CI**: `gh pr checks <번호> --watch --fail-fast`. 실패하면 `gh run view --log-failed`로 원인을 요약한다. CI를 통과시키려고 테스트를 끄거나 조건을 완화하지 않는다.
10. `meta.json`에 `"pr": {"number", "url"}`를 기록하고, PR URL, CI 결과, 다음 단계(`/dev-merge`)를 보고한다.

## 완료 기준
- 커밋에 관계없는 파일이나 비밀값이 없다.
- PR 본문의 Testing 항목이 실제 실행 결과와 일치한다.
- PR이 하나만 있다(다시 실행해도 새로 생기지 않는다).
- **merge는 하지 않았다.**
