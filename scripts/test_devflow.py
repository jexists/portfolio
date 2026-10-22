"""devflow.py 단위 테스트. gh·git 은 실행하지 않고 fake 실행기로 대체한다.

실행: python3 -m unittest discover -s scripts -p 'test_*.py'
"""

import json
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

import devflow  # noqa: E402
from devflow import Flow, FlowError, Result  # noqa: E402

ISSUE_BODY = "\n".join(f"## {s}\n내용\n" for s in devflow.ISSUE_SECTIONS)
PR_BODY = "\n".join(f"## {s}\n내용\n" for s in devflow.PR_SECTIONS)


class FakeRunner:
    """명령 앞부분(prefix) → Result. 처음 일치하는 규칙을 쓴다. 규칙 값이 list 면 호출마다 하나씩 꺼낸다."""

    def __init__(self, rules):
        self.rules = rules
        self.calls = []

    def __call__(self, cmd, check=True):
        self.calls.append(cmd)
        for prefix, value in self.rules:
            if cmd[: len(prefix)] == list(prefix):
                result = value.pop(0) if isinstance(value, list) else value
                if callable(result):
                    result = result(cmd)
                if check and result.code != 0:
                    raise FlowError(result.err or "failed")
                return result
        raise AssertionError(f"예상하지 못한 명령: {cmd}")

    def ran(self, *prefix):
        return [c for c in self.calls if c[: len(prefix)] == list(prefix)]


def ok(out=""):
    return Result(0, out, "")


def fail(err="boom", code=1):
    return Result(code, "", err)


DEFAULT = (("gh", "repo", "view"), ok("main"))


class PureFunctionTest(unittest.TestCase):
    def test_branch_name(self):
        self.assertEqual(devflow.branch_name("feat", "email-login", 123), "feat/123-email-login")
        self.assertEqual(devflow.branch_name("chore", "bump-deps"), "chore/bump-deps")
        for kind, slug in [("feature", "x"), ("feat", "Email Login"), ("feat", "a--b"), ("feat", "x" * 41)]:
            with self.assertRaises(FlowError):
                devflow.branch_name(kind, slug, 1)

    def test_issue_from_branch(self):
        self.assertEqual(devflow.issue_from_branch("fix/124-token-expiration"), 124)
        self.assertIsNone(devflow.issue_from_branch("chore/init-setup"))
        self.assertIsNone(devflow.issue_from_branch(""))

    def test_missing_sections_accepts_h2_and_h3(self):
        body = "## Background\n### Objective\n## scope\n"
        self.assertEqual(devflow.missing_sections(body, ("Background", "Objective", "Scope", "References")), ["References"])

    def test_evaluate_merge(self):
        pr = {"state": "OPEN", "isDraft": False, "mergeable": "MERGEABLE", "baseRefName": "main"}
        green = [{"name": "front", "bucket": "pass"}, {"name": "back", "bucket": "skipping"}]
        self.assertEqual(devflow.evaluate_merge(pr, green, "main", False), [])
        self.assertTrue(devflow.evaluate_merge({**pr, "isDraft": True}, green, "main", False))
        self.assertTrue(devflow.evaluate_merge({**pr, "mergeable": "CONFLICTING"}, green, "main", False))
        self.assertTrue(devflow.evaluate_merge({**pr, "baseRefName": "dev"}, green, "main", False))
        self.assertTrue(devflow.evaluate_merge(pr, [{"name": "front", "bucket": "fail"}], "main", False))
        self.assertTrue(devflow.evaluate_merge(pr, [{"name": "front", "bucket": "pending"}], "main", False))
        self.assertTrue(devflow.evaluate_merge(pr, [], "main", False))
        self.assertEqual(devflow.evaluate_merge(pr, [], "main", True), [])


class IssueEnsureTest(unittest.TestCase):
    def issues(self, items):
        return (("gh", "issue", "list"), ok(json.dumps(items)))

    def test_reuses_issue_with_plan_marker_even_if_closed(self):
        existing = {"number": 7, "title": "다른 제목", "state": "CLOSED", "url": "u7", "body": "x <!-- plan-id: p1 -->"}
        run = FakeRunner([self.issues([existing])])
        result = Flow(run).issue_ensure("feat: 새 기능", ISSUE_BODY, [], "p1")
        self.assertEqual((result["action"], result["number"]), ("reused", 7))
        self.assertFalse(run.ran("gh", "issue", "create"))

    def test_reuses_open_issue_with_same_title(self):
        existing = {"number": 3, "title": "feat: 새 기능", "state": "OPEN", "url": "u3", "body": ""}
        run = FakeRunner([self.issues([existing])])
        self.assertEqual(Flow(run).issue_ensure("FEAT: 새 기능", ISSUE_BODY, [], None)["number"], 3)
        self.assertFalse(run.ran("gh", "issue", "create"))

    def test_creates_with_only_existing_labels_and_marker(self):
        captured = {}

        def create(cmd):
            captured["cmd"] = cmd
            captured["body"] = Path(cmd[cmd.index("--body-file") + 1]).read_text(encoding="utf-8")
            return ok("https://github.com/o/r/issues/12")

        run = FakeRunner([
            self.issues([]),
            (("gh", "label", "list"), ok(json.dumps([{"name": "enhancement"}]))),
            (("gh", "issue", "create"), create),
        ])
        result = Flow(run).issue_ensure("feat: 새 기능", ISSUE_BODY, ["enhancement", "없는라벨"], "p9")
        self.assertEqual((result["action"], result["number"]), ("created", 12))
        self.assertIn("enhancement", captured["cmd"])
        self.assertNotIn("없는라벨", captured["cmd"])
        self.assertIn("<!-- plan-id: p9 -->", captured["body"])

    def test_label_lookup_failure_does_not_block(self):
        run = FakeRunner([
            self.issues([]),
            (("gh", "label", "list"), fail("forbidden")),
            (("gh", "issue", "create"), ok("https://github.com/o/r/issues/2")),
        ])
        self.assertEqual(Flow(run).issue_ensure("t", ISSUE_BODY, ["bug"], None)["number"], 2)
        self.assertNotIn("--label", run.ran("gh", "issue", "create")[0])

    def test_create_error_requeries_instead_of_retrying(self):
        created = {"number": 5, "title": "t", "state": "OPEN", "url": "u5", "body": "<!-- plan-id: p -->"}
        run = FakeRunner([
            (("gh", "issue", "list"), [ok("[]"), ok(json.dumps([created]))]),
            (("gh", "issue", "create"), fail("timeout")),
        ])
        result = Flow(run).issue_ensure("t", ISSUE_BODY, [], "p")
        self.assertEqual((result["action"], result["number"]), ("created-after-error", 5))
        self.assertEqual(len(run.ran("gh", "issue", "create")), 1)

    def test_create_error_without_issue_raises_once(self):
        run = FakeRunner([
            (("gh", "issue", "list"), ok("[]")),
            (("gh", "issue", "create"), fail("network")),
        ])
        with self.assertRaises(FlowError):
            Flow(run).issue_ensure("t", ISSUE_BODY, [], None)
        self.assertEqual(len(run.ran("gh", "issue", "create")), 1)

    def test_rejects_body_missing_sections(self):
        with self.assertRaises(FlowError):
            Flow(FakeRunner([])).issue_ensure("t", "## Background\n", [], None)


class BranchEnsureTest(unittest.TestCase):
    def base_rules(self, current="main", dirty="", local=False, remote=""):
        return [
            (("git", "branch", "--show-current"), ok(current)),
            (("git", "status", "--porcelain"), ok(dirty)),
            (("git", "rev-parse"), ok() if local else fail(code=1)),
            (("git", "ls-remote"), ok(remote)),
            DEFAULT,
        ]

    def test_already_on_branch_even_if_dirty(self):
        run = FakeRunner(self.base_rules(current="feat/1-x", dirty=" M a.ts"))
        self.assertEqual(Flow(run).branch_ensure("feat", "x", 1)["action"], "current")

    def test_dirty_tree_aborts_without_touching_files(self):
        run = FakeRunner(self.base_rules(dirty=" M a.ts"))
        with self.assertRaises(FlowError):
            Flow(run).branch_ensure("feat", "x", 1)
        self.assertFalse([c for c in run.calls if c[:2] in (["git", "switch"], ["git", "stash"], ["git", "checkout"])])

    def test_reuses_local_branch(self):
        run = FakeRunner(self.base_rules(local=True) + [(("git", "switch"), ok())])
        self.assertEqual(Flow(run).branch_ensure("feat", "x", 1)["action"], "reused-local")
        self.assertEqual(run.ran("git", "switch")[0], ["git", "switch", "feat/1-x"])

    def test_reuses_remote_branch(self):
        run = FakeRunner(self.base_rules(remote="abc\trefs/heads/feat/1-x") + [(("git", "fetch"), ok()), (("git", "switch"), ok())])
        self.assertEqual(Flow(run).branch_ensure("feat", "x", 1)["action"], "reused-remote")

    def test_creates_linked_branch_from_default(self):
        run = FakeRunner(self.base_rules() + [
            (("gh", "issue", "develop", "--list"), ok("")),
            (("gh", "issue", "develop"), ok()),
        ])
        result = Flow(run).branch_ensure("feat", "x", 9)
        self.assertEqual(result["action"], "created-linked")
        self.assertEqual(run.ran("gh", "issue", "develop", "9")[0],
                         ["gh", "issue", "develop", "9", "--name", "feat/9-x", "--base", "main", "--checkout"])

    def test_issue_with_other_linked_branch_aborts(self):
        run = FakeRunner(self.base_rules() + [(("gh", "issue", "develop", "--list"), ok("feat/9-old\thttps://x"))])
        with self.assertRaises(FlowError):
            Flow(run).branch_ensure("feat", "x", 9)
        self.assertFalse(run.ran("gh", "issue", "develop", "9"))

    def test_without_issue_branches_from_origin_default(self):
        run = FakeRunner(self.base_rules() + [(("git", "fetch"), ok()), (("git", "switch"), ok())])
        Flow(run).branch_ensure("chore", "bump", None)
        self.assertEqual(run.ran("git", "switch")[0], ["git", "switch", "-c", "chore/bump", "origin/main"])


class PrEnsureTest(unittest.TestCase):
    def rules(self, prs, branch="feat/1-x"):
        return [
            (("git", "branch", "--show-current"), ok(branch)),
            DEFAULT,
            (("gh", "pr", "list"), ok(json.dumps(prs))),
            (("git", "push"), ok()),
        ]

    def test_reuses_open_pr_without_creating(self):
        run = FakeRunner(self.rules([{"number": 4, "state": "OPEN", "url": "u4", "isDraft": False}]))
        result = Flow(run).pr_ensure("feat: x", PR_BODY, False, False)
        self.assertEqual((result["action"], result["number"]), ("reused", 4))
        self.assertFalse(run.ran("gh", "pr", "create"))
        self.assertFalse(run.ran("gh", "pr", "edit"))

    def test_update_edits_existing_pr(self):
        run = FakeRunner(self.rules([{"number": 4, "state": "OPEN", "url": "u4", "isDraft": False}]) + [(("gh", "pr", "edit"), ok())])
        self.assertEqual(Flow(run).pr_ensure("feat: x", PR_BODY, False, True)["action"], "updated")

    def test_merged_pr_aborts(self):
        run = FakeRunner(self.rules([{"number": 4, "state": "MERGED", "url": "u4", "isDraft": False}]))
        with self.assertRaises(FlowError):
            Flow(run).pr_ensure("feat: x", PR_BODY, False, False)
        self.assertFalse(run.ran("git", "push"))

    def test_refuses_default_branch(self):
        run = FakeRunner(self.rules([], branch="main"))
        with self.assertRaises(FlowError):
            Flow(run).pr_ensure("feat: x", PR_BODY, False, False)
        self.assertFalse(run.ran("git", "push"))

    def test_creates_draft_against_default(self):
        run = FakeRunner(self.rules([]) + [(("gh", "pr", "create"), ok("https://github.com/o/r/pull/8"))])
        result = Flow(run).pr_ensure("feat: x", PR_BODY, True, False)
        cmd = run.ran("gh", "pr", "create")[0]
        self.assertEqual(result["number"], 8)
        self.assertIn("--draft", cmd)
        self.assertEqual(cmd[cmd.index("--base") + 1], "main")
        self.assertEqual(run.ran("git", "push")[0], ["git", "push", "-u", "origin", "feat/1-x"])

    def test_create_error_requeries(self):
        run = FakeRunner([
            (("git", "branch", "--show-current"), ok("feat/1-x")),
            DEFAULT,
            (("gh", "pr", "list"), [ok("[]"), ok(json.dumps([{"number": 6, "state": "OPEN", "url": "u6", "isDraft": False}]))]),
            (("git", "push"), ok()),
            (("gh", "pr", "create"), fail("502")),
        ])
        self.assertEqual(Flow(run).pr_ensure("feat: x", PR_BODY, False, False)["action"], "created-after-error")

    def test_rejects_body_missing_sections(self):
        with self.assertRaises(FlowError):
            Flow(FakeRunner([])).pr_ensure("t", "## Summary\n", False, False)


class MergeTest(unittest.TestCase):
    PR = {"number": 4, "title": "t", "url": "u4", "state": "OPEN", "isDraft": False, "mergeable": "MERGEABLE",
          "baseRefName": "main", "headRefName": "feat/1-x", "headRefOid": "abc1234def", "closingIssuesReferences": [{"number": 1}]}

    def rules(self, checks):
        return [
            (("gh", "pr", "view"), ok(json.dumps(self.PR))),
            (("gh", "pr", "checks"), checks),
            DEFAULT,
            (("gh", "pr", "merge"), ok()),
            (("gh", "issue", "view"), ok("CLOSED")),
        ]

    def test_merges_with_squash_and_matching_sha(self):
        run = FakeRunner(self.rules(ok(json.dumps([{"name": "front", "bucket": "pass"}]))))
        result = Flow(run).merge("4", "abc1234def", False)
        self.assertEqual(result["issues"], {1: "CLOSED"})
        self.assertEqual(run.ran("gh", "pr", "merge")[0],
                         ["gh", "pr", "merge", "4", "--squash", "--delete-branch", "--match-head-commit", "abc1234def"])

    def test_failed_checks_block_merge(self):
        run = FakeRunner(self.rules(Result(1, json.dumps([{"name": "front", "bucket": "fail"}]), "")))
        with self.assertRaises(FlowError):
            Flow(run).merge("4", "abc1234def", False)
        self.assertFalse(run.ran("gh", "pr", "merge"))

    def test_no_checks_blocks_unless_allowed(self):
        no_checks = Result(1, "", "no checks reported on the 'feat/1-x' branch")
        with self.assertRaises(FlowError):
            Flow(FakeRunner(self.rules(no_checks))).merge("4", "abc1234def", False)
        run = FakeRunner(self.rules(no_checks))
        Flow(run).merge("4", "abc1234def", True)
        self.assertTrue(run.ran("gh", "pr", "merge"))

    def test_sha_mismatch_blocks_merge(self):
        run = FakeRunner(self.rules(ok(json.dumps([{"name": "front", "bucket": "pass"}]))))
        with self.assertRaises(FlowError):
            Flow(run).merge("4", "0000000", False)
        self.assertFalse(run.ran("gh", "pr", "merge"))

    def test_merge_check_cli_exit_code(self):
        run = FakeRunner(self.rules(Result(8, json.dumps([{"name": "back", "bucket": "pending"}]), "")))
        self.assertEqual(devflow.main(["merge-check", "4"], Flow(run)), 1)


if __name__ == "__main__":
    unittest.main()
