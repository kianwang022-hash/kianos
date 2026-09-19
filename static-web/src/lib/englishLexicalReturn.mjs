import {LEXICAL_LEDGER_STORAGE_KEY,appendEvidenceEvent,emptyLexicalLedger,repairStateForEvent} from './lexicalEvidence.mjs';
import {lexicalEventFromObjectiveThread,resolveCurrentLexicalTarget} from './lexicalEnglishEvidence.mjs';
import {readEnglishJson} from './englishLearnerEvidence.mjs';
export async function prepareEnglishLexicalReturn(storage,{task,objectId,attemptSubmittedAt,attemptBinding=null,threads=[],base='/',resolve=resolveCurrentLexicalTarget}={}){
 const initial=storage.getItem(LEXICAL_LEDGER_STORAGE_KEY);
 let ledger=readEnglishJson(storage,LEXICAL_LEDGER_STORAGE_KEY,emptyLexicalLedger());
 if(ledger.schema!==emptyLexicalLedger().schema)throw new Error('LEXICAL_LEDGER_SCHEMA_MISMATCH_PRESERVE_DATA');
 const events=[];
 for(let i=0;i<threads.length;i++){
  if(threads[i].route!=='lexical')continue;
  const result=lexicalEventFromObjectiveThread({task,objectId,attemptSubmittedAt,thread:threads[i],threadIndex:i});
  if(result.status!=='READY')throw new Error(result.status);
  if(!attemptBinding)throw new Error('LEXICAL_ENGLISH_ATTEMPT_BINDING_REQUIRED');
  if(['fresh','unseen'].includes(result.event.context_novelty)&&attemptBinding.prior_exposure!=='unseen')throw new Error('LEXICAL_ENGLISH_FRESHNESS_NOT_ESTABLISHED');
  result.event.assistance=attemptBinding.assistance||'assisted';
  result.event.context_novelty=attemptBinding.prior_exposure==='unseen'?'unseen':'repeated';
  const event=await resolve(result.event,{base});
  const appended=appendEvidenceEvent(ledger,event);
  if(!['APPENDED','DUPLICATE_IGNORED'].includes(appended.status))throw new Error('LEXICAL_RETURN_'+appended.status);
  ledger=appended.ledger;events.push(event);
 }
 if(!events.length)return {changes:[],guards:[],events:[]};
 const projections=new Map();
 for(const event of events){
  const derived=repairStateForEvent(ledger,event);if(!derived)continue;
  const key='kianos-vocabulary-astro-v2:'+event.word_id;
  const state=projections.get(key)||readEnglishJson(storage,key,{revealed:false,repairTargets:{},lastSeenAt:'',meta:{word_id:event.word_id,ordinal:event.ordinal,word:event.word}});
  state.repairTargets={...(state.repairTargets||{})};const targetKey=event.target_id||`${event.target_kind}:${event.target_locator||''}`;
  if(derived.state==='ACTIVE')state.repairTargets[targetKey]={target_kind:event.target_kind,target_id:event.target_id,target_locator:event.target_locator,target_revision:event.target_revision,label:event.target_label,source:'evidence_reducer',outcome:'ADDED',observed_at:event.observed_at};
  else if(derived.state==='DORMANT')delete state.repairTargets[targetKey];
  // Lookup/repair admission is NOT a Coverage visit or a whole-card judgment.
  projections.set(key,state);
 }
 return {changes:[[LEXICAL_LEDGER_STORAGE_KEY,ledger],...projections],guards:[[LEXICAL_LEDGER_STORAGE_KEY,initial],...[...projections.keys()].map(key=>[key,storage.getItem(key)])],events};
}
