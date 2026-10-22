# docs/plans — 승인된 Plan 기록

Claude Code Plan Mode에서 **승인된** 계획을 자동으로 보관한다. 원문과 구현 결과를 나란히 두어 "어떤 계획으로 무엇을 만들었는지" 추적한다.

## 폴더 규칙
```
docs/plans/<YYYY-MM-DD>_<HHMM>_<sha256 앞 8자리>/
├── plan.md     # 승인된 원문 (바이트 그대로, 수정 금지)
├── meta.json   # 1단계: hook이 자동 생성
└── result.md   # 2단계: plan-report skill로 작성 (선택)
```

## 1단계: 자동 보관 (hook)
- `.claude/settings.json`의 `PostToolUse` + matcher `ExitPlanMode` → `.claude/hooks/archive_plan.py`
- 승인될 때만 실행된다. 거부된 계획은 저장되지 않는다.
- 중복 방지: 같은 `tool_use_id`, 또는 같은 세션에서 같은 내용(sha256)은 다시 저장하지 않는다.
- 같은 세션에서 수정된 계획은 새 폴더에 저장하고 `meta.previous`로 이전 기록을 연결한다.
- 민감 정보로 보이는 줄이 있으면 원문은 그대로 저장하되 `meta.sensitive_findings`(줄 번호, 패턴 이름만)에 남기고 화면에 경고한다. **커밋 전에 확인할 것.**
- 실패하면 화면에 `⚠️ Plan 자동 보관 실패` 메시지가 뜨고 `.claude/hooks/logs/archive_plan.log`(gitignore)에 기록된다. 승인 흐름은 막지 않는다.
- 커밋은 자동으로 하지 않는다. 다른 변경과 함께 직접 커밋한다.

### meta.json 필드
| 필드 | 설명 |
|---|---|
| `id` | 폴더 이름 |
| `approved_at` | 승인 시각 (로컬 TZ, ISO 8601) |
| `session_id`, `tool_use_id` | Claude Code 세션, 이벤트 식별자 |
| `source_plan_path` | 원본 plan 파일 경로 (`~/.claude/plans/...`) |
| `sha256` | plan.md 해시 |
| `previous` | 같은 세션의 이전 버전 id 또는 null |
| `git.branch`, `git.base_commit`, `git.dirty` | 승인 시점 Git 상태 (2단계 비교 기준) |
| `status` | `approved` → `implemented` |
| `sensitive_findings` | `[{line, pattern}]` |
| `result_commits` | 2단계에서 추가: 관련 커밋 해시 |

## 2단계: 구현 결과 연결 (수동)
`/plan-report`(Claude) 또는 `$plan-report`(Codex)를 실행하면 `meta.git.base_commit` 이후의 변경을 기준으로 `result.md`를 작성한다. 내용은 변경 파일, 변경 이유, 테스트·빌드 결과, 계획과 달라진 부분, 관련 커밋이다.
