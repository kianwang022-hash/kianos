"""Exact primary visibility must preserve every identity and nested payload."""
import copy
import unittest
import lexical_build_final_learner_objects as b
class SenseVisibilityTest(unittest.TestCase):
 def test_exact_payloads_and_unmatched(self):
  d=b.load(b.DECISIONS);count=0;expected_count=0
  for p in b.WORDS.glob('o*.json'):
   o=b.load(p);wd=d.get('words',{}).get(o['word_id'],{})
   if not wd.get('senses'):continue
   expected_count+=sum(wd['senses'].get(s.get('sense_id'),{}).get('disposition')=='EXPLORE_ONLY' for s in o['record']['senses'])
   full=copy.deepcopy(d);full['words'][o['word_id']].pop('senses')
   a=b.compile_word(o,full);v=b.compile_word(o,d)
   plain=copy.deepcopy(v['senses'])
   for s in plain:
    if s.pop('disposition',None)=='EXPLORE_ONLY':count+=1
   self.assertEqual(plain,a['senses']);self.assertEqual(v['pronunciation_support'],a['pronunciation_support']);self.assertEqual(v['constructions'],a['constructions']);self.assertEqual(v['sense_lineage'],a['sense_lineage'])
   bad=copy.deepcopy(d);bad['words'][o['word_id']]['senses']['missing']={'disposition':'INVALID'}
   self.assertEqual(v,b.compile_word(o,bad))
   bad['words'][o['word_id']]['senses'][v['senses'][0]['id']]={'disposition':'INVALID'}
   with self.assertRaisesRegex(RuntimeError,'SENSE_DISPOSITION_INVALID'):b.compile_word(o,bad)
  self.assertGreater(expected_count,0);self.assertEqual(count,expected_count)
 def test_hidden_materialized_collocation_stays_materialized(self):
  o=b.load(b.WORDS/'o3090.json');d=b.load(b.DECISIONS);s=o['record']['senses'][1]
  o=copy.deepcopy(o);o['record']['constructions'].append({'construction_id':'synthetic','pattern':'synthetic','presentation_merge':{'surviving_object_id':s['collocations'][0]['collocation_id']}})
  full=copy.deepcopy(d);full['words'][o['word_id']].pop('senses')
  hidden=b.compile_word(o,d)['constructions'];self.assertEqual(hidden,b.compile_word(o,full)['constructions']);self.assertFalse(any(c['id']=='synthetic' for c in hidden))
if __name__=='__main__':unittest.main()
