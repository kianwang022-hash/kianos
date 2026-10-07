import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
const root=process.argv[2],id=process.argv[3],mode=process.argv[4]||'witness';
process.env.KIANOS_REPO_ROOT=root;process.env.KIANOS_XIZONG_BUILD_CACHE='0';
const mod=name=>import(pathToFileURL(`${root}/static-web/src/lib/${name}.mjs`));
try {
 const native=await mod('xizong'),cues=await mod('xizongLearningCues');
 const shared=JSON.parse(fs.readFileSync(`${root}/content/xizong/knowledge/learner/shared-fields.json`));
 const loadIndex=family=>JSON.parse(fs.readFileSync(`${root}/content/xizong/knowledge/learner/${family}-learning-cues.json`));
 const index=loadIndex('b-digestive-metabolic-endocrine-tumor');
 function resolve(id,ix=index){
  const row=ix.precision_index.find(x=>x.id===id);if(!row)return {id,error:'NO_CURRENT_ROW'};
  let core={},witness=null,witnessError=null,answer=null,error=null;
  try {
   const b=native.loadXizongBlock(ix.system_id,row.anchor.block_id),item=shared.precision_fields?.[id];
   core=Object.fromEntries((item?.retention_metadata?.required_core_refs||[]).map(d=>{const owner=native.loadXizongBlock(d.system_id,d.block_id),kp=owner.kpRecords.find(k=>k.kpId===d.kp_id);return[d.kp_id,kp?cues.preparedMemoryDigest(kp.detailMarkdown):null]}));
   try {if(row.prepared_memory_ref?.owner_mode==='NATIVE_CUE')witness=cues.preparedNativeCueWitness(row,b,item,shared)}catch(e){witnessError=e.message}
   try {answer=cues.resolvePreparedMemoryCue(row,b,shared).answer_html||null}catch(e){error=e.message}
  }catch(e){error=e.message}
  return{id,core,witness,witnessError,answer,error};
 }
 if(mode==='witness'){
  const a=loadIndex('a3-urinary');
  console.log(JSON.stringify({result:resolve(id),unrelatedD:resolve('b-d01-kp02-slow-wave-frequency'),neighborD19:resolve('b-d19-lg06-cholangiocarcinoma'),unrelatedA:resolve(a.precision_index[0].id,a)}));
 }else{
  const assert=(await import('node:assert/strict')).default,production=await mod('xizongProductionProjection'),learner=await mod('xizongLearnerObject'),release=await mod('xizongMemoryRelease'),memory=await mod('xizongMemoryModel');
  const raw=native.loadXizongBlock(index.system_id,'D1'),b=production.buildXizongProductionBlock(raw),lc=cues.learningCuesForBlock(cues.loadXizongLearningCues(native.loadXizongSystem(index.system_id)),b),o=learner.buildXizongLearnerObject({block:b,learningCues:lc});
  const descriptors=[release.buildXizongMemoryReleaseDescriptorFromLearnerObject(o),release.buildXizongBlockMemoryReleaseDescriptor(b,lc)];
  const state=memory.createXizongMemoryState(),cardId='precision:b-d01-kp02-slow-wave-frequency';
  state.cards[cardId]={id:cardId,precisionCueId:cardId.slice(10),family:'PRECISION',systemId:index.system_id,canonicalId:'B',blockId:'D1',kpId:'digestive-d1-kp02',logicGroupId:'b-d01-lg01',answerResolution:'EXACT_CURRENT_OWNER',answerHtml:'<p>historical answer</p>',ownerContextHtml:'historical context',contentHistory:[{answerHtml:'older'}]};state.evidence=[{cardId,rating:'mastered',at:'2026-10-01'}];const before=JSON.stringify(state);
  assert.equal(release.isXizongPreparedMemoryCard(state.cards[cardId],'D1'),false);
  for(const d of descriptors){assert.equal(d.precisionCards.some(c=>c.id===cardId),false);assert.equal(d.precisionCards.length,mode==='missing-ref'?2:0);}
  if(mode!=='missing-ref'){assert.equal(release.supportsXizongPreparedMemoryBlock('D1'),false);assert.throws(()=>release.buildXizongPreparedMemoryAvailability(o),/PREPARED_BLOCK_UNSUPPORTED/)}else{const next=memory.makePreparedMemoryAvailable(state,release.buildXizongPreparedMemoryAvailability(o));assert.deepEqual(next.cards[cardId],state.cards[cardId]);assert.deepEqual(next.evidence,state.evidence)}
  assert.equal(JSON.stringify(state),before);
  console.log(JSON.stringify({status:'PASS',mode,precisionCounts:descriptors.map(d=>d.precisionCards.length),historyPreserved:true}));
 }
}catch(e){console.log(JSON.stringify({error:e.stack}));process.exitCode=1}
