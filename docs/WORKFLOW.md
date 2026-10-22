# 개발 워크플로우 (GitHub 연동)

Plan → 사용자 승인 → Issue → Branch → 구현 → 테스트 → Commit → PR → CI → **사용자 승인 후** Merge → Issue 자동 종료

## 한눈에 보기
| 단계 | 누가 / 어떻게 | 자동 여부 |
|---|---|---|
| 1. 계획 | Claude Plan Mode. 마지막에 `## Workflow` 블록 (CLAUDE.md 형식) | 사용자 요청으로 시작 |
| 2. 승인 | Plan 승인 화면 | **사용자** |
| 3. 보관 + 알림 | hook `archive_plan.py` → `docs/plans/<id>/` 저장, Workflow 블록이 있으면 Claude에게 dev-start 알림 | 자동 |
| 4. Issue + Branch | `dev-start` (Claude가 알림을 받고 바로 실행, 또는 `/dev-start`) | 자동 (계획 승인 = 실행 승인) |
| 5. 구현·테스트 | Claude | 자동 (계획에서 크게 벗어나면 사용자에게 묻는다) |
| 6. Commit + PR + CI | `/dev-finish` | **사용자가 실행** → 이후 자동 |
| 7. 상태 확인 | `/dev-status` (언제든) | 읽기 전용 |
| 8. Merge | `/dev-merge` → 요약 → 승인 질문 → squash merge | **사용자 승인** (권한 규칙으로도 매번 확인) |
| 9. Issue 종료 | PR 본문의 `Closes #N` + 기본 브랜치 merge | GitHub 자동 |

## 명령
| 명령 | 하는 일 |
|---|---|
| (Plan Mode) | 계획 작성. 개발 작업이면 `## Workflow` 블록을 넣는다 |
| `/dev-start [docs/plans/<id>]` | Issue 재사용·생성 → 연결 브랜치 재사용·생성 |
| `/dev-finish [--draft]` | 검증 → 커밋 → result.md → push → PR 재사용·생성 → CI 확인 |
| `/dev-status` | 브랜치, Issue, PR, CI, 미커밋 변경 |
| `/dev-merge [PR]` | merge 조건 확인 → 요약 → 승인 → squash merge → Issue 종료·로컬 정리 확인 |
Codex에서는 같은 스킬을 `$dev-start`처럼 부른다(`dev-finish`, `dev-merge`는 명시적으로 부를 때만 실행된다).

### 사소한 작업 (Issue 없음)
계획 없이 바로 하거나, 계획의 Workflow에 `issue: none`을 쓴다.
```bash
python3 scripts/devflow.py branch-ensure --type chore --slug bump-deps   # → chore/bump-deps (main 기준)
# 수정 후 /dev-finish (Related Issue: 없음) → /dev-merge
```

## scripts/devflow.py
모든 명령은 GitHub와 git을 다시 조회해 판단한다(상태 파일 없음). 세션이 끊겨도 같은 명령을 다시 실행하면 이어서 진행된다.
| 명령 | 중복·안전 처리 |
|---|---|
| `context [--json]` | 읽기 전용 |
| `check-body issue\|pr <파일>` | 필수 절(Issue: Background…References, PR: Summary…Related Issue) 검사 |
| `issue-ensure --title --body-file [--label] [--plan-id]` | plan-id 마커 → 같은 제목의 열린 Issue 순서로 재사용. 없는 label은 뺀다. 생성 실패 시 재시도하지 않고 다시 조회 |
| `branch-ensure --type --slug [--issue]` | 미커밋 변경이 있으면 중단. 로컬 → 원격 → 새로 만들기(`gh issue develop`) 순서. Issue에 다른 브랜치가 연결돼 있으면 중단 |
| `pr-ensure --title --body-file [--draft] [--update]` | 기본 브랜치에서는 거부. 열린 PR이 있으면 재사용, 이미 merge됐으면 중단. 생성 실패 시 다시 조회 |
| `merge-check <PR> [--allow-no-checks]` | OPEN, Draft 아님, MERGEABLE, base=기본 브랜치, 모든 체크 pass/skipping, 체크 0개면 거부 |
| `merge <PR> --sha <SHA>` | merge-check를 다시 통과하고 검토한 SHA와 head가 같을 때만 `--squash --delete-branch --match-head-commit` |

## 예외 상황
| 상황 | 동작 / 복구 |
|---|---|
| 같은 계획으로 Issue가 이미 있음 | 재사용 (닫힌 Issue여도 plan-id가 같으면 재사용 → 다시 열지는 사용자가 결정) |
| 브랜치가 이미 있음 | 로컬 또는 원격 브랜치로 전환해 이어서 작업 |
| PR이 이미 있음 | 재사용. 본문을 바꿀 때만 `--update` |
| 이미 merge된 작업 | pr-ensure가 중단 → 새 브랜치에서 시작 |
| 세션 종료 / 다른 세션 | `/dev-status` → 다음 단계 안내. 계획과 연결 정보는 `docs/plans/<id>/meta.json`(issue, branch, pr) |
| gh 인증 만료 | `context`에서 "gh 인증 실패" → `gh auth login` 후 다시 실행 |
| 네트워크 오류 | 생성 명령은 실패 후 자동으로 다시 조회한다. 생성되지 않았으면 같은 명령을 다시 실행해도 안전하다 |
| CI 실패 | merge-check가 거부. `gh run view --log-failed`로 원인 확인 → 수정 커밋 → push → CI 재실행 |
| 미커밋 변경 | 브랜치 전환을 거부(삭제·stash 안 함). 직접 커밋하거나 정리한다 |
| 여러 작업 동시 진행 | 작업마다 브랜치·PR이 따로 있다. 동시에 같은 작업 디렉터리를 쓰려면 `git worktree add ../portfolio-<slug> <branch>` |

## CI (`.github/workflows/ci.yml`)
- 모든 PR과 main push에서 실행한다. job `front`(Node 24: `npm ci` → lint → test → build[tsc 타입 검사 포함])와 `back`(go.mod 버전: `make lint` → `make test` → `make build`)이다.
- 실패하면 merge-check가 merge를 막는다. CI를 통과시키려고 테스트를 끄거나 조건을 완화하지 않는다.

## GitHub 저장소 설정
현재 저장소는 **private + Free 플랜**이라 Branch protection과 Rulesets를 쓸 수 없다(API 403). 그래서 보호는 로컬 가드로 한다.
- Claude 권한(`.claude/settings.json`): `gh pr merge`, `devflow merge`, `gh repo edit`, `gh api -X PATCH`는 **항상 확인**. `git push origin main`은 **거부**. force push는 **거부**.
- 스킬: merge는 `/dev-merge`로만, CI 통과와 사용자 승인을 확인한 뒤에만 한다.
- 터미널에서 직접 `git push origin main`을 하는 것까지는 막지 못한다(서버 쪽 규칙이 없기 때문).

권장 설정 (웹: **Settings → General → Pull Requests**):
- Allow squash merging: 켬 (기본 메시지: Pull request title)
- Always suggest updating pull request branches: 선택
- Automatically delete head branches: **켬**
- Allow auto-merge: **끔** (아래 조건이 갖춰지기 전까지)

Rulesets를 쓰려면(저장소를 public으로 바꾸거나 GitHub Pro): **Settings → Rules → Rulesets → New branch ruleset**
- Target: Default branch
- Restrict deletions, Block force pushes: 켬
- Require a pull request before merging: 켬, Required approvals **0** (1인 개발이라 스스로 승인할 수 없다)
- Require status checks to pass: `front`, `back` 추가
- Bypass list: 비움

Auto-merge를 켜려면: 위 Rulesets(필수 체크)를 갖춘 뒤 Settings → General → "Allow auto-merge"를 켜고 `gh pr merge <PR> --auto --squash --delete-branch`를 쓴다. 필수 체크가 없는 상태에서 auto-merge를 켜면 CI를 기다리지 않고 merge될 수 있으므로 켜지 않는다.
