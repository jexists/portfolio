---
name: session-wrapup
description: 사용자가 "마무리", "정리", "세션 종료", "오늘 여기까지"라고 할 때 이번 세션의 변경을 확인해 docs/PROGRESS.md를 갱신하고, 필요하면 DECISIONS.md와 ARCHITECTURE.md도 갱신한 뒤 커밋 메시지를 제안한다. 커밋은 하지 않는다.
---

# session-wrapup

## 실행 조건
- 사용자가 세션을 마치려 할 때 (마무리, 정리, 종료, 여기까지)
- 사용자가 요청하지 않았다면 실행하지 않는다

## 절차
1. `git status -sb`, `git diff --stat`, `git log --oneline <세션 시작 시점>..HEAD`(모르면 `-10`)로 이번 세션의 변경을 파악한다.
2. `docs/PROGRESS.md`를 갱신한다.
   - 끝난 일을 "완료"로 옮기고 날짜(YYYY-MM-DD)를 붙인다.
   - "진행 중"에는 멈춘 지점과 남은 작업을 파일 경로 수준으로 적는다.
   - "다음 할 일"은 다음 세션이 바로 시작할 수 있게 구체적인 동사로 시작하는 1~5개로 정리한다.
3. 이번 세션에 설계 결정(기술 선택, 구조, 규칙 변경)이 있었으면 `docs/DECISIONS.md` 맨 위에 새 항목을 추가한다(형식은 그 파일 참고).
4. 폴더 구조나 API, 데이터 흐름이 바뀌었으면 `docs/ARCHITECTURE.md`의 해당 부분을 고친다.
5. `docs/plans/`에 이번 세션에 구현한 `approved` 계획이 있으면 `plan-report` 실행을 제안한다.
6. 바뀐 문서에 비밀값이 없는지 확인한다: `git diff -- docs | grep -inE "password|secret|api[_-]?key|token|mongodb(\+srv)?://[^ ]*@"`
7. AGENTS.md의 Git 규칙에 맞는 커밋 메시지를 제안한다(관련 없는 변경은 커밋을 나눠서 제안한다).

## 완료 기준
- PROGRESS.md의 "다음 할 일"만 보고 다음 세션을 바로 시작할 수 있다.
- 문서에 비밀값이 없다.
- **commit과 push를 하지 않았다.** 사용자에게 갱신한 파일 목록과 제안한 커밋 메시지만 보여 준다.
