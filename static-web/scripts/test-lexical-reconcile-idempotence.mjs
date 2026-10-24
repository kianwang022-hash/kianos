import assert from 'node:assert/strict';
import {emptyLexicalLedger,appendEvidenceEvent,reconcileEvidenceIdentity,lexicalTargetKey} from '../src/lib/lexicalEvidence.mjs';
const row={word_id:'word:synthetic',target_kind:'construction',from_target_id:'old',status:'retired',to_target_id:null};
let seed=appendEvidenceEvent(emptyLexicalLedger(),{event_id:'idempotence-fixture',word_id:row.word_id,target_kind:row.target_kind,target_id:'old',source:'depth_plus',outcome:'ADDED',observed_at:'2026-10-24T00:00:00Z'}).ledger;
const events=JSON.stringify(seed.events),seedCopy=structuredClone(seed);
const key=lexicalTargetKey({word_id:row.word_id,target_kind:row.target_kind,target_id:'old'});
for(const status of ['retired','deprecated','reference','merged']){
 const current={...row,status,to_target_id:status==='merged'?'new':null};
 const first=reconcileEvidenceIdentity(seed,[current]);
 assert.deepEqual(first.statuses,[status==='merged'?'LINEAGE_REMAP_REGISTERED':'LINEAGE_FROZEN_REGISTERED']);
 assert.equal(first.ledger.identity_lineage[key].resolution,status==='merged'?'REMAP':'FROZEN');
 if(status==='merged')assert.equal(first.ledger.identity_lineage[key].to_target_id,'new');
 const before=structuredClone(first.ledger);
 const repeated=reconcileEvidenceIdentity(first.ledger,[current,current]);
 assert.deepEqual(repeated.statuses,[]);assert.deepEqual(repeated.ledger,before);assert.deepEqual(first.ledger,before);
 assert.equal(JSON.stringify(repeated.ledger.events),events);
 const different={...current,status:'merged',to_target_id:'different'};
 const conflict=reconcileEvidenceIdentity(first.ledger,[different]);
 assert.deepEqual(conflict.statuses,['LINEAGE_CONFLICT_FROZEN']);
 assert.equal(conflict.ledger.identity_lineage[key].resolution,'FROZEN');
 assert.equal(conflict.ledger.identity_lineage[key].reason,'LINEAGE_CONFLICT');
 assert.equal(conflict.ledger.identity_lineage[key].to_target_id,null);
 for(const declaration of [current,different,{...row,status:'active'}]){
  const conflictBefore=structuredClone(conflict.ledger);
  const again=reconcileEvidenceIdentity(conflict.ledger,[declaration]);
  assert.deepEqual(again.statuses,[]);assert.deepEqual(again.ledger,conflictBefore);assert.deepEqual(conflict.ledger,conflictBefore);
  assert.equal(JSON.stringify(again.ledger.events),events);
 }
 const added=reconcileEvidenceIdentity(conflict.ledger,[{...row,from_target_id:'another'}]);
 assert.deepEqual(added.statuses,['LINEAGE_FROZEN_REGISTERED']);assert.equal(Object.keys(added.ledger.identity_lineage).length,2);
}
assert.deepEqual(reconcileEvidenceIdentity(seed,[{...row,status:'active'}]).statuses,[]);
assert.deepEqual(seed,seedCopy);console.log('PASS identity reconciliation statuses represent actual new state; conflicts stay frozen; source events/input immutable');
