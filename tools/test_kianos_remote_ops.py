#!/usr/bin/env python3

import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


SCRIPT = Path(__file__).with_name("kianos_remote_ops.py")


class RemoteOpsTests(unittest.TestCase):
    def make_repo(self):
        temp = tempfile.TemporaryDirectory()
        repo = Path(temp.name)
        subprocess.run(["git", "init", "-b", "main"], cwd=repo, check=True, stdout=subprocess.DEVNULL)
        subprocess.run(["git", "config", "user.name", "Test"], cwd=repo, check=True)
        subprocess.run(["git", "config", "user.email", "test@example.com"], cwd=repo, check=True)
        (repo / "notes.txt").write_text("alpha\nneedle here\nomega\n", encoding="utf-8")
        subprocess.run(["git", "add", "notes.txt"], cwd=repo, check=True)
        subprocess.run(["git", "commit", "-m", "init"], cwd=repo, check=True, stdout=subprocess.DEVNULL)
        return temp, repo

    def call(self, *args):
        return subprocess.run(
            [sys.executable, str(SCRIPT), *args],
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            check=False,
        )

    def test_snapshot_reports_dirty_state(self):
        temp, repo = self.make_repo()
        self.addCleanup(temp.cleanup)
        (repo / "notes.txt").write_text("changed\n", encoding="utf-8")
        result = self.call("snapshot", "--repo", str(repo))
        self.assertEqual(result.returncode, 0, result.stdout)
        payload = json.loads(result.stdout)
        self.assertEqual(payload["branch"], "main")
        self.assertEqual(payload["dirty_count"], 1)
        self.assertTrue(payload["head"])

    def test_packet_combines_file_range_and_grep(self):
        temp, repo = self.make_repo()
        self.addCleanup(temp.cleanup)
        result = self.call(
            "packet",
            "--repo",
            str(repo),
            "--range",
            "notes.txt:2:3",
            "--scope",
            ".",
            "--grep",
            "needle",
        )
        self.assertEqual(result.returncode, 0, result.stdout)
        self.assertIn("## RANGE notes.txt:2:3", result.stdout)
        self.assertIn("2: needle here", result.stdout)
        self.assertIn("## GREP notes.txt", result.stdout)
        self.assertIn("matches=1", result.stdout)

    def test_verify_runs_commands_and_keeps_full_logs(self):
        temp, repo = self.make_repo()
        self.addCleanup(temp.cleanup)
        result = self.call(
            "verify",
            "--repo",
            str(repo),
            "--cmd",
            "printf 'hello\\n'",
            "--cmd",
            "printf 'world\\n'",
        )
        self.assertEqual(result.returncode, 0, result.stdout)
        payload = json.loads(result.stdout)
        self.assertTrue(payload["ok"])
        self.assertEqual(len(payload["commands"]), 2)
        self.assertEqual(payload["commands"][0]["tail"], ["hello"])
        self.assertTrue(Path(payload["commands"][0]["log"]).exists())

    def test_verify_stops_on_failure_by_default(self):
        temp, repo = self.make_repo()
        self.addCleanup(temp.cleanup)
        result = self.call(
            "verify",
            "--repo",
            str(repo),
            "--cmd",
            "printf 'before\\n'",
            "--cmd",
            "exit 7",
            "--cmd",
            "printf 'after\\n'",
        )
        self.assertEqual(result.returncode, 7, result.stdout)
        payload = json.loads(result.stdout)
        self.assertFalse(payload["ok"])
        self.assertEqual(len(payload["commands"]), 2)
        self.assertEqual(payload["commands"][1]["exit_code"], 7)


if __name__ == "__main__":
    unittest.main()
