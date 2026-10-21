// Bounded regression for accepted reading bridges; no new admission.
import assert from 'node:assert/strict';import fs from 'node:fs';import {execFileSync} from 'node:child_process';
import {loadXizongBlock,loadXizongSystem} from '../src/lib/xizong.mjs';
import {resolveXizongLearnerProjection} from '../src/lib/xizongLearnerProjection.mjs';
import {loadXizongLearningCues,resolvePreparedMemoryCue} from '../src/lib/xizongLearningCues.mjs';
import {buildXizongPreparedMemoryAvailability,supportsXizongPreparedMemoryBlock} from '../src/lib/xizongMemoryRelease.mjs';
import {createXizongMemoryState,makePreparedMemoryAvailable} from '../src/lib/xizongMemoryModel.mjs';
const root=new URL('../../',import.meta.url),read=p=>JSON.parse(fs.readFileSync(new URL(p,root)));
const review=read('static-web/scripts/fixtures/reading-bridge-review-20261021.json'),shared=read('content/xizong/knowledge/learner/shared-fields.json');
assert.equal(execFileSync('git',['hash-object','content/xizong/knowledge/learner/shared-fields.json'],{cwd:root,encoding:'utf8'}).trim(),review.shared_fields_blob);
const targets=[['circulation','circulation-b04'],['circulation','circulation-b06'],['digestive-metabolic-endocrine-tumor','D1'],['digestive-metabolic-endocrine-tumor','D16'],['hematology-immunity-infection','hematology-h01']];let checks=1;
for(const [systemId,blockId] of targets){
 const block=loadXizongBlock(systemId,blockId),accepted=review.cores.find(x=>x.path===block.sourcePath);
 for(const c of accepted.core_changes){assert.equal(block.kpRecords.find(x=>x.ordinal===c.ordinal).detailMarkdown,c.new_core);checks++;}
 const compiled=resolveXizongLearnerProjection(block);assert.deepEqual(compiled.learnerObject.kps.map(x=>x.identity.kpId),block.kpRecords.map(x=>x.kpId));checks++;
 if(supportsXizongPreparedMemoryBlock(blockId)){
  const d=buildXizongPreparedMemoryAvailability(compiled.learnerObject);assert.deepEqual(d.coreCards,[]);const state=createXizongMemoryState(),before=structuredClone(state),next=makePreparedMemoryAvailable(state,d);assert.deepEqual(state,before);assert.deepEqual(next.evidence,[]);assert.deepEqual(next.releasedBlocks,{});checks+=4;
 }
 const cues=loadXizongLearningCues(loadXizongSystem(systemId));
 for(const row of cues.precisionIndex.filter(x=>x.anchor.block_id===blockId && review.previous_witnesses[x.id])){
  const oldBlock=structuredClone(block),oldRow=structuredClone(row);oldRow.prepared_memory_ref=review.previous_witnesses[row.id];for(const c of accepted.core_changes)oldBlock.kpRecords.find(x=>x.ordinal===c.ordinal).detailMarkdown=c.old_core;
  const oldResolved=resolvePreparedMemoryCue(oldRow,oldBlock,shared),current=resolvePreparedMemoryCue(row,block,shared);assert.equal(current.answer_html,oldResolved.answer_html);assert.equal(current.id,oldResolved.id);assert.equal(current.cue,oldResolved.cue);checks+=3;
  assert.throws(()=>resolvePreparedMemoryCue(oldRow,block,shared),/CORE_REVIEW_STALE/);checks++;
  const stale=structuredClone(block);stale.kpRecords.find(x=>x.kpId===row.anchor.kp_id).detailMarkdown+='\nUNREVIEWED_CHANGE';assert.throws(()=>resolvePreparedMemoryCue(row,stale,shared),/CORE_REVIEW_STALE/);checks++;
  const changed=structuredClone(shared);changed.precision_fields[row.id].answer+=' UNREVIEWED_ANSWER';assert.throws(()=>resolvePreparedMemoryCue(row,block,changed),/STALE|MISMATCH/);checks++;
 }
}
console.log(JSON.stringify({status:'PASS',checks,scope:'five native bridges, exact answers/IDs, stale Core and answer rejection, synthetic no-progress availability'}));
