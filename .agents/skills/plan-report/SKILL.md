---
name: plan-report
description: docs/plans/ 에 보관된 승인된 계획(plan.md)과 실제 구현 결과를 연결해 result.md 를 작성한다. "계획 결과 정리", "plan report", "계획대로 됐는지 정리" 요청이나 session-wrapup 의 제안이 있을 때 사용한다.
---

# plan-report

## 실행 조건
- 사용자가 계획과 구현 결과를 정리해 달라고 할 때
- 대상: 사용자가 지정한 `docs/plans/<id>/`. 지정하지 않았으면 `meta.json`의 `status`가 `approved`인 것 중 `approved_at`이 가장 최근인 것

## 절차
1. `docs/plans/<id>/plan.md`(원문)와 `meta.json`을 읽는다. **plan.md는 절대 수정하지 않는다.**
2. 기준 커밋 `meta.git.base_commit`부터 변경을 모은다.
   - `git log --oneline <base_commit>..HEAD`
   - `git diff --stat <base_commit>` (커밋되지 않은 변경 포함)
3. 테스트·빌드를 **실제로 실행**하고 결과를 기록한다(바뀐 영역만): `cd front && npm test && npm run lint && npm run build`, `cd back && make test && make lint`
4. `docs/plans/<id>/result.md`를 아래 형식으로 작성한다(이미 있으면 덮어쓰지 말고 날짜를 붙인 절을 아래에 추가한다).
   ```markdown
   # 구현 결과 — <id>
   작성: YYYY-MM-DD · 기준 커밋: <base_commit 앞 7자리>..<HEAD 앞 7자리>

   ## 1. 변경 파일
   ## 2. 주요 변경 이유
   ## 3. 테스트·빌드 결과   (실행한 명령과 통과/실패 수)
   ## 4. 계획 대비 달라진 부분   (plan.md 단계별: 완료 / 변경(이유) / 미실행(이유))
   ## 5. 관련 커밋   (해시 + 제목, 아직 커밋 전이면 "미커밋")
   ```
5. `meta.json`의 `status`를 `implemented`로 바꾸고 `result_commits`(해시 배열)를 추가한다. 다른 필드는 건드리지 않는다.

## 완료 기준
- result.md의 다섯 절이 모두 채워져 있고, 3절은 실제 실행 출력에 근거한다.
- plan.md 바이트가 그대로다 (`shasum -a 256 plan.md`가 `meta.sha256`과 같다).
- 비밀값을 쓰지 않았고, commit과 push를 하지 않았다.
