import importlib.util
import json
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location("ipa_builder", Path(__file__).with_name("lexical_build_final_learner_objects.py"))
builder = importlib.util.module_from_spec(spec)
spec.loader.exec_module(builder)


class PronunciationProjectionTest(unittest.TestCase):
    def word(self, ordinal, honor_form_decision=False):
        owner = builder.load(builder.WORDS / f"o{ordinal:04d}.json")
        decisions = builder.load(builder.DECISIONS)
        word_decision = (decisions.get("words") or {}).get(owner["word_id"]) or {}
        final = builder.compile_word(owner, decisions)
        expected_form = builder.compile_form(owner["record"].get("form_identity"))
        form_decision = word_decision.get("form_identity")
        if honor_form_decision and expected_form and (form_decision or {}).get("disposition") == "EXPLORE_ONLY":
            expected_form.update(disposition="EXPLORE_ONLY", repair=None)
        self.assertEqual(final["reference"]["form"], expected_form)
        # Reference/lifecycle dependencies are covered by the Reference projection tests.
        # Preserve the legacy IPA hash assertion for owners without those dependencies.
        has_lifecycle = any(r.get("status") and r["status"].lower() != "active" for r in owner.get("identity_refs", {}).get("collocations", []))
        if not owner.get("reference_senses") and not has_lifecycle and not final["sense_lineage"]:
            record, paths = builder.hydrate_relations(owner, owner["record"])
            fingerprint_inputs = {"record": record, "relation_paths": paths}
            if honor_form_decision and form_decision:
                fingerprint_inputs["form_identity_decision"] = builder.clone(form_decision)
            self.assertEqual(final["source_fingerprint"], builder.sha256(fingerprint_inputs))
        return final

    def readings(self, final, sense_id):
        support = final["pronunciation_support"]
        return [support["readings"][i] for i in support["sense_readings"].get(sense_id, [])]

    def test_fragment_and_unknown_are_not_completed_or_relabelled(self):
        form = {"headword_pronunciations": [{"ipa": "/-rət/", "locales": ["en-US"]}, {"ipa": "/ˈfɔltlɪs/", "locales": []}]}
        result = builder.compile_pronunciation_support(form, [])
        self.assertEqual([r["ipa"] for r in result["readings"]], ["/ˈfɔltlɪs/"])
        self.assertEqual(result["readings"][0]["locales"], [])
        self.assertIsNone(builder.compile_pronunciation_support({"variants": [{"ipa": "/-reɪt/"}]}, []))

    def test_ordinary_support_does_not_manufacture_reference_or_repair(self):
        final = self.word(177)
        self.assertIsNone(final["reference"]["form"])
        self.assertNotIn("repair", final["pronunciation_support"])
        self.assertTrue(any("en-US" in r["locales"] for r in final["pronunciation_support"]["readings"]))
        self.assertFalse(any("en-GB" in r["locales"] for r in final["pronunciation_support"]["readings"]))
        self.assertEqual(final["pronunciation_support"]["sense_readings"], {})

    def test_old_abstract_adjective_survives_new_leaf_exclusion(self):
        # Explicit background decision changes Repair, not lexical pronunciation truth.
        final = self.word(19, honor_form_decision=True)
        owner = builder.load(builder.WORDS / 'o0019.json')
        original = builder.clone(owner)
        decisions = builder.load(builder.DECISIONS)
        self.assertEqual(decisions['words']['word:abstract']['form_identity']['disposition'], 'EXPLORE_ONLY')
        ordinary_decisions = builder.clone(decisions)
        del ordinary_decisions['words']['word:abstract']['form_identity']
        ordinary = builder.compile_word(owner, ordinary_decisions)
        self.assertIsNotNone(ordinary['reference']['form']['repair'])
        self.assertIsNone(final['reference']['form']['repair'])
        self.assertEqual(final['reference']['form']['disposition'], 'EXPLORE_ONLY')
        for field in ('boundary', 'boundaries', 'variants'):
            self.assertEqual(final['reference']['form'][field], ordinary['reference']['form'][field])
        self.assertEqual(final['pronunciation_support'], ordinary['pronunciation_support'])
        self.assertEqual(final['sense_lineage'], ordinary['sense_lineage'])
        self.assertEqual(owner, original)
        adjective = "sense:abstract:b7b8b05117f3527c"
        readings = self.readings(final, adjective)
        self.assertEqual([r["ipa"] for r in readings], ["/ˈæb.strækt/"])
        self.assertEqual(readings[0]["evidence_basis"], "existing_form")
        self.assertEqual(readings[0]["locales"], [])

    def test_record_pos_and_row_identity_exclusions(self):
        record = self.word(3993)
        self.assertEqual(self.readings(record, "sense:record:06ebc585fa725045"), [])
        noun = self.readings(record, "sense:record:858ba19a9e4053b0")
        verb = self.readings(record, "sense:record:d6d74ba3bd5b5865")
        self.assertIn("/ˈrɛkɚd/", [r["ipa"] for r in noun])
        self.assertNotIn("/rɪˈkɔrd/", [r["ipa"] for r in noun])
        self.assertIn("/rɪˈkɔrd/", [r["ipa"] for r in verb])
        row = self.word(4209)
        self.assertEqual(self.readings(row, "sense:row:2250c8db5d4355be"), [])
        self.assertEqual(self.readings(row, "sense:row:17262aa0f0b9a602"), [])
        self.assertEqual(self.readings(row, "sense:row:95b218aabf4c5b9f")[0]["locales"], [])

    def test_case_strong_weak_and_transcription_limits_preserved(self):
        august = self.word(340)
        for sid, surface in [("sense:august:abd4aaa95974529f", "August"), ("sense:august:a4a009c595995813", "august")]:
            for reading in self.readings(august, sid):
                if reading["evidence_basis"] != "existing_form":
                    self.assertEqual(reading["applicability"][0]["surface"], surface)
                    self.assertTrue(reading["applicability"][0]["case_sensitive"])
        the = self.word(4960)["pronunciation_support"]
        self.assertEqual(len(the["readings"]), 3)
        self.assertEqual([r["applicability"][0]["conditions"]["source_sound_qualifiers_raw"]["note"] for r in the["readings"]], ["weak form before consonants", "strong form", "weak form before vowels"])
        faultless = self.word(5809)["pronunciation_support"]["readings"][0]
        self.assertEqual(faultless["evidence_basis"], "derived_moby")
        self.assertEqual(faultless["locales"], [])
        cigaret_final = self.word(807, honor_form_decision=True)
        cigaret = cigaret_final["pronunciation_support"]["readings"][0]
        self.assertFalse(cigaret["spelling_binding"]["direct_exact_cigaret_sound_claim"])
        self.assertEqual(cigaret["spelling_binding"]["source_surface"], "cigarette")

    def test_cigaret_lookup_form_decision_and_fingerprint(self):
        owner = builder.load(builder.WORDS / "o0807.json")
        decisions = builder.load(builder.DECISIONS)
        decided = builder.compile_word(owner, decisions)
        decision = decisions["words"][owner["word_id"]]["form_identity"]
        record, paths = builder.hydrate_relations(owner, owner["record"])
        decided_fingerprint_inputs = {
            "record": record,
            "relation_paths": paths,
            "form_identity_decision": builder.clone(decision),
        }

        expected_form = builder.compile_form(record.get("form_identity"))
        expected_form.update(disposition="EXPLORE_ONLY", repair=None)
        self.assertEqual(decided["reference"]["form"], expected_form)
        self.assertEqual(decided["source_fingerprint"], builder.sha256(decided_fingerprint_inputs))

        without_decision = builder.clone(decisions)
        del without_decision["words"][owner["word_id"]]["form_identity"]
        undecided = builder.compile_word(owner, without_decision)
        undecided_fingerprint_inputs = {"record": record, "relation_paths": paths}
        self.assertEqual(undecided["reference"]["form"], builder.compile_form(record.get("form_identity")))
        self.assertEqual(undecided["source_fingerprint"], builder.sha256(undecided_fingerprint_inputs))
        self.assertNotEqual(decided["source_fingerprint"], undecided["source_fingerprint"])

    def test_blank_has_no_invented_support(self):
        self.assertIsNone(self.word(5569)["pronunciation_support"])
        self.assertIsNone(builder.compile_pronunciation_support(None, []))

    def test_old_literal_boundary_is_preserved_without_scope_inference(self):
        support = self.word(4022)["pronunciation_support"]
        self.assertEqual([row["ipa"] for row in support["readings"]], ["/rɪˈfjuːz/", "/ˈrefjuːs/"])
        self.assertTrue(all(row["locales"] == [] for row in support["readings"]))
        self.assertEqual(support["sense_readings"], {})
        self.assertEqual(support["readings"][0]["applicability"][0]["conditions"]["owner_identity_condition"], "verb refuse")

    def test_inflected_variant_is_not_the_headword_reading(self):
        final = self.word(1156)
        support = final["pronunciation_support"]
        self.assertNotIn("/ˈkraɪ.siːz/", [row["ipa"] for row in support["readings"]])
        self.assertIn("/ˈkraɪ.sɪs/", [row["ipa"] for row in support["readings"]])
        self.assertIn("/ˈkraɪ.siːz/", [row["ipa"] for row in final["reference"]["form"]["variants"]])

    def test_explicit_new_scope_survives_unbound_legacy_fallback(self):
        form = {"choice_rule": "sense_selects_pronunciation",
                "variants": [{"ipa": "/baʊ/", "pos": ["noun"]}],
                "headword_pronunciations": [{"ipa": "/boʊ/", "locales": ["en-US"],
                    "applicability": [{"sense_ids": ["weapon"], "excluded_sense_ids": ["ship"]}]}]}
        support = builder.compile_pronunciation_support(form, [{"id": "weapon", "pos": "noun"}, {"id": "ship", "pos": "noun"}], "bow")
        self.assertEqual(support["sense_readings"], {"weapon": [0]})

    def test_sense_conditioned_form_cannot_bind_by_pos_alone(self):
        final = self.word(557)
        self.assertEqual(final["pronunciation_support"]["sense_readings"], {})
        self.assertTrue(final["pronunciation_support"]["readings"])
        self.assertEqual(self.readings(final, "sense:bow:2d29023eebfb52c2"), [])
        self.assertEqual(self.readings(final, "sense:bow:c7047fc7def157d3"), [])


if __name__ == "__main__":
    unittest.main()
