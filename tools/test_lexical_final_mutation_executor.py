#!/usr/bin/env python3
from __future__ import annotations

import copy
import hashlib
import json
import subprocess
import tempfile
import unittest
from pathlib import Path

import sys
sys.path.insert(0, str(Path(__file__).resolve().parent))
import lexical_apply_final_mutation_package as m


def write_json(path: Path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def run(root: Path, *args):
    return subprocess.check_output(["git", "-C", str(root), *args], stderr=subprocess.STDOUT).decode().strip()


class ExecutorFixture:
    def __init__(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        run(self.root, "init")
        run(self.root, "config", "user.email", "test@example.com")
        run(self.root, "config", "user.name", "Test")
        self.word_path = self.root / "content/lexical/words/by-ordinal/o0101.json"
        self.board_path = self.root / m.BOARD_PATH
        self.package_path = self.root / "content/lexical/execution/final-mutation-package.json"
        self.owner = {
            "schema": "kianos.lexical.word_owner.v1",
            "ordinal": 101,
            "word_id": "word:affection",
            "word": "affection",
            "record": {
                "word_id": "word:affection",
                "word": "affection",
                "core_concept": {
                    "core_clusters": [],
                    "core_meaning_cn": "感情",
                    "core_meaning_en": "affection",
                    "mental_model_cn": "",
                    "mental_model_en": "",
                },
                "senses": [{
                    "sense_id": "sense:affection:test",
                    "pos": "noun",
                    "definition_cn": "感情",
                    "definition_en": "affection",
                }],
            },
            "relation_refs": [],
            "reference_senses": [],
            "identity_refs": {
                "senses": [{
                    "sense_id": "sense:affection:test",
                    "status": "active",
                    "merged_into_sense_id": None,
                }]
            },
        }
        self.board = {
            "schema": m.BOARD_SCHEMA,
            "frontier": {
                "current_candidate_id": "BF01",
                "range": [101, 200],
                "state": "MATERIALIZE_ALLOWED",
            },
        }
        write_json(self.word_path, self.owner)
        write_json(self.board_path, self.board)
        run(self.root, "add", ".")
        run(self.root, "commit", "-m", "base")
        self.base = run(self.root, "rev-parse", "HEAD")

    def make_package(self, *, expected=None, path=None):
        path = path or "content/lexical/words/by-ordinal/o0101.json"
        expected = expected or m.filehash(self.word_path)
        package = {
            "schema": m.PACKAGE_SCHEMA,
            "package_id": "BF01-test",
            "candidate_id": "BF01",
            "range": {"start_ordinal": 101, "end_ordinal": 200},
            "lane": "A",
            "source_head": self.base,
            "human_gate": {"approved": True, "approval_ref": "proposal@approved"},
            "writes": [{
                "path": path,
                "mode": "patch_json",
                "expected_sha256": expected,
                "edits": [{
                    "pointer": "/record/core_concept",
                    "value": {
                        "core_clusters": [],
                        "core_meaning_cn": "温和而持续的喜爱",
                        "core_meaning_en": "a warm lasting feeling of liking",
                        "mental_model_cn": "温和、持续的亲近感",
                        "mental_model_en": "warm lasting fondness",
                    },
                }],
            }],
        }
        write_json(self.package_path, package)
        run(self.root, "add", str(self.package_path.relative_to(self.root)))
        run(self.root, "commit", "-m", "request")
        return package

    def close(self):
        self.tmp.cleanup()


class MutationExecutorTests(unittest.TestCase):
    def test_happy_path_applies_exact_patch_and_receipt(self):
        fx = ExecutorFixture()
        try:
            fx.make_package()
            receipt_path, receipt = m.apply_package(
                fx.root, fx.package_path, "work/lexical-continuous-test"
            )
            owner = m.load_json(fx.word_path)
            self.assertEqual(owner["record"]["core_concept"]["core_meaning_cn"], "温和而持续的喜爱")
            self.assertEqual(receipt["status"], "MUTATIONS_APPLIED_PENDING_FLOB_REBUILD_AND_VALIDATION")
            self.assertTrue(receipt_path.is_file())
            self.assertFalse(receipt["main_merge_authorized"])
        finally:
            fx.close()

    def test_stale_hash_fails_closed(self):
        fx = ExecutorFixture()
        try:
            fx.make_package(expected="0" * 64)
            with self.assertRaisesRegex(ValueError, "STALE_FILE"):
                m.apply_package(fx.root, fx.package_path, "work/lexical-continuous-test")
        finally:
            fx.close()

    def test_non_frontier_state_fails_closed(self):
        fx = ExecutorFixture()
        try:
            fx.board["frontier"]["state"] = "WAIT_FOR_FRONTIER"
            write_json(fx.board_path, fx.board)
            run(fx.root, "add", ".")
            run(fx.root, "commit", "-m", "board wait")
            fx.base = run(fx.root, "rev-parse", "HEAD")
            fx.make_package()
            with self.assertRaisesRegex(ValueError, "FRONTIER_NOT_EXECUTABLE"):
                m.apply_package(fx.root, fx.package_path, "work/lexical-continuous-test")
        finally:
            fx.close()

    def test_non_lexical_path_fails_closed(self):
        fx = ExecutorFixture()
        try:
            fx.make_package(path="static-web/forbidden.json")
            with self.assertRaisesRegex(ValueError, "WRITE_SCOPE_VIOLATION"):
                m.apply_package(fx.root, fx.package_path, "work/lexical-continuous-test")
        finally:
            fx.close()

    def test_wrong_branch_fails_closed(self):
        fx = ExecutorFixture()
        try:
            fx.make_package()
            with self.assertRaisesRegex(ValueError, "EXECUTOR_BRANCH_FORBIDDEN"):
                m.apply_package(fx.root, fx.package_path, "main")
        finally:
            fx.close()


if __name__ == "__main__":
    unittest.main()
