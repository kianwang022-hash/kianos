#!/usr/bin/env python3
from __future__ import annotations

import json
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import authority_projection_audit as projection
from governance_current_audit import closure_consistency_conflicts, reviewed_derivation_revision_conflict


class ClosureInvariantTests(unittest.TestCase):
    def test_closed_rejects_live_state(self):
        value = {
            "status": "CLOSED_CURRENT",
            "current": {
                "next_action": "finish downstream QA",
                "acceptance_status": "PENDING_FINAL_QA",
                "active_other_rebase": True,
            },
        }
        conflicts = closure_consistency_conflicts(value)
        self.assertTrue(any(x.startswith("LIVE_NEXT_ACTION") for x in conflicts))
        self.assertTrue(any(x.startswith("LIVE_ACCEPTANCE") for x in conflicts))
        self.assertTrue(any(x.startswith("LIVE_ACTIVE_FLAG") for x in conflicts))

    def test_nested_closed_subtree_rejects_live_state(self):
        value = {
            "status": "CURRENT",
            "architecture_v3": {
                "status": "CLOSED_CURRENT",
                "downstream": {
                    "acceptance_status": "PENDING_FINAL_QA",
                    "next_action": "finish exact reconciliation",
                },
            },
        }
        conflicts = closure_consistency_conflicts(value)
        self.assertTrue(any(x.startswith("LIVE_ACCEPTANCE:architecture_v3") for x in conflicts))
        self.assertTrue(any(x.startswith("LIVE_NEXT_ACTION:architecture_v3") for x in conflicts))

    def test_closed_ignores_explicit_history(self):
        value = {
            "status": "CLOSED_CURRENT",
            "historical_next_action": "old next step",
            "previous_review": {"status": "REVALIDATION_PENDING", "next_action": "old"},
            "provenance": {"status": "PENDING_AT_THE_TIME"},
        }
        self.assertEqual([], closure_consistency_conflicts(value))

    def test_review_witness_is_revision_not_identity(self):
        self.assertTrue(reviewed_derivation_revision_conflict("new", "old", True))
        self.assertFalse(reviewed_derivation_revision_conflict("new", "old", False))
        self.assertFalse(reviewed_derivation_revision_conflict("same", "same", True))


class DerivedProjectionFreshnessTests(unittest.TestCase):
    def fixture(self):
        temp = tempfile.TemporaryDirectory()
        root = Path(temp.name)
        (root / "source.md").write_text("# source\n", encoding="utf-8")
        (root / "projection.json").write_text(json.dumps({
            "source": "source.md",
            "authority": "DERIVED_PROJECTION",
        }), encoding="utf-8")
        (root / "validator.py").write_text("# reads source.md and projection.json\n", encoding="utf-8")
        (root / "workflow.yml").write_text(
            "pull_request:\n  paths: [source.md, projection.json, validator.py]\n"
            "push:\n  branches: [main]\n  paths: [source.md, projection.json, validator.py]\n"
            "run: python validator.py\n",
            encoding="utf-8",
        )
        registry = {
            "derived_projections": {
                "fixture": {
                    "path": "projection.json",
                    "source": "source.md",
                    "authority": "DERIVED_PROJECTION",
                    "freshness": {
                        "mode": "VALIDATED_AGAINST_CURRENT_SOURCE",
                        "validator": "validator.py",
                        "workflow": "workflow.yml",
                    },
                }
            }
        }
        return temp, root, registry

    def run_audit(self, root, registry):
        projection.REPO = root
        projection.errors.clear()
        projection.checks = 0
        projection.audit_derived(registry)
        return list(projection.errors)

    def test_valid_freshness_contract_passes(self):
        temp, root, registry = self.fixture()
        try:
            self.assertEqual([], self.run_audit(root, registry))
        finally:
            temp.cleanup()

    def test_missing_source_trigger_fails(self):
        temp, root, registry = self.fixture()
        try:
            (root / "workflow.yml").write_text(
                "pull_request:\n  paths: [projection.json, validator.py]\n"
                "push:\n  branches: [main]\n  paths: [projection.json, validator.py]\n"
                "run: python validator.py\n",
                encoding="utf-8",
            )
            errors = self.run_audit(root, registry)
            self.assertTrue(any(x.startswith("DERIVED_WORKFLOW_MISSES_SOURCE_TRIGGER") for x in errors))
        finally:
            temp.cleanup()


if __name__ == "__main__":
    unittest.main()
