import assert from 'node:assert/strict';
import {buildEnglishEvidencePacket} from '../src/lib/englishSessionControl.mjs';
import {saveEnglishAttempt,updateEnglishReadingDiscussion,englishReadingDiscussionSpans,englishReadingQuestionOutcomes,exportEnglishCheckpoint,restoreEnglishCheckpoint} from '../src/lib/englishLearnerEvidence.mjs';
class Storage {
 constructor(){this.map=new Map();}get length(){return this.map.size;}key(i){return [...this.map.keys()][i]??null;}
 getItem(k){return this.map.get(k)??null;}setItem(k,v){this.map.set(k,String(v));}removeItem(k){this.map.delete(k);}
}
const storage=new Storage(),key='kianos-reading-attempt-v1:fixture',day='2026-10-05';
const meta={task:'reading_a',object_id:'fixture',source_hash:'fixture-hash',snapshot:{paragraphs:['Repeat. Repeat.'],questions:[{id:'q1'},{id:'q2'}]}};
const catalog=[{task:meta.task,object_id:meta.object_id,source_hash:meta.source_hash}];
const now=Date.parse('2026-10-05T00:00:00Z');
let state={submitted:false,submittedAt:'',answers:{q1:'A'},results:{},uncertain:['q1'],trajectory:{q1:Array.from({length:12},(_,i)=>({answer:i%2?'A':'B',at:new Date(now+i*1000).toISOString()}))},causes:{q1:'A learner note'}};
saveEnglishAttempt(storage,key,state,meta,{now});
const stale=structuredClone(state);
const first={text:'Repeat.',start:0,end:7,source_context:'Repeat. Repeat.',source_locator:'block:1',focused_question_id:'q1'};
updateEnglishReadingDiscussion(storage,meta,{span:first,now});
updateEnglishReadingDiscussion(storage,meta,{span:first,now:now+1});
assert.equal(JSON.parse(storage.getItem(key)).discussionSpans.length,1,'double click idempotent');
updateEnglishReadingDiscussion(storage,meta,{span:{...first,start:8,end:15},now:now+2});
assert.equal(JSON.parse(storage.getItem(key)).discussionSpans.length,2,'same text at distinct offsets stays distinct');
assert.equal(JSON.parse(storage.getItem(key)).binding.assistance,'unassisted','saved intent is not Chat assistance');
let packet=buildEnglishEvidencePacket(storage,{day,catalog});
assert.deepEqual(packet.inventory[0].question_outcomes,[],'unsubmitted answers/keys do not escape');
assert.equal(packet.inventory[0].discussion_spans.length,2);
saveEnglishAttempt(storage,key,stale,meta,{now:now+3});
assert.equal(stale.discussionSpans.length,2,'stale native save keeps newly added spans');
const removed=stale.discussionSpans[0].span_id;
updateEnglishReadingDiscussion(storage,meta,{removeId:removed,now:now+4});
const removedRaw=storage.getItem(key);
updateEnglishReadingDiscussion(storage,meta,{removeId:removed,now:now+5});
assert.equal(storage.getItem(key),removedRaw,'repeat remove is no-op');
saveEnglishAttempt(storage,key,stale,meta,{now:now+6});
assert.equal(stale.discussionSpans.length,1,'deleted span never resurrected by stale page');
const checkpoint=exportEnglishCheckpoint(storage),restored=new Storage();
restoreEnglishCheckpoint(restored,checkpoint);
assert.equal(restored.getItem(key),storage.getItem(key),'native checkpoint restores exact bytes');
state=JSON.parse(restored.getItem(key));state.submitted=true;state.submittedAt='2026-10-05T00:01:00Z';state.results={q1:'wrong',q2:'unanswered'};
saveEnglishAttempt(restored,key,state,meta,{now:now+60000});
packet=buildEnglishEvidencePacket(restored,{day,catalog});
const outcomes=packet.inventory[0].question_outcomes;
assert.equal(outcomes[0].final_answer,'A','regression: normal Packet recovers final choice missing before repair');
assert.equal(outcomes[0].uncertain,true);assert.equal(outcomes[0].note,'A learner note');
assert.equal(outcomes[0].trajectory.length,8);assert.equal(outcomes[0].trajectory[0].at,state.trajectory.q1[4].at);
assert.equal(outcomes[1].result,'unanswered');assert.equal(outcomes[1].final_answer,null);
assert.deepEqual(outcomes,englishReadingQuestionOutcomes(state,meta.source_hash),'manual/native share outcome projection');
assert.deepEqual(packet.inventory[0].discussion_spans,englishReadingDiscussionSpans(state,meta.source_hash));
for(const badCatalog of [[],[{...catalog[0],source_hash:'changed'}]]) {
 const stalePacket=buildEnglishEvidencePacket(restored,{day,catalog:badCatalog});
 assert.deepEqual(stalePacket.inventory[0].question_outcomes,[],'unverified or changed source fails closed');
 assert.deepEqual(stalePacket.inventory[0].discussion_spans,[]);
}
const before=restored.getItem(key);
assert.throws(()=>updateEnglishReadingDiscussion(restored,{...meta,source_hash:'changed'},{span:first}),/CURRENT_CHANGED/);
assert.equal(restored.getItem(key),before,'source mismatch preserves historical bytes');
const serialized=JSON.stringify(packet.inventory);
assert.ok(!serialized.includes('paragraphs')&&!serialized.includes('source_snapshot')&&!serialized.includes('formal_answer'),'bounded learner evidence never copies bank or formal answers');
updateEnglishReadingDiscussion(restored,meta,{clear:true});
for(const i of [...'Repeat. Repeat.'].map((c,i)=>c.trim()?i:null).filter(i=>i!=null).slice(0,12))updateEnglishReadingDiscussion(restored,meta,{span:{text:'Repeat. Repeat.'[i],start:i,end:i+1},now:now+i});
assert.throws(()=>updateEnglishReadingDiscussion(restored,meta,{span:{text:'t',start:13,end:14}}),/12/);
assert.equal(JSON.parse(restored.getItem(key)).discussionSpans.length,12);
// A fresh discussion on an older submitted object must survive the recent window.
const crowded=new Storage(),crowdedCatalog=[...catalog];
crowded.setItem(key,before);
for(let i=0;i<9;i++) {
 const copy=structuredClone(state),id='newer-'+i;
 copy.binding.object_id=id;copy.binding.attempt_id=id;copy.discussionSpans=[];
 copy.submittedAt=new Date(now+120000+i*1000).toISOString();
 crowded.setItem('kianos-reading-attempt-v1:'+id,JSON.stringify(copy));
 crowdedCatalog.push({...catalog[0],object_id:id});
}
const staleCrowdedPage=JSON.parse(crowded.getItem(key));
updateEnglishReadingDiscussion(crowded,meta,{span:first,now:now+600000});
saveEnglishAttempt(crowded,key,staleCrowdedPage,meta,{now:now+601000});
assert.equal(JSON.parse(crowded.getItem(key)).discussion_updated_at,new Date(now+600000).toISOString(),
 'stale native save must preserve latest explicit discussion timestamp');
const activeRow=buildEnglishEvidencePacket(crowded,{day,catalog:crowdedCatalog}).inventory.find(row=>row.object_id===meta.object_id);
assert.equal(activeRow.discussion_spans.length,2,'fresh discussion cannot disappear behind eight newer submissions');
assert.equal(activeRow.question_outcomes[0].final_answer,'A');
const invalid=structuredClone(state);invalid.results={q1:'wrong'};
assert.deepEqual(englishReadingQuestionOutcomes(invalid,meta.source_hash),[],'partial result map is unknown');
console.log('PASS Reading native evidence: baseline failure repaired; submitted/source gates, bounded trajectory/spans, duplicate/remove/stale-page, checkpoint restore, manual/native consistency');
