#!/usr/bin/env python3
from __future__ import annotations
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
SRC=ROOT/'content/lexical/execution/preflight/o4375-o4874.current-identities.json'
OUT=ROOT/'content/lexical/execution/preflight/o4375-o4874.identity-index.json'

def slim_sense(x):
    return {k:x.get(k) for k in ('sense_id','stable_sense_id','status','merged_into_sense_id','pos','definition_en','definition_cn','level','governing_pattern') if x.get(k) is not None}

def main():
    obj=json.loads(SRC.read_text(encoding='utf-8'))
    rows=[]
    for o in obj['owners']:
        rows.append({
          'ordinal':o['ordinal'],'word':o['word'],'word_id':o['word_id'],
          'active':[slim_sense(x) for x in o.get('active_senses',[])],
          'reference':[slim_sense(x) for x in o.get('reference_senses',[])],
          'relations':o.get('relation_refs',[]),
          'form_identity':o.get('form_identity'),
          'constructions':[{'fact_id':x.get('fact_id'),'pattern':x.get('pattern'),'source_sense_id':x.get('source_sense_id'),'meaning_cn':x.get('meaning_cn'),'definition_en':x.get('definition_en')} for x in o.get('constructions',[])],
          'semantic_neighbors':[{'fact_id':x.get('fact_id'),'relation_id':x.get('relation_id'),'target_word':x.get('target_word'),'source_sense_id':x.get('source_sense_id'),'target_sense_id':x.get('target_sense_id'),'boundary':x.get('boundary'),'boundaries':x.get('boundaries')} for x in o.get('semantic_neighbors',[])],
          'confusables':[{'fact_id':x.get('fact_id'),'relation_id':x.get('relation_id'),'target_word':x.get('target_word'),'source_sense_id':x.get('source_sense_id'),'target_sense_id':x.get('target_sense_id'),'boundary':x.get('boundary'),'boundaries':x.get('boundaries')} for x in o.get('confusables',[])],
          'lookup_spellings':[x.get('spelling') for x in o.get('lookup_refs',[]) if x.get('spelling')],
        })
    payload={'schema':'kianos.lexical.execution_identity_index.v1','package':[4375,4874],'owner_count':len(rows),'owners':rows}
    OUT.write_text(json.dumps(payload,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print('IDENTITY_INDEX_PASS',len(rows),OUT.relative_to(ROOT))
if __name__=='__main__': main()
