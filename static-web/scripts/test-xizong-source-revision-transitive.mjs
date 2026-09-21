import assert from 'node:assert/strict';
import fs from 'node:fs';

import {
  buildXizongForecastProgress,
  buildXizongStudyPacketFromStorage,
  xizongStudySourceRevisionStatus
} from '../src/lib/xizongStudyPacket.mjs';
import { xizongQuestionSemanticHash } from '../src/lib/xizongQuestions.mjs';

class Storage {
  constructor(entries = {}) { this.map = new Map(Object.entries(entries)); }
  get length(){ return this.map.size; }
  key(index){ return [...this.map.keys()][index] ?? null; }
  getItem(key){ return this.map.has(key) ? this.map.get(key) : null; }
  setItem(key,value){ this.map.set(String(key),String(value)); }
  removeItem(key){ this.map.delete(String(key)); }
}

const packetMeta={
  objectId:'xizong:audit-b01',
  systemId:'audit',
  canonicalId:'AUDIT',
  blockId:'audit-b01',
  blockLabel:'B01',
  blockTitle:'Audit',
  sourcePath:'fixture.md',
  sourceHash:'source-v2',
  sourceContactMode:'WHOLE_BLOCK_CUMULATIVE',
  sourcePerGroup:false
};
const kpRows=[{
  kpId:'audit-b01-kp01',
  displayId:'KP01',
  title:'Audit KP',
  groupId:'audit-lg01',
  groupLabel:'LG01',
  sourceLocator:'p1',
  prompt:'recall'
}];
const packetIndex=[{systemId:'audit',blockId:'audit-b01',packetMeta,kpRows}];
const stateKey='kianos-xizong-astro-v2:xizong:audit-b01';

const staleState={
  schema:'kianos.xizong.block-state.v2',
  stage:'block_recall',
  learned:{'audit-b01-kp01':true},
  ratings:{'audit-b01-kp01':'mastered'},
  sourceContactDone:true,
  sourceContactEvidence:[{
    segment_id:'block-cumulative:xizong:audit-b01',
    coverage_kind:'EXPLICIT_BLOCK_CUMULATIVE_CONFIRMATION',
    kp_ids:['audit-b01-kp01'],
    completed_at:'2026-09-20T00:00:00Z',
    source_hash:'source-v1'
  }],
  blockRecallDone:true,
  completed:true
};

const status=xizongStudySourceRevisionStatus(staleState,'source-v2');
assert.equal(status.status,'STALE_SOURCE_REVISION');
assert.equal(status.blocked,true);

const staleStorage=new Storage({[stateKey]:JSON.stringify(staleState)});
const staleForecast=buildXizongForecastProgress(staleStorage,packetIndex);
assert.equal(staleForecast.runtime_evidence.completed_blocks,0);
assert.equal(staleForecast.runtime_evidence.source_revision_blocked_count,1);
assert.equal(staleForecast.runtime_evidence.source_revision_blocked_blocks[0].status,'STALE_SOURCE_REVISION');

const stalePacket=buildXizongStudyPacketFromStorage({
  storage:staleStorage,packetMeta,kpRows,now:Date.parse('2026-09-21T00:00:00Z')
});
assert.equal(stalePacket.current.source_revision_blocked,true);
assert.equal(stalePacket.current.source_revision_status,'STALE_SOURCE_REVISION');
assert.equal(stalePacket.current.evidence_source_hash,'source-v1');

const unboundState={
  schema:'kianos.xizong.block-state.v2',
  learned:{'audit-b01-kp01':true},
  ratings:{'audit-b01-kp01':'known'},
  blockRecallDone:true,
  completed:true
};
const unbound=xizongStudySourceRevisionStatus(unboundState,'source-v2');
assert.equal(unbound.status,'SOURCE_IDENTITY_UNBOUND');
assert.equal(unbound.blocked,true);
const unboundForecast=buildXizongForecastProgress(
  new Storage({[stateKey]:JSON.stringify(unboundState)}),
  packetIndex
);
assert.equal(unboundForecast.runtime_evidence.completed_blocks,0);
assert.equal(unboundForecast.runtime_evidence.source_revision_blocked_count,1);

const currentState={
  ...staleState,
  sourceHash:'source-v2',
  sourceContactEvidence:[{
    ...staleState.sourceContactEvidence[0],
    source_hash:'source-v2'
  }]
};
const currentStatus=xizongStudySourceRevisionStatus(currentState,'source-v2');
assert.equal(currentStatus.status,'CURRENT');
assert.equal(currentStatus.blocked,false);
const currentForecast=buildXizongForecastProgress(
  new Storage({[stateKey]:JSON.stringify(currentState)}),
  packetIndex
);
assert.equal(currentForecast.runtime_evidence.completed_blocks,1);
assert.equal(currentForecast.runtime_evidence.source_revision_blocked_count,0);

const pendingState={...currentState,sourceRevisionPending:true,sourceRevisionFromHash:'source-v1'};
const pending=xizongStudySourceRevisionStatus(pendingState,'source-v2');
assert.equal(pending.status,'REVISION_PENDING');
assert.equal(pending.blocked,true);

// Question semantics must participate in evidence versioning independently of stable qid inventory.
const questionV1={
  questionId:'xizong-official-2026-n001',
  questionType:'A',
  stem:'请选择错误的说法',
  options:[
    {label:'A',text:'原始选项 A'},
    {label:'B',text:'原始选项 B'}
  ],
  correctAnswer:'A'
};
const questionV2={
  ...questionV1,
  stem:'请选择正确的说法',
  options:[
    {label:'A',text:'修订后的正确选项 A'},
    {label:'B',text:'修订后的错误选项 B'}
  ],
  correctAnswer:'A'
};
assert.notEqual(
  xizongQuestionSemanticHash([questionV1]),
  xizongQuestionSemanticHash([questionV2]),
  'same qid + same answer letter must not preserve semantic evidence version when stem/options change'
);

const evidenceGuard=fs.readFileSync('static-web/src/components/XizongSystemEvidenceGuard.astro','utf8');
assert.match(evidenceGuard,/sweep\?\.questionSemanticHash/);
assert.match(evidenceGuard,/question\.stem/);
assert.match(evidenceGuard,/question\.options/);

// Browser owner must reopen completion and require current Source contact + Block Recall.
const component=fs.readFileSync('static-web/src/components/XizongBlockV6.astro','utf8');
assert.match(component,/sourceRevisionPending: true/);
assert.match(component,/sourceRevisionReason: evidenceSourceHash \? 'SOURCE_REVISION_CHANGED' : 'SOURCE_IDENTITY_UNBOUND'/);
assert.match(component,/completed: false/);
assert.match(component,/blockRecallDone: false/);
assert.match(component,/currentSourceContactCovered/);
assert.match(component,/state\.sourceRevisionPending !== true/);
assert.match(component,/Source 已更新 · 需重新确认/);

console.log(JSON.stringify({
  schema:'kianos.xizong.source-revision-transitive.v1',
  stale_block_cannot_reduce_forecast:'PASS',
  unbound_block_cannot_reduce_forecast:'PASS',
  packet_surfaces_revision_status:'PASS',
  current_bound_completion_still_counts:'PASS',
  browser_reopens_completion_without_deleting_prior_recall:'PASS'
},null,2));
console.log('PASS Xizong Source revision transitive invalidation');
