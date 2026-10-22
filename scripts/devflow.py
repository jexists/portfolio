#!/usr/bin/env python3
"""GitHub 연동 개발 워크플로우 도우미 (Issue → Branch → PR → CI → Merge).

상태 파일 없이 매번 GitHub(gh)와 git 에서 다시 조회하므로, 여러 번 실행해도 Issue·PR·브랜치가 중복으로 생기지 않는다.
원격을 바꾸는 명령: issue-ensure, branch-ensure(issue 연결 브랜치), pr-ensure(push 포함), merge.
읽기 전용 명령: context, merge-check, check-body.

사용법은 docs/WORKFLOW.md 참고. 표준 라이브러리만 사용한다.
"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
import tempfile
from dataclasses import dataclass
from pathlib import Path

TYPES = ("feat", "fix", "refactor", "docs", "chore", "test", "perf", "design")
SLUG_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
BRANCH_ISSUE_RE = re.compile(r"^[a-z]+/(\d+)-")
ISSUE_SECTIONS = ("Background", "Objective", "Scope", "Out of Scope", "Acceptance Criteria", "Technical Notes", "References")
PR_SECTIONS = ("Summary", "Changes", "Testing", "Risks / Impact", "Related Issue")
PASSING_BUCKETS = {"pass", "skipping"}


class FlowError(Exception):
    """사용자에게 그대로 보여 줄 수 있는 중단 사유."""


@dataclass
class Result:
    code: int
    out: str
    err: str


class Runner:
    """외부 명령 실행기. 테스트에서는 fake 로 바꾼다."""

    def __call__(self, cmd: list[str], check: bool = True) -> Result:
        proc = subprocess.run(cmd, capture_output=True, text=True)
        result = Result(proc.returncode, proc.stdout.strip(), proc.stderr.strip())
        if check and result.code != 0:
            raise FlowError(f"명령 실패: {' '.join(cmd)}\n{result.err or result.out}")
        return result


# ---------- 순수 함수 ----------

def branch_name(kind: str, slug: str, issue: int | None = None) -> str:
    if kind not in TYPES:
        raise FlowError(f"type 은 {', '.join(TYPES)} 중 하나여야 합니다: {kind}")
    if not SLUG_RE.match(slug) or len(slug) > 40:
        raise FlowError(f"slug 는 소문자·숫자·하이픈, 40자 이내여야 합니다: {slug}")
    return f"{kind}/{issue}-{slug}" if issue else f"{kind}/{slug}"


def issue_from_branch(name: str) -> int | None:
    m = BRANCH_ISSUE_RE.match(name or "")
    return int(m.group(1)) if m else None


def missing_sections(body: str, sections: tuple[str, ...]) -> list[str]:
    """`## 제목` 또는 Issue Form 이 만드는 `### 제목` 을 모두 인정한다."""
    found = {m.group(1).strip().lower() for m in re.finditer(r"^#{2,3}\s+(.+?)\s*$", body, re.M)}
    return [s for s in sections if s.lower() not in found]


def plan_marker(plan_id: str) -> str:
    return f"<!-- plan-id: {plan_id} -->"


def evaluate_merge(pr: dict, checks: list[dict], default_branch: str, allow_no_checks: bool) -> list[str]:
    """merge 를 막는 사유 목록. 비어 있으면 merge 가능."""
    reasons = []
    if pr.get("state") != "OPEN":
        reasons.append(f"PR 상태가 OPEN 이 아님: {pr.get('state')}")
    if pr.get("isDraft"):
        reasons.append("Draft PR")
    if pr.get("mergeable") != "MERGEABLE":
        reasons.append(f"mergeable 아님: {pr.get('mergeable')} (UNKNOWN 이면 잠시 후 다시 확인)")
    if pr.get("baseRefName") != default_branch:
        reasons.append(f"base 가 기본 브랜치({default_branch})가 아님: {pr.get('baseRefName')}")
    if not checks and not allow_no_checks:
        reasons.append("CI 체크가 없음 (의도한 경우에만 --allow-no-checks)")
    bad = [f"{c.get('name')}={c.get('bucket')}" for c in checks if c.get("bucket") not in PASSING_BUCKETS]
    if bad:
        reasons.append("통과하지 않은 체크: " + ", ".join(bad))
    return reasons


# ---------- gh / git 조회 ----------

class Flow:
    def __init__(self, run: Runner | None = None):
        self.run = run or Runner()

    def gh_json(self, cmd: list[str]):
        out = self.run(cmd).out
        return json.loads(out) if out else None

    def default_branch(self) -> str:
        return self.run(["gh", "repo", "view", "--json", "defaultBranchRef", "--jq", ".defaultBranchRef.name"]).out

    def current_branch(self) -> str:
        return self.run(["git", "branch", "--show-current"]).out

    def dirty_files(self) -> list[str]:
        out = self.run(["git", "status", "--porcelain"]).out
        return [line for line in out.splitlines() if line.strip()]

    def local_branch_exists(self, name: str) -> bool:
        return self.run(["git", "rev-parse", "--verify", "--quiet", f"refs/heads/{name}"], check=False).code == 0

    def remote_branch_exists(self, name: str) -> bool:
        return bool(self.run(["git", "ls-remote", "--heads", "origin", name]).out)

    def list_issues(self) -> list[dict]:
        # search API 는 색인이 늦어 방금 만든 Issue 를 놓칠 수 있다 → list API 로 받아 로컬에서 거른다.
        return self.gh_json(["gh", "issue", "list", "--state", "all", "--limit", "300",
                             "--json", "number,title,state,url,body"]) or []

    def find_issue(self, title: str, plan_id: str | None) -> dict | None:
        issues = self.list_issues()
        if plan_id:
            marker = plan_marker(plan_id)
            for issue in issues:
                if marker in (issue.get("body") or ""):
                    return issue
        for issue in issues:
            if issue.get("state") == "OPEN" and issue.get("title", "").strip().lower() == title.strip().lower():
                return issue
        return None

    def existing_labels(self, wanted: list[str]) -> list[str]:
        if not wanted:
            return []
        result = self.run(["gh", "label", "list", "--limit", "200", "--json", "name"], check=False)
        if result.code != 0 or not result.out:
            return []
        names = {item["name"] for item in json.loads(result.out)}
        return [label for label in wanted if label in names]

    def pr_for_branch(self, branch: str) -> list[dict]:
        return self.gh_json(["gh", "pr", "list", "--head", branch, "--state", "all",
                             "--json", "number,state,url,isDraft,title"]) or []

    def checks(self, pr: str) -> list[dict]:
        # 실패(1)·대기(8)여도 JSON 은 나온다. 체크가 하나도 없으면 오류 메시지만 나온다.
        result = self.run(["gh", "pr", "checks", pr, "--json", "name,state,bucket,link"], check=False)
        if result.out.startswith("["):
            return json.loads(result.out)
        if "no checks" in (result.err + result.out).lower():
            return []
        raise FlowError(f"체크 조회 실패: {result.err or result.out}")

    # ---------- 명령 ----------

    def context(self) -> dict:
        auth = self.run(["gh", "auth", "status"], check=False)
        branch = self.current_branch()
        ctx = {
            "gh_auth": auth.code == 0,
            "branch": branch,
            "issue": issue_from_branch(branch),
            "dirty": self.dirty_files(),
            "default_branch": None,
            "pr": None,
            "checks": None,
        }
        if not ctx["gh_auth"]:
            return ctx
        ctx["default_branch"] = self.default_branch()
        counts = self.run(["git", "rev-list", "--left-right", "--count", f"origin/{ctx['default_branch']}...HEAD"], check=False)
        if counts.code == 0 and counts.out:
            behind, ahead = counts.out.split()
            ctx["behind"], ctx["ahead"] = int(behind), int(ahead)
        prs = [p for p in self.pr_for_branch(branch) if p["state"] == "OPEN"] if branch else []
        if prs:
            ctx["pr"] = prs[0]
            ctx["checks"] = self.checks(str(prs[0]["number"]))
        return ctx

    def issue_ensure(self, title: str, body: str, labels: list[str], plan_id: str | None) -> dict:
        missing = missing_sections(body, ISSUE_SECTIONS)
        if missing:
            raise FlowError("Issue 본문에 필요한 절이 없습니다: " + ", ".join(missing))
        found = self.find_issue(title, plan_id)
        if found:
            return {"action": "reused", "number": found["number"], "url": found["url"], "state": found["state"]}
        if plan_id and plan_marker(plan_id) not in body:
            body = body.rstrip() + "\n\n" + plan_marker(plan_id) + "\n"
        with tempfile.NamedTemporaryFile("w", suffix=".md", delete=False, encoding="utf-8") as fh:
            fh.write(body)
            body_file = fh.name
        cmd = ["gh", "issue", "create", "--title", title, "--body-file", body_file]
        for label in self.existing_labels(labels):
            cmd += ["--label", label]
        try:
            url = self.run(cmd).out.splitlines()[-1]
        except FlowError as exc:
            # 재시도하지 않는다: 실제로 만들어졌는지 먼저 확인한다.
            created = self.find_issue(title, plan_id)
            if created:
                return {"action": "created-after-error", "number": created["number"], "url": created["url"], "state": created["state"]}
            raise FlowError(f"Issue 생성 실패(생성되지 않은 것을 확인함). 원인 해결 후 다시 실행하세요.\n{exc}") from exc
        finally:
            Path(body_file).unlink(missing_ok=True)
        number = int(url.rstrip("/").rsplit("/", 1)[-1])
        return {"action": "created", "number": number, "url": url, "state": "OPEN"}

    def branch_ensure(self, kind: str, slug: str, issue: int | None) -> dict:
        name = branch_name(kind, slug, issue)
        current = self.current_branch()
        if current == name:
            return {"action": "current", "branch": name}
        dirty = self.dirty_files()
        if dirty:
            raise FlowError("커밋되지 않은 변경이 있어 브랜치를 바꾸지 않습니다. 커밋하거나 직접 정리한 뒤 다시 실행하세요:\n" + "\n".join(dirty))
        if self.local_branch_exists(name):
            self.run(["git", "switch", name])
            return {"action": "reused-local", "branch": name}
        if self.remote_branch_exists(name):
            self.run(["git", "fetch", "origin", name])
            self.run(["git", "switch", "-c", name, "--track", f"origin/{name}"])
            return {"action": "reused-remote", "branch": name}
        base = self.default_branch()
        if issue:
            linked = self.run(["gh", "issue", "develop", "--list", str(issue)], check=False).out
            linked_names = [line.split()[0] for line in linked.splitlines() if line.strip() and not line.startswith("BRANCH")]
            if linked_names:
                raise FlowError(f"Issue #{issue} 에 이미 연결된 브랜치가 있습니다: {', '.join(linked_names)} — 그 이름(type/slug)으로 다시 실행하세요.")
            self.run(["gh", "issue", "develop", str(issue), "--name", name, "--base", base, "--checkout"])
            return {"action": "created-linked", "branch": name, "base": base}
        self.run(["git", "fetch", "origin", base])
        self.run(["git", "switch", "-c", name, f"origin/{base}"])
        return {"action": "created", "branch": name, "base": base}

    def pr_ensure(self, title: str, body: str, draft: bool, update: bool) -> dict:
        missing = missing_sections(body, PR_SECTIONS)
        if missing:
            raise FlowError("PR 본문에 필요한 절이 없습니다: " + ", ".join(missing))
        branch = self.current_branch()
        base = self.default_branch()
        if not branch or branch == base:
            raise FlowError(f"기본 브랜치({base})나 detached HEAD 에서는 PR 을 만들지 않습니다.")
        prs = self.pr_for_branch(branch)
        open_prs = [p for p in prs if p["state"] == "OPEN"]
        if any(p["state"] == "MERGED" for p in prs) and not open_prs:
            raise FlowError(f"{branch} 의 PR 은 이미 merge 됐습니다. 새 작업은 새 브랜치에서 하세요.")
        self.run(["git", "push", "-u", "origin", branch])
        with tempfile.NamedTemporaryFile("w", suffix=".md", delete=False, encoding="utf-8") as fh:
            fh.write(body)
            body_file = fh.name
        try:
            if open_prs:
                pr = open_prs[0]
                if update:
                    self.run(["gh", "pr", "edit", str(pr["number"]), "--title", title, "--body-file", body_file])
                return {"action": "updated" if update else "reused", "number": pr["number"], "url": pr["url"]}
            cmd = ["gh", "pr", "create", "--base", base, "--head", branch, "--title", title, "--body-file", body_file]
            if draft:
                cmd.append("--draft")
            try:
                url = self.run(cmd).out.splitlines()[-1]
            except FlowError as exc:
                again = [p for p in self.pr_for_branch(branch) if p["state"] == "OPEN"]
                if again:
                    return {"action": "created-after-error", "number": again[0]["number"], "url": again[0]["url"]}
                raise FlowError(f"PR 생성 실패(생성되지 않은 것을 확인함).\n{exc}") from exc
        finally:
            Path(body_file).unlink(missing_ok=True)
        return {"action": "created", "number": int(url.rstrip("/").rsplit("/", 1)[-1]), "url": url, "draft": draft}

    def pr_view(self, pr: str) -> dict:
        return self.gh_json(["gh", "pr", "view", pr, "--json",
                             "number,title,url,state,isDraft,mergeable,baseRefName,headRefName,headRefOid,closingIssuesReferences"])

    def merge_check(self, pr: str, allow_no_checks: bool) -> dict:
        info = self.pr_view(pr)
        checks = self.checks(pr)
        reasons = evaluate_merge(info, checks, self.default_branch(), allow_no_checks)
        return {
            "ok": not reasons,
            "reasons": reasons,
            "number": info["number"],
            "url": info["url"],
            "head_sha": info["headRefOid"],
            "head": info["headRefName"],
            "checks": checks,
            "closes": [i["number"] for i in info.get("closingIssuesReferences") or []],
        }

    def merge(self, pr: str, sha: str, allow_no_checks: bool) -> dict:
        check = self.merge_check(pr, allow_no_checks)
        if not check["ok"]:
            raise FlowError("merge 조건 미충족:\n- " + "\n- ".join(check["reasons"]))
        if check["head_sha"] != sha:
            raise FlowError(f"검토한 커밋({sha[:7]})과 현재 head({check['head_sha'][:7]})가 다릅니다. 다시 검토하세요.")
        self.run(["gh", "pr", "merge", pr, "--squash", "--delete-branch", "--match-head-commit", sha])
        closed = {}
        for number in check["closes"]:
            state = self.run(["gh", "issue", "view", str(number), "--json", "state", "--jq", ".state"], check=False).out
            closed[number] = state or "UNKNOWN"
        return {"action": "merged", "number": check["number"], "url": check["url"], "issues": closed}


def read_body(path: str) -> str:
    return Path(path).read_text(encoding="utf-8")


def main(argv: list[str] | None = None, flow: Flow | None = None) -> int:
    parser = argparse.ArgumentParser(prog="devflow", description=__doc__.splitlines()[0])
    sub = parser.add_subparsers(dest="cmd", required=True)

    p = sub.add_parser("context", help="현재 브랜치·Issue·PR·CI 상태 (읽기 전용)")
    p.add_argument("--json", action="store_true")

    p = sub.add_parser("check-body", help="Issue/PR 본문 필수 절 검사 (읽기 전용)")
    p.add_argument("kind", choices=["issue", "pr"])
    p.add_argument("body_file")

    p = sub.add_parser("issue-ensure", help="Issue 재사용 또는 생성")
    p.add_argument("--title", required=True)
    p.add_argument("--body-file", required=True)
    p.add_argument("--label", action="append", default=[])
    p.add_argument("--plan-id")

    p = sub.add_parser("branch-ensure", help="작업 브랜치 재사용 또는 생성")
    p.add_argument("--type", required=True, dest="kind")
    p.add_argument("--slug", required=True)
    p.add_argument("--issue", type=int)

    p = sub.add_parser("pr-ensure", help="push 후 PR 재사용 또는 생성")
    p.add_argument("--title", required=True)
    p.add_argument("--body-file", required=True)
    p.add_argument("--draft", action="store_true")
    p.add_argument("--update", action="store_true", help="열린 PR 이 있으면 제목·본문 갱신")

    for name in ("merge-check", "merge"):
        p = sub.add_parser(name)
        p.add_argument("pr")
        p.add_argument("--allow-no-checks", action="store_true")
        if name == "merge":
            p.add_argument("--sha", required=True, help="merge-check 로 검토한 head SHA")

    args = parser.parse_args(argv)
    flow = flow or Flow()
    try:
        if args.cmd == "context":
            data = flow.context()
            if args.json:
                print(json.dumps(data, ensure_ascii=False, indent=2))
            else:
                print(format_context(data))
            return 0
        if args.cmd == "check-body":
            sections = ISSUE_SECTIONS if args.kind == "issue" else PR_SECTIONS
            missing = missing_sections(read_body(args.body_file), sections)
            print(json.dumps({"ok": not missing, "missing": missing}, ensure_ascii=False))
            return 0 if not missing else 1
        if args.cmd == "issue-ensure":
            data = flow.issue_ensure(args.title, read_body(args.body_file), args.label, args.plan_id)
        elif args.cmd == "branch-ensure":
            data = flow.branch_ensure(args.kind, args.slug, args.issue)
        elif args.cmd == "pr-ensure":
            data = flow.pr_ensure(args.title, read_body(args.body_file), args.draft, args.update)
        elif args.cmd == "merge-check":
            data = flow.merge_check(args.pr, args.allow_no_checks)
            print(json.dumps(data, ensure_ascii=False, indent=2))
            return 0 if data["ok"] else 1
        else:
            data = flow.merge(args.pr, args.sha, args.allow_no_checks)
        print(json.dumps(data, ensure_ascii=False, indent=2))
        return 0
    except FlowError as exc:
        print(f"devflow: {exc}", file=sys.stderr)
        return 1


def format_context(ctx: dict) -> str:
    lines = [f"gh 인증: {'OK' if ctx['gh_auth'] else '실패 — gh auth login 필요'}",
             f"브랜치: {ctx['branch'] or '(detached)'}" + (f" → Issue #{ctx['issue']}" if ctx["issue"] else ""),
             f"기본 브랜치: {ctx['default_branch']}" + (f" (ahead {ctx.get('ahead')}, behind {ctx.get('behind')})" if "ahead" in ctx else ""),
             f"미커밋 변경: {len(ctx['dirty'])}개"]
    if ctx["pr"]:
        pr = ctx["pr"]
        lines.append(f"PR: #{pr['number']} {'(Draft) ' if pr['isDraft'] else ''}{pr['url']}")
        checks = ctx["checks"] or []
        summary = ", ".join(f"{c['name']}={c['bucket']}" for c in checks) or "체크 없음"
        lines.append(f"CI: {summary}")
    else:
        lines.append("PR: 없음")
    return "\n".join(lines)


if __name__ == "__main__":
    sys.exit(main())
