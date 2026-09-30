import assert from 'node:assert/strict';
import test from 'node:test';
import {PRACTICE_KEYS as K,readPoliticsSnapshot,politicsReviewPacket} from '../src/lib/politicsPracticeState.mjs';
import {applyPoliticsChatReturn,inspectPoliticsReviewedReturns,exportPoliticsCheckpoint,POLITICS_CHAT_RETURN_PREFIX as P,POLITICS_CHAT_RETURN_LATEST_KEY as latest} from '../src/lib/politicsChatReturn.mjs';
import {politicsProductCatalog} from '../src/lib/productCatalog.mjs';
import {buildPoliticsPracticeCatalogCurrent} from '../src/lib/politicsPractice.mjs';
import {captureSharedControlCheckpoint} from '../src/lib/sharedControlCheckpoint.mjs';
import {buildPrivateLearnerCheckpoint} from '../src/lib/privateLearnerCheckpoint.mjs';
import {buildDailyLearningPacketFromPrivateCheckpoint} from './privateDailyLearningPacket.mjs';
import {buildHomeDailyLearningPacket} from '../src/lib/dailyLearningPacketRuntime.mjs';
import {serializeDailyLearningPacketForChat} from '../src/lib/dailyLearningPacket.mjs';
class Storage {
 constructor(rows={}){this.map=new Map(Object.entries(rows));this.writes=0;}
 get length(){return this.map.size;}key(i){return [...this.map.keys()][i]??null;}getItem(k){return this.map.get(k)??null;}
 setItem(k,v){this.writes++;this.map.set(k,String(v));}removeItem(k){this.writes++;this.map.delete(k);}
}
const day='2026-09-30',now=Date.parse(day+'T03:00:00Z');
const catalog={revision:'synthetic-2027-current',questions:[{id:'Q1',subject:'marxism',subjectLabel:'马原',number:1,type:'single',chapter:'c01',chapterTitle:'synthetic',unitKey:'marxism/c01/u01',unitId:'u01',unitTitle:'synthetic',unitHref:'/politics/marxism/c01/#u01',taskRevision:'question-v1',sourceId:'synthetic-X1000-2027'}],chapters:[],units:[{key:'marxism/c01/u01',sourceOwnerIds:['synthetic-CF-2027']}]};
function fixture({legacy=false,sourcePatch={}}={}){
 const first={question_id:'Q1',outcome:'WRONG',selected:'B',correct_answer:'A',study_day:day,observed_at:day+'T01:00:00Z',...(legacy?{}:{source_context:{unit_key:'marxism/c01/u01',source:'xiao1000',source_id:'synthetic-X1000-2027',source_href:'/politics/marxism/c01/#u01',source_owner_ids:['synthetic-CF-2027'],content_revision:catalog.revision,task_revision:'question-v1'}})};
 if(first.source_context)Object.assign(first.source_context,sourcePatch);
 const storage=new Storage({[K.attempts]:JSON.stringify({units:{'marxism/c01/u01':{unit_key:'marxism/c01/u01',attempts:{Q1:first}}}}),[K.meta]:JSON.stringify({latestOutcome:{Q1:'WRONG'},discussion:{Q1:true},notes:{Q1:'native uncertainty preserved'}}),[K.evidence]:JSON.stringify([{...first}]),[K.last]:JSON.stringify({href:'/politics/marxism/c01/#u01',subject:'marxism',chapter:'c01',title:'synthetic position'})});
 const packet=politicsReviewPacket(catalog,readPoliticsSnapshot(storage),{day,filter:'all',subject:'all'});
 const ret={schema:'kianos.politics.chat-return.v1',direction:'CHAT_TO_LEARNER',batch_id:packet.batch_id,catalog_revision:packet.catalog_revision,study_day:day,scope:packet.scope,generated_at:day+'T02:00:00Z',verdict:'FOLLOW_UP',diagnosis_summary:'Synthetic source correction changes the interpretation, not the Wrong event.',follow_ups:[{id:'correction',question_ids:['Q1'],action:'SOURCE_RETURN',reason:'Synthetic interpretation correction',instruction:'Return only to the exact native owner; no automatic allocation.'}]};
 return {storage,ret,packet};
}
const daily=(storage,targetDay=day,owner=catalog)=>buildHomeDailyLearningPacket({storage,day:targetDay,now:Date.parse(targetDay+'T03:00:00Z'),politicsCatalog:owner});
test('native import -> Daily Packet -> Chat/Review/Steward transport carries corrected meaning without rewriting facts',()=>{
 const {storage,ret}=fixture(),before=daily(storage),raw=[K.attempts,K.evidence,K.last].map(k=>[k,storage.getItem(k)]);
 applyPoliticsChatReturn(storage,catalog,ret,{now,expectedDay:day});const after=daily(storage),evidence=after.packet.subjects.politics.evidence;
 assert.notDeepEqual(evidence,before.packet.subjects.politics.evidence);assert.deepEqual(evidence.today,before.packet.subjects.politics.evidence.today);assert.deepEqual(evidence.resume,before.packet.subjects.politics.evidence.resume);
 const row=evidence.reviewed_returns.items[0];assert.equal(row.basis_status,'CURRENT_NATIVE_BINDING');assert.equal(row.execution_eligible,false);assert.equal(row.completion,'NOT_INFERRED');assert.equal(row.consumer_reconciliation,'NOT_OBSERVED');assert.equal(row.diagnosis_summary,ret.diagnosis_summary);
 const text=serializeDailyLearningPacketForChat(after.packet);assert.ok(text.includes(ret.diagnosis_summary));assert.ok(text.includes(ret.follow_ups[0].instruction));assert.deepEqual(raw.map(([k])=>[k,storage.getItem(k)]),raw);
 const writes=storage.writes;inspectPoliticsReviewedReturns(storage,catalog,{day});daily(storage);assert.equal(storage.writes,writes,'read-only transport must not create tasks or acknowledgements');
});
test('new-day unrelated NO_ACTION and latest pointer do not erase old unconsumed interpretation',()=>{
 const {storage,ret}=fixture();applyPoliticsChatReturn(storage,catalog,ret,{now,expectedDay:day});const original=storage.getItem(P+ret.batch_id);
 const nextDay='2026-10-01',packet=politicsReviewPacket(catalog,readPoliticsSnapshot(storage),{day:nextDay,filter:'all',subject:'all'});
 applyPoliticsChatReturn(storage,catalog,{...ret,study_day:nextDay,batch_id:packet.batch_id,generated_at:nextDay+'T02:00:00Z',verdict:'NO_ACTION',diagnosis_summary:'Unrelated new-day NONE is not old correction consumption.',follow_ups:[]},{now:Date.parse(nextDay+'T03:00:00Z'),expectedDay:nextDay});
 const evidence=daily(storage,nextDay).packet.subjects.politics.evidence,rows=evidence.reviewed_returns.items;
 assert.equal(rows.length,2);assert.equal(rows.find(r=>r.batch_id===ret.batch_id).diagnosis_summary,ret.diagnosis_summary);assert.equal(rows[0].consumer_reconciliation,'NOT_OBSERVED');assert.equal(storage.getItem(P+ret.batch_id),original);assert.equal(evidence.today.wrong_count,0);assert.equal(evidence.cumulative_first_attempts.by_question_type.single.wrong,1);
});
test('changed batch/Source/task bindings are explicitly stale, while history and siblings remain readable',()=>{
 for(const owner of [{...catalog,questions:[]},{...catalog,questions:[{...catalog.questions[0],sourceId:'synthetic-X1000-2028'}]},{...catalog,questions:[{...catalog.questions[0],taskRevision:'question-v2'}]},{...catalog,units:[{...catalog.units[0],sourceOwnerIds:['synthetic-CF-2028']}]}]){
  const {storage,ret}=fixture();applyPoliticsChatReturn(storage,catalog,ret,{now,expectedDay:day});const before=[...storage.map],result=daily(storage,day,owner);const row=result.packet.subjects.politics.evidence.reviewed_returns.items[0];assert.equal(row.basis_status,'STALE');assert.equal(row.execution_eligible,false);assert.equal(row.diagnosis_summary,ret.diagnosis_summary);assert.deepEqual([...storage.map],before);assert.equal(result.coverage.english,'unknown');assert.equal(result.coverage.xizong,'unknown');
 }
 const {storage,ret}=fixture();applyPoliticsChatReturn(storage,catalog,ret,{now,expectedDay:day});storage.setItem(K.meta,JSON.stringify({latestOutcome:{Q1:'WRONG'},notes:{Q1:'new material context'}}));assert.equal(daily(storage).packet.subjects.politics.evidence.reviewed_returns.items[0].basis_status,'STALE');
});
test('captured Source members and content revision cannot promote malformed or older Source to current',()=>{
 for(const sourcePatch of [{source_owner_ids:[null]},{source_owner_ids:[{}]},{source_owner_ids:['']},{source_owner_ids:[' synthetic-CF-2027 ']},{source_owner_ids:[]},{content_revision:null},{content_revision:''},{content_revision:'older-2026'}]){
  const {storage,ret}=fixture({sourcePatch});applyPoliticsChatReturn(storage,catalog,ret,{now,expectedDay:day});const before=[...storage.map],row=daily(storage).packet.subjects.politics.evidence.reviewed_returns.items[0];assert.equal(row.basis_status,'UNKNOWN',JSON.stringify(sourcePatch));assert.equal(row.execution_eligible,false);assert.deepEqual([...storage.map],before);
 }
 const {storage,ret}=fixture({sourcePatch:{source_owner_ids:['synthetic-CF-2026'],content_revision:'older-2026'}});applyPoliticsChatReturn(storage,catalog,ret,{now,expectedDay:day});assert.equal(daily(storage).packet.subjects.politics.evidence.reviewed_returns.items[0].basis_status,'STALE');
});
test('unrelated global revision does not assert changed Source; missing per-Source historical baseline remains UNKNOWN',()=>{
 const {storage,ret}=fixture();applyPoliticsChatReturn(storage,catalog,ret,{now,expectedDay:day});const before=[...storage.map],changed={...catalog,revision:'unrelated-unit-changed'};
 const row=daily(storage,day,changed).packet.subjects.politics.evidence.reviewed_returns.items[0];assert.equal(row.basis_status,'UNKNOWN');assert.match(row.basis_error,/SOURCE_CONTENT_UNCLASSIFIED/);assert.equal(row.diagnosis_summary,ret.diagnosis_summary);assert.deepEqual([...storage.map],before);
 const absent=daily(storage,day,{...catalog,units:[]}).packet.subjects.politics.evidence.reviewed_returns.items[0];assert.equal(absent.basis_status,'UNKNOWN');
});
test('legacy/missing/future Source witness is UNKNOWN rather than promoted or cleared',()=>{
 const {storage,ret}=fixture({legacy:true});applyPoliticsChatReturn(storage,catalog,ret,{now,expectedDay:day});const raw=[...storage.map],row=daily(storage).packet.subjects.politics.evidence.reviewed_returns.items[0];assert.equal(row.basis_status,'UNKNOWN');assert.match(row.basis_error,/SOURCE_WITNESS_UNKNOWN/);assert.equal(row.diagnosis_summary,ret.diagnosis_summary);assert.deepEqual([...storage.map],raw);
 const future=inspectPoliticsReviewedReturns(storage,catalog,{day:'2026-09-29'});assert.equal(future.items[0].basis_status,'UNKNOWN');assert.match(future.items[0].basis_error,/FUTURE_DAY/);
});
test('bad saved Return JSON/nested records/signatures preserve raw and report UNKNOWN without poisoning siblings',()=>{
 for(const kind of ['json','nested','signature','wrong-key']){
  const {storage,ret}=fixture();applyPoliticsChatReturn(storage,catalog,ret,{now,expectedDay:day});const value=JSON.parse(storage.getItem(P+ret.batch_id));let key=P+ret.batch_id;
  if(kind==='json')storage.setItem(key,'{unreadable-synthetic');else if(kind==='wrong-key'){key=P+'wrong';storage.setItem(key,JSON.stringify(value));}else{if(kind==='nested')value.follow_ups[0].contexts='damaged';else value.return_signature='damaged';storage.setItem(key,JSON.stringify(value));}
  const before=[...storage.map],result=daily(storage);assert.equal(result.packet.subjects.politics.evidence.reviewed_returns.status,'UNKNOWN');assert.ok(result.warnings.some(w=>w.includes('PRESERVE_RAW')));assert.deepEqual([...storage.map],before);assert.equal(result.coverage.english,'unknown');assert.equal(result.coverage.xizong,'unknown');
 }
});
test('deduplicated native replay retains unknown root fields and exact record provenance',()=>{
 const {storage,ret}=fixture();applyPoliticsChatReturn(storage,catalog,ret,{now,expectedDay:day});const key=P+ret.batch_id,value=JSON.parse(storage.getItem(key));value.futurePrivateField={keep:true};storage.setItem(key,JSON.stringify(value));const raw=storage.getItem(key),writes=storage.writes;
 assert.equal(applyPoliticsChatReturn(storage,catalog,ret,{now,expectedDay:day}).status,'idempotent');const result=inspectPoliticsReviewedReturns(storage,catalog,{day});assert.equal(result.items.length,1);assert.equal(result.items[0].source_key,key);assert.equal(storage.writes,writes);assert.equal(storage.getItem(key),raw);
});
test('real Product catalog preserves only exact Source IDs; native import and private checkpoint Packet share identity checks',()=>{
 const native=buildPoliticsPracticeCatalogCurrent('/'),product=politicsProductCatalog('/');
 for(const unit of product.units){const owner=native.units.find(row=>row.key===unit.key);assert.deepEqual(unit.sourceOwnerIds,owner.source.map(row=>row.id));assert.equal(Object.hasOwn(unit,'source'),false);}
 for(const q of product.questions){assert.equal(Object.hasOwn(q,'answer'),false);assert.equal(Object.hasOwn(q,'stem'),false);}
 const q=product.questions.find(row=>row.id==='X1000-MARX-S-001'),unit=product.units.find(row=>row.key===q.unitKey);
 const first={question_id:q.id,outcome:'WRONG',selected:'B',correct_answer:'A',study_day:day,observed_at:day+'T01:00:00Z',source_context:{unit_key:q.unitKey,source_id:q.sourceId,source_owner_ids:unit.sourceOwnerIds,task_revision:q.taskRevision,content_revision:product.revision}};
 const storage=new Storage({[K.attempts]:JSON.stringify({units:{[q.unitKey]:{unit_key:q.unitKey,attempts:{[q.id]:first}}}}),[K.meta]:JSON.stringify({latestOutcome:{[q.id]:'WRONG'}})});
 const packet=politicsReviewPacket(product,readPoliticsSnapshot(storage),{day,filter:'all',subject:'all'}),ret={schema:'kianos.politics.chat-return.v1',direction:'CHAT_TO_LEARNER',batch_id:packet.batch_id,catalog_revision:packet.catalog_revision,study_day:day,scope:packet.scope,generated_at:day+'T02:00:00Z',verdict:'FOLLOW_UP',diagnosis_summary:'Synthetic exact real-owner transport',follow_ups:[{id:'real-owner-synthetic',question_ids:[q.id],action:'SOURCE_RETURN',reason:'synthetic',instruction:'read exact native owner without automatic action'}]};
 applyPoliticsChatReturn(storage,product,ret,{now,expectedDay:day});const before=[...storage.map];
 assert.equal(inspectPoliticsReviewedReturns(storage,product,{day,now}).items[0].basis_status,'CURRENT_NATIVE_BINDING');
 assert.equal(inspectPoliticsReviewedReturns(storage,native,{day,now}).items[0].basis_status,'CURRENT_NATIVE_BINDING');
 const checkpoint=buildPrivateLearnerCheckpoint({studyDay:day,now,shared:captureSharedControlCheckpoint(storage,{studyDay:day,now}),subjects:{politics:exportPoliticsCheckpoint(storage)}});
 const recovered=buildDailyLearningPacketFromPrivateCheckpoint(checkpoint,{now}).packet.subjects.politics.evidence.reviewed_returns;
 assert.equal(recovered.items[0].diagnosis_summary,ret.diagnosis_summary);assert.equal(recovered.items[0].basis_status,'CURRENT_NATIVE_BINDING');assert.equal(recovered.items[0].execution_eligible,false);assert.deepEqual([...storage.map],before);
});
