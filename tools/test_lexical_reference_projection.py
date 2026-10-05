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
        for n, sid, cid in [(545, 'sense:bore:30b1817c4fac5d13', 'collocation:3cf52dfbaa3f68349a27'), (695, 'sense:carriage:7479005566ec5ecc', 'collocation:5c3b7d1ebdbe39aae0e6')]:
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
        final = self.compile(owner)
        self.assertEqual(final['sense_lineage'], [])
        leap = next(s for s in final['senses'] if s['id'] == 'sense:bound:4df14c7f24475958')
        old = next(u for u in leap['usage'] if u['id'] == 'collocation:7fa2edc7720a9a3f51c1')
        self.assertEqual((old['phrase'], old['meaning_cn'], old['kind'], old['repair']), ('bound up', '跳起', 'usage_example', None))
        owner['identity_refs']['collocations'] = []
        self.assertEqual(self.compile(owner)['sense_lineage'], [])

    def test_distinct_construction_keeps_tied_adjective_attachment(self):
        final = self.compile(self.owner(555))
        rows = [c for c in final['constructions'] if c['id'] == 'construction:bound:bound-up-with']
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]['sense_id'], 'sense:bound:7abc4665b1ff5027')
        self.assertEqual(rows[0]['pattern'], 'be bound up with sth')
        self.assertNotEqual(rows[0]['id'], 'collocation:7fa2edc7720a9a3f51c1')

    def test_unaffected_dependencies_preserve_fingerprint_format(self):
        owner = self.owner(19)
        final = self.compile(owner)
        record, paths = b.hydrate_relations(owner, owner['record'])
        self.assertEqual(final['source_fingerprint'], b.sha256({'record': record, 'relation_paths': paths}))


if __name__ == '__main__':
    unittest.main()
