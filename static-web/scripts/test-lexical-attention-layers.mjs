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
import * as attention from '../src/lib/lexicalAttention.mjs';
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
const markupURL=await compile('src/components/VocabularyWordMarkup.astro',{'./LexicalPronunciation.astro':pronunciation,'../lib/lexicalAttention.mjs':pathToFileURL(process.cwd()+'/src/lib/lexicalAttention.mjs').href});
const markup=(await import(markupURL)).default;
const shard=(await import(await compile('src/pages/vocabulary-data/[key].astro',{'../../components/VocabularyWordMarkup.astro':markupURL,'../../lib/lexical.mjs':pathToFileURL(process.cwd()+'/src/lib/lexical.mjs').href}))).default;
const container=await experimental_AstroContainer.create();
const render=w=>container.renderToString(markup,{props:{answer:loadLexicalWordByOrdinal(w.ordinal)}});
const manifest=lexicalRuntimeManifest(),shards=new Map();
async function fetcher(path){if(path.endsWith('manifest.json'))return {ok:true,json:async()=>manifest};const key=path.split('/').filter(Boolean).at(-1);const spec=manifest.shards.find(s=>s.key===key);assert.ok(spec);if(!shards.has(key))shards.set(key,await container.renderToString(shard,{props:{start:spec.start,end:spec.end}}));return {ok:true,text:async()=>shards.get(key)};}
const resolverOpts={fetcher,parseDocument:html=>parse(html).document};
class MemoryStorage{constructor(entries=[]){this.map=new Map(entries);}get length(){return this.map.size;}key(i){return [...this.map.keys()][i]??null;}getItem(k){return this.map.get(k)??null;}setItem(k,v){this.map.set(k,String(v));}removeItem(k){this.map.delete(k);}}
async function adapters(w,mode,seed=evidence.emptyLexicalLedger(),legacy=null){
 const {document,window}=parse('<div data-vocab-evidence-bridge data-base="/" data-total="7946"></div>'+await render(w));
 window.HTMLElement.prototype.scrollIntoView=function(){};
 const store=new MemoryStorage(),key='kianos-vocabulary-astro-v2:'+w.word_id;
 if(legacy)store.setItem(key,JSON.stringify({revealed:true,repairTargets:legacy}));
 let ledger=structuredClone(seed),writes=0;
 const loc={search:'?mode='+mode,origin:'https://synthetic.invalid',pathname:'/vocabulary/word/',replace(){throw Error('unexpected navigation')}};
 const context=vm.createContext({...evidence,...settings,...routes,...attention,HTMLElement:window.HTMLElement,HTMLTextAreaElement:window.HTMLTextAreaElement,HTMLButtonElement:window.HTMLButtonElement,CustomEvent:window.CustomEvent,URLSearchParams,URL,location:loc,document,window,localStorage:store,learnerWriterReady:Promise.resolve(),lexicalBrowserStateReadable:()=>true,readBrowserLexicalLedger:()=>ledger,writeBrowserLexicalLedger:x=>{ledger=x;writes++;},requestAnimationFrame:fn=>fn()});
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
 function toggle(node,open){if(open)node.setAttribute('open','');else node.removeAttribute('open');node.dispatchEvent(new window.Event('toggle'));}
 return {toggle,get root(){return root;},document,window,store,get ledger(){return ledger;},get writes(){return writes;},keypress,switchMode};
}
const results=[];const pass=name=>{results.push({name,status:'PASS'});console.log('PASS '+name);};
const button=(a,id)=>[...a.root.querySelectorAll('[data-vocab-repair]')].find(b=>b.getAttribute('data-target-id')===id);
const visible=a=>[...a.root.querySelectorAll('[data-vocab-repair]')].filter(attention.lexicalTargetIsVisible);
const createLedger=(w,targets)=>targets.reduce((l,t,i)=>evidence.appendEvidenceEvent(l,{event_id:'old:'+i,word_id:w.word_id,ordinal:w.ordinal,word:w.word,...t,source:'depth_plus',outcome:'ADDED',observed_at:'2026-10-24T00:00:00.000Z'}).ledger,evidence.emptyLexicalLedger());
const counts={main:0,recognition:0,reference:0};
for(let n=2200;n<2300;n++){const w=loadLexicalWordByOrdinal(n).record;for(const x of [...w.senses,...w.constructions])counts[attention.lexicalAttentionLayer(x)]++;}
assert.deepEqual(counts,{main:378,recognition:86,reference:11});pass('01 Exact 100-word explicit plan counts and real Final projection');
const heavy=loadLexicalWordByOrdinal(2298).record,hedge=loadLexicalWordByOrdinal(2299).record,float=loadLexicalWordByOrdinal(1963).record;
assert.equal(heavy.senses.filter(attention.isDefaultLexicalObject).length,3);assert.equal(heavy.constructions.filter(attention.isDefaultLexicalObject).length,0);pass('02 Heavy: three main senses; work sense and three constructions optional');
assert.equal(hedge.senses.filter(attention.isDefaultLexicalObject).length,4);assert.equal(hedge.constructions.filter(attention.isDefaultLexicalObject).length,2);pass('03 Hedge: finance noun retained main; three senses optional');
assert.equal(float.senses.filter(attention.isDefaultLexicalObject).length,2);assert.equal(float.constructions.filter(attention.isDefaultLexicalObject).length,1);pass('04 Float: two physical senses plus idea construction; three reference senses');
for(const w of [heavy,hedge,float]){const {document}=parse(await render(w));for(const x of [...w.senses,...w.constructions])assert.equal([...document.querySelectorAll('[data-vocab-repair]')].filter(b=>b.dataset.targetId===x.id).length,1);}
pass('05 SSR emits each stable target exactly once across layers');
let a=await adapters(heavy,'study');a.keypress(' ');const optional=heavy.senses.find(x=>attention.lexicalAttentionLayer(x)==='recognition');assert.ok(!attention.lexicalTargetIsVisible(button(a,optional.id)));assert.ok(visible(a).length);pass('06 Study main visible, optional collapsed and absent from keyboard/admission');
const expansion=a.root.querySelector('[data-vocab-attention-layer="recognition"]');const bytes=JSON.stringify(a.ledger),writes=a.writes;a.toggle(expansion,true);assert.equal(JSON.stringify(a.ledger),bytes);assert.equal(a.writes,writes);assert.ok(attention.lexicalTargetIsVisible(button(a,optional.id)));pass('07 Expanding recognition is read-only and exposes exact preserved target');
button(a,optional.id).click();assert.equal(a.ledger.events.at(-1).target_id,optional.id);assert.equal(a.ledger.events.at(-1).outcome,'ADDED');assert.equal(a.ledger.events.length,1);pass('08 Explicit optional + admits exactly one target, no automatic debt');
a.keypress('j');a.toggle(expansion,false);assert.equal(a.root.querySelector('.keyboard-target'),null);const n=a.ledger.events.length;button(a,optional.id).click();assert.equal(a.ledger.events.length,n);pass('09 Closing resets navigation and hidden + cannot write');
a=await adapters(float,'lookup');assert.equal(a.writes,0);for(const g of a.root.querySelectorAll('details[data-vocab-attention-layer]'))assert.ok(g.hasAttribute('open'));for(const x of float.senses)assert.ok(attention.lexicalTargetIsVisible(button(a,x.id)));pass('10 Lookup complete, visibly tiered, and zero ledger writes');
a=await adapters(float,'repair');assert.equal(visible(a).length,0);assert.ok(!a.root.querySelector('[data-vocab-repair-other]').hasAttribute('open'));pass('11 Empty Repair does not flatten meanings or create targets');
const reference=float.senses.find(x=>x.id==='sense:float:b11719828aea564a');let seed=createLedger(float,[reference.repair]);a=await adapters(float,'repair',seed);assert.ok(attention.lexicalTargetIsVisible(button(a,reference.id)));assert.ok(button(a,reference.id).closest('[data-vocab-repair-focus]'));assert.equal(JSON.stringify(a.ledger.events),JSON.stringify(seed.events));for(const x of float.senses.filter(x=>x.id!==reference.id))assert.ok(!attention.lexicalTargetIsVisible(button(a,x.id)));pass('12 Legal old reference debt focused by exact ID; other meanings collapsed');
const unresolved=createLedger(float,[{target_kind:'sense',target_id:'missing:old'},{target_kind:'construction',target_id:reference.id},{target_kind:'sense',target_id:null,target_locator:'record.senses[0]',target_revision:'stale'}]);a=await adapters(float,'repair',unresolved);assert.equal(visible(a).length,0);assert.match(a.root.querySelector('[data-vocab-repair-unresolved]').textContent,/3 个历史目标/);assert.equal(JSON.stringify(a.ledger.events),JSON.stringify(unresolved.events));pass('13 Missing/wrong-kind/stale-locator records retained without substitution');
a=await adapters(float,'repair',seed);button(a,reference.id).click();assert.equal(a.ledger.events.at(-1).outcome,'CLEAR');assert.equal(a.ledger.events.at(-1).target_id,reference.id);assert.equal(JSON.stringify(a.ledger.events.slice(0,1)),JSON.stringify(seed.events));assert.equal(visible(a).length,0);pass('14 Explicit removal clears only selected target and re-collapses its original node');
a=await adapters(heavy,'lookup');await a.switchMode('study');a.keypress(' ');assert.ok(!attention.lexicalTargetIsVisible(button(a,optional.id)));a.keypress('j');await a.switchMode('repair');assert.equal(a.root.querySelector('.keyboard-target'),null);assert.equal(visible(a).length,0);pass('15 Fresh Study/Lookup/Repair navigation resets collapse and keyboard state');
assert.throws(()=>attention.lexicalAttentionLayer({disposition:'UNKNOWN'}),/UNKNOWN_ATTENTION/);const summary=all.find(x=>x.ordinal===2298);assert.equal(summary.senseCount,3);assert.equal(summary.constructionCount,0);pass('16 Unknown disposition fails closed; summaries exclude optional');
const old={...reference.repair,source:'depth_plus',outcome:'ADDED',observed_at:'2026-10-23T00:00:00.000Z'};a=await adapters(float,'repair',seed,{[reference.id]:old});const again=await adapters(float,'repair',a.ledger,{[reference.id]:old});assert.equal(JSON.stringify(again.ledger.events),JSON.stringify(a.ledger.events));assert.equal(again.ledger.events[0].event_id,seed.events[0].event_id);pass('17 Legacy import idempotent; immutable evidence and legal identity retained');
// Nested target focus and repeated reparenting are part of the Repair regression.
const child=hedge.senses.flatMap(s=>s.usage||[]).find(x=>x.repair);
const parent=hedge.senses.find(s=>(s.usage||[]).some(x=>x.id===child.id));
a=await adapters(hedge,'repair',createLedger(hedge,[child.repair]));
assert.deepEqual(visible(a).map(b=>b.dataset.targetId),[child.id]);
assert.match(a.root.querySelector('.lexicalRepairTargetContext').textContent,new RegExp(parent.definition_cn.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
a.keypress('j');a.keypress('k');assert.equal(visible(a).length,1);
const other=a.root.querySelector('[data-vocab-repair-other]');a.toggle(other,true);
button(a,parent.id).click();assert.equal(a.root.querySelectorAll(`[data-target-id="${child.id}"]`).length,1);
assert.ok(button(a,child.id).closest(`[data-vocab-sense-id="${parent.id}"]`));
button(a,parent.id).click();a.toggle(other,false);
assert.deepEqual(visible(a).map(b=>b.dataset.targetId),[child.id]);
console.log('PASS nested child-only focus, necessary parent label, repeated parent/child transitions without duplicate targets');
const identityResults=[];const identityPass=name=>{identityResults.push({name,status:'PASS'});console.log('PASS identity '+name);};
const openReference=a=>{a.toggle(a.root.querySelector('[data-vocab-repair-other]'),true);a.toggle(a.root.querySelector('[data-vocab-attention-layer="reference"]'),true);};
const wrongKind=createLedger(float,[{...reference.repair,target_kind:'construction'}]);
a=await adapters(float,'repair',wrongKind);let targetButton=button(a,reference.id);
assert.equal(targetButton.getAttribute('aria-pressed'),'false');assert.ok(!attention.lexicalTargetIsVisible(targetButton));openReference(a);targetButton.click();
assert.equal(a.ledger.events.at(-1).outcome,'ADDED');assert.equal(a.ledger.events.at(-1).target_kind,'sense');assert.equal(JSON.stringify(a.ledger.events.slice(0,1)),JSON.stringify(wrongKind.events));assert.equal(evidence.compileRepairTargets(a.ledger).length,2);const wrongKindCache=JSON.parse(a.store.getItem('kianos-vocabulary-astro-v2:'+float.word_id)).repairTargets;assert.deepEqual(Object.keys(wrongKindCache),[reference.id]);assert.equal(wrongKindCache[reference.id].target_kind,'sense');identityPass('wrong kind never marks/clears another kind; explicit correct + is separate');
const wrongOrdinal=createLedger(float,[{...reference.repair,ordinal:2298}]);
a=await adapters(float,'repair',wrongOrdinal);targetButton=button(a,reference.id);assert.equal(targetButton.getAttribute('aria-pressed'),'false');assert.ok(targetButton.disabled);assert.ok(!attention.lexicalTargetIsVisible(targetButton));openReference(a);targetButton.click();assert.equal(JSON.stringify(a.ledger.events),JSON.stringify(wrongOrdinal.events));assert.match(a.root.querySelector('[data-vocab-repair-unresolved]').textContent,/1 个历史目标/);assert.deepEqual(JSON.parse(a.store.getItem('kianos-vocabulary-astro-v2:'+float.word_id)).repairTargets,{});identityPass('wrong ordinal remains unresolved and blocks ambiguous operation without repair');
const locator={...reference.repair,target_id:null,target_revision:float.source_fingerprint};let locatorSeed=createLedger(float,[locator]);
a=await adapters(float,'repair',locatorSeed);targetButton=button(a,reference.id);assert.equal(targetButton.getAttribute('aria-pressed'),'true');targetButton.click();assert.equal(a.ledger.events.at(-1).outcome,'CLEAR');assert.equal(a.ledger.events.at(-1).target_id,null);assert.equal(a.ledger.events.at(-1).target_revision,float.source_fingerprint);assert.equal(a.ledger.events.at(-1).target_locator,locator.target_locator);assert.equal(evidence.compileRepairTargets(a.ledger).length,0);assert.equal(JSON.stringify(a.ledger.events.slice(0,1)),JSON.stringify(locatorSeed.events));identityPass('valid historical locator clears exact locator+revision without creating stable-ID debt');
const both=createLedger(float,[reference.repair,locator]);a=await adapters(float,'repair',both);targetButton=button(a,reference.id);assert.equal(targetButton.textContent,'✓2');assert.match(targetButton.getAttribute('aria-label'),/2 个/);targetButton.click();assert.equal(a.ledger.events.at(-1).outcome,'CLEAR');assert.equal(evidence.compileRepairTargets(a.ledger).length,1);assert.equal(targetButton.getAttribute('aria-pressed'),'true');targetButton.click();assert.equal(evidence.compileRepairTargets(a.ledger).length,0);assert.equal(JSON.stringify(a.ledger.events.slice(0,2)),JSON.stringify(both.events));assert.deepEqual(new Set(a.ledger.events.slice(2).map(e=>evidence.lexicalTargetKey(e))),new Set(both.events.map(e=>evidence.lexicalTargetKey(e))));identityPass('stable-ID and locator debts remain distinct; each click clears one explicit identity');
const twoRevisions=createLedger(float,[locator,{...locator,target_revision:'older-validity-unknown'}]);a=await adapters(float,'repair',twoRevisions);targetButton=button(a,reference.id);assert.equal(targetButton.textContent,'✓');targetButton.click();const remaining=evidence.compileRepairTargets(a.ledger);assert.equal(remaining.length,1);assert.equal(remaining[0].target_revision,'older-validity-unknown');assert.match(a.root.querySelector('[data-vocab-repair-unresolved]').textContent,/1 个历史目标/);identityPass('current locator clear never clears or aliases another revision');
a=await adapters(float,'repair',evidence.emptyLexicalLedger(),{legacy:{...reference.repair,word_id:float.word_id,ordinal:2298,source:'depth_plus',outcome:'ADDED',observed_at:'2026-10-23T00:00:00.000Z'}});assert.equal(a.ledger.events[0].ordinal,2298);assert.equal(button(a,reference.id).getAttribute('aria-pressed'),'false');assert.ok(button(a,reference.id).disabled);identityPass('legacy cache import preserves explicit malformed ordinal rather than overwriting it');
const foreign=createLedger(float,[{...reference.repair,word_id:'word:heavy',ordinal:2298}]);a=await adapters(float,'repair',foreign);assert.equal(visible(a).length,0);assert.equal(JSON.stringify(a.ledger.events),JSON.stringify(foreign.events));identityPass('foreign-word debt is never remapped to the current word');
fs.mkdirSync('.qa',{recursive:true});fs.writeFileSync('.qa/lexical-attention-layers.json',JSON.stringify({status:'PASS',kind:'ASTRO_SSR_AND_SYNTHETIC_ADAPTER_NOT_BROWSER',results,identity_negative_regressions:identityResults},null,2)+'\n');

if(process.env.LEXICAL_ATTENTION_SNAPSHOT_DIR){
 const dir=process.env.LEXICAL_ATTENTION_SNAPSHOT_DIR;fs.mkdirSync(dir,{recursive:true});
 for(const ordinal of [1963,2214,2298,2299]){
  const word=loadLexicalWordByOrdinal(ordinal).record;const a=await adapters(word,'study');a.keypress(' ');
  const list=[...a.root.querySelectorAll('[data-vocab-learning-unit]')].filter(attention.lexicalTargetIsVisible).map(node=>({id:node.dataset.vocabSenseId||node.dataset.vocabConstructionId||node.querySelector('[data-target-id]')?.dataset.targetId,text:node.textContent.replace(/\s+/g,' ').trim()}));
  const out={ordinal,word:word.word,mode:'study-revealed',proof:'ACTUAL_ASTRO_SSR_AND_PRODUCTION_ADAPTER_SYNTHETIC_DOM_NOT_BROWSER',core:a.root.querySelector('.lexicalCoreHeadline')?.textContent.replace(/\s+/g,' ').trim()||null,default_objects:list,optional_count:[...a.root.querySelectorAll('[data-vocab-attention-layer="recognition"] [data-vocab-learning-unit]')].length,reference_count:[...a.root.querySelectorAll('[data-vocab-attention-layer="reference"] [data-vocab-learning-unit]')].length};
  fs.writeFileSync(dir+'/'+word.word+'-study.json',JSON.stringify(out,null,2)+'\n');fs.writeFileSync(dir+'/'+word.word+'-study.html',a.root.outerHTML);
 }
}
