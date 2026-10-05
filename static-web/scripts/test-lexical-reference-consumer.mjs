import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import vm from 'node:vm';
import { transform } from '@astrojs/compiler';
import { experimental_AstroContainer } from 'astro/container';
import { appendEvidenceEvent, emptyLexicalLedger, compileRepairTargets, reconcileEvidenceIdentity } from '../src/lib/lexicalEvidence.mjs';

// Compile only the three current owners; no catalog build/server/browser or private state.
const words = JSON.parse(execFileSync('python3', ['-c', `import sys,json;sys.path.insert(0,'../tools');import lexical_build_final_learner_objects as b;print(json.dumps([b.compile_word(b.load(b.WORDS/f'o{n:04}.json'),b.load(b.DECISIONS)) for n in [545,555,695]]))`], { encoding: 'utf8' }));
const check = (ok, name) => { assert.ok(ok, name); console.log('PASS '+name); };
const lineage = words.flatMap(word => word.sense_lineage);
let ledger = emptyLexicalLedger();
const targets = [
  ['word:bore', 'sense', 'sense:bore:30b1817c4fac5d13'],
  ['word:bore', 'collocation', 'collocation:3cf52dfbaa3f68349a27'],
  ['word:carriage', 'sense', 'sense:carriage:7479005566ec5ecc'],
  ['word:carriage', 'collocation', 'collocation:5c3b7d1ebdbe39aae0e6'],
  ['word:bound', 'collocation', 'collocation:7fa2edc7720a9a3f51c1'],
  ['word:career', 'sense', 'sense:career:9254dc3737085252']
];
for (const [i, [word_id, target_kind, target_id]] of targets.entries()) ledger = appendEvidenceEvent(ledger, {event_id:'reference-fixture-'+i, word_id, target_kind, target_id, source:'depth_plus',outcome:'ADDED',observed_at:`2026-10-05T00:00:0${i}.000Z`}).ledger;
const rawEvents = JSON.stringify(ledger.events);
const reconciled = reconcileEvidenceIdentity(ledger, lineage).ledger;
check(compileRepairTargets(reconciled).length === 2 && compileRepairTargets(reconciled).every(t => ['word:bound', 'word:career'].includes(t.word_id)), 'only_explicit_reference_parent_and_child_targets_freeze');
check(JSON.stringify(reconciled.events) === rawEvents && reconciled.conflicts.length === 0, 'immutable_history_is_not_rewritten_or_migrated');
check(!Object.keys(reconciled.identity_lineage).some(key => key.includes('bound-up-with') || key.includes('7fa2edc7720a9a3f51c1')), 'old_jump_evidence_does_not_move_to_new_construction');
check(JSON.stringify(reconcileEvidenceIdentity(reconciled, lineage).ledger) === JSON.stringify(reconciled), 'reconciliation_is_idempotent');

// Use the installed Astro compiler and renderer on the actual two components.
// Data URL modules have explicit dependency URLs; nothing is built or installed.
// Installed compiler 2 emits legacy metadata unused by non-hydrated SSR; Astro 5 removed that helper.
const moduleUrl = code => 'data:text/javascript;base64,'+Buffer.from(code.replace(/,\n\s*createMetadata as \$\$createMetadata/, '').replace(/^export const \$\$metadata = .*;$/gm, '')).toString('base64');
const runtimeUrl = import.meta.resolve('astro/compiler-runtime');
const pronunciation = await transform(fs.readFileSync('src/components/LexicalPronunciation.astro','utf8'), {filename:'LexicalPronunciation.astro',internalURL:runtimeUrl,resultScopedSlot:true,renderScript:true});
let pronunciationCode = pronunciation.code.replaceAll('astro/runtime/server/index.js', runtimeUrl).replaceAll('../lib/lexicalPronunciation.mjs', pathToFileURL(process.cwd()+'/src/lib/lexicalPronunciation.mjs').href);
const markup = await transform(fs.readFileSync('src/components/VocabularyWordMarkup.astro','utf8'), {filename:'VocabularyWordMarkup.astro',internalURL:runtimeUrl,resultScopedSlot:true,renderScript:true});
let markupCode = markup.code.replaceAll('astro/runtime/server/index.js', runtimeUrl).replaceAll('./LexicalPronunciation.astro', moduleUrl(pronunciationCode));
const component = (await import(moduleUrl(markupCode))).default;
const container = await experimental_AstroContainer.create();
for (const word of words) {
  const html = await container.renderToString(component, {props:{answer:{objectId:word.word_id,ordinal:word.ordinal,record:word,sourceHash:word.source_fingerprint,senseLineage:word.sense_lineage}}});
  if (word.reference.senses?.length) {
    const ref = word.reference.senses[0];
    const start = html.indexOf('data-vocab-lookup-only');
    check(start >= 0 && html.slice(start, html.indexOf('</main>', start)).includes(ref.definition_en), word.word+'_actual_markup_preserves_reference_truth');
    check(!html.slice(start, html.indexOf('</main>', start)).includes('data-vocab-repair'), word.word+'_reference_has_no_plus');
    check(html.slice(Math.max(0,start-50),start+100).includes('hidden'), word.word+'_reference_is_hidden_before_runtime_selects_lookup');
  } else {
    check(html.includes('data-vocab-construction-sense-id="sense:bound:7abc4665b1ff5027"'), 'bound_markup_keeps_explicit_construction_attachment');
  }
}

// Execute the actual adapters with synthetic DOM/storage, not mirrored mode logic.
async function runAdapters(mode) {
  let currentLedger = ledger, writes = 0;
  const store = new Map([['kianos-vocabulary-last-ordinal','7000']]);
  class Element {
    constructor() {this.dataset={};this.hidden=false;}
    addEventListener() {}
    setAttribute() {}
  }
  const root = new Element(), lookup = new Element(), front = new Element(), details = new Element();
  const word = words[0];
  root.getAttribute = key => ({'data-vocab-object':word.word_id,'data-vocab-word':word.word,'data-vocab-ordinal':word.ordinal,'data-vocab-source-hash':word.source_fingerprint}[key] || '');
  root.querySelector = key => key === '[data-vocab-identity-lineage]' ? {textContent:JSON.stringify(word.sense_lineage)} : key === '[data-vocab-front]' ? front : key === '[data-vocab-details]' ? details : null;
  root.querySelectorAll = key => key === '[data-vocab-lookup-only]' ? [lookup] : [];
  const context = vm.createContext({HTMLElement:Element,HTMLTextAreaElement:Element,URLSearchParams,location:{search:'?mode='+mode},document:{querySelectorAll:()=>[root],addEventListener(){},removeEventListener(){}},window:{addEventListener(){},removeEventListener(){}},localStorage:{getItem:key=>store.get(key)||null,setItem:(key,value)=>store.set(key,value)},learnerWriterReady:Promise.resolve(),lexicalBrowserStateReadable:()=>true,readBrowserLexicalLedger:()=>currentLedger,writeBrowserLexicalLedger:value=>{currentLedger=value;writes++;},compileRepairTargets,appendEvidenceEvent,reconcileEvidenceIdentity,DEFAULT_PRONUNCIATION:'en-US',LEXICAL_SETTINGS_STORAGE_KEY:'settings',normalizeLexicalSettings:value=>({default_pronunciation:'en-US',...value}),requestAnimationFrame:fn=>fn()});
  for (const file of ['VocabularyIdentityLineageBridge.astro','VocabularyWordRuntime.astro']) {
    const source = fs.readFileSync('src/components/'+file,'utf8').match(/<script>([\s\S]*?)<\/script>/)[1].replace(/^\s*import[\s\S]*?;/gm,'');
    vm.runInContext(source,context);await new Promise(resolve=>setImmediate(resolve));
  }
  return {writes,hidden:lookup.hidden,currentLedger,store};
}
const lookup = await runAdapters('lookup');
check(lookup.writes === 0 && JSON.stringify(lookup.currentLedger) === JSON.stringify(ledger), 'lookup_adapters_do_not_persist_reconciliation');
check(!lookup.hidden && lookup.store.get('kianos-vocabulary-last-ordinal') === '7000', 'lookup_runtime_shows_reference_without_moving_cursor');
const study = await runAdapters('study');
check(study.hidden && study.writes === 1 && compileRepairTargets(study.currentLedger).length === 4, 'study_hides_reference_and_freezes_only_this_words_explicit_targets');
check(JSON.stringify(study.currentLedger.events) === rawEvents, 'study_reconciliation_preserves_all_events');
console.log('PASS focused Reference consumer: installed Astro SSR and synthetic production adapters');
