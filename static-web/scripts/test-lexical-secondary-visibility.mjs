// Actual Astro component/shard SSR and production adapters with isolated synthetic DOM/storage.
// DOM_PARSER_MODULE can point to an isolated linkedom installation; no browser/profile is used.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {transform} from '@astrojs/compiler';
import {experimental_AstroContainer} from 'astro/container';
import {loadLexicalWordByOrdinal,lexicalRuntimeManifest,listLexicalWordSummaries} from '../src/lib/lexical.mjs';
import * as evidence from '../src/lib/lexicalEvidence.mjs';
import * as settings from '../src/lib/lexicalSettings.mjs';
import * as routes from '../src/lib/lexicalRuntimeRoute.mjs';
import {resolveCurrentLexicalTarget} from '../src/lib/lexicalEnglishEvidence.mjs';
import {capturePrivateSubjectCheckpoints,restorePrivateSubjectCheckpoints} from '../src/lib/privateSubjectCheckpoints.mjs';
const {parseHTML}=await import(process.env.DOM_PARSER_MODULE || 'linkedom');
const parse=html=>parseHTML('<html><body>'+html+'</body></html>');
const check=(ok,label)=>{assert.ok(ok,label);console.log('PASS '+label);};
const rootDir=process.cwd()+'/..';
const decisions=JSON.parse(fs.readFileSync(rootDir+'/content/lexical/final-learner-object-decisions.json'));
const all=listLexicalWordSummaries();
const cases=all.filter(w=>Object.values(decisions.words[w.objectId]?.secondary_senses||{}).some(v=>v.disposition==='EXPLORE_ONLY')).map(w=>loadLexicalWordByOrdinal(w.ordinal).record);
const url=code=>'data:text/javascript;base64,'+Buffer.from(code.replace(/,\n\s*createMetadata as \$\$createMetadata/,'').replace(/^export const \$\$metadata = .*;$/gm,'')).toString('base64');
const runtime=import.meta.resolve('astro/compiler-runtime');
async function compile(file,replacements={}){let {code}=await transform(fs.readFileSync(file,'utf8'),{filename:file,internalURL:runtime,resultScopedSlot:true,renderScript:true});code=code.replaceAll('astro/runtime/server/index.js',runtime);for(const [a,b] of Object.entries(replacements))code=code.replaceAll(a,b);return url(code);}
const pronunciation=await compile('src/components/LexicalPronunciation.astro',{'../lib/lexicalPronunciation.mjs':pathToFileURL(process.cwd()+'/src/lib/lexicalPronunciation.mjs').href});
const markupURL=await compile('src/components/VocabularyWordMarkup.astro',{'./LexicalPronunciation.astro':pronunciation});
const markup=(await import(markupURL)).default;
const shard=(await import(await compile('src/pages/vocabulary-data/[key].astro',{'../../components/VocabularyWordMarkup.astro':markupURL,'../../lib/lexical.mjs':pathToFileURL(process.cwd()+'/src/lib/lexical.mjs').href}))).default;
const container=await experimental_AstroContainer.create();
const render=w=>container.renderToString(markup,{props:{answer:loadLexicalWordByOrdinal(w.ordinal)}});
const manifest=lexicalRuntimeManifest(),shards=new Map();
async function fetcher(path){if(path.endsWith('manifest.json'))return {ok:true,json:async()=>manifest};const key=path.split('/').filter(Boolean).at(-1);const spec=manifest.shards.find(s=>s.key===key);assert.ok(spec);if(!shards.has(key))shards.set(key,await container.renderToString(shard,{props:{start:spec.start,end:spec.end}}));return {ok:true,text:async()=>shards.get(key)};}
const resolverOpts={fetcher,parseDocument:html=>parse(html).document};
let restored=0,absent=[];
for(const w of cases){
 const html=await render(w),{document}=parse(html);
 for(const [id,d] of Object.entries(decisions.words[w.word_id].secondary_senses)){
  if(d.disposition!=='EXPLORE_ONLY')continue;
  const s=w.secondary_senses.find(s=>s.id===id);
  if(!s){absent.push({word:w.word,id});continue;}
  restored++;
  const button=[...document.querySelectorAll('[data-vocab-repair]')].find(b=>b.dataset.targetId===id);
  assert.ok(button && button.closest('[data-vocab-secondary-explore-only][hidden]'));
  assert.equal(button.dataset.targetKind,'secondary_sense');assert.equal(button.dataset.targetLocator,s.repair.target_locator);
  const row=button.closest('[data-vocab-secondary-explore-only]');assert.ok(row.textContent.includes(s.definition_cn||s.definition_en));
  const event={word_id:w.word_id,ordinal:w.ordinal,...s.repair};
  const resolved=await resolveCurrentLexicalTarget(event,resolverOpts);assert.equal(resolved.target_id,id);
  await assert.rejects(resolveCurrentLexicalTarget({...event,target_kind:'sense'},resolverOpts),/TARGET_NOT_FOUND/);
  await assert.rejects(resolveCurrentLexicalTarget({...event,target_id:id+':wrong'},resolverOpts),/TARGET_NOT_FOUND/);
  await assert.rejects(resolveCurrentLexicalTarget({...event,target_id:null,target_revision:'old'},resolverOpts),/LOCATOR_REVISION_MISMATCH/);
  await assert.rejects(resolveCurrentLexicalTarget({...event,source_hash:'old'},resolverOpts),/SOURCE_CHANGED/);
  await assert.rejects(resolveCurrentLexicalTarget({...event,target_id:null,target_locator:'record.secondary_senses[999]',target_revision:w.source_fingerprint},resolverOpts),/TARGET_NOT_FOUND/);
 }
}
check(restored>0,'actual SSR/shard resolver retains every present decided Secondary and rejects wrong kind/ID/stale locator revisions');
console.log(JSON.stringify({restored,source_absent:absent,rendered_actual_shards:shards.size}));
class MemoryStorage{constructor(entries=[]){this.map=new Map(entries);}get length(){return this.map.size;}key(i){return [...this.map.keys()][i]??null;}getItem(k){return this.map.get(k)??null;}setItem(k,v){this.map.set(k,String(v));}removeItem(k){this.map.delete(k);}}
async function adapters(w,mode,seed=evidence.emptyLexicalLedger(),legacy=null){
 const {document,window}=parse('<div data-vocab-evidence-bridge data-base="/" data-total="7946"></div>'+await render(w));
 window.HTMLElement.prototype.scrollIntoView=function(){};
 const store=new MemoryStorage(),key='kianos-vocabulary-astro-v2:'+w.word_id;
 if(legacy)store.setItem(key,JSON.stringify({revealed:true,repairTargets:legacy}));
 let ledger=structuredClone(seed),writes=0;
 const loc={search:'?mode='+mode,origin:'https://synthetic.invalid',pathname:'/vocabulary/word/',replace(){throw Error('unexpected navigation')}};
 const context=vm.createContext({...evidence,...settings,...routes,HTMLElement:window.HTMLElement,HTMLTextAreaElement:window.HTMLTextAreaElement,HTMLButtonElement:window.HTMLButtonElement,CustomEvent:window.CustomEvent,URLSearchParams,URL,location:loc,document,window,localStorage:store,learnerWriterReady:Promise.resolve(),lexicalBrowserStateReadable:()=>true,readBrowserLexicalLedger:()=>ledger,writeBrowserLexicalLedger:x=>{ledger=x;writes++;},requestAnimationFrame:fn=>fn()});
 for(const name of ['VocabularyIdentityLineageBridge.astro','VocabularyWordRuntime.astro','VocabularyEvidenceBridge.astro']){
  const code=fs.readFileSync('src/components/'+name,'utf8').match(/<script>([\s\S]*?)<\/script>/)[1].replace(/^\s*import[\s\S]*?;/gm,'');vm.runInContext(code,context);await new Promise(r=>setImmediate(r));
 }
 let root=document.querySelector('[data-local-port="vocabulary"]');
 function keypress(key){const e=new window.Event('keydown',{bubbles:true,cancelable:true});e.key=key;e.code=key===' '?'Space':'';document.dispatchEvent(e);}
 async function switchMode(nextMode){
   window.dispatchEvent(new window.CustomEvent('kianos:vocabulary-root-dispose',{detail:{root}}));
   const replacement=parse(await render(w)).document.querySelector('[data-local-port="vocabulary"]');
   root.replaceWith(replacement);root=replacement;loc.search='?mode='+nextMode;
   window.dispatchEvent(new window.CustomEvent('kianos:vocabulary-root-ready'));
   await new Promise(r=>setImmediate(r));
  }
 return {get root(){return root;},document,window,store,get ledger(){return ledger;},get writes(){return writes;},keypress,switchMode};
}
for(const ordinal of [2185,2214]){
 const w=loadLexicalWordByOrdinal(ordinal).record,s=w.secondary_senses.find(s=>s.disposition==='EXPLORE_ONLY'),id=s.id;
 let ledger=evidence.emptyLexicalLedger();
 for(const [i,outcome] of ['ADDED','WRONG'].entries())ledger=evidence.appendEvidenceEvent(ledger,{event_id:'old:'+ordinal+':'+i,word_id:w.word_id,ordinal,...s.repair,target_revision:'old-revision',source:i?'chat_check':'depth_plus',outcome,observed_at:`2026-10-23T00:00:0${i}.000Z`}).ledger;
 const eventBytes=JSON.stringify(ledger.events);
 for(const mode of ['study','lookup','repair']){
  const a=await adapters(w,mode,ledger);if(mode==='study')a.keypress(' ');
  const hidden=a.root.querySelector('[data-vocab-secondary-explore-only]');assert.equal(hidden.hidden,mode==='study');
  assert.equal(JSON.stringify(a.ledger.events),eventBytes);assert.ok(evidence.compileRepairTargets(a.ledger).some(t=>t.target_id===id&&t.target_kind==='secondary_sense'));
  if(mode==='lookup')assert.equal(a.writes,0);
  const buttons=[...a.root.querySelectorAll('[data-vocab-repair]')].filter(b=>!b.closest('[hidden]'));
  const seen=new Set();for(let i=0;i<buttons.length;i++){a.keypress('j');const selected=a.root.querySelector('.keyboard-target [data-vocab-repair]');assert.ok(selected&&!selected.closest('[hidden]'));seen.add(selected.dataset.targetId||selected.dataset.targetLocator);}
  assert.equal(seen.has(id),mode!=='study');assert.equal(seen.size,buttons.length);
  a.keypress('k');assert.ok(!a.root.querySelector('.keyboard-target [data-vocab-repair]').closest('[hidden]'));
  const secondaryButton=[...a.root.querySelectorAll('[data-vocab-repair]')].find(b=>b.dataset.targetId===id);
  if(mode==='study'){
   const writes=a.writes,before=JSON.stringify(a.ledger);secondaryButton.click();assert.equal(a.writes,writes);assert.equal(JSON.stringify(a.ledger),before);
   a.keypress('+');assert.equal(a.ledger.events.filter(e=>e.target_id===id).length,2);
  }else if(mode==='repair'){
   while(a.root.querySelector('.keyboard-target [data-vocab-repair]')?.dataset.targetId!==id)a.keypress('j');
   a.keypress('+');assert.equal(a.ledger.events.at(-1).outcome,'CLEAR');assert.equal(a.ledger.events.at(-1).target_kind,'secondary_sense');assert.equal(a.ledger.events.at(-1).target_id,id);assert.equal(evidence.repairStateForEvent(a.ledger,a.ledger.events[0]).state,'DORMANT');assert.ok(!evidence.compileRepairTargets(a.ledger).some(t=>t.target_id===id));assert.equal(JSON.stringify(a.ledger.events.slice(0,2)),eventBytes);
  }
 }
 // Actual checkpoint transport, then repeated legacy-cache import by production adapter.
 const oldTarget={...s.repair,target_revision:'old-revision',source:'depth_plus',outcome:'ADDED',observed_at:'2026-10-22T00:00:00.000Z'};
 const key='kianos-vocabulary-astro-v2:'+w.word_id,source=new MemoryStorage([[evidence.LEXICAL_LEDGER_STORAGE_KEY,JSON.stringify(ledger)],[key,JSON.stringify({revealed:true,repairTargets:{[id]:oldTarget}})]]);
 const checkpoint=capturePrivateSubjectCheckpoints(source),destination=new MemoryStorage();restorePrivateSubjectCheckpoints(destination,checkpoint);assert.equal(destination.getItem(evidence.LEXICAL_LEDGER_STORAGE_KEY),source.getItem(evidence.LEXICAL_LEDGER_STORAGE_KEY));restorePrivateSubjectCheckpoints(destination,checkpoint);assert.equal(destination.getItem(key),source.getItem(key));
 const imported=await adapters(w,'repair',JSON.parse(destination.getItem(evidence.LEXICAL_LEDGER_STORAGE_KEY)),JSON.parse(destination.getItem(key)).repairTargets);
 const again=await adapters(w,'repair',imported.ledger,{[id]:oldTarget});assert.equal(JSON.stringify(imported.ledger.events),JSON.stringify(again.ledger.events));assert.equal(JSON.stringify(again.ledger.events.slice(0,2)),eventBytes);assert.ok(evidence.compileRepairTargets(again.ledger).some(t=>t.target_id===id&&t.target_kind==='secondary_sense'));
 check(true,w.word+': Study/Lookup/Repair J/K/+ visibility, hidden-click guard, immutable old ADDED/WRONG, explicit CLEAR, checkpoint and idempotent imports');
}
// Existing Form rule stays independent, including historical revisions.
const green=loadLexicalWordByOrdinal(2199).record;let forms=evidence.emptyLexicalLedger();
for(const [i,rev] of ['old-one','old-two'].entries())forms=evidence.appendEvidenceEvent(forms,{event_id:'form:'+i,word_id:green.word_id,ordinal:2199,target_kind:'form_identity',target_id:null,target_locator:'record.form_identity',target_revision:rev,source:'depth_plus',outcome:'ADDED',observed_at:'2026-10-23T00:00:00.000Z'}).ledger;
for(const mode of ['study','lookup','repair']){const a=await adapters(green,mode,forms);assert.equal(JSON.stringify(a.ledger.events),JSON.stringify(forms.events));if(mode==='lookup'){assert.equal(a.writes,0);assert.ok(a.root.querySelector('[data-vocab-lookup-only]:not([hidden])'));}else{assert.equal(evidence.compileRepairTargets(a.ledger).length,0);assert.equal(a.root.querySelector('[data-vocab-lookup-only]').hidden,true);}}
check(true,'original Form old-revision freezing and Lookup zero-write boundary preserved through actual SSR/adapters');

for(const w of cases.filter(w=>w.secondary_senses.some(s=>s.disposition==='EXPLORE_ONLY'))){
 const a=await adapters(w,'study');a.keypress(' ');
 const summary=all.find(x=>x.objectId===w.word_id);
 assert.equal(summary.secondarySenseCount,w.secondary_senses.filter(s=>s.disposition!=='EXPLORE_ONLY').length);
 for(const mode of ['study','lookup','repair','study']){
  if(mode!==a.root.dataset.vocabMode){await a.switchMode(mode);if(mode==='study')a.keypress(' ');assert.equal(a.root.querySelector('.keyboard-target'),null);}
  for(const row of a.root.querySelectorAll('[data-vocab-secondary-explore-only]'))assert.equal(row.hidden,mode==='study');
  const visible=[...a.root.querySelectorAll('[data-vocab-repair]')].filter(b=>!b.closest('[hidden]'));
  for(let i=0;i<visible.length;i++){a.keypress('j');assert.ok(!a.root.querySelector('.keyboard-target [data-vocab-repair]').closest('[hidden]'));}
 }
}
check(true,'all restored words: mode-switch initialization resets selection, current-mode navigation and summary counts agree');
// Optional exact default DOM comparison against the saved pre-repair builder/markup evidence.
if(process.env.SECONDARY_BEFORE_DIR){
 const before=process.env.SECONDARY_BEFORE_DIR;
 const oldMarkup=(await import(await compile(before+'/before-source/static-web/src/components/VocabularyWordMarkup.astro',{'./LexicalPronunciation.astro':pronunciation}))).default;
 const oldWords=new Map(fs.readdirSync(before+'/before-final/shards').flatMap(p=>JSON.parse(fs.readFileSync(before+'/before-final/shards/'+p))).map(w=>[w.ordinal,w]));
 for(const w of cases.filter(w=>![2185,2214].includes(w.ordinal))){
  const prior=oldWords.get(w.ordinal),answer={...loadLexicalWordByOrdinal(w.ordinal),record:prior,sourceHash:prior.source_fingerprint};
  const oldHtml=await container.renderToString(oldMarkup,{props:{answer}}),newHtml=await render(w);
  const normalize=(html,hash)=>{const d=parse(html).document;d.querySelectorAll('[data-vocab-secondary-explore-only][hidden],[data-vocab-debug-source]').forEach(n=>n.remove());return d.body.innerHTML.replaceAll(hash,'FINGERPRINT').replace(/>\s+</g,'><').replace(/\s+/g,' ').trim();};
  const n=normalize(newHtml,w.source_fingerprint),o=normalize(oldHtml,prior.source_fingerprint);if(n!==o){let i=0;while(n[i]===o[i])i++;throw Error(w.word+' default DOM delta at '+i+' new='+n.slice(i,i+180)+' old='+o.slice(i,i+180));}
 }
 check(true,'existing decisions: exact Study DOM parity after hidden rows removed, including normal Senses/groups/headings');
}
const css=fs.readFileSync('src/styles/lexical-presentation.css','utf8');
assert.match(css,/\[data-vocab-secondary-explore-only\]\[hidden\]\s*\{\s*display:none!important/);
check(true,'authored CSS explicitly enforces hidden rows before initialization (no real-browser visual claim)');

if(process.env.SECONDARY_EVIDENCE_DIR){
 const out=process.env.SECONDARY_EVIDENCE_DIR;fs.mkdirSync(out,{recursive:true});
 const inventory=[...shards].map(([key,html])=>({key,sha256:createHash('sha256').update(html).digest('hex'),bytes:Buffer.byteLength(html)}));
 fs.writeFileSync(out+'/ssr-shard-inventory.json',JSON.stringify(inventory,null,2)+'\n');
 const key=manifest.shards.find(s=>s.start<=2185&&s.end>=2185).key;fs.writeFileSync(out+'/grant-ground-actual-shard.html',shards.get(key));
}
// Degenerate synthetic layout: hidden-only Secondary group leaves no visible empty container.
const fixture=structuredClone(loadLexicalWordByOrdinal(2185).record);fixture.senses=[];
const fixtureHtml=await container.renderToString(markup,{props:{answer:{...loadLexicalWordByOrdinal(2185),record:fixture}}});
const fixtureGroup=parse(fixtureHtml).document.querySelector('[data-vocab-repair-list]');assert.ok(fixtureGroup.hidden&&fixtureGroup.hasAttribute('data-vocab-secondary-explore-only'));
check(true,'hidden-only Secondary group is initially hidden, without an orphan group/title');
