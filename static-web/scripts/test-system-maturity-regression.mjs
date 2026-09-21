import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { privateLearnerBridge } from './privateLearnerBridge.mjs';
import { readPrivateLearnerCheckpoint as readDisk, writePrivateLearnerCheckpoint as writeDisk } from './privateLearnerStore.mjs';
import { buildPrivateLearnerCheckpoint, writePrivateLearnerCheckpoint as writeRemote } from '../src/lib/privateLearnerCheckpoint.mjs';
import { saveSharedControlToPrivate, restoreSharedControlFromPrivate, PRIVATE_CHECKPOINT_BASE_KEY } from '../src/lib/privateCheckpointRuntime.mjs';
import { captureSharedControlCheckpoint } from '../src/lib/sharedControlCheckpoint.mjs';
import { capturePrivateSubjectCheckpoints } from '../src/lib/privateSubjectCheckpoints.mjs';
import { applyPrivateControlCommand } from '../src/lib/privateControlRuntime.mjs';
import { CONTROL_LOCAL_RECEIPT_KEY } from '../src/lib/privateControlCommand.mjs';
import { buildExamChatPlanBasis, readExamChatPlan, EXAM_CHAT_PLAN_SCHEMA } from '../src/lib/examChatPlan.mjs';
import { ENGLISH_SESSION_KEY, ENGLISH_SESSION_SCHEMA, buildEnglishEvidencePacket } from '../src/lib/englishSessionControl.mjs';
import { ENGLISH_MATERIAL_EXPOSURE_KEY } from '../src/lib/englishLearnerEvidence.mjs';
import { emptyLexicalLedger, LEXICAL_LEDGER_STORAGE_KEY } from '../src/lib/lexicalEvidence.mjs';
import { STUDY_TIMER_STATE_KEY, STUDY_TIMER_LEDGER_KEY, STUDY_TIMER_SCHEMA, studyDayAt } from '../src/lib/studyTimer.mjs';

class Storage {
  constructor(rows = {}) { this.map = new Map(Object.entries(rows)); this.failKey = null; }
  get length() { return this.map.size; }
  key(i) { return [...this.map.keys()][i] ?? null; }
  getItem(key) { return this.map.get(key) ?? null; }
  setItem(key, raw) { if (key === this.failKey) throw new Error('QuotaExceededError'); this.map.set(key, String(raw)); }
  removeItem(key) { this.map.delete(key); }
}
const now = Date.now(), day = studyDayAt(now), stamp = new Date(now).toISOString();
const results = [];
const pass = name => results.push(name);
const xzA = 'kianos-xizong-last-location-v1', xzB = 'kianos:xizong:system-question-sweep:audit:v1';
const complete = new Storage({[xzA]:'{"block":"old"}', [xzB]:'{"evidence":"preserved"}'});
const checkpoint = buildPrivateLearnerCheckpoint({studyDay:day, now,
  shared:captureSharedControlCheckpoint(complete, {studyDay:day, now}),
  subjects:capturePrivateSubjectCheckpoints(complete, {}, {now})});

// Direct save from partial local state must not require a preceding restore.
const partial = new Storage({[xzA]:'{"block":"new"}'});
let saved, options;
await saveSharedControlToPrivate(partial, {now:now+1,
  readCheckpoint:async()=>({status:'ready', checkpoint}),
  writeCheckpoint:async(value, opts)=>{saved=value;options=opts;}});
assert.equal(saved.payload.subjects.xizong.entry_count, 2);
assert.equal(saved.payload.subjects.xizong.entries.find(row=>row.key===xzA).raw, '{"block":"old"}', 'unknown ancestry preserves durable data');
assert.equal(partial.getItem(xzB), null, 'backup merge cannot mutate browser state');
assert.equal(options.expectedCheckpoint.checkpoint_id, checkpoint.checkpoint_id);
pass('partial local save preserves complete backup without mutating browser');

const corrupted = structuredClone(checkpoint);
corrupted.payload.subjects.lexical={schema:'kianos.lexical.private-payload.v1',entries:{[LEXICAL_LEDGER_STORAGE_KEY]:'{"schema":"wrong"}'}};
const clean = new Storage();
const restored = await restoreSharedControlFromPrivate(clean,{now,readCheckpoint:async()=>({status:'ready',checkpoint:corrupted})});
assert.equal(restored.subjects.xizong.status,'restored');
assert.equal(restored.subjects.english.status,'blocked');
assert.equal(restored.subjects.lexical.status,'blocked');
assert.equal(clean.getItem(xzB),complete.getItem(xzB));
assert.equal(clean.getItem(LEXICAL_LEDGER_STORAGE_KEY),null);
pass('corrupt English/Lexical group cannot block healthy Xizong recovery');

// Regression for a shared partial snapshot: a timer-state key is not the ledger.
const timer = new Storage({
  [STUDY_TIMER_STATE_KEY]:JSON.stringify({schema:STUDY_TIMER_SCHEMA,running:false,manualPaused:true,subject:null,context:null,segmentStartedAt:null,lastSeenAt:now,revision:1,updatedAt:now}),
  [STUDY_TIMER_LEDGER_KEY]:JSON.stringify({schema:STUDY_TIMER_SCHEMA,sessions:[{id:'retained-hour',subject:'english',startedAt:now-3600000,endedAt:now,source:'timer'}]})
});
const timerBackup=buildPrivateLearnerCheckpoint({studyDay:day,now,shared:captureSharedControlCheckpoint(timer,{studyDay:day,now}),subjects:{}});
const partialTimer=new Storage({[STUDY_TIMER_STATE_KEY]:timer.getItem(STUDY_TIMER_STATE_KEY)});
await restoreSharedControlFromPrivate(partialTimer,{now,readCheckpoint:async()=>({status:'ready',checkpoint:timerBackup})});
assert.equal(JSON.parse(partialTimer.getItem(STUDY_TIMER_LEDGER_KEY)).sessions.length,1);
await saveSharedControlToPrivate(partialTimer,{now:now+1,readCheckpoint:async()=>({status:'ready',checkpoint:timerBackup}),writeCheckpoint:async value=>{
  assert.equal(value.payload.shared.study_timer_ledger.sessions.length,1);
}});
pass('partial shared restore/save retains the existing hour rather than zero');

const brokenShared=structuredClone(checkpoint);brokenShared.payload.shared.exam_profile={bad:true};
const healthyRecovery=new Storage();
const isolatedShared=await restoreSharedControlFromPrivate(healthyRecovery,{now,readCheckpoint:async()=>({status:'ready',checkpoint:brokenShared})});
assert.equal(isolatedShared.subjects.xizong.status,'restored');
assert.ok(isolatedShared.warnings.some(value=>value.startsWith('checkpoint:shared:')));
assert.equal(healthyRecovery.getItem(xzB),complete.getItem(xzB));
pass('unreadable shared profile cannot block healthy subject recovery');

const event=id=>({event_id:id,word_id:'synthetic',source:'reading',outcome:'LOOKUP',observed_at:stamp});
const ledger={...emptyLexicalLedger(),events:[event('old'),event('new')]};
const newerLexical=new Storage({[LEXICAL_LEDGER_STORAGE_KEY]:JSON.stringify(ledger)});
const newerBackup=buildPrivateLearnerCheckpoint({studyDay:day,now,shared:captureSharedControlCheckpoint(newerLexical,{studyDay:day,now}),subjects:capturePrivateSubjectCheckpoints(newerLexical)});
const staleBrowser=new Storage({[LEXICAL_LEDGER_STORAGE_KEY]:JSON.stringify({...ledger,events:ledger.events.slice(0,1)})});
const staleSave=await saveSharedControlToPrivate(staleBrowser,{now:now+1,readCheckpoint:async()=>({status:'ready',checkpoint:newerBackup}),writeCheckpoint:async value=>{
  assert.equal(JSON.parse(value.payload.subjects.lexical.entries[LEXICAL_LEDGER_STORAGE_KEY]).events.length,2);
}});
assert.equal(staleSave.status,'partial');
assert.match(staleSave.warnings.join(' '),/LOCAL_BASE_CONFLICT/);
const knownBrowser=new Storage();
await restoreSharedControlFromPrivate(knownBrowser,{now,readCheckpoint:async()=>({status:'ready',checkpoint:newerBackup})});
knownBrowser.setItem(LEXICAL_LEDGER_STORAGE_KEY,JSON.stringify({...ledger,events:[...ledger.events,event('third')]}));
const knownSave=await saveSharedControlToPrivate(knownBrowser,{now:now+2,readCheckpoint:async()=>({status:'ready',checkpoint:newerBackup}),writeCheckpoint:async value=>{
  assert.equal(JSON.parse(value.payload.subjects.lexical.entries[LEXICAL_LEDGER_STORAGE_KEY]).events.length,3);
}});
assert.equal(knownSave.status,'saved');
pass('stale browser cannot shrink remote history; known checkpoint descendant can save new evidence');

// Saving a complete shadow must not certify a browser which never received it.
{
  const browser = new Storage();
  let durable = structuredClone(newerBackup);
  const readCheckpoint = async () => ({ status: 'ready', checkpoint: durable });
  const writeCheckpoint = async (value, opts) => {
    assert.equal(opts.expectedCheckpoint.checkpoint_id, durable.checkpoint_id);
    durable = value;
  };
  await saveSharedControlToPrivate(browser, { now: now+3, readCheckpoint, writeCheckpoint });
  assert.equal(browser.getItem(LEXICAL_LEDGER_STORAGE_KEY), null, 'shadow backup does not restore the browser');
  assert.equal(browser.getItem(PRIVATE_CHECKPOINT_BASE_KEY), null, 'shadow-only preservation is not local ancestry');
  assert.deepEqual(JSON.parse(durable.payload.subjects.lexical.entries[LEXICAL_LEDGER_STORAGE_KEY]).events.map(row=>row.event_id), ['old','new']);
  browser.setItem(LEXICAL_LEDGER_STORAGE_KEY, JSON.stringify({...emptyLexicalLedger(), events:[event('local-first')]}));
  const next = await saveSharedControlToPrivate(browser, { now: now+4, readCheckpoint, writeCheckpoint });
  assert.equal(next.status, 'partial');
  assert.match(next.warnings.join(' '), /LOCAL_BASE_CONFLICT/);
  assert.deepEqual(JSON.parse(durable.payload.subjects.lexical.entries[LEXICAL_LEDGER_STORAGE_KEY]).events.map(row=>row.event_id), ['old','new']);
  assert.equal(browser.getItem(PRIVATE_CHECKPOINT_BASE_KEY), null);
  assert.equal(JSON.parse(browser.getItem(LEXICAL_LEDGER_STORAGE_KEY)).events[0].event_id, 'local-first', 'conflict preserves local bytes too');
  pass('shadow-only save cannot mint ancestry or authorize later history loss');
}

// One healthy fill and one native ambiguity must remain visibly partial.
{
  const recallKey = 'kianos:xizong:system-recall:audit:v1';
  const holdoutKey = 'kianos:xizong:full-paper-holdout-years:v1';
  const browser = new Storage({
    'kianos:xizong:system-evidence-meta:audit:v1': '{"version":"new"}',
    'kianos-xizong-stale-system-evidence:audit:1': '{"current_version":"new","recall":{"done":true}}'
  });
  const ambiguousSource = new Storage({ [recallKey]: '{"done":"divergent"}', [holdoutKey]: '[2026]' });
  const ambiguous = buildPrivateLearnerCheckpoint({studyDay:day, now,
    shared:captureSharedControlCheckpoint(new Storage(), {studyDay:day, now}),
    subjects:capturePrivateSubjectCheckpoints(ambiguousSource)});
  const recovery = await restoreSharedControlFromPrivate(browser, {now, readCheckpoint:async()=>({status:'ready', checkpoint:ambiguous})});
  assert.equal(browser.getItem(recallKey), null, 'native ambiguous evidence is not revived');
  assert.equal(browser.getItem(holdoutKey), '[2026]', 'healthy key still restores');
  assert.equal(recovery.subjects.xizong.status, 'partial');
  assert.ok(recovery.subjects.xizong.blocked.some(row=>row.key===recallKey && row.reason==='NATIVE_RETIREMENT_AMBIGUOUS'));
  assert.ok(recovery.warnings.some(value=>value.startsWith('checkpoint:xizong:')));
  assert.equal(browser.getItem(PRIVATE_CHECKPOINT_BASE_KEY), null, 'partial native recovery never establishes ancestry');
  pass('native partial restore retains blocked reasons and cannot mint ancestry');
}

const originalFetch=globalThis.fetch, originalWindow=globalThis.window, originalDocument=globalThis.document;
const catalog=[{task:'reading_a',object_id:'synthetic-maturity',source_hash:'synthetic-v1',semantic_source_hash:'semantic-v1'}];
globalThis.window={dispatchEvent(){}};
globalThis.document={querySelector:()=>({textContent:JSON.stringify(catalog)})};
let receiptAvailable=false, receipts=0;
globalThis.fetch=async(url, init={})=>{
  if(String(url).endsWith('/receipt')) {
    receipts++;
    return receiptAvailable
      ? new Response(JSON.stringify({status:'saved',receipt:JSON.parse(init.body)}),{status:200})
      : new Response('{}',{status:503});
  }
  return new Response(JSON.stringify({collections:[],drills:[]}),{status:200});
};
try {
  const storage=new Storage();
  const plan={schema:EXAM_CHAT_PLAN_SCHEMA,study_day:day,generated_at:stamp,
    learner_evidence_basis:buildExamChatPlanBasis(storage,day),subjects:{english:{target_minutes:30,session_ref:'synthetic-session'}},next_subject:'english'};
  const instruction={schema:ENGLISH_SESSION_SCHEMA,session_id:'synthetic-session',study_day:day,generated_at:stamp,current_step:0,
    steps:[{step_id:'s1',...catalog[0],label:'Synthetic',params:{material_exposure:{state:'unknown',basis:'learner_statement',note:'synthetic declaration',observed_at:stamp}}}],return_policy:{on_finish:'english_home'}};
  const command={schema:'kianos.control-browser-command.v1',command_id:'synthetic-command-001',command_hash:'a'.repeat(64),study_day:day,generated_at:stamp,expires_at:null,
    operations:[{kind:'english.session',payload:instruction},{kind:'exam.chat_plan',payload:plan}]};
  const applied=await applyPrivateControlCommand(storage,command,{day,now});
  assert.equal(applied.status,'applied');assert.equal(applied.receipt_saved,false);
  assert.ok(storage.getItem(ENGLISH_MATERIAL_EXPOSURE_KEY));
  assert.equal(readExamChatPlan(storage,day).status,'ready');
  pass('native declaration plus plan apply atomically without self-staling');
  const before=[...storage.map];receiptAvailable=true;
  const repeated=await applyPrivateControlCommand(storage,command,{day,now:now+1});
  assert.equal(repeated.status,'idempotent');assert.equal(repeated.receipt_saved,true);
  assert.deepEqual([...storage.map],before);assert.equal(receipts,2);
  pass('receipt retry does not replay native mutation');
  const replayStore=new Storage();
  const recovery=buildPrivateLearnerCheckpoint({studyDay:day,now,
    shared:captureSharedControlCheckpoint(storage,{studyDay:day,now}),subjects:capturePrivateSubjectCheckpoints(storage)});
  await restoreSharedControlFromPrivate(replayStore,{now,readCheckpoint:async()=>({status:'ready',checkpoint:recovery})});
  assert.equal((await applyPrivateControlCommand(replayStore,command,{day,now:now+2})).status,'idempotent');
  assert.deepEqual(JSON.parse(replayStore.getItem(ENGLISH_SESSION_KEY)),JSON.parse(storage.getItem(ENGLISH_SESSION_KEY)));
  pass('restart restores apply receipt and native session before replay');
  await assert.rejects(applyPrivateControlCommand(storage,{...command,command_id:'synthetic-older-001',generated_at:new Date(now-1000).toISOString()},{day,now}),/OLDER_COMMAND/);
  pass('late older command cannot replace newer applied instruction');
  storage.setItem(LEXICAL_LEDGER_STORAGE_KEY,JSON.stringify(emptyLexicalLedger()));
  assert.equal(readExamChatPlan(storage,day).status,'stale');
  assert.equal(buildEnglishEvidencePacket(storage,{day,catalog}).resume.status,'ready');
  pass('later evidence invalidates global plan while native Resume remains valid');
  const atomic=new Storage();atomic.failKey=CONTROL_LOCAL_RECEIPT_KEY;
  await assert.rejects(applyPrivateControlCommand(atomic,command,{day,now}),/QuotaExceededError/);
  assert.equal(atomic.length,0);
  pass('failed local apply receipt rolls back every native mutation');
} finally { globalThis.fetch=originalFetch;globalThis.window=originalWindow;globalThis.document=originalDocument; }

const dir=fs.mkdtempSync(path.join(os.tmpdir(),'kianos-maturity-cas-'));
let server;
try {
  writeDisk(checkpoint,dir);
  assert.throws(()=>writeDisk({...checkpoint,checkpoint_id:'older',generated_at:new Date(now-1).toISOString()},dir),/STALE_WRITE/);
  let middleware;
  privateLearnerBridge({privateDir:dir,packetSync:async()=>({state:'disabled'})}).configureServer({middlewares:{use(fn){middleware=fn;}}});
  server=http.createServer((req,res)=>middleware(req,res,()=>{res.statusCode=404;res.end();}));
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const endpoint='http://127.0.0.1:'+server.address().port+'/__kianos-private/checkpoint';
  const a={...checkpoint,checkpoint_id:'concurrent-a',generated_at:new Date(now+1000).toISOString()};
  const b={...checkpoint,checkpoint_id:'concurrent-b',generated_at:new Date(now+2000).toISOString()};
  const writes=await Promise.allSettled([a,b].map(value=>writeRemote(value,{endpoint,expectedCheckpoint:checkpoint})));
  assert.equal(writes.filter(row=>row.status==='fulfilled').length,1);
  assert.match(String(writes.find(row=>row.status==='rejected').reason),/CONFLICT/);
  const current=readDisk(dir);assert.ok(['concurrent-a','concurrent-b'].includes(current.checkpoint_id));
  const noCAS=await fetch(endpoint,{method:'PUT',headers:{'content-type':'application/json'},body:JSON.stringify(b)});
  assert.equal(noCAS.status,428);
  assert.equal(readDisk(dir).checkpoint_id,current.checkpoint_id);
  pass('real HTTP concurrent save admits one writer; stale or unguarded writes preserve disk');
} finally { if(server)await new Promise(resolve=>server.close(resolve));fs.rmSync(dir,{recursive:true,force:true}); }
console.log(JSON.stringify({status:'PASS',native_checks:results.length,checks:results},null,2));
