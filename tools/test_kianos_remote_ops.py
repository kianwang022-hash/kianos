#!/usr/bin/env python3

import json
import os
import signal
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
        self.assertIn("cached_origin_main", payload)
        self.assertNotIn("origin_main", payload)
        self.assertIn("cached local origin/main", payload["remote_ref_note"])
        self.assertIn("transient_processes", payload)
        self.assertIsInstance(payload["transient_processes"], list)

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
        self.assertIn("matching_lines=1", result.stdout)

    def test_packet_fails_closed_for_missing_explicit_file(self):
        temp, repo = self.make_repo()
        self.addCleanup(temp.cleanup)
        result = self.call("packet", "--repo", str(repo), "--file", "missing.txt")
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("requested file is missing", result.stdout)

    def test_packet_ranks_multi_pattern_files_first(self):
        temp, repo = self.make_repo()
        self.addCleanup(temp.cleanup)
        (repo / "one.txt").write_text("alpha only\n", encoding="utf-8")
        (repo / "both.txt").write_text("alpha beta\n", encoding="utf-8")
        result = self.call(
            "packet", "--repo", str(repo), "--scope", ".",
            "--grep", "alpha", "--grep", "beta", "--max-matches", "1",
        )
        self.assertEqual(result.returncode, 0, result.stdout)
        first_grep = result.stdout.split("## GREP ", 1)[1].splitlines()[0]
        self.assertTrue(first_grep.startswith("both.txt "), first_grep)
        self.assertIn("patterns=2/2", first_grep)

    def test_packet_fails_closed_for_missing_scope(self):
        temp, repo = self.make_repo()
        self.addCleanup(temp.cleanup)
        result = self.call(
            "packet", "--repo", str(repo), "--scope", "missing-dir", "--grep", "alpha",
        )
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("grep scope does not exist", result.stdout)

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


    def test_verify_allows_short_async_teardown(self):
        temp, repo = self.make_repo()
        self.addCleanup(temp.cleanup)
        marker = "/tmp/kianos-remote-ops-short-teardown"
        result = self.call(
            "verify", "--repo", str(repo),
            "--cmd", f"{sys.executable} -c 'import time; time.sleep(0.15)' --user-data-dir={marker} >/dev/null 2>&1 &",
            "--resource-grace-seconds", "1.0",
        )
        self.assertEqual(result.returncode, 0, result.stdout)
        payload = json.loads(result.stdout)
        self.assertTrue(payload["resource_hygiene"]["clean"], payload)

    def test_verify_fails_closed_when_command_leaks_transient_process(self):
        temp, repo = self.make_repo()
        self.addCleanup(temp.cleanup)
        marker = "/tmp/kianos-remote-ops-test-leak"
        result = self.call(
            "verify",
            "--repo",
            str(repo),
            "--cmd",
            f"{sys.executable} -c 'import time; time.sleep(60)' --user-data-dir={marker} >/dev/null 2>&1 &",
            "--resource-grace-seconds", "0.2",
        )
        self.assertEqual(result.returncode, 86, result.stdout)
        payload = json.loads(result.stdout)
        self.assertFalse(payload["ok"])
        leaks = payload["resource_hygiene"]["new_transient_processes"]
        self.assertTrue(leaks, payload)
        self.assertTrue(any(marker in row["command"] for row in leaks), leaks)
        for row in leaks:
            try:
                os.kill(int(row["pid"]), signal.SIGKILL)
            except ProcessLookupError:
                pass

    def test_hygiene_requires_exact_recognized_pid(self):
        temp, repo = self.make_repo()
        self.addCleanup(temp.cleanup)
        proc = subprocess.Popen(
            [sys.executable, "-c", "import time; time.sleep(60)", "--user-data-dir=/tmp/kianos-remote-ops-hygiene"],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        self.addCleanup(lambda: proc.poll() is None and proc.kill())
        for _ in range(20):
            listed = self.call("hygiene")
            rows = json.loads(listed.stdout)["transient_processes"]
            if any(int(row["pid"]) == proc.pid for row in rows):
                break
            import time as _time
            _time.sleep(0.05)
        applied = self.call("hygiene", "--apply", "--pid", str(proc.pid), "--grace-seconds", "0.2")
        self.assertEqual(applied.returncode, 0, applied.stdout)
        proc.wait(timeout=2)
        self.assertIsNotNone(proc.returncode)

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
