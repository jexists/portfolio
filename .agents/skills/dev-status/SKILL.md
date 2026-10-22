---
name: dev-status
description: 현재 작업 브랜치와 연결된 Issue, PR, CI 상태, 미커밋 변경을 조회해 짧게 보고한다. "지금 상태", "PR 어떻게 됐어", "CI 결과" 질문이나 /dev-status 에 사용한다. 읽기 전용.
---

# dev-status (읽기 전용)

## 절차
1. `python3 scripts/devflow.py context`
2. 브랜치에 Issue 번호가 있으면 `gh issue view <번호> --json number,title,state,url`
3. PR이 있고 CI가 실패했으면 `gh run list --branch <브랜치> --limit 1`과 `gh run view <id> --log-failed`로 실패한 job과 첫 오류만 요약한다.
4. 진행 중인 계획: `docs/plans/*/meta.json` 중 `branch`가 현재 브랜치인 것

## 보고 형식 (6줄 이내)
```
브랜치: <이름> (기본 <main> 대비 ahead N / behind M, 미커밋 K개)
Issue: #N <제목> [OPEN|CLOSED] | 없음
PR: #N [Draft|Open|Merged] <URL> | 없음
CI: front=pass, back=fail (원인 한 줄) | 체크 없음
계획: docs/plans/<id> | 없음
다음: /dev-finish | CI 수정 | /dev-merge | 기본 브랜치 최신화(behind > 0)
```
- 파일을 수정하거나 원격 상태를 바꾸는 명령은 실행하지 않는다.
