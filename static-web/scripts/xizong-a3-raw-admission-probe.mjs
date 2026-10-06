import fs from 'node:fs';import assert from 'node:assert/strict';import {pathToFileURL} from 'node:url';
const root=process.argv[2],mode=process.argv[3];process.env.KIANOS_REPO_ROOT=root;process.env.KIANOS_XIZONG_BUILD_CACHE='0';
const mod=n=>import(pathToFileURL(`${root}/static-web/src/lib/${n}.mjs`));
try{
 const native=await mod('xizong'),prod=await mod('xizongProductionProjection'),cues=await mod('xizongLearningCues'),learner=await mod('xizongLearnerObject'),release=await mod('xizongMemoryRelease'),memory=await mod('xizongMemoryModel');
 const raw=native.loadXizongBlock('urinary','b01'),b=prod.buildXizongProductionBlock(raw),lc=cues.learningCuesForBlock(cues.loadXizongLearningCues(native.loadXizongSystem('urinary')),b),o=learner.buildXizongLearnerObject({block:b,learningCues:lc});
 const descriptors=[release.buildXizongMemoryReleaseDescriptorFromLearnerObject(o),release.buildXizongBlockMemoryReleaseDescriptor(b,lc)];
 const id='a3-b01-lg04-precision',state=memory.createXizongMemoryState();state.cards['precision:'+id]={id:'precision:'+id,precisionCueId:id,family:'PRECISION',systemId:'urinary',canonicalId:'A3',blockId:'urinary-b01',kpId:'',logicGroupId:'urinary-b01-lg04',answerResolution:'EXACT_CURRENT_OWNER',answerHtml:'<p>historical answer</p>',ownerContextHtml:'old context',contentHistory:[{answerHtml:'older'}]};state.evidence=[{cardId:'precision:'+id,rating:'known',at:'2026-10-01'}];const before=JSON.stringify(state);
 if(mode==='missing-ref'||mode==='zero-admission'){
  assert.equal(release.isXizongPreparedMemoryCard(state.cards['precision:'+id],'urinary-b01'),false);assert.equal(JSON.stringify(state),before);
  for(const d of descriptors){assert.equal(d.precisionCards.some(c=>c.precisionCueId===id),false);assert.equal(d.precisionCards.length,mode==='zero-admission'?0:1);assert.ok(d.precisionCards.every(c=>c.answerResolution==='EXACT_CURRENT_OWNER'));}
  if(mode==='zero-admission'){assert.equal(release.supportsXizongPreparedMemoryBlock('urinary-b01'),false);assert.throws(()=>release.buildXizongPreparedMemoryAvailability(o),/PREPARED_BLOCK_UNSUPPORTED/)}
  else{const next=memory.makePreparedMemoryAvailable(state,release.buildXizongPreparedMemoryAvailability(o));assert.deepEqual(next.cards['precision:'+id],state.cards['precision:'+id]);assert.deepEqual(next.evidence,state.evidence);assert.equal(JSON.stringify(state),before)}
 }
 console.log(JSON.stringify({status:'PASS',mode,precisionCounts:descriptors.map(d=>d.precisionCards.length),historyPreserved:true}));
}catch(e){console.log(JSON.stringify({status:'FAIL',mode,error:e.stack}));process.exitCode=1}
