---
name: session-start
description: 새 세션을 시작하거나 "이어서", "어디까지 했지", "현재 상태" 같은 요청을 받았을 때 docs/PROGRESS.md와 git 상태를 읽고 이어서 할 일을 짧게 보고한다. 파일은 수정하지 않는다.
---

# session-start

## 실행 조건
- 새 세션의 첫 작업이거나, 사용자가 이전 작업을 이어가자고 할 때
- 이미 이번 세션에서 실행했다면 다시 실행하지 않는다

## 절차 (읽기 전용)
1. `docs/PROGRESS.md` 전체를 읽는다. `docs/DECISIONS.md`는 최근 항목 3~5개만 읽는다.
2. `git status -sb`, `git log --oneline -10`, `git branch --show-current`를 실행한다.
3. `docs/plans/`에서 `meta.json`의 `status`가 `approved`인(아직 결과가 연결되지 않은) 최신 계획이 있으면 id를 기록한다.
4. PROGRESS의 "진행 중", "다음 할 일"과 실제 git 상태(브랜치, 커밋되지 않은 변경, 최근 커밋)가 맞지 않으면 그 차이를 적는다.

## 완료 기준
- 아래 형식으로 **5줄 이내**로 보고한다.
  ```
  브랜치: <branch> (커밋 안 된 변경 N개 | 깨끗함)
  마지막 완료: <PROGRESS 기준 한 줄>
  진행 중 계획: <docs/plans/id 또는 없음>
  다음 할 일: 1) … 2) … 3) …
  주의: <PROGRESS와 git이 다르면 그 내용, 없으면 생략>
  ```
- 어떤 파일도 만들거나 고치지 않았다.
