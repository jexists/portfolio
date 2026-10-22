---
name: dev-merge
description: CI 가 통과한 PR 을 사용자 승인을 받은 뒤 squash merge 하고 연결된 Issue 종료와 로컬 정리를 확인한다. 사용자가 /dev-merge 로 명시적으로 실행할 때만 쓴다.
argument-hint: "[PR 번호]"
disable-model-invocation: true
---

# dev-merge — 승인 후 Squash Merge

## 실행 조건
- 사용자가 `/dev-merge [PR]`를 실행했다. PR을 지정하지 않으면 현재 브랜치의 열린 PR을 쓴다.

## 절차
1. `python3 scripts/devflow.py merge-check <PR>`. `ok: false`이면 **멈추고** 사유(Draft, CI 실패·대기, 충돌, base 불일치, 체크 없음)와 해결 방법을 알린다.
   - 체크가 하나도 없는 PR(CI 도입 전 브랜치 등)은 사용자가 명시적으로 허락한 경우에만 `--allow-no-checks`를 쓴다.
2. **검토 요약**: `gh pr view <PR>`와 `gh pr diff <PR> --name-only`로 변경 파일, 핵심 변경, CI 결과, 닫힐 Issue(`closes`), 위험 요소를 5~8줄로 정리한다.
3. **승인**: AskUserQuestion으로 "squash merge 할까요?"를 묻는다. 선택지는 `Merge (squash, 브랜치 삭제)` / `보류`. 승인하지 않으면 아무것도 하지 않는다.
4. `python3 scripts/devflow.py merge <PR> --sha <1단계 head_sha> [--allow-no-checks]`
   - 검토 후 새 커밋이 push되었으면 SHA가 달라 거부된다. 그때는 1단계부터 다시 한다.
5. **후속 확인**
   - 결과의 `issues`가 모두 `CLOSED`인지 확인한다. 아니면 `gh issue view`로 확인하고, PR 본문의 `Closes #N` 누락 여부를 알린다(직접 닫지 않고 사용자에게 묻는다).
   - 로컬: `git switch <기본 브랜치> && git pull --ff-only`. 작업 브랜치가 남아 있으면 `git branch -d <브랜치>`로만 지운다(`-D` 금지. squash merge라 `-d`가 거부되면 원격 PR이 MERGED인지 확인한 뒤 사용자에게 묻는다).
   - 연결된 계획의 `meta.json`에 `"status": "merged"`, `"merged_pr"`를 기록하고, 필요하면 session-wrapup에서 함께 커밋한다.

## 완료 기준
- 사용자가 승인한 SHA만 merge했다.
- Issue 종료 여부와 로컬 브랜치 상태를 보고했다.
- Auto-merge를 켜지 않았다.
