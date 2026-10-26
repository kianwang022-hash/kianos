"""Attention is presentation, never target identity or new Repair evidence."""
import copy
import unittest

import lexical_build_final_learner_objects as builder


class AttentionLayerTest(unittest.TestCase):
    def setUp(self):
        self.owner = {
            "ordinal": 1,
            "word_id": "word:synthetic",
            "word": "synthetic",
            "record": {
                "word": "synthetic",
                "core_concept": {"core_meaning_cn": "合成测试"},
                "senses": [
                    {"sense_id": "sense:main", "pos": "verb", "definition_cn": "主要用法"},
                    {
                        "sense_id": "sense:optional", "pos": "noun",
                        "definition_cn": "可选识别义", "definition_en": "optional meaning",
                        "governing_pattern": "exact pattern", "usage_note": "exact note",
                        "lexical_identity_overlay": {"note": "exact identity boundary"},
                        "collocations": [{
                            "collocation_id": "collocation:optional", "phrase": "exact phrase",
                            "meaning_cn": "完整短语", "exam_value": "fixed_pattern",
                        }],
                    },
                ],
                "secondary_senses": [{
                    "fact_id": "secondary:optional", "pos": "adjective",
                    "definition_cn": "附加识别义", "definition_en": "secondary meaning",
                    "pattern": "exact secondary pattern",
                }],
                "constructions": [{
                    "construction_id": "construction:optional", "sense_id": "sense:optional",
                    "pattern": "synthetic pattern", "meaning_cn": "完整构式",
                    "definition_en": "complete construction", "boundary": "exact boundary",
                }],
            },
            "relation_refs": [],
        }

    def decisions(self, disposition="RECOGNITION_EXPANSION"):
        return {"words": {"word:synthetic": {
            "senses": {"sense:optional": {"disposition": disposition, "reason": "exact decision"}},
            "secondary_senses": {"secondary:optional": {"disposition": disposition}},
            "constructions": {"construction:optional": {"disposition": disposition}},
        }}}

    def test_optional_projection_keeps_complete_payloads_and_strict_targets(self):
        before_owner = copy.deepcopy(self.owner)
        baseline = builder.compile_word(self.owner, {})
        projected = builder.compile_word(self.owner, self.decisions())
        for field in ("senses", "secondary_senses", "constructions"):
            stripped = copy.deepcopy(projected[field])
            for item in stripped:
                item.pop("disposition", None)
            self.assertEqual(stripped, baseline[field])
        self.assertEqual(projected["sense_lineage"], baseline["sense_lineage"])
        self.assertEqual(projected["pronunciation_support"], baseline["pronunciation_support"])
        self.assertEqual(self.owner, before_owner)
        self.assertNotEqual(projected["source_fingerprint"], baseline["source_fingerprint"])

    def test_optional_and_reference_are_excluded_from_default_recall_and_density(self):
        for disposition in ("RECOGNITION_EXPANSION", "EXPLORE_ONLY"):
            with self.subTest(disposition=disposition):
                projected = builder.compile_word(self.owner, self.decisions(disposition))
                self.assertEqual(projected["recall_map"], {"parts": ["1V"], "density": "light"})
                self.assertEqual(len(projected["senses"]), 2)
                self.assertEqual(len(projected["secondary_senses"]), 1)
                self.assertEqual(len(projected["constructions"]), 1)

    def test_construction_default_density_uses_its_own_decision_not_parent(self):
        decisions = self.decisions()
        decisions["words"]["word:synthetic"].pop("constructions")
        projected = builder.compile_word(self.owner, decisions)
        self.assertEqual(projected["recall_map"], {"parts": ["1V"], "density": "rich"})
        self.assertNotIn("disposition", projected["constructions"][0])

    def test_default_depth_is_not_optional(self):
        baseline = builder.compile_word(self.owner, {})
        projected = builder.compile_word(self.owner, self.decisions("DEFAULT_DEPTH"))
        self.assertEqual(projected["recall_map"], baseline["recall_map"])

    def test_unknown_dispositions_on_matched_objects_fail_closed(self):
        for field, identity, error in (
            ("senses", "sense:optional", "SENSE"),
            ("secondary_senses", "secondary:optional", "SECONDARY"),
            ("constructions", "construction:optional", "CONSTRUCTION"),
        ):
            for invalid in ("UNKNOWN", "recognition_expansion", "", 2, False, []):
                with self.subTest(field=field, invalid=invalid):
                    decisions = {"words": {"word:synthetic": {field: {identity: {"disposition": invalid}}}}}
                    with self.assertRaisesRegex(RuntimeError, f"{error}_DISPOSITION_INVALID"):
                        builder.compile_word(self.owner, decisions)

    def test_unmatched_decisions_do_not_change_object_or_revision(self):
        baseline = builder.compile_word(self.owner, {})
        for field in ("senses", "secondary_senses", "constructions"):
            with self.subTest(field=field):
                decisions = {"words": {"word:synthetic": {field: {"not-current": {"disposition": "INVALID"}}}}}
                self.assertEqual(builder.compile_word(self.owner, decisions), baseline)

    def test_merged_construction_stays_merged_without_consuming_its_decision(self):
        self.owner["record"]["constructions"][0]["presentation_merge"] = {
            "surviving_object_id": "collocation:optional"
        }
        decisions = self.decisions()
        baseline_decisions = copy.deepcopy(decisions)
        baseline_decisions["words"]["word:synthetic"].pop("constructions")
        projected = builder.compile_word(self.owner, decisions)
        self.assertEqual(projected["constructions"], [])
        self.assertEqual(projected, builder.compile_word(self.owner, baseline_decisions))
        self.assertEqual(projected["senses"][1]["usage"][0]["id"], "collocation:optional")

    def test_only_consumed_construction_decisions_change_revision(self):
        baseline = builder.compile_word(self.owner, {})
        for disposition in ("DEFAULT_DEPTH", "RECOGNITION_EXPANSION", "EXPLORE_ONLY"):
            with self.subTest(disposition=disposition):
                decisions = {"words": {"word:synthetic": {
                    "constructions": {"construction:optional": {"disposition": disposition}}
                }}}
                projected = builder.compile_word(self.owner, decisions)
                self.assertNotEqual(projected["source_fingerprint"], baseline["source_fingerprint"])
                self.assertEqual(projected["constructions"][0]["disposition"], disposition)


if __name__ == "__main__":
    unittest.main()
