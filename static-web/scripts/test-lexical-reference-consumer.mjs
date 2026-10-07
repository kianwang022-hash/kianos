import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import vm from 'node:vm';
import { transform } from '@astrojs/compiler';
import { experimental_AstroContainer } from 'astro/container';
import { appendEvidenceEvent, emptyLexicalLedger, compileRepairTargets, reconcileEvidenceIdentity, legacyEventId } from '../src/lib/lexicalEvidence.mjs';
import { listLexicalWordSummaries } from '../src/lib/lexical.mjs';
import { buildLexicalChatStatePacket } from '../src/lib/lexicalChatState.mjs';

// Compile only the three current owners; no catalog build/server/browser or private state.
const words = JSON.parse(execFileSync('python3', ['-c', `import sys,json;sys.path.insert(0,'../tools');import lexical_build_final_learner_objects as b;print(json.dumps([b.compile_word(b.load(b.WORDS/f'o{n:04}.json'),b.load(b.DECISIONS)) for n in [545,555,695,2]]))`], { encoding: 'utf8' }));
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
const trialWords = JSON.parse(execFileSync('python3', ['-c', `import sys,json;sys.path.insert(0,'../tools');import lexical_build_final_learner_objects as b;print(json.dumps([b.compile_word(b.load(b.WORDS/f'o{n:04}.json'),b.load(b.DECISIONS)) for n in [2405,2473,1367,1368,2976,2847,1500,1438,7826]]))`], { encoding: 'utf8' }));
for (const word of trialWords) {
  const html = await container.renderToString(component, {props:{answer:{objectId:word.word_id,ordinal:word.ordinal,record:word,sourceHash:word.source_fingerprint,senseLineage:word.sense_lineage}}});
  if ([2405,2473,7826].includes(word.ordinal)) {
    const form = html.match(/<section[^>]*lexicalFormSection[\s\S]*?<\/section>/)?.[0] || '';
    check(form.includes('data-vocab-lookup-only') && /<section[^>]*\bhidden\b/.test(form), word.word+'_background_form_uses_existing_lookup_mode');
    check(!form.includes('data-vocab-repair') && !form.includes('data-vocab-target-row'), word.word+'_background_form_has_no_default_repair');
    check(form.includes(word.ordinal === 2405 ? 'humour' : word.ordinal === 7826 ? 'internalise' : word.reference.form.boundaries[0].note), word.word+'_lookup_retains_spelling_or_full_stress_ipa');
  } else if ([1367,2976].includes(word.ordinal)) {
    const form = html.match(/<section[^>]*lexicalFormSection[\s\S]*?<\/section>/)?.[0] || '';
    check(form.includes('data-vocab-repair') && !form.includes('data-vocab-lookup-only'), word.word+'_useful_form_remains_default');
  } else if (word.ordinal === 1368) {
    check(html.includes('lowercase diet is food/eating plan') && html.includes('data-target-locator="record.senses[3].lexical_identity_overlay"'), 'Diet_capitalization_overlay_keeps_existing_repair');
  } else if (word.ordinal === 1438) {
    check(word.senses.length === 4 && word.senses.find(s => s.id === 'sense:dissipate:bdfc9c156d1a5e9e').governing_pattern === 'vi.', 'dissipate_keeps_all_senses_and_verified_intransitive_governance');
    check(!html.includes('dissipate into + sth') && !html.includes('dissipate in + sth'), 'dissipate_unproven_frameworks_are_not_published_in_depth_or_reference');
    check(!html.includes('data-target-id="collocation:7c6d5172eb944bf6525c"') && !html.includes('data-target-id="collocation:01ad80a6232bc19959c7"'), 'dissipate_withdrawn_children_have_no_plus_target');
  } else {
    const ref = html.match(/<section[^>]*aria-label="Reference-only senses"[\s\S]*?<\/section>/)?.[0] || '';
    check(ref.includes(word.reference.senses[0].sense_id) && !ref.includes('data-vocab-repair'), word.word+'_reference_truth_and_no_plus');
  }
}
const importOnly = structuredClone(trialWords.find(word => word.ordinal === 2473));
importOnly.reference.confusables = []; importOnly.reference.relations = []; importOnly.reference.family = [];
const onlyHtml = await container.renderToString(component, {props:{answer:{objectId:importOnly.word_id,ordinal:importOnly.ordinal,record:importOnly,sourceHash:importOnly.source_fingerprint,senseLineage:importOnly.sense_lineage}}});
check(/<aside[^>]*data-vocab-lookup-only[^>]*\bhidden\b/.test(onlyHtml), 'background_only_rail_is_hidden_in_default_and_retained_for_lookup');
check(onlyHtml.includes('data-has-reference="false"'), 'background_only_rail_leaves_no_default_empty_column');
for (const word of words) {
  const html = await container.renderToString(component, {props:{answer:{objectId:word.word_id,ordinal:word.ordinal,record:word,sourceHash:word.source_fingerprint,senseLineage:word.sense_lineage}}});
  if (word.reference.senses?.length) {
    const ref = word.reference.senses[0];
    const refId = ref.sense_id || ref.stable_sense_id || ref.id;
    check(html.includes(`data-vocab-reference-sense-id="${refId}"`), word.word+'_reference_preserves_existing_identity');
    const start = html.indexOf('data-vocab-lookup-only');
    check(start >= 0 && html.slice(start, html.indexOf('</main>', start)).includes(ref.definition_en), word.word+'_actual_markup_preserves_reference_truth');
    check(!html.slice(start, html.indexOf('</main>', start)).includes('data-vocab-repair'), word.word+'_reference_has_no_plus');
    check(html.slice(Math.max(0,start-50),start+100).includes('hidden'), word.word+'_reference_is_hidden_before_runtime_selects_lookup');
  } else {
    check(html.includes('data-vocab-construction-sense-id="sense:bound:7abc4665b1ff5027"'), 'bound_markup_keeps_explicit_construction_attachment');
  }
}

// Execute the actual adapters with synthetic DOM/storage, not mirrored mode logic.
async function runAdapters(mode, selectedWord = words[0], seedLedger = ledger, legacyTargets = null) {
  let currentLedger = seedLedger, writes = 0;
  const store = new Map([['kianos-vocabulary-last-ordinal','7000']]);
  class Element {
    constructor() {this.dataset={};this.hidden=false;}
    addEventListener() {}
    setAttribute() {}
  }
  const root = new Element(), lookup = new Element(), front = new Element(), details = new Element();
  const word = selectedWord;
  if (legacyTargets) store.set('kianos-vocabulary-astro-v2:'+word.word_id,JSON.stringify({revealed:true,repairTargets:legacyTargets}));
  root.getAttribute = key => ({'data-vocab-object':word.word_id,'data-vocab-word':word.word,'data-vocab-ordinal':word.ordinal,'data-vocab-source-hash':word.source_fingerprint}[key] || '');
  const rendered = await container.renderToString(component, {props:{answer:{objectId:word.word_id,ordinal:word.ordinal,record:word,sourceHash:word.source_fingerprint,senseLineage:word.sense_lineage}}});
  const formTransport = rendered.match(/<script[^>]*data-vocab-current-form[^>]*>([\s\S]*?)<\/script>/)?.[1];
  check(formTransport !== undefined, word.word+'_actual_markup_carries_current_form_qualification');
  root.querySelector = key => key === '[data-vocab-identity-lineage]' ? {textContent:JSON.stringify(word.sense_lineage)} : key === '[data-vocab-current-form]' ? {textContent:formTransport} : key === '[data-vocab-front]' ? front : key === '[data-vocab-details]' ? details : null;
  root.querySelectorAll = key => key === '[data-vocab-lookup-only]' ? [lookup] : [];
  const context = vm.createContext({HTMLElement:Element,HTMLTextAreaElement:Element,URLSearchParams,location:{search:'?mode='+mode},document:{querySelectorAll:()=>[root],addEventListener(){},removeEventListener(){}},window:{addEventListener(){},removeEventListener(){}},localStorage:{getItem:key=>store.get(key)||null,setItem:(key,value)=>store.set(key,value)},learnerWriterReady:Promise.resolve(),lexicalBrowserStateReadable:()=>true,readBrowserLexicalLedger:()=>currentLedger,writeBrowserLexicalLedger:value=>{currentLedger=value;writes++;},compileRepairTargets,appendEvidenceEvent,reconcileEvidenceIdentity,legacyEventId,DEFAULT_PRONUNCIATION:'en-US',LEXICAL_SETTINGS_STORAGE_KEY:'settings',normalizeLexicalSettings:value=>({default_pronunciation:'en-US',...value}),requestAnimationFrame:fn=>fn()});
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

const dissipate = trialWords.find(word => word.ordinal === 1438);
let withdrawnLedger = emptyLexicalLedger();
for (const [i,id] of ['collocation:7c6d5172eb944bf6525c','collocation:01ad80a6232bc19959c7'].entries()) withdrawnLedger = appendEvidenceEvent(withdrawnLedger,{event_id:'withdrawal-regression-'+i,word_id:dissipate.word_id,ordinal:1438,target_kind:'collocation',target_id:id,source:'depth_plus',outcome:'ADDED',observed_at:`2026-10-07T00:00:0${i}.000Z`}).ledger;
check(compileRepairTargets(withdrawnLedger).length === 2,'withdrawn_fixture_contains_existing_repair_debt');
const withdrawnEventBytes = JSON.stringify(withdrawnLedger.events);
const withdrawnStudy = await runAdapters('study',dissipate,withdrawnLedger);
check(compileRepairTargets(withdrawnStudy.currentLedger).length === 0,'dissipate_actual_study_bridge_freezes_both_withdrawn_child_targets');
check(JSON.stringify(withdrawnStudy.currentLedger.events) === withdrawnEventBytes,'dissipate_withdrawal_preserves_existing_learning_events');
const withdrawnLookup = await runAdapters('lookup',dissipate,withdrawnLedger);
check(withdrawnLookup.writes === 0 && JSON.stringify(withdrawnLookup.currentLedger) === JSON.stringify(withdrawnLedger),'withdrawn_lookup_keeps_existing_record_bytes_immutable');

// The current projection may withdraw a Form's learning eligibility without
// deleting its previous revision-bound evidence or guessing a new target.
const currentRows = listLexicalWordSummaries().filter(row => [2405,2473,7826,1367,2976,1368].includes(row.ordinal));
const priorByOrdinal = new Map();
for (const shard of ['o2369-2432','o2433-2496','o7809-7872','o1345-1408','o2945-3008']) {
  for (const word of JSON.parse(execFileSync('git',['show',`27bf2735bb7a26bbe4b3f889821096708f076778:content/lexical/learner/final/shards/${shard}.json`],{encoding:'utf8'}))) priorByOrdinal.set(word.ordinal,word);
}
let formLedger = emptyLexicalLedger();
for (const ordinal of [2405,2473,7826,1367,2976]) {
  const word = priorByOrdinal.get(ordinal);
  formLedger = appendEvidenceEvent(formLedger,{event_id:'form-eligibility-'+ordinal,word_id:word.word_id,ordinal,word:word.word,target_kind:'form_identity',target_id:null,target_locator:'record.form_identity',target_revision:word.source_fingerprint,source:'depth_plus',outcome:'ADDED',observed_at:'2026-10-07T00:00:00.000Z'}).ledger;
}
for (const [word_id,ordinal,target_kind,target_id,target_locator] of [
  ['word:internalize',7826,'sense','sense:internalize:2772118fc8fe5d6d',null],
  ['word:diet',1368,'form_identity',null,'record.senses[3].lexical_identity_overlay'],
  ['word:import',2473,'core',null,'record.core_concept']
]) formLedger = appendEvidenceEvent(formLedger,{event_id:'qualified-control-'+ordinal,word_id,ordinal,target_kind,target_id,target_locator,target_revision:target_id?null:priorByOrdinal.get(ordinal).source_fingerprint,source:'depth_plus',outcome:'ADDED',observed_at:'2026-10-07T00:01:00.000Z'}).ledger;
const formEventsBefore = JSON.stringify(formLedger.events);
const qualified = reconcileEvidenceIdentity(formLedger,[],currentRows).ledger;
const remaining = compileRepairTargets(qualified);
check(remaining.length === 5 && remaining.filter(t=>t.target_locator==='record.form_identity').every(t=>[1367,2976].includes(t.ordinal)), 'current_Form_qualification_stops_three_old_background_debts_and_keeps_valuable_Forms');
check(remaining.some(t=>t.word_id==='word:internalize'&&t.target_kind==='sense') && remaining.some(t=>t.word_id==='word:import'&&t.target_kind==='core') && remaining.some(t=>t.word_id==='word:diet'), 'Sense_Core_and_Diet_overlay_controls_stay_active');
check(JSON.stringify(qualified.events) === formEventsBefore && JSON.stringify(formLedger.events) === formEventsBefore, 'current_Form_qualification_never_changes_source_or_historical_events');
check(JSON.stringify(reconcileEvidenceIdentity(qualified,[],currentRows).ledger) === JSON.stringify(qualified), 'background_Form_freeze_is_idempotent');
check(compileRepairTargets(reconcileEvidenceIdentity(formLedger,[],[]).ledger).length===8, 'missing_current_Form_evidence_does_not_guess_retirement');
const packet = buildLexicalChatStatePacket({ledger:qualified,now:'2026-10-07T00:02:00.000Z'});
check(packet.repair.active_target_count===5 && packet.today_evidence.length===8, 'Chat_handoff_stops_actionable_background_Form_debt_but_retains_historical_evidence');
for (const ordinal of [2405,2473,7826]) {
  const word = trialWords.find(w=>w.ordinal===ordinal);
  const actualStudy = await runAdapters('study',word,formLedger);
  check(!compileRepairTargets(actualStudy.currentLedger).some(t=>t.ordinal===ordinal&&t.target_locator==='record.form_identity'), word.word+'_production_Study_bridge_stops_prior_Form_debt');
  check(JSON.stringify(actualStudy.currentLedger.events)===formEventsBefore,word.word+'_production_Study_preserves_all_event_bytes');
  const actualLookup = await runAdapters('lookup',word,formLedger);
  check(actualLookup.writes===0 && JSON.stringify(actualLookup.currentLedger)===JSON.stringify(formLedger),word.word+'_Lookup_does_not_persist_Form_reconciliation');
  const legacy = {'form_identity:record.form_identity':{target_kind:'form_identity',target_locator:'record.form_identity',target_revision:priorByOrdinal.get(ordinal).source_fingerprint,source:'depth_plus',observed_at:'2026-10-06T00:00:00.000Z'}};
  const imported = await runAdapters('study',word,emptyLexicalLedger(),legacy);
  check(imported.currentLedger.events.length===1 && compileRepairTargets(imported.currentLedger).length===0,word.word+'_legacy_cache_event_survives_without_recreating_executable_Form_debt');
}
const originalForm = formLedger.events.find(event=>event.ordinal===7826&&event.target_locator==='record.form_identity');
const withOlderRevision = appendEvidenceEvent(qualified,{...originalForm,event_id:'another-prior-form-revision',target_revision:'another-prior-revision',observed_at:'2026-10-06T00:00:00.000Z'}).ledger;
const olderQualified = reconcileEvidenceIdentity(withOlderRevision,[],currentRows).ledger;
check(compileRepairTargets(olderQualified).length===5 && JSON.stringify(olderQualified.events)===JSON.stringify(withOlderRevision.events),'every_prior_Form_revision_freezes_without_event_rewriting');
const attemptedReactivation = appendEvidenceEvent(olderQualified,{...originalForm,event_id:'old-form-reactivation',outcome:'REACTIVATED',observed_at:'2026-10-07T00:03:00.000Z'}).ledger;
check(compileRepairTargets(attemptedReactivation).length===5,'later_old_Form_event_cannot_recreate_an_executable_debt');
console.log('PASS current Form eligibility: prior debt frozen through production adapters; valuable targets and history preserved');
