"""archive_plan.py 단위 테스트. 임시 디렉터리에만 쓴다.

실행: python3 -m unittest discover -s .claude/hooks -p 'test_*.py'
"""

import json
import os
import stat
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

SCRIPT = Path(__file__).with_name("archive_plan.py")
PLAN = "# 계획\n\n1. 첫 단계\n2. 두 번째 단계 — 한글·이모지 ✅\n"


class ArchivePlanTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        self.archive = self.root / "plans"
        self.log = self.root / "logs" / "archive_plan.log"

    def tearDown(self):
        for p in self.root.rglob("*"):
            if p.is_dir():
                p.chmod(stat.S_IRWXU)
        self.tmp.cleanup()

    def run_hook(self, payload, raw=None):
        env = {**os.environ, "CLAUDE_PROJECT_DIR": str(self.root),
               "PLAN_ARCHIVE_DIR": str(self.archive), "PLAN_ARCHIVE_LOG": str(self.log)}
        stdin = raw if raw is not None else json.dumps(payload)
        proc = subprocess.run([sys.executable, str(SCRIPT)], input=stdin, capture_output=True, text=True, env=env)
        self.assertEqual(proc.returncode, 0, proc.stderr)
        return json.loads(proc.stdout) if proc.stdout.strip() else None

    def payload(self, plan=PLAN, tool_use_id="toolu_1", session_id="s1", source="/tmp/plans/a.md"):
        return {"session_id": session_id, "hook_event_name": "PostToolUse", "tool_name": "ExitPlanMode",
                "tool_use_id": tool_use_id, "tool_input": {"plan": plan, "planFilePath": source},
                "tool_response": {"plan": plan, "filePath": source}}

    def entries(self):
        return sorted(p for p in self.archive.iterdir() if p.is_dir()) if self.archive.exists() else []

    def test_saves_plan_byte_identical(self):
        out = self.run_hook(self.payload())
        [entry] = self.entries()
        self.assertEqual((entry / "plan.md").read_bytes(), PLAN.encode("utf-8"))
        meta = json.loads((entry / "meta.json").read_text())
        self.assertEqual(meta["id"], entry.name)
        self.assertEqual(meta["status"], "approved")
        self.assertEqual(meta["tool_use_id"], "toolu_1")
        self.assertIn("Plan 보관", out["systemMessage"])

    def test_same_tool_use_id_saved_once(self):
        self.run_hook(self.payload())
        self.assertIsNone(self.run_hook(self.payload()))
        self.assertEqual(len(self.entries()), 1)

    def test_same_session_same_hash_skipped(self):
        self.run_hook(self.payload(tool_use_id="toolu_1"))
        self.assertIsNone(self.run_hook(self.payload(tool_use_id="toolu_2")))
        self.assertEqual(len(self.entries()), 1)

    def test_other_session_same_hash_saved(self):
        self.run_hook(self.payload(session_id="s1", tool_use_id="toolu_1"))
        self.run_hook(self.payload(session_id="s2", tool_use_id="toolu_2"))
        self.assertEqual(len(self.entries()), 2)

    def test_revised_plan_links_previous(self):
        self.run_hook(self.payload())
        self.run_hook(self.payload(plan=PLAN + "3. 추가 단계\n", tool_use_id="toolu_2"))
        first, second = sorted(self.entries(), key=lambda p: json.loads((p / "meta.json").read_text())["approved_at"] + p.name)
        metas = {json.loads((p / "meta.json").read_text())["tool_use_id"]: json.loads((p / "meta.json").read_text())
                 for p in (first, second)}
        self.assertEqual(metas["toolu_2"]["previous"], metas["toolu_1"]["id"])
        self.assertIsNone(metas["toolu_1"]["previous"])

    def test_falls_back_to_plan_file(self):
        src = self.root / "source.md"
        src.write_text(PLAN, encoding="utf-8")
        payload = {"session_id": "s1", "tool_use_id": "toolu_f", "tool_input": {"planFilePath": str(src)},
                   "tool_response": {}}
        self.run_hook(payload)
        [entry] = self.entries()
        self.assertEqual((entry / "plan.md").read_bytes(), PLAN.encode("utf-8"))

    def test_missing_plan_reports_failure(self):
        out = self.run_hook({"session_id": "s1", "tool_use_id": "x", "tool_input": {}, "tool_response": {}})
        self.assertIn("보관 실패", out["systemMessage"])
        self.assertTrue(self.log.exists())
        self.assertEqual(self.entries(), [])

    def test_invalid_json_reports_failure(self):
        out = self.run_hook(None, raw="not json")
        self.assertIn("보관 실패", out["systemMessage"])

    def test_unwritable_dir_reports_failure(self):
        self.archive.mkdir()
        self.archive.chmod(stat.S_IRUSR | stat.S_IXUSR)
        out = self.run_hook(self.payload())
        self.assertIn("보관 실패", out["systemMessage"])

    def test_sensitive_values_flagged_not_recorded(self):
        fake = "sk-" + "A" * 30
        fake_uri = "mongodb+srv://" + "admin:" + "hunter22" + "@x.net"  # 스캐너 오탐 방지용 런타임 조립
        plan = PLAN + f"\nMONGO_URI={fake_uri}\nOPENAI_KEY={fake}\n"
        out = self.run_hook(self.payload(plan=plan))
        [entry] = self.entries()
        meta_text = (entry / "meta.json").read_text()
        meta = json.loads(meta_text)
        self.assertEqual({f["pattern"] for f in meta["sensitive_findings"]} >= {"mongodb_credentials", "openai_or_anthropic_key"}, True)
        self.assertNotIn("hunter22", meta_text)
        self.assertNotIn(fake, meta_text)
        self.assertEqual((entry / "plan.md").read_text(), plan)  # 원문은 그대로
        self.assertIn("민감 정보", out["systemMessage"])

    def test_never_overwrites_existing_dir(self):
        self.run_hook(self.payload(session_id="s1", tool_use_id="t1"))
        self.run_hook(self.payload(session_id="s2", tool_use_id="t2"))
        names = [p.name for p in self.entries()]
        self.assertEqual(len(set(names)), 2)


if __name__ == "__main__":
    unittest.main()
