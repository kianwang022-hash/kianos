#!/usr/bin/env python3
"""Tests for the deterministic, non-semantic audit risk router."""

from __future__ import annotations

import argparse
import json
import tempfile
import unittest
from pathlib import Path

import lexical_audit_risk_router as router


class RouterTests(unittest.TestCase):
    def args(self, output: str = "manifest.json") -> argparse.Namespace:
        return argparse.Namespace(
            start=875,
            end=1124,
            semantic_handoff="content/lexical/semantic-review/o0875-o1124.md",
            output=output,
            blind_output=None,
            sample_output=None,
        )

    def package(self):
        package, blind, sample = router.generate(self.args())
        return package, blind, sample

    def test_deterministic_repeated_output(self):
        first = self.package()
        second = self.package()
        self.assertEqual(router.stable_json(first), router.stable_json(second))
        self.assertEqual(router.stable_json(first[1]), router.stable_json(second[1]))
        self.assertEqual(router.stable_json(first[2]), router.stable_json(second[2]))

    def test_exact_ordinal_coverage_and_counts(self):
        package, _, _ = self.package()
        rows = package["rows"]
        self.assertEqual(len(rows), 250)
        self.assertEqual([row["ordinal"] for row in rows], list(range(875, 1125)))
        self.assertEqual(package["production_operation_counts"], {"NO_CHANGE": 156, "UPGRADE": 94})
        self.assertEqual(sum(row["production_operation"] == "UPGRADE" for row in rows), 94)

    def test_overlapping_strata_are_not_double_counted(self):
        package, _, _ = self.package()
        rows = package["rows"]
        mandatory = {
            row["ordinal"]
            for row in rows
            if any(stratum != "SIMPLE_NO_CHANGE_CANDIDATE" for stratum in row["mandatory_strata"])
        }
        self.assertEqual(package["unique_mandatory_owner_count"], len(mandatory))
        self.assertLess(package["unique_mandatory_owner_count"], sum(bool(row["mandatory_strata"]) for row in rows) + 1)
        self.assertTrue(any(len(row["mandatory_strata"]) > 1 for row in rows))

    def test_upgrade_always_has_machine_floor_even_safe_simple(self):
        package, _, _ = self.package()
        for row in package["rows"]:
            if row["production_operation"] == "UPGRADE":
                self.assertEqual(row["machine_min_depth"], "AUDIT_COMPLEX")
                self.assertIn("PRODUCTION_UPGRADE", row["risk_flags"])
                self.assertIn("PRODUCTION_UPGRADE", row["mandatory_strata"])

    def test_known_structure_sentinels(self):
        package, _, _ = self.package()
        rows = {row["ordinal"]: row for row in package["rows"]}
        self.assertIn("FORM_PRONUNCIATION_SENTINEL", rows[897]["risk_flags"])
        self.assertIn("FORM_SPELLING_SENTINEL", rows[900]["risk_flags"])
        self.assertIn("PRODUCTION_PATTERN_SENTINEL", rows[918]["risk_flags"])
        self.assertIn("HAS_WORD_FAMILY_OR_RELATION", rows[919]["risk_flags"])
        self.assertIn("FORM_CASE_SENTINEL", rows[924]["risk_flags"])

    def test_simple_sample_is_deterministic_and_covers_endpoints(self):
        package, _, sample = self.package()
        simple = [row["ordinal"] for row in package["rows"] if row["machine_min_depth"] == "AUDIT_SIMPLE_CANDIDATE"]
        self.assertEqual(sample["simple_owner_count"], len(simple))
        self.assertEqual(sample["selected_ordinals"], router.sample_ordinals([row for row in package["rows"] if row["machine_min_depth"] == "AUDIT_SIMPLE_CANDIDATE"]))
        self.assertEqual(sample["selected_ordinals"][0], simple[0])
        self.assertEqual(sample["selected_ordinals"][-1], simple[-1])
        self.assertEqual(len(sample["selected_ordinals"]), 10)

    def test_hashes_and_blind_projection_withholds_production_detail(self):
        package, blind, _ = self.package()
        row = package["rows"][0]
        owner_path = router.ROOT / "content/lexical/words/by-ordinal/o0875.json"
        self.assertEqual(row["owner_hash"], router.sha256_file(owner_path))
        self.assertEqual(row["source_head"], router.git_head())
        self.assertEqual(blind["rows"][0]["ordinal"], 875)
        self.assertNotIn("production_operation", blind["rows"][0])
        self.assertNotIn("production_quality", blind["rows"][0])

    def test_malformed_handoff_and_owner_fail_explicitly(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "bad.md"
            path.write_text("- o0875 **wrong** — `NO_CHANGE` — `SAFE_SIMPLE`.\n", encoding="utf-8")
            with self.assertRaisesRegex(router.RouterError, "HANDOFF_SCOPE_MISMATCH"):
                router.parse_handoff(path, 875, 1124)
        with self.assertRaisesRegex(router.RouterError, "OWNER_SCHEMA_INVALID"):
            router.validate_owner({}, 875, router.ROOT / "bad-owner.json")


if __name__ == "__main__":
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(RouterTests)
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    raise SystemExit(0 if result.wasSuccessful() else 1)
