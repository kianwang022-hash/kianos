"""Secondary presentation must not retire independently addressable targets."""
import copy
import unittest
import lexical_build_final_learner_objects as b

class SecondaryVisibilityTest(unittest.TestCase):
    def test_all_present_decisions_keep_complete_targets_and_default_counts(self):
        decisions=b.load(b.DECISIONS)
        count=0
        for p in sorted(b.WORDS.glob('o*.json')):
            owner=b.load(p); wid=owner['word_id']
            configured=decisions.get('words',{}).get(wid,{}).get('secondary_senses',{})
            relevant={x.get('fact_id') or x.get('source_sense_id') for x in owner['record'].get('secondary_senses',[])} & set(configured)
            if not relevant: continue
            projected=b.compile_word(owner,decisions)
            unhidden=copy.deepcopy(decisions);unhidden['words'][wid].pop('secondary_senses',None)
            full=b.compile_word(owner,unhidden)
            self.assertNotEqual(projected['source_fingerprint'],full['source_fingerprint'])
            for obj in projected['secondary_senses']:
                plain=copy.deepcopy(obj);plain.pop('disposition',None)
                self.assertIn(plain,full['secondary_senses'])
                if obj.get('disposition')=='EXPLORE_ONLY':
                    count+=1
                    self.assertEqual(obj['repair']['target_kind'],'secondary_sense')
                    self.assertEqual(obj['repair']['target_id'],obj['id'])
                    self.assertTrue(obj['definition_cn'] or obj['definition_en'])
            # A physically absent branch produces the same Recall/density as presentation hiding.
            stripped=copy.deepcopy(owner)
            stripped['record']['secondary_senses']=[x for x in owner['record'].get('secondary_senses',[]) if configured.get(x.get('fact_id') or x.get('source_sense_id'),{}).get('disposition') in b.DEFAULT_LEARNER_DISPOSITIONS]
            self.assertEqual(projected['recall_map'],b.compile_word(stripped,unhidden)['recall_map'])
        self.assertGreater(count,0)

    def test_unmatched_decision_has_no_revision_or_object_effect(self):
        owner=b.load(b.WORDS/'o0029.json'); decisions=b.load(b.DECISIONS)
        original=b.compile_word(owner,decisions)
        altered=copy.deepcopy(decisions)
        altered.setdefault('words',{}).setdefault(owner['word_id'],{}).setdefault('secondary_senses',{})['not-a-real-fact']={'disposition':'EXPLORE_ONLY','reason':'synthetic unmatched control'}
        self.assertEqual(original,b.compile_word(owner,altered))

if __name__=='__main__':unittest.main()
