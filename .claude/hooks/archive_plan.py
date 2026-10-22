#!/usr/bin/env python3
"""PostToolUse(ExitPlanMode) hook: 승인된 Plan 원문을 docs/plans/ 에 보관한다.

- 원문은 바이트 그대로 plan.md 에 저장하고, 메타데이터는 meta.json 에 분리한다.
- 같은 이벤트(tool_use_id) 또는 같은 세션의 같은 내용(sha256)은 다시 저장하지 않는다.
- 어떤 경우에도 exit 0 으로 끝나며, 실패는 systemMessage 와 로그 파일로 알린다.
- git 은 읽기 전용 명령만 사용한다. 표준 라이브러리만 사용한다.
"""

from __future__ import annotations

import datetime as dt
import hashlib
import json
import os
import re
import subprocess
import sys
import tempfile
import traceback
from pathlib import Path

SENSITIVE_PATTERNS = [
    ("aws_access_key", re.compile(r"\b(AKIA|ASIA)[0-9A-Z]{16}\b")),
    ("openai_or_anthropic_key", re.compile(r"\bsk-[A-Za-z0-9_\-]{20,}")),
    ("github_token", re.compile(r"\b(ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{30,}|\bgithub_pat_[A-Za-z0-9_]{30,}")),
    ("private_key", re.compile(r"-----BEGIN [A-Z ]*PRIVATE KEY-----")),
    ("mongodb_credentials", re.compile(r"mongodb(\+srv)?://[^:/\s@]+:[^@/\s]+@")),
    ("assigned_secret", re.compile(
        r"(?i)\b(password|passwd|secret|api[_-]?key|access[_-]?token)\b\s*[:=]\s*['\"]?[^\s'\"<>`]{8,}")),
]


def project_dir(payload: dict) -> Path:
    return Path(os.environ.get("CLAUDE_PROJECT_DIR") or payload.get("cwd") or os.getcwd())


def archive_root(proj: Path) -> Path:
    override = os.environ.get("PLAN_ARCHIVE_DIR")
    return Path(override) if override else proj / "docs" / "plans"


def log_path(proj: Path) -> Path:
    override = os.environ.get("PLAN_ARCHIVE_LOG")
    return Path(override) if override else proj / ".claude" / "hooks" / "logs" / "archive_plan.log"


def emit(message: str, context: str | None = None) -> None:
    out: dict = {"systemMessage": message}
    if context:
        out["hookSpecificOutput"] = {"hookEventName": "PostToolUse", "additionalContext": context}
    print(json.dumps(out, ensure_ascii=False))


WORKFLOW_RE = re.compile(r"^##\s+Workflow\s*$(?P<body>.*?)(?=^##\s|\Z)", re.M | re.S)


def parse_workflow(plan: str) -> dict | None:
    """계획 끝의 `## Workflow` 블록(- key: value)을 읽는다. 없으면 None (개발 실행이 아닌 계획)."""
    # 코드 블록 안의 예시는 무시하고, 마지막 Workflow 블록을 쓴다.
    without_code = re.sub(r"^```.*?^```[^\n]*$", "", plan, flags=re.M | re.S)
    matches = list(WORKFLOW_RE.finditer(without_code))
    if not matches:
        return None
    m = matches[-1]
    fields = {}
    for line in m.group("body").splitlines():
        kv = re.match(r"^\s*-\s*([a-z]+)\s*:\s*(.+?)\s*(?:#.*)?$", line)
        if kv:
            fields[kv.group(1)] = kv.group(2)
    return fields or None


def workflow_context(plan_dir: str, workflow: dict) -> str:
    """승인 직후 Claude 에게 다음 단계를 알린다. 실제 Issue·브랜치 작업은 dev-start 스킬이 한다."""
    issue = workflow.get("issue", "new")
    what = "Issue 없이 작업 브랜치만" if issue == "none" else f"Issue({issue})와 연결 브랜치를"
    return (
        f"승인된 계획이 {plan_dir}/plan.md 에 보관됐고 Workflow 블록이 있다 ({json.dumps(workflow, ensure_ascii=False)}). "
        f"코드를 수정하기 전에 dev-start 스킬을 실행해 {what} 준비하라. "
        "미커밋 변경이 있거나 gh 인증이 실패하면 멈추고 사용자에게 알린다."
    )


def extract_plan(payload: dict) -> tuple[str, str | None]:
    """원문과 원본 경로를 반환한다. 공식 문서 순서대로 fallback."""
    resp = payload.get("tool_response")
    resp = resp if isinstance(resp, dict) else {}
    inp = payload.get("tool_input")
    inp = inp if isinstance(inp, dict) else {}
    source = resp.get("filePath") or inp.get("planFilePath")

    for candidate in (resp.get("plan"), inp.get("plan")):
        if isinstance(candidate, str) and candidate.strip():
            return candidate, source
    if source and Path(source).is_file():
        return Path(source).read_text(encoding="utf-8"), source
    raise ValueError("입력에 plan 원문이 없음 (tool_response.plan / tool_input.plan / plan 파일 모두 없음)")


def scan_sensitive(text: str) -> list[dict]:
    findings = []
    for lineno, line in enumerate(text.splitlines(), start=1):
        for name, pattern in SENSITIVE_PATTERNS:
            if pattern.search(line):
                findings.append({"line": lineno, "pattern": name})
    return findings


def git(proj: Path, *args: str) -> str | None:
    try:
        out = subprocess.run(["git", "-C", str(proj), *args], capture_output=True, text=True, timeout=5)
        return out.stdout.strip() if out.returncode == 0 else None
    except (OSError, subprocess.SubprocessError):
        return None


def load_existing(root: Path) -> list[dict]:
    metas = []
    if not root.is_dir():
        return metas
    for meta_file in root.glob("*/meta.json"):
        try:
            metas.append(json.loads(meta_file.read_text(encoding="utf-8")))
        except (OSError, ValueError):
            continue
    return metas


def find_duplicate(metas: list[dict], tool_use_id: str | None, session_id: str | None, digest: str) -> dict | None:
    for meta in metas:
        if tool_use_id and meta.get("tool_use_id") == tool_use_id:
            return meta
        if session_id and meta.get("session_id") == session_id and meta.get("sha256") == digest:
            return meta
    return None


def find_previous(metas: list[dict], session_id: str | None, source: str | None) -> str | None:
    if not session_id or not source:
        return None
    same = [m for m in metas if m.get("session_id") == session_id and m.get("source_plan_path") == source]
    same.sort(key=lambda m: m.get("approved_at", ""))
    return same[-1]["id"] if same else None


def archive(payload: dict) -> tuple[str, str | None]:
    proj = project_dir(payload)
    root = archive_root(proj)
    plan, source = extract_plan(payload)
    raw = plan.encode("utf-8")
    digest = hashlib.sha256(raw).hexdigest()
    session_id = payload.get("session_id")
    tool_use_id = payload.get("tool_use_id")

    metas = load_existing(root)
    dup = find_duplicate(metas, tool_use_id, session_id, digest)
    if dup:
        return "", None  # 중복: 조용히 종료

    now = dt.datetime.now().astimezone()
    base_id = f"{now:%Y-%m-%d_%H%M}_{digest[:8]}"
    root.mkdir(parents=True, exist_ok=True)

    findings = scan_sensitive(plan)
    meta = {
        "id": None,
        "approved_at": now.isoformat(timespec="seconds"),
        "session_id": session_id,
        "tool_use_id": tool_use_id,
        "source_plan_path": source,
        "sha256": digest,
        "previous": find_previous(metas, session_id, source),
        "git": {
            "branch": git(proj, "rev-parse", "--abbrev-ref", "HEAD"),
            "base_commit": git(proj, "rev-parse", "HEAD"),
            "dirty": bool(git(proj, "status", "--porcelain")),
        },
        "status": "approved",
        "sensitive_findings": findings,
    }

    tmp = Path(tempfile.mkdtemp(prefix=".tmp-", dir=root))
    try:
        (tmp / "plan.md").write_bytes(raw)
        suffix = 1
        while True:
            plan_id = base_id if suffix == 1 else f"{base_id}-{suffix}"
            target = root / plan_id
            if not target.exists():
                meta["id"] = plan_id
                (tmp / "meta.json").write_text(json.dumps(meta, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
                try:
                    os.rename(tmp, target)  # 원자적 확정, 기존 폴더는 덮어쓰지 않음
                    break
                except OSError:
                    if not target.exists():
                        raise
            suffix += 1
    finally:
        if tmp.exists():
            for f in tmp.iterdir():
                f.unlink()
            tmp.rmdir()

    try:
        rel = target.relative_to(proj)
    except ValueError:
        rel = target
    msg = f"📁 Plan 보관: {rel}/plan.md"
    if findings:
        lines = ", ".join(str(f["line"]) for f in findings)
        msg += f"\n⚠️ 민감 정보로 보이는 줄({lines})이 있습니다. 커밋 전에 {rel}/plan.md 를 확인하세요."
    workflow = parse_workflow(plan)
    return msg, (workflow_context(str(rel), workflow) if workflow else None)


def main() -> int:
    payload: dict = {}
    try:
        payload = json.loads(sys.stdin.read() or "{}")
        message, context = archive(payload)
        if message:
            emit(message, context)
    except Exception as exc:  # noqa: BLE001 - hook 은 절대 실패로 끝나면 안 된다
        log = log_path(project_dir(payload) if isinstance(payload, dict) else Path.cwd())
        try:
            log.parent.mkdir(parents=True, exist_ok=True)
            with log.open("a", encoding="utf-8") as fh:
                fh.write(f"[{dt.datetime.now().isoformat(timespec='seconds')}] {exc!r}\n{traceback.format_exc()}\n")
        except OSError:
            pass
        emit(f"⚠️ Plan 자동 보관 실패: {exc} (로그: {log})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
