#!/usr/bin/env python3
from __future__ import annotations

import json
import os
import tempfile
import unittest
from argparse import Namespace
from pathlib import Path

import sys
sys.path.insert(0, str(Path(__file__).resolve().parent))
import lexical_live_batch as m


def write(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


class LiveBatchTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        self.cursor = self.root / "live-batch.json"
        self.pack = self.root / "content/lexical/semantic-audit/test.md"
        self.receipt = self.root / "content/lexical/execution/mutation-receipts/BF19-test.json"
        self.pack.parent.mkdir(parents=True, exist_ok=True)
        self.pack.write_text("# audit\n", encoding="utf-8")
        self.receipt.parent.mkdir(parents=True, exist_ok=True)
        self.receipt.write_text("{}\n", encoding="utf-8")
        write(self.cursor, {
            "schema": m.SCHEMA,
            "status": "ACTIVE",
            "frontier": {
                "candidate_id": "BF19",
                "range": [1951, 2050],
                "state": "MATERIALIZE_ALLOWED",
                "human_gate": {"status": "APPROVED", "ordinals": [], "approval_ref": "p"},
            },
            "next": {
                "candidate_id": "BF20",
                "range": [2051, 2150],
                "state": "REVIEW_AHEAD_FROZEN",
                "proposal_path": "proposal.md",
                "human_gate": {"status": "PENDING", "ordinals": [2130, 2137], "approval_ref": None},
            },
        })

    def tearDown(self):
        self.tmp.cleanup()

    def test_materialize_audit_pass_advance(self):
        old = Path.cwd()
        try:
            os.chdir(self.root)
            m.cmd_mark_materialized(Namespace(cursor=self.cursor, candidate="BF19", package_id="BF19-test", receipt=str(self.receipt.relative_to(self.root))))
            c = m.load(self.cursor)
            self.assertEqual(c["frontier"]["state"], "READY_FOR_B_READBACK")
            req = self.root / "content/lexical/execution/audit-result.json"
            write(req, {
                "schema": m.AUDIT_REQUEST_SCHEMA,
                "candidate_id": "BF19",
                "result": "PASS",
                "audit_pack": str(self.pack.relative_to(self.root)),
                "correction_ordinals": [],
                "blind_first": "ENFORCED",
            })
            m.cmd_record_audit_file(Namespace(cursor=self.cursor, request=req))
            c = m.load(self.cursor)
            self.assertEqual(c["frontier"]["state"], "READY_TO_MERGE")
            m.cmd_advance_after_merge(Namespace(cursor=self.cursor, candidate="BF19", merge_commit="a"*40))
            c = m.load(self.cursor)
            self.assertEqual(c["frontier"]["candidate_id"], "BF20")
            self.assertEqual(c["frontier"]["state"], "HUMAN_GATE_REQUIRED")
            self.assertEqual(c["next"]["candidate_id"], "BF21")
        finally:
            os.chdir(old)

    def test_pass_with_corrections_routes_to_reconcile(self):
        old = Path.cwd()
        try:
            os.chdir(self.root)
            m.cmd_mark_materialized(Namespace(cursor=self.cursor, candidate="BF19", package_id="BF19-test", receipt=str(self.receipt.relative_to(self.root))))
            req = self.root / "content/lexical/execution/audit-result.json"
            write(req, {
                "schema": m.AUDIT_REQUEST_SCHEMA,
                "candidate_id": "BF19",
                "result": "PASS_WITH_CORRECTIONS",
                "audit_pack": str(self.pack.relative_to(self.root)),
                "correction_ordinals": [2000],
            })
            m.cmd_record_audit_file(Namespace(cursor=self.cursor, request=req))
            c = m.load(self.cursor)
            self.assertEqual(c["frontier"]["state"], "RECONCILE_ALLOWED")
        finally:
            os.chdir(old)


if __name__ == "__main__":
    unittest.main()
