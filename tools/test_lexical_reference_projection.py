import copy
import importlib.util
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location('reference_builder', Path(__file__).with_name('lexical_build_final_learner_objects.py'))
b = importlib.util.module_from_spec(spec)
spec.loader.exec_module(b)


class ReferenceProjectionTest(unittest.TestCase):
    def owner(self, n):
        return b.load(b.WORDS / f'o{n:04d}.json')

    def compile(self, owner):
        return b.compile_word(owner, b.load(b.DECISIONS))

    def test_demoted_truth_and_child_ids_are_complete_but_not_active(self):
        for n, sid, cid in [(545, 'sense:bore:30b1817c4fac5d13', 'collocation:3cf52dfbaa3f68349a27'), (695, 'sense:carriage:7479005566ec5ecc', 'collocation:5c3b7d1ebdbe39aae0e6'), (2847, 'sense:liquid:86e5952bc6015b21', 'collocation:83b0e28ff3434369f07e'), (1500, 'sense:dramatic:0d497d2864075582', 'collocation:3af41aaf13d1418ae3e0')]:
            owner = self.owner(n)
            final = self.compile(owner)
            self.assertNotIn(sid, [s['id'] for s in final['senses']])
            self.assertEqual(final['reference']['senses'], owner['reference_senses'])
            self.assertEqual(final['reference']['senses'][0]['collocations'][0]['collocation_id'], cid)
            lineage = {row['from_target_id']: row for row in final['sense_lineage']}
            self.assertEqual(lineage[sid]['status'], 'reference')
            self.assertEqual(lineage[cid]['target_kind'], 'collocation')
            self.assertIsNone(lineage[cid]['to_target_id'])
            self.assertNotIn(cid, owner['identity_refs']['active_collocations'])

    def test_explicit_background_form_keeps_lookup_truth_and_ipa(self):
        decisions = b.load(b.DECISIONS)
        for n, overlays in [(2405, ['sense:humor:619268be4f125c6a']), (2473, ['sense:import:2aea7b0ca1245c41', 'sense:import:c557e55d59865d39'])]:
            owner = self.owner(n)
            canonical = copy.deepcopy(owner)
            final = b.compile_word(owner, decisions)
            preserve = copy.deepcopy(decisions)
            preserve['words'][owner['word_id']].pop('form_identity')
            preserve['words'][owner['word_id']].pop('sense_identity_overlays')
            ordinary = b.compile_word(owner, preserve)
            form = final['reference']['form']
            self.assertEqual(form['disposition'], 'EXPLORE_ONLY')
            self.assertIsNone(form['repair'])
            for field in ('boundary', 'boundaries', 'variants'):
                self.assertEqual(form[field], ordinary['reference']['form'][field])
            self.assertEqual(final['pronunciation_support'], ordinary['pronunciation_support'])
            self.assertNotEqual(final['source_fingerprint'], ordinary['source_fingerprint'])
            self.assertEqual(owner, canonical)
            for sid in overlays:
                self.assertIsNone(next(s for s in final['senses'] if s['id'] == sid)['identity_overlay'])
                self.assertIsNotNone(next(s for s in ordinary['senses'] if s['id'] == sid)['identity_overlay'])
        for n in (1367, 2976):
            final = self.compile(self.owner(n))
            self.assertIsNotNone(final['reference']['form']['repair'])
            self.assertNotIn('disposition', final['reference']['form'])
        diet = self.compile(self.owner(1368))
        institution = next(s for s in diet['senses'] if s['id'] == 'sense:diet:3154a8051e2f505a')
        self.assertIsNotNone(institution['identity_overlay']['repair'])

    def test_reference_only_edits_change_existing_fingerprint(self):
        owner = self.owner(545)
        before = self.compile(owner)
        revised = copy.deepcopy(owner)
        revised['reference_senses'][0]['definition_en'] += ' synthetic-only revision'
        self.assertEqual(owner['record'], revised['record'])
        self.assertNotEqual(before['source_fingerprint'], self.compile(revised)['source_fingerprint'])

    def test_parent_lifecycle_only_change_updates_existing_fingerprint(self):
        owner = self.owner(695)
        before = self.compile(owner)
        revised = copy.deepcopy(owner)
        parent = next(r for r in revised['identity_refs']['senses'] if r['sense_id'] == 'sense:carriage:7479005566ec5ecc')
        parent['status'] = 'retired'
        self.assertEqual(owner['record'], revised['record'])
        self.assertEqual(owner['reference_senses'], revised['reference_senses'])
        self.assertEqual(owner['identity_refs']['collocations'], revised['identity_refs']['collocations'])
        after = self.compile(revised)
        self.assertNotEqual(before['sense_lineage'], after['sense_lineage'])
        self.assertNotEqual(before['source_fingerprint'], after['source_fingerprint'])

    def test_explicit_child_lifecycle_changes_existing_fingerprint(self):
        owner = self.owner(695)
        before = self.compile(owner)
        revised = copy.deepcopy(owner)
        child = next(r for r in revised['identity_refs']['collocations'] if r['id'] == 'collocation:5c3b7d1ebdbe39aae0e6')
        child['status'] = 'retired'
        self.assertEqual(owner['record'], revised['record'])
        self.assertNotEqual(before['source_fingerprint'], self.compile(revised)['source_fingerprint'])

    def test_absence_and_usage_examples_do_not_infer_freeze(self):
        owner = self.owner(555)
        original = copy.deepcopy(owner)
        final = self.compile(owner)
        expected_ids = {
            'collocation:9a835794b03a6d48bee7',
            'collocation:addf7319a4e463686a85',
            'collocation:fa5db2e585321a798690',
        }
        # Positive control: explicit source lifecycle must not be discarded.
        declared = [row for row in owner['identity_refs']['collocations']
                    if row.get('status') == 'reference']
        self.assertEqual({row['id'] for row in declared}, expected_ids)
        self.assertEqual(final['sense_lineage'], [
            {'word_id': 'word:bound', 'target_kind': 'collocation',
             'from_target_id': row['id'], 'status': 'reference', 'to_target_id': None}
            for row in declared])
        # Controlled negative fixture: no lifecycle declarations, not production data.
        controlled = copy.deepcopy(owner)
        controlled['identity_refs']['collocations'] = []
        controlled['identity_refs']['senses'] = []
        controlled['identity_refs']['facts'] = []
        self.assertNotIn('historical_locator_freezes',
                         b.load(b.DECISIONS).get('words', {}).get('word:bound', {}))
        no_lifecycle = self.compile(controlled)
        self.assertEqual(no_lifecycle['sense_lineage'], [])
        for output in (final, no_lifecycle):
            leap = next(s for s in output['senses'] if s['id'] == 'sense:bound:4df14c7f24475958')
            old = next(u for u in leap['usage'] if u['id'] == 'collocation:7fa2edc7720a9a3f51c1')
            self.assertEqual((old['phrase'], old['meaning_cn'], old['kind'], old['repair']),
                             ('bound up', '跳起', 'usage_example', None))
            self.assertFalse(any(row.get('from_target_id') == old['id']
                                 for row in output['sense_lineage']))
        self.assertEqual(owner, original)

    def test_distinct_construction_keeps_tied_adjective_attachment(self):
        final = self.compile(self.owner(555))
        rows = [c for c in final['constructions'] if c['id'] == 'construction:bound:bound-up-with']
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]['sense_id'], 'sense:bound:7abc4665b1ff5027')
        self.assertEqual(rows[0]['pattern'], 'be bound up with sth')
        self.assertNotEqual(rows[0]['id'], 'collocation:7fa2edc7720a9a3f51c1')

    def test_unaffected_dependencies_preserve_fingerprint_format(self):
        # Construct a dependency-free fixture explicitly; abstract itself is affected.
        owner = self.owner(19)
        controlled = copy.deepcopy(owner)
        controlled.pop('reference_senses', None)
        controlled['identity_refs']['facts'] = []
        controlled['identity_refs']['senses'] = [
            r for r in controlled['identity_refs']['senses'] if r.get('status') == 'active']
        controlled['identity_refs']['collocations'] = [
            r for r in controlled['identity_refs']['collocations']
            if not r.get('status') or r['status'] == 'active']
        decisions = b.load(b.DECISIONS)
        decisions['words'].pop('word:abstract', None)
        record, paths = b.hydrate_relations(controlled, controlled['record'])
        expected = b.sha256({'record': record, 'relation_paths': paths})
        final = b.compile_word(controlled, decisions)
        self.assertEqual(final['sense_lineage'], [])
        self.assertEqual(final['source_fingerprint'], expected)
        unrelated = copy.deepcopy(decisions)
        unrelated['words']['word:synthetic-unrelated'] = {
            'form_identity': {'disposition': 'EXPLORE_ONLY', 'reason': 'test-only unrelated'}}
        self.assertEqual(b.compile_word(controlled, unrelated), final)

    def test_abstract_explicit_dependencies_change_fingerprint_without_rewriting_owner(self):
        owner = self.owner(19)
        original = copy.deepcopy(owner)
        decisions = b.load(b.DECISIONS)
        final = b.compile_word(owner, decisions)
        record, paths = b.hydrate_relations(owner, owner['record'])
        # Independent expected lifecycle comes from source declarations, never output.
        source_senses = [r for r in owner['identity_refs']['senses']
                         if r.get('status') == 'deprecated']
        source_children = [r for r in owner['identity_refs']['collocations']
                           if r.get('status') == 'deprecated']
        self.assertEqual([r['sense_id'] for r in source_senses],
                         ['sense:abstract:101ad1c99ab15f03'])
        self.assertEqual({r['id'] for r in source_children},
                         {'collocation:2255bd40db066fe3d294',
                          'collocation:b4cb2e848b0a00a613f5'})
        self.assertTrue(all(r.get('merged_into_sense_id') is None for r in source_senses))
        self.assertTrue(all(r.get('merged_into_id') is None for r in source_children))
        expected_senses = [
            {'word_id': owner['word_id'], 'target_kind': 'sense',
             'from_target_id': r['sense_id'], 'status': 'deprecated', 'to_target_id': None}
            for r in source_senses]
        expected_children = [
            {'word_id': owner['word_id'], 'target_kind': 'collocation',
             'from_target_id': r['id'], 'status': 'deprecated', 'to_target_id': None}
            for r in source_children]
        source_facts = [r for r in owner['identity_refs']['facts']
                        if r.get('status') == 'deprecated' and r.get('target_kind') == 'construction']
        self.assertEqual({r['id'] for r in source_facts},
                         {'construction:19ab57ac7e31c4d9b201',
                          'construction:19ab57ac7e31c4d9b202',
                          'construction:19ab57ac7e31c4d9b203'})
        self.assertTrue(all('merged_into_id' in r and r['merged_into_id'] is None
                            for r in source_facts))
        expected_facts = [
            {'word_id': owner['word_id'], 'target_kind': 'construction',
             'from_target_id': r['id'], 'status': 'deprecated', 'to_target_id': None}
            for r in source_facts]
        self.assertEqual(final['sense_lineage'], expected_senses + expected_children + expected_facts)
        inputs = {'record': record, 'relation_paths': paths,
                  'form_identity_decision': decisions['words']['word:abstract']['form_identity'],
                  'reference_senses': owner['reference_senses'],
                  'sense_lineage': expected_senses,
                  'collocation_lineage': expected_children,
                  'fact_lineage': expected_facts}
        self.assertEqual(final['source_fingerprint'], b.sha256(inputs))
        self.assertNotEqual(final['source_fingerprint'], b.sha256({'record': record, 'relation_paths': paths}))
        revised = copy.deepcopy(owner)
        revised['reference_senses'][0]['definition_en'] += ' synthetic-only revision'
        self.assertNotEqual(b.compile_word(revised, decisions)['source_fingerprint'], final['source_fingerprint'])
        without_form = copy.deepcopy(decisions)
        without_form['words']['word:abstract'].pop('form_identity')
        self.assertNotEqual(b.compile_word(owner, without_form)['source_fingerprint'], final['source_fingerprint'])
        unrelated = copy.deepcopy(decisions)
        unrelated['words']['word:synthetic-unrelated'] = {'form_identity': {'disposition': 'EXPLORE_ONLY'}}
        self.assertEqual(b.compile_word(owner, unrelated), final)
        self.assertEqual(owner, original)


if __name__ == '__main__':
    unittest.main()
