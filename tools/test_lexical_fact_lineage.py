"""Small source-derived tests; no review packet or fixed global ID count required."""
import copy
import importlib.util
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location('fact_builder', Path(__file__).with_name('lexical_build_final_learner_objects.py'))
b = importlib.util.module_from_spec(spec)
spec.loader.exec_module(b)


class FactLineageTest(unittest.TestCase):
    def fixture(self, facts=None):
        return {'ordinal': 1, 'word_id': 'word:synthetic', 'word': 'synthetic',
                'record': {'word': 'synthetic', 'senses': [], 'constructions': [], 'secondary_senses': []},
                'identity_refs': {'facts': facts or []}}

    def declaration(self, kind='construction'):
        return {'id': 'stable-original-id', 'target_kind': kind,
                'status': 'deprecated', 'merged_into_id': None}

    def test_explicit_same_kind_and_conditional_fingerprint(self):
        for kind in ('construction', 'secondary_sense'):
            owner = self.fixture([self.declaration(kind)])
            original = copy.deepcopy(owner)
            row = {'word_id': owner['word_id'], 'target_kind': kind,
                   'from_target_id': 'stable-original-id', 'status': 'deprecated', 'to_target_id': None}
            final = b.compile_word(owner, {})
            self.assertEqual(final['sense_lineage'], [row])
            self.assertEqual(final['source_fingerprint'], b.sha256({
                'record': owner['record'], 'relation_paths': [], 'fact_lineage': [row]}))
            self.assertEqual(owner, original)
            owner['identity_refs']['facts'] = []
            empty = b.compile_word(owner, {})
            self.assertEqual(empty['sense_lineage'], [])
            self.assertEqual(empty['source_fingerprint'], b.sha256({'record': owner['record'], 'relation_paths': []}))
            for field in ('source_fingerprint', 'sense_lineage'):
                final.pop(field); empty.pop(field)
            self.assertEqual(final, empty)

    def test_excluded_declarations_have_no_fingerprint_effect(self):
        baseline = b.compile_word(self.fixture(), {})
        variants = []
        for key, value in [('status', 'active'), ('status', 'reference'), ('status', 'unknown'),
                           ('status', None), ('target_kind', 'relation'), ('target_kind', None),
                           ('id', None), ('id', ''), ('id', ' padded '),
                           ('merged_into_id', 'successor'), ('merged_into_id', 'stable-original-id')]:
            row = self.declaration(); row[key] = value; variants.append(row)
        for key in ('status', 'target_kind', 'id', 'merged_into_id'):
            row = self.declaration(); row.pop(key); variants.append(row)
        variants.extend([None, {}, 'invalid'])
        for row in variants:
            with self.subTest(row=row):
                owner = self.fixture([row]); original = copy.deepcopy(owner)
                self.assertEqual(b.compile_word(owner, {}), baseline)
                self.assertEqual(owner, original)

    def test_duplicate_and_conflicting_declarations_are_not_consumed(self):
        for extra in [self.declaration(), dict(self.declaration(), status='active'),
                      dict(self.declaration(), target_kind='secondary_sense'),
                      dict(self.declaration(), target_kind=None)]:
            owner = self.fixture([self.declaration(), extra])
            self.assertEqual(b.compile_word(owner, {}), b.compile_word(self.fixture(), {}))

    def test_current_binding_blocks_even_explore_only_and_no_cross_kind_alias(self):
        for kind in ('construction', 'secondary_sense'):
            owner = self.fixture([self.declaration(kind)])
            field = 'constructions' if kind == 'construction' else 'secondary_senses'
            owner['record'][field] = [{'fact_id': 'stable-original-id', 'pattern': 'a pattern',
                                       'pos': 'noun', 'definition_en': 'a meaning'}]
            decisions = {'words': {'word:synthetic': {'secondary_senses': {
                'stable-original-id': {'disposition': 'EXPLORE_ONLY'}}}}}
            self.assertEqual(b.compile_word(owner, decisions)['sense_lineage'], [])
            owner['identity_refs']['facts'][0]['target_kind'] = (
                'secondary_sense' if kind == 'construction' else 'construction')
            row = b.compile_word(owner, decisions)['sense_lineage'][0]
            self.assertEqual(row['target_kind'], owner['identity_refs']['facts'][0]['target_kind'])
            self.assertIsNone(row['to_target_id'])

    def test_source_approved_declarations_not_fixed_global_count(self):
        # These reviewed words have no active same-kind conflict. Missing kinds
        # stay excluded until an approved source metadata change supplies them.
        for ordinal in (19, 123, 261, 322, 333, 385):
            owner = b.load(b.WORDS / f'o{ordinal:04d}.json')
            original = copy.deepcopy(owner)
            expected = [{'word_id': owner['word_id'], 'target_kind': row['target_kind'],
                         'from_target_id': row['id'], 'status': 'deprecated', 'to_target_id': None}
                        for row in owner['identity_refs']['facts']
                        if row.get('status') == 'deprecated'
                        and row.get('target_kind') in ('construction', 'secondary_sense')
                        and 'merged_into_id' in row and row['merged_into_id'] is None]
            final = b.compile_word(owner, b.load(b.DECISIONS))
            observed = [row for row in final['sense_lineage']
                        if row.get('target_kind') in ('construction', 'secondary_sense')]
            self.assertEqual(observed, expected)
            self.assertEqual(owner, original)
            if ordinal == 19:
                self.assertEqual({row['from_target_id'] for row in expected},
                                 {f'construction:19ab57ac7e31c4d9b20{i}' for i in (1, 2, 3)})


if __name__ == '__main__':
    unittest.main()
