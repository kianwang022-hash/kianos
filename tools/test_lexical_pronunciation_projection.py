import importlib.util
import json
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location("ipa_builder", Path(__file__).with_name("lexical_build_final_learner_objects.py"))
builder = importlib.util.module_from_spec(spec)
spec.loader.exec_module(builder)


class PronunciationProjectionTest(unittest.TestCase):
    def word(self, ordinal):
        owner = builder.load(builder.WORDS / f"o{ordinal:04d}.json")
        final = builder.compile_word(owner, builder.load(builder.DECISIONS))
        self.assertEqual(final["reference"]["form"], builder.compile_form(owner["record"].get("form_identity")))
        self.assertEqual(final["source_fingerprint"], builder.sha256({"record": builder.hydrate_relations(owner, owner["record"])[0], "relation_paths": builder.hydrate_relations(owner, owner["record"])[1]}))
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
        final = self.word(19)
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
        cigaret = self.word(807)["pronunciation_support"]["readings"][0]
        self.assertFalse(cigaret["spelling_binding"]["direct_exact_cigaret_sound_claim"])
        self.assertEqual(cigaret["spelling_binding"]["source_surface"], "cigarette")

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
