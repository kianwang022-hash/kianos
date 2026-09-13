#!/usr/bin/env python3
"""Synthetic contract/transport tests; these do not prove lexical K or learner U."""
import copy
import json
import tempfile
import unittest
from pathlib import Path
import lexical_shard as m


class TransportTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        for path in m.CONTRACTS:
            p = self.root / path
            p.parent.mkdir(parents=True, exist_ok=True)
            p.write_text('Catalog execution: ACTIVE\n')
        for n in range(1, 5):
            m.save(self.root / m.WORD.format(n), dict(schema='kianos.lexical.word_owner.v1',
                ordinal=n, word_id=f'word:w{n}', word=f'w{n}',
                record=dict(word_id=f'word:w{n}', word=f'w{n}',
                    core_concept={'mental_model_cn': '保留所有语义'},
                    senses=[{'sense_id': f's{n}', 'definition_cn': '意义',
                             'confidence': 'low', 'source_evidence': [{'note': 'needed'}]}],
                    constructions=[], verification_summary={'old': 'not semantic'}),
                identity_refs={'senses': [{'sense_id': f's{n}', 'status': 'active'}]},
                reference_senses=[{'definition_cn': '低频但不可丢弃'}], relation_refs=[],
                provenance={'audit': 'preserve on disk'}, lookup_refs=['pointer']))

    def bundle(self):
        return m.export(self.root, 1, 3)

    def patch(self, b):
        return {'bundle_id': b['bundle_id'], 'decisions': [dict(ordinal=w['view']['ordinal'],
            quality='SAFE_SIMPLE', operation='NO_CHANGE', rationale='Synthetic test judgment only',
            edits=[]) for w in b['words']]}

    def ack(self, c):
        return dict(candidate_id=c['candidate_id'], reviewer='synthetic-test',
            reviewed_views={o: f['view_hash'] for o, f in c['finals'].items()})

    def relation(self):
        ref = {'relation_id': 'relation:test', 'field': 'confusables', 'index': 0}
        owner = dict(relation_id=ref['relation_id'], canonical_record={'boundary': 'keep'},
            word_views=[dict(source_word_id=f'word:w{n}', field='confusables', index=0,
                            payload={'target': 'example'}) for n in (1, 2)])
        m.save(self.root / m.relation_path(ref), owner)
        for n in (1, 2):
            p = self.root / m.WORD.format(n)
            w = m.load(p)
            w['relation_refs'] = [ref]
            m.save(p, w)
        return ref

    def test_01_projection_is_loss_aware(self):
        b = self.bundle()
        v = b['words'][0]['view']
        self.assertNotIn('provenance', v)
        self.assertTrue(v['reference_senses'])
        self.assertEqual(v['record']['senses'][0]['confidence'], 'low')
        self.assertTrue(v['record']['senses'][0]['source_evidence'])
        self.assertTrue(v['identity_refs'])
        self.assertFalse(b['semantic_judgment'])

    def test_02_word_budget_resumes(self):
        b = m.export(self.root, 1, 4, max_words=2)
        self.assertEqual([w['view']['ordinal'] for w in b['words']], [1, 2])
        self.assertEqual(b['next_ordinal'], 3)

    def test_03_byte_budget_never_truncates(self):
        b = m.export(self.root, 1, 4, max_words=1)
        limited = m.export(self.root, 1, 4, max_bytes=len(m.encoded(b)) + 5)
        self.assertEqual(len(limited['words']), 1)
        self.assertEqual(limited['words'][0]['view'], b['words'][0]['view'])

    def test_04_oversized_is_explicit(self):
        with self.assertRaisesRegex(ValueError, 'BUNDLE_OVERSIZED'):
            m.export(self.root, 1, 4, max_bytes=10)

    def test_05_shared_relations_deduplicated(self):
        self.relation()
        b = self.bundle()
        self.assertEqual(len(b['relations']), 1)
        m.verify_bundle(self.root, b)

    def test_06_broken_relation_rejected(self):
        ref = self.relation()
        p = self.root / m.relation_path(ref)
        r = m.load(p)
        r['word_views'] = []
        m.save(p, r)
        with self.assertRaisesRegex(ValueError, 'RELATION_VIEW'):
            self.bundle()

    def test_07_no_change_real_attestation_required(self):
        b = self.bundle()
        p = self.patch(b)
        p['decisions'][0]['rationale'] = ''
        with self.assertRaisesRegex(ValueError, 'RATIONALE'):
            m.prepare(self.root, b, p)

    def test_08_missing_duplicate_and_foreign_judgments(self):
        b = self.bundle()
        for ordinals in ([1, 2], [1, 1, 3], [1, 2, 4]):
            p = self.patch(b)
            p['decisions'] = [dict(p['decisions'][0], ordinal=o) for o in ordinals]
            with self.assertRaisesRegex(ValueError, 'JUDGMENT'):
                m.prepare(self.root, b, p)

    def test_09_upgrade_preserves_metadata_without_live_write(self):
        b = self.bundle()
        p = self.patch(b)
        p['decisions'][0].update(operation='UPGRADED', edits=[{
            'pointer': '/record/core_concept', 'value': {'mental_model_cn': 'new'}}])
        before = (self.root / m.WORD.format(1)).read_bytes()
        c = m.prepare(self.root, b, p)
        self.assertEqual(c['changes'][m.WORD.format(1)]['provenance'], {'audit': 'preserve on disk'})
        self.assertEqual(before, (self.root / m.WORD.format(1)).read_bytes())
        self.assertEqual(c['status'], 'STAGED_PENDING_READBACK')

    def test_10_stale_word_and_authority_abort(self):
        for path in (m.WORD.format(1), m.CONTRACTS[1]):
            b = self.bundle()
            p = self.root / path
            raw = p.read_bytes()
            p.write_bytes(raw + b' ')
            with self.assertRaisesRegex(ValueError, 'STALE_READ_SET'):
                m.prepare(self.root, b, self.patch(b))
            p.write_bytes(raw)

    def test_11_unrelated_work_does_not_invalidate(self):
        b = self.bundle()
        (self.root / 'unrelated.txt').write_text('another worker')
        m.prepare(self.root, b, self.patch(b))

    def test_12_shared_owner_change_invalidates(self):
        ref = self.relation()
        b = self.bundle()
        p = self.root / m.relation_path(ref)
        p.write_text(p.read_text() + ' ')
        with self.assertRaisesRegex(ValueError, 'STALE_READ_SET'):
            m.prepare(self.root, b, self.patch(b))

    def test_13_unsafe_paths_and_identity_writes_rejected(self):
        with self.assertRaisesRegex(ValueError, 'UNSAFE_PATH'):
            m.safe(self.root, '../escape')
        b = self.bundle()
        for pointer in ('/ordinal', '/relation_refs', '/record', '/record/word_id'):
            p = self.patch(b)
            p['decisions'][0].update(operation='UPGRADED', edits=[{'pointer': pointer, 'value': []}])
            with self.assertRaises(ValueError):
                m.prepare(self.root, b, p)

    def test_14_lifecycle_not_silently_erased(self):
        b = self.bundle()
        p = self.patch(b)
        p['decisions'][0].update(operation='UPGRADED', edits=[{'pointer': '/record/senses', 'value': []}])
        with self.assertRaisesRegex(ValueError, 'LIFECYCLE'):
            m.prepare(self.root, b, p)

    def test_15_tampered_view_resealed_still_rejected(self):
        b = self.bundle()
        b['words'][0]['view']['record']['core_concept'] = {'fake': True}
        b.pop('bundle_id')
        b = m.seal(b, 'bundle_id')
        with self.assertRaisesRegex(ValueError, 'VIEW_MISMATCH'):
            m.prepare(self.root, b, self.patch(b))

    def test_16_tampered_candidate_resealed_still_rejected(self):
        b = self.bundle()
        c = m.prepare(self.root, b, self.patch(b))
        c['finals']['1']['view_hash'] = 'fake'
        c.pop('candidate_id')
        c = m.seal(c, 'candidate_id')
        with self.assertRaisesRegex(ValueError, 'REPLAY_MISMATCH'):
            m.publish_plan(self.root, b, c, self.ack(c))

    def test_17_all_final_views_required(self):
        b = self.bundle()
        c = m.prepare(self.root, b, self.patch(b))
        ack = self.ack(c)
        del ack['reviewed_views']['2']
        with self.assertRaisesRegex(ValueError, 'INCOMPLETE_FINAL_READBACK'):
            m.publish_plan(self.root, b, c, ack)

    def test_18_pause_blocks_publication_not_inspection(self):
        (self.root / m.CONTRACTS[0]).write_text('Catalog execution: PAUSED\n')
        b = self.bundle()
        c = m.prepare(self.root, b, self.patch(b))
        with self.assertRaisesRegex(ValueError, 'CATALOG_PAUSED'):
            m.publish_plan(self.root, b, c, self.ack(c))

    def test_19_local_close_does_not_promote_main(self):
        b = self.bundle()
        c = m.prepare(self.root, b, self.patch(b))
        plan = m.publish_plan(self.root, b, c, self.ack(c))
        self.assertFalse(plan['receipt']['main_acceptance'])
        self.assertEqual(plan['receipt']['catalog_count_delta'], 0)
        self.assertEqual(plan['tree_elements'], [])

    def test_20_blocked_needs_specific_closure(self):
        b = self.bundle()
        p = self.patch(b)
        p['decisions'][0]['quality'] = 'BLOCKED'
        with self.assertRaisesRegex(ValueError, 'BLOCKED_NEEDS'):
            m.prepare(self.root, b, p)
        p['decisions'][0]['blocker'] = {'requirement': 'ambiguous sense', 'closure': 'source evidence'}
        m.prepare(self.root, b, p)

    def test_21_unknown_semantic_fields_survive(self):
        p = self.root / m.WORD.format(1)
        o = m.load(p)
        o['record']['future_semantics'] = {'rare_boundary': 'keep'}
        m.save(p, o)
        self.assertIn('future_semantics', self.bundle()['words'][0]['view']['record'])

    def test_22_failed_stage_does_not_write_any_owner(self):
        b = self.bundle()
        p = self.patch(b)
        p['decisions'][0].update(operation='UPGRADED', edits=[{'pointer': '/record/core_concept', 'value': {'x': 1}}])
        p['decisions'][2]['rationale'] = ''
        hashes = {w['path']: (self.root / w['path']).read_bytes() for w in b['words']}
        with self.assertRaises(ValueError):
            m.prepare(self.root, b, p)
        self.assertEqual(hashes, {path: (self.root / path).read_bytes() for path in hashes})


if __name__ == '__main__':
    unittest.main(verbosity=2)
