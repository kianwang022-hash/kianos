import fs from 'node:fs';
import path from 'node:path';
import { listPoliticsChapterPathsCurrent, loadPoliticsChapterCurrent } from '../src/lib/politicsCurrent.mjs';
import { enrichPoliticsChapterCurrent } from '../src/lib/politicsRepairMemory.mjs';

const repoRoot = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(process.cwd(), '..');

const learningRoot = path.join(repoRoot, 'content/politics/learning');
const sourceRegistryPath = path.join(repoRoot, 'content/politics/source/source_node_registry.v2.jsonl');

function fail(message) {
  console.error(`POLITICS_REPAIR_MEMORY_QA_FAIL: ${message}`);
  process.exitCode = 1;
}

function jsonFiles(suffix) {
  const out = [];
  for (const entry of fs.readdirSync(learningRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const dir = path.join(learningRoot, entry.name);
    for (const name of fs.readdirSync(dir)) {
      if (name.endsWith(suffix)) out.push(path.join(dir, name));
    }
  }
  return out.sort();
}

function sourceNodeIds() {
  const ids = new Set();
  for (const line of fs.readFileSync(sourceRegistryPath, 'utf8').split(/\r?\n/)) {
    if (!line.trim()) continue;
    const row = JSON.parse(line);
    for (const key of ['stable_node_id', 'node_id', 'id', 'stable_id', 'source_node_id']) {
      if (typeof row?.[key] === 'string' && row[key]) ids.add(row[key]);
    }
  }
  return ids;
}

function deferredFirstReady(chapter, questionId) {
  for (const checkpoint of chapter?.firstReadyProjection?.embedded_checkpoints || []) {
    const row = (checkpoint?.deferred_questions || []).find((entry) => String(entry?.question_id || '') === String(questionId));
    if (!row) continue;
    return {
      ...row,
      embedded_natural_unit_id: String(checkpoint?.embedded_natural_unit_id || ''),
      runtime_natural_unit_id: String(checkpoint?.runtime_natural_unit_id || '')
    };
  }
  return null;
}

const sourceIds = sourceNodeIds();
const memoryFiles = jsonFiles('.memory.json');
const repairFiles = jsonFiles('.repair.json');

for (const file of memoryFiles) {
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  const rel = path.relative(repoRoot, file);
  if (data?.schema !== 'kianos.politics.memory_projection.v1') fail(`${rel} invalid schema`);
  if (data?.policy !== 'SOURCE_GROUNDED_SELECTIVE') fail(`${rel} must use SOURCE_GROUNDED_SELECTIVE`);
  if (data?.admission_gate?.requires_source_grounding !== true) fail(`${rel} must require source grounding`);

  for (const [unitId, unit] of Object.entries(data?.units || {})) {
    const candidates = Array.isArray(unit?.candidates) ? unit.candidates : [];
    if (!candidates.length) fail(`${rel}:${unitId} has no candidates`);
    for (const candidate of candidates) {
      const refs = Array.isArray(candidate?.source_refs) ? candidate.source_refs.filter(Boolean) : [];
      if (!refs.length) fail(`${rel}:${candidate?.id || unitId} has no source_refs`);
      for (const ref of refs) {
        if (!sourceIds.has(ref)) fail(`${rel}:${candidate?.id || unitId} unresolved source_ref ${ref}`);
      }
      if (candidate?.admission !== 'CANDIDATE_ONLY') {
        fail(`${rel}:${candidate?.id || unitId} shared Current may define a candidate, not private learner review debt`);
      }
      if (!candidate?.handbook_alignment) fail(`${rel}:${candidate?.id || unitId} missing handbook_alignment`);
    }
  }
}

const chapterIndex = new Map();
for (const row of listPoliticsChapterPathsCurrent()) {
  const chapter = enrichPoliticsChapterCurrent(loadPoliticsChapterCurrent(row.subject, row.chapter));
  chapterIndex.set(`${row.subject}/${row.chapter}`, chapter);
}

for (const file of repairFiles) {
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  const rel = path.relative(repoRoot, file);
  if (data?.schema !== 'kianos.politics.question_repair_projection.v1') fail(`${rel} invalid schema`);
  const priority = Array.isArray(data?.source_priority) ? data.source_priority : [];
  const legacyIndex = priority.findIndex((row) => String(row).includes('LEGACY_QUESTION_KNOWLEDGE_LINKS'));
  if (legacyIndex < 0 || legacyIndex !== priority.length - 1 || !String(priority[legacyIndex]).includes('PROVENANCE_ONLY')) {
    fail(`${rel} legacy question links must be final provenance-only source`);
  }
  if (!String(data?.semantic_authority_rule || '').includes('may not override Current Unit ownership')) {
    fail(`${rel} missing semantic authority guard`);
  }

  const base = path.basename(file, '.repair.json');
  const subject = path.basename(path.dirname(file));
  const chapter = chapterIndex.get(`${subject}/${base}`);
  if (!chapter) {
    fail(`${rel} cannot resolve owning chapter ${subject}/${base}`);
    continue;
  }
  const questions = new Map(chapter.units.flatMap((unit) => unit.questions.map((q) => [q.id, { q, unit }])));

  for (const [questionId, repair] of Object.entries(data?.repairs || {})) {
    if (!repair?.owner_natural_unit_id) fail(`${rel}:${questionId} missing owner_natural_unit_id`);
    if (!repair?.tested_node) fail(`${rel}:${questionId} missing tested_node`);
    if (!repair?.lecture_return) fail(`${rel}:${questionId} missing lecture_return`);
    if (!Object.prototype.hasOwnProperty.call(repair, 'precision_candidate')) {
      fail(`${rel}:${questionId} must make an explicit precision admission decision`);
    }

    const resolved = questions.get(questionId);
    if (!resolved) {
      const deferred = deferredFirstReady(chapter, questionId);
      if (!deferred) {
        fail(`${rel}:${questionId} is neither a rendered Current question nor an explicitly deferred first-ready question`);
        continue;
      }
      if (deferred.embedded_natural_unit_id !== repair.owner_natural_unit_id) {
        fail(`${rel}:${questionId} deferred owner ${deferred.embedded_natural_unit_id} disagrees with repair owner ${repair.owner_natural_unit_id}`);
      }
      if (!deferred.first_ready_natural_unit_id) {
        fail(`${rel}:${questionId} deferred repair is missing first_ready_natural_unit_id`);
      }
      continue;
    }

    if (!resolved.unit.representedNaturalUnitIds.includes(repair.owner_natural_unit_id)) {
      fail(`${rel}:${questionId} owner ${repair.owner_natural_unit_id} is outside rendered Current Unit ownership`);
    }
    if (!resolved.q.repair?.current_unit_hits?.length) fail(`${rel}:${questionId} has no current_unit_hits after enrichment`);
  }
}

if (!process.exitCode) {
  console.log('POLITICS_REPAIR_MEMORY_QA_PASS');
  console.log(JSON.stringify({ memorySidecars: memoryFiles.length, repairSidecars: repairFiles.length }));
}

// Only disposable producer content and in-memory learner state are used here.
const {default: assert}=await import('node:assert/strict');
const os=await import('node:os');
const {extractPoliticsMemoryCandidates:extract,politicsMemoryReviewedTargetRevision:revision,assertDistinctPoliticsMemoryPrompts:distinct,politicsMemoryCatalogRevision:catalogRevision}=await import('../src/lib/politicsMemoryCandidates.mjs');
const {applyPoliticsMemoryPlan:apply,recordPoliticsMemoryResponse:respond,resolvePoliticsMemoryResume:resume,buildPoliticsMemoryHistoryProfile:profile,stagePoliticsMemoryPlan:stage,politicsMemoryPlanEffectMatches:effect,validatePoliticsMemoryPlan:validatePlan,POLITICS_MEMORY_PLAN_KEY:planKey}=await import('../src/lib/politicsMemoryRuntime.mjs');
const fixtureRoot=fs.mkdtempSync(path.join(os.tmpdir(),'politics-memory-fixture-'));
try {
 const rel='content/politics/learning/marxism/teaching-candidate/preparation-review.md';
 fs.mkdirSync(path.dirname(path.join(fixtureRoot,rel)),{recursive:true});
 const group={name:'legacy identity',natural_unit_id:'fixture-nu',source_refs:['fixture-src'],items:['fixture exact answer'],prompt:'fixture retrieval question',checking_criteria:['complete answer'],memory_cue:'optional cue',inspected_refs:['fixture-page'],admission_basis:{route:'FIRST_ROUND_EXACT',review_status:'REVIEWED',source_edition:'POL27-CF',source_locator:'fixture page',review_ref:rel+'#a',prerequisite:'fixture model'}};
 const chapter={subject:'MARX',chapter_id:'fixture-chapter',content_support:{active_precision:[group]}},opts={repoRoot:fixtureRoot};
 const raw=extract(chapter,{...opts,selectableOnly:false})[0];assert.equal(extract(chapter,opts).length,0);
 group.admission_basis.reviewed_target_revision=revision(raw);
 fs.writeFileSync(path.join(fixtureRoot,rel),'<a id="a"></a>\n'+'|'+raw.id+'|fixture reviewed|'+group.admission_basis.reviewed_target_revision+'|\n');
 const reviewedFile=path.join(fixtureRoot,rel),digest=group.admission_basis.reviewed_target_revision;
 const auditRow=(id,hash,status='reviewed')=>'|'+id+'|'+status+'|'+hash+'|\n';
 for(const bad of [auditRow(raw.id,'sha256:'+'0'.repeat(64))+auditRow('other',digest),auditRow(raw.id,''),auditRow(raw.id,digest)+auditRow(raw.id,digest),auditRow(raw.id,digest,'PENDING_SOURCE_BINDING'),raw.id+'\n'+digest+'\n']){
  fs.writeFileSync(reviewedFile,'<a id="a"></a>\n'+bad);assert.equal(extract(chapter,opts).length,0,'crossed/incomplete/duplicate/pending/non-record review must fail closed');
 }
 fs.writeFileSync(reviewedFile,'<a id="a"></a>\n'+auditRow(raw.id,digest));
 const currentEdition=group.admission_basis.source_edition;
 group.admission_basis.source_edition='LEG26';group.admission_basis.reviewed_target_revision=revision(extract(chapter,{...opts,selectableOnly:false})[0]);
 fs.writeFileSync(reviewedFile,'<a id="a"></a>\n'+auditRow(raw.id,group.admission_basis.reviewed_target_revision));
 assert.equal(extract(chapter,opts).length,0,'historical-only review cannot authorize current fixed wording');
 group.admission_basis.source_edition=currentEdition;group.admission_basis.reviewed_target_revision=digest;
 fs.writeFileSync(reviewedFile,'<a id="a"></a>\n'+auditRow(raw.id,digest));
 const approved=extract(chapter,opts)[0];assert.ok(approved?.admission_verified);assert.equal(approved.prompt,group.prompt);assert.deepEqual(approved.checking_criteria,group.checking_criteria);
 const side={id:'fixture-sidecar',form:'boundary',statement:'fixture sidecar answer',prompt:'specific sidecar prompt',checking_criteria:['sidecar criterion'],source_refs:['fixture-src'],handbook_alignment:'PENDING_SOURCE_BINDING',admission:'CANDIDATE_ONLY',admission_basis:{...group.admission_basis,review_ref:rel+'#side'}};
 const sideChapter={subject:'MARX',chapter_id:'fixture-chapter',memoryProjection:{schema:'kianos.politics.memory_projection.v1',units:{'fixture-nu':{title:'generic unit',candidates:[side]}}}};
 side.admission_basis.reviewed_target_revision=revision(extract(sideChapter,{...opts,selectableOnly:false})[0]);
 fs.appendFileSync(path.join(fixtureRoot,rel),'\n<a id="side"></a>\n'+'|'+side.id+'|fixture reviewed|'+side.admission_basis.reviewed_target_revision+'|\n');
 const sideApproved=extract(sideChapter,opts)[0];assert.equal(sideApproved.prompt,side.prompt);assert.ok(sideApproved.admission_verified,'legacy source-reviewed availability remains compatible; not proof of current baseline necessity');
 group.prompt='clearer question';assert.equal(extract(chapter,{...opts,selectableOnly:false})[0].id,approved.id);assert.equal(extract(chapter,opts).length,0);group.prompt=approved.prompt;
 group.id=approved.id;group.natural_unit_id='fixed-nu';group.source_refs=['fixed-source'];
 assert.equal(extract(chapter,{...opts,selectableOnly:false})[0].id,approved.id);
 group.natural_unit_id=approved.natural_unit_id;group.source_refs=approved.source_refs;
 assert.throws(()=>extract({...chapter,content_support:{active_precision:[group,{...group}]}},{...opts,selectableOnly:false}),/DUPLICATE_ID/);
 assert.throws(()=>distinct([approved,{...approved,id:'other',answer_items:['different']}]),/AMBIGUOUS_PROMPT/);
 assert.throws(()=>distinct([approved,{...approved}]),/DUPLICATE_ID/);
 const map=new Map(),storage={getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)};
 const catalog={schema:'kianos.politics.memory-candidate-catalog.v1',revision:'fixture-rev',candidates:[approved]},day='2026-10-05',now=Date.parse(day+'T00:00:00Z');
 const plan={schema:'kianos.politics.memory-plan.v1',plan_id:'fixture-only',study_day:day,generated_at:new Date(now).toISOString(),catalog_revision:catalog.revision,items:[{candidate_id:approved.id}]};
 assert.equal(apply(storage,catalog,plan,{expectedDay:day,now}).status,'applied');assert.equal(apply(storage,catalog,plan,{expectedDay:day,now}).status,'idempotent');
 assert.equal(resume(storage,catalog,{expectedDay:day}).candidate.prompt,approved.prompt);
 const event=respond(storage,catalog,{plan_id:plan.plan_id,candidate_id:approved.id,response:'FUZZY',observed_at:new Date(now).toISOString()},{expectedDay:day});
 assert.deepEqual(event.candidate_snapshot.checking_criteria,group.checking_criteria);
 assert.equal(event.candidate_snapshot.admission_basis.reviewed_target_revision,group.admission_basis.reviewed_target_revision);
 assert.equal(profile([event],{...catalog,revision:'unrelated',candidates:[{...approved,memory_cue:'clearer cue'}]},{currentDay:day}).summary.current_compatible_events,1);
 assert.equal(profile([event],{...catalog,candidates:[{...approved,prompt:'broader retrieval scope'}]},{currentDay:day}).summary.stale_or_changed_events,1);
 assert.equal(profile([event],{...catalog,candidates:[{...approved,answer_items:['changed']} ]},{currentDay:day}).summary.stale_or_changed_events,1);
 assert.throws(()=>apply(storage,catalog,{...plan,items:[{candidate_id:'unknown'}]},{expectedDay:day,now}),/UNKNOWN_CANDIDATE/);
 assert.throws(()=>apply(storage,catalog,{...plan,items:[{candidate_id:approved.id,reason:'conflicting replay'}]},{expectedDay:day,now}),/REPLAY_CONFLICT/);
 assert.throws(()=>apply(storage,catalog,{...plan,plan_id:'next',generated_at:new Date(now+1).toISOString()},{expectedDay:day,now:now+1}),/SUPERSEDE_REQUIRED/);
 const replacement={...plan,plan_id:'next',supersedes_plan_id:plan.plan_id,generated_at:new Date(now+1).toISOString()};
 assert.equal(apply(storage,catalog,replacement,{expectedDay:day,now:now+1}).status,'superseded');
 assert.equal(resume(storage,catalog,{expectedDay:day}).status,'ACTIVE');
 assert.equal(profile([event],{...catalog,candidates:[{...approved,source_refs:['changed-source']}]},{currentDay:day}).summary.stale_or_changed_events,1);
 assert.equal(resume(storage,catalog,{expectedDay:'2026-10-06'}).status,'STALE');
 assert.throws(()=>apply(storage,{...catalog,candidates:[{...approved,admission_verified:false}]},plan,{expectedDay:day,now}),/NOT_REVIEWED/);
 // Prove the production stage→consumer path, including ID-only legacy commands.
 const makeStorage=()=>{const data=new Map();return {getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)}};
 const actualCatalog={...catalog,revision:catalogRevision([approved])},stagePlan={...plan,catalog_revision:actualCatalog.revision},staged=makeStorage();
 stage(staged,stagePlan,{expectedDay:day,now});assert.equal(resume(staged,actualCatalog,{expectedDay:day}).status,'ACTIVE');
 const frozen=validatePlan(stagePlan,actualCatalog,{expectedDay:day,now});
 const exact=makeStorage();stage(exact,frozen,{expectedDay:day,now});assert(effect(exact,frozen,day));const legacyCommand={...frozen,items:frozen.items.map(({candidate_snapshot,...item})=>item)};
 assert.equal(effect(exact,legacyCommand,day),false,'ID-only receipt cannot bless unchecked enrichment');
 const legacyExact=makeStorage();stage(legacyExact,legacyCommand,{expectedDay:day,now});assert(effect(legacyExact,legacyCommand,day),'unchanged native ID-only stage remains idempotent');
 const altered=JSON.parse(exact.getItem(planKey));altered.items[0].candidate_snapshot.prompt='tampered retrieval';exact.setItem(planKey,JSON.stringify(altered));
 assert.equal(effect(exact,frozen,day),false,'snapshot-bearing command cannot acknowledge a changed snapshot');
 assert.equal(effect(exact,legacyCommand,day),false,'ID-only command must not hide tampered stored snapshots');
 assert.equal(resume(exact,actualCatalog,{expectedDay:day}).status,'STALE');
 for(const field of ['subject','chapter_id','natural_unit_id','family']){
  const moved={...approved,[field]:'changed-ownership'};
  assert.notEqual(revision(moved),revision(approved),field+' must bind Content review');
  const movedCatalog={...actualCatalog,revision:catalogRevision([moved]),candidates:[moved]};
  assert.notEqual(movedCatalog.revision,actualCatalog.revision,field+' must bind catalog');
  assert.equal(resume(staged,movedCatalog,{expectedDay:day}).status,'STALE');
  assert.throws(()=>respond(staged,movedCatalog,{plan_id:plan.plan_id,candidate_id:approved.id,response:'STABLE',observed_at:new Date(now).toISOString()},{expectedDay:day}),/CATALOG_STALE/);
 }
 const legacy=structuredClone(event);delete legacy.candidate_snapshot.checking_criteria;delete legacy.candidate_snapshot.admission_basis;
 assert.equal(profile([legacy],actualCatalog,{currentDay:day}).summary.stale_or_changed_events,1,'legacy raw recall does not gain newly reviewed criteria');
 console.log('PASS reviewed producer→catalog→snapshot→Recall; pending excluded, stable ID, local semantic staleness');
} finally {fs.rmSync(fixtureRoot,{recursive:true,force:true});}

// Current teaching entry → same-model C01 reconstruction → existing Memory consumer.
// This is a bounded content/consumer regression test, not learner evidence or a
// proof that every chapter/source has passed semantic or real-user acceptance.
{
 const { buildPoliticsMemoryCandidateCatalogCurrent: buildCatalog } = await import('../src/lib/politicsMemoryCandidates.mjs');
 const read = relative => fs.readFileSync(path.join(repoRoot, relative), 'utf8');
 const manifest = JSON.parse(read('content/politics/learning/manifest.json'));
 let checks = 0;
 const verify = (condition, message) => { checks += 1; if (!condition) fail('prepared-handoff:' + message); };
 verify(manifest.source_roles.chengfeng.role === 'DETAILED_STUDY_AND_COMPRESSION_SOURCE', 'source-role-must-preserve-requested-Chengfeng-basis');
 // Route integrity is deliberately narrower than teaching or Source acceptance.
 // Resolve actual chapter/model owners and local links without prescribing one
 // teaching shape to every subject or treating the catalog as coverage proof.
 let routedChapters = 0, localPreparationLinks = 0;
 const learningRootPath = path.resolve(repoRoot, 'content/politics/learning');
 const inLearning = p => path.resolve(p).startsWith(learningRootPath + path.sep);
 const safeText = relative => {
  const p = path.resolve(repoRoot, relative);
  return inLearning(p) && fs.existsSync(p) && fs.statSync(p).isFile()
   ? fs.readFileSync(p, 'utf8') : null;
 };
 const checkPreparationLinks = (relative, text) => {
  for (const [, href] of text.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
   if (/^[a-z][a-z\d+.-]*:/i.test(href) || href.startsWith('#')) continue;
   const file = href.split('#')[0];
   if (!file) continue;
   const target = path.resolve(repoRoot, path.dirname(relative), file);
   localPreparationLinks += 1;
   verify(target.startsWith(path.resolve(repoRoot) + path.sep) && fs.existsSync(target), relative + ':broken-local-preparation-link:' + href);
  }
 };
 const maturity = read('content/politics/MATURITY_PACKAGE.md');
 verify(maturity.includes('ACCEPTANCE.md#reviewed-target-memory-delivery--bounded-acceptance'), 'maturity-must-reference-current-delivery-acceptance');
 verify(!/MODEL→MEMORY INTEGRATION REOPENED|Complete the already-open prepared-package|separate open delivery\/acceptance boundary/.test(maturity), 'maturity-still-reopens-delivered-memory');
 verify(/REAL-U GATED/.test(maturity) && /PARTIAL \/ SOURCE GATED/.test(maturity) && /authentic timed/i.test(maturity), 'maturity-must-preserve-learning-source-and-modality-gates');

 for (const [subject, entry] of Object.entries(manifest.subjects)) {
  const prepared = entry.teaching_preparation;
  verify(Boolean(prepared?.subject_model && prepared?.chapter_directory), subject + ':prepared-owner-entry-missing');
  if (!prepared) continue;
  for (const relative of [prepared.subject_model, prepared.chapter_directory]) {
   const resolved = path.resolve(repoRoot, relative);
   verify(resolved.startsWith(path.resolve(repoRoot, 'content/politics/learning') + path.sep) && fs.existsSync(resolved), subject + ':invalid-preparation-reference:' + relative);
  }
  verify(prepared.scope === 'PER_ASSET_REVIEW_AND_SOURCE_LIMITS', subject + ':entry-must-not-grant-whole-subject-admission');
  const modelText = safeText(prepared.subject_model);
  verify(Boolean(modelText?.trim()), subject + ':empty-subject-model');
  if (modelText) checkPreparationLinks(prepared.subject_model, modelText);
  for (const relative of entry.current_assets || []) {
   const chapterText = safeText(relative);
   verify(Boolean(chapterText), subject + ':missing-current-chapter:' + relative);
   if (!chapterText) continue;
   const ownedChapter = JSON.parse(chapterText);
   verify(Boolean(ownedChapter.chapter_id), subject + ':missing-chapter-identity:' + relative);
   const compression = ownedChapter.chapter_compression || {};
   verify(Object.entries(compression).some(([key, value]) => key !== 'review_prompt' && key !== 'stability_rule' && value && JSON.stringify(value).length > 2), subject + ':missing-owned-reconstruction:' + relative);
   const name = path.basename(relative, '.json');
   let briefPath = path.posix.join(prepared.chapter_directory, name + '.brief.md');
   let text = safeText(briefPath);
   // Existing Marxism C00 is prepared inside subject-model.md, not a missing
   // ch00 brief. Require its explicit owner link and section before using it.
   if (!text && name === 'ch00' && modelText?.includes('](../ch00.json)') && modelText.includes('c00-fixed-spine')) {
    briefPath = prepared.subject_model; text = modelText;
   }
   verify(Boolean(text?.trim()), subject + ':missing-chapter-preparation:' + relative);
   if (!text) continue;
   routedChapters += 1;
   checkPreparationLinks(briefPath, text);
  }

 }
 for (const relative of ['content/politics/ACCEPTANCE.md', ...['marxism', 'history', 'mao', 'xi', 'ethics-law'].map(subject => `content/politics/learning/${subject}/ACCEPTANCE.md`)]) {
  const text = read(relative);
  verify(text.includes('REVIEWED_TARGET_DELIVERY_ACCEPTED'), relative + ':landed-delivery-still-marked-pending');
  verify(!/\*\*bounded candidate evidence only\*\*|currently has bounded candidate evidence only/.test(text), relative + ':stale-candidate-only-claim');
  verify(/U\s+UNTESTED|real-learner-only/.test(text), relative + ':real-user-boundary-lost');
 }
 // These subject owners formerly kept the closed P5/P6 delivery gate live.
 // Check their current supplemental claim without upgrading the base PASS or
 // treating dated Source/surface receipts as current teaching instructions.
 for (const subject of ['history', 'mao', 'xi']) {
  const relative = `content/politics/learning/${subject}/ACCEPTANCE.md`;
  const text = read(relative);
  const supplemental = text.split('## Current supplemental scope — reviewed-target delivery')[1]?.split('\n## ')[0] || '';
  checkPreparationLinks(relative, supplemental);
  verify(supplemental.includes('../../ACCEPTANCE.md#reviewed-target-memory-delivery--bounded-acceptance'), relative + ':missing-bounded-lane-acceptance');
  verify(!/REOPENED\s*\/\s*NOT YET ACCEPTED|under the existing parent[^\n]*P5\/P6|Close this supplemental claim only/.test(text), relative + ':obsolete-supplemental-delivery-gate');
  verify(/Uninspected source text\/images\/tables/.test(supplemental) && /current-year-sensitive/.test(supplemental) && /whole-subject teaching completeness/.test(supplemental), relative + ':unreviewed-teaching-source-boundary-lost');
  verify(/U UNTESTED \/ learner-only/.test(supplemental), relative + ':supplemental-real-user-boundary-lost');
  verify(/Historical P5\/P6/.test(supplemental) && /not an active continuation queue/.test(supplemental), relative + ':historical-delivery-instructions-still-live');
 }
 const historyAcceptance = read('content/politics/learning/history/ACCEPTANCE.md');
 verify(historyAcceptance.includes('Historical surface binding tested on 2026-09-13') && !historyAcceptance.includes('Current shared surface binding relevant to History'), 'history:old-ipad-first-binding-still-current');
 verify(historyAcceptance.includes('LEARNING_CONTRACT.md#surface-roles') && /current source-study and Chat-compression roles follow Learning §2/.test(historyAcceptance), 'history:current-surface-owner-missing');
 const chapterPath = 'content/politics/learning/marxism/ch01.json';
 const chapter = JSON.parse(read(chapterPath));
 const briefPath = 'content/politics/learning/marxism/teaching-candidate/ch01.brief.md';
 const brief = read(briefPath);
 const spine = chapter.chapter_compression.reconstruction_chain;
 const section = brief.split('## 同一模型压缩与下一章桥接')[1]?.split('\n## ')[0] || '';
 const recovered = [...section.matchAll(/^- (\d{2} .+)$/gm)].map(m => m[1].trim());
 verify(JSON.stringify(recovered) === JSON.stringify(spine), 'brief-reconstruction-differs-from-canonical-model');
 const anchors = [...brief.matchAll(/<a id="([^"]+)"><\/a>/g)].map(m => m[1]);
 verify(new Set(anchors).size === anchors.length, 'duplicate-content-anchor');
 const mapText = brief.split('|固定节点|')[1]?.split('<a id="c01-prepared-stages">')[0] || '';
 const rows = mapText.split('\n').filter(line => /^\|\d{2} /.test(line));
 verify(rows.length === spine.length, 'model-node-routing-incomplete');
 const rawTargets = chapter.content_support.active_precision;
 const rawById = new Map(rawTargets.map(x => [x.id, x]));
 const attached = [];
 for (const row of rows) {
  const [label] = row.slice(1).split('|');
  verify(spine.some(node => node.startsWith(label.trim() + '｜')), 'renamed-model-node:' + label);
  for (const match of row.matchAll(/\]\(#([^)]+)\)/g)) verify(anchors.includes(match[1]), 'broken-explanation-link:' + match[1]);
  const ids = [...row.matchAll(/`(polmem-[a-z0-9]+)`/g)].map(m => m[1]);
  verify(ids.length > 0, 'node-has-no-owned-retrieval-reference:' + label);
  for (const id of ids) { verify(rawById.has(id), 'orphan-retrieval-reference:' + id); attached.push(id); }
 }
 verify(new Set(attached).size === attached.length && attached.length === rawTargets.length, 'exact-target-map-missing-or-duplicated');
 const firstRouteLabels = [
  '入章定位',
  '现实为什么不能由意识任意决定',
  '一个客观世界怎样变化却仍可被认识',
  '人为什么没有站到物质世界外面',
  '派生的意识为什么能改变现实却不能随心所欲',
  '用AI压力测试并收束世界统一性',
  '理解后补全',
  '易混与同模型恢复'
 ];
 for (const label of firstRouteLabels) verify(brief.includes('|' + label + '|'), 'stable-prepared-stage-missing:' + label);
 const stageText=brief.split('### 从下一段直接续讲')[1]?.split('### 原22组精记的交接')[0] || '';
 const stageRows=stageText.split('\n').filter(line=>firstRouteLabels.some(label=>line.startsWith('|' + label + '|'))).map(line=>line.slice(1,-1).split('|'));
 verify(JSON.stringify(stageRows.map(row=>row[0]))===JSON.stringify(firstRouteLabels),'prepared-stage-order-drift');
 verify(stageRows.every(row=>String(row[1]||'').trim().length>12 && String(row.at(-1)||'').trim().length>4),'problem-stage-missing-question-or-next');
 verify(stageText.includes('首轮主问题：如果现实世界不由人的意识任意决定，为什么人的意识又真的能够改变现实？'),'chapter-core-tension-missing');
 verify(brief.includes('后台定位/覆盖表，不是首课目录'),'spine-must-be-backstage-index');
 verify(!brief.includes('首课按上表01–04、05–07、08–10三段依次填入'),'node-batch-recital-still-present');
 verify(!brief.includes('|首次填充01–04|') && !brief.includes('|首次填充05–07|') && !brief.includes('|首次填充08–10|'),'node-number-stage-route-still-present');
 verify(brief.includes('## 易混与边界的独立回合') && anchors.includes('c01-boundary-pass'), 'prepared-confusable-pass-missing');
 const catalog = buildCatalog();
 const catalogById = new Map(catalog.candidates.map(x => [x.id, x]));
 for (const target of rawTargets) {
  const selected = catalogById.get(target.id);
  verify(Boolean(selected?.admission_verified), 'reviewed-C01-target-not-consumed:' + target.id);
  if (!selected) continue;
  verify(selected.prompt === target.prompt, 'authored-prompt-lost:' + target.id);
  verify(JSON.stringify(selected.answer_items) === JSON.stringify(target.items), 'exact-answer-lost:' + target.id);
  verify(JSON.stringify(selected.checking_criteria) === JSON.stringify(target.checking_criteria), 'checking-lost:' + target.id);
  verify(selected.memory_cue === target.memory_cue, 'encoding-cue-lost:' + target.id);
 }
 // An entrypoint is not admission. Pending source content stays unselectable.
 verify(catalog.candidates.every(x => x.admission_verified === true && x.admission_basis?.review_status === 'REVIEWED'), 'pending-target-promoted-by-entrypoint');
 const data = new Map();
 const storage = { getItem: k => data.get(k) ?? null, setItem: (k,v) => data.set(k,v), removeItem: k => data.delete(k) };
 const day = '2026-10-07', now = Date.parse(day + 'T08:00:00Z');
 const plan = { schema: 'kianos.politics.memory-plan.v1', plan_id: 'isolated-c01-prepared-handoff', study_day: day, generated_at: new Date(now).toISOString(), catalog_revision: catalog.revision, items: rawTargets.map(x => ({candidate_id:x.id, reason:'Synthetic reviewed-content handoff; not Kian evidence'})) };
 assert.equal(resume(storage,catalog,{expectedDay:day}), null);
 assert.equal(apply(storage,catalog,plan,{expectedDay:day,now}).status,'applied');
 const events=[];
 for (let i=0; i<rawTargets.length; i++) {
  const active=resume(storage,catalog,{expectedDay:day});
  assert.equal(active.status,'ACTIVE'); assert.equal(active.candidate.id,rawTargets[i].id);
  events.push(respond(storage,catalog,{plan_id:plan.plan_id,candidate_id:rawTargets[i].id,response:['FORGOT','FUZZY','STABLE'][i%3],observed_at:new Date(now+i*1000).toISOString()},{expectedDay:day}));
  // The next read is the same persisted-state resume after a fresh consumer.
 }
 assert.equal(resume(storage,catalog,{expectedDay:day}).status,'COMPLETE');
 assert.equal(profile(events,catalog,{currentDay:day}).summary.current_compatible_events,rawTargets.length);
 assert.equal(resume(storage,catalog,{expectedDay:'2026-10-08'}).status,'STALE');
 const { buildHomeDailyLearningPacket: makePacket } = await import('../src/lib/dailyLearningPacketRuntime.mjs');
 const { buildPoliticsPracticeCatalogCurrent: practiceCatalog } = await import('../src/lib/politicsPractice.mjs');
 const packetArgs={storage,day,now,politicsCatalog:practiceCatalog('/'),politicsMemoryCatalog:catalog};
 const result=makePacket(packetArgs),packet=result.packet,returned=packet.subjects.politics.evidence.memory;
 assert.equal(result.coverage.politics,'attached');assert.deepEqual(result.warnings,[]);
 assert.equal(packet.schema,'kianos.daily-learning-packet.v1');
 assert.equal(returned.summary.recall_count,rawTargets.length);
 assert.equal(returned.history_profile.summary.current_compatible_events,rawTargets.length);
 const nextDay=makePacket({...packetArgs,day:'2026-10-08',now:now+86400000}).packet.subjects.politics.evidence.memory;
 assert.equal(nextDay.summary.recall_count,0);assert.equal(nextDay.current_plan,null);
 assert.equal(nextDay.history_profile.summary.current_compatible_events,rawTargets.length);
 console.log('POLITICS_PREPARED_HANDOFF_' + (process.exitCode ? 'FAIL' : 'PASS'), JSON.stringify({checks, routedSubjects:Object.keys(manifest.subjects).length, routedChapters, localPreparationLinks, chapter:chapter.chapter_id, modelNodes:spine.length, exactTargets:rawTargets.length, catalogTargets:catalog.candidates.length, syntheticEvents:events.length, learnerWrites:0}));
}

// Bounded 2026-10-07 regression: source-first-and-selective-retention policy,
// plus voluntary practice through the existing evidence writer. No real state.
{
 const readRule = name => fs.readFileSync(path.join(repoRoot, name), 'utf8');
 const learning = readRule('content/politics/LEARNING_CONTRACT.md');
 const interaction = readRule('content/politics/INTERACTION_CONTRACT.md');
 const semantics = readRule('content/politics/CONTENT_SEMANTICS_CONTRACT.md');
 const system = readRule('SYSTEM_CONTRACT.md');
 const { politicsNavigation } = await import('../src/lib/sharedNavigation.mjs');
 assert.deepEqual(politicsNavigation().filter(row=>row.matchPath.test('politics/memory/')).map(row=>row.key),['review'],'Memory is a review route, not a lesson');
 assert.ok(learning.includes('Chengfeng detailed study') && learning.includes('not replacement mother text'));
 assert.ok(learning.includes('2027 腿姐《冲刺背诵手册》') && learning.includes('retention source'));
 assert.ok(learning.includes('Source correctness and memory necessity are different judgments'));
 assert.ok(learning.includes('A Chengfeng-only author choice is **not a substitute**'));
 assert.ok(learning.includes('recognition') && learning.includes('complete membership') && learning.includes('genuinely required fixed wording'));
 assert.ok(learning.includes('optional practice/reference') && learning.includes('No mass deletion'));
 assert.ok(learning.includes('Content is the finished learning product') && learning.includes('residual Precision / Memory'));
 for (const rule of [learning, interaction, system]) {
  assert.ok(!/Chat is the single continuous teaching mainline|Chat remains the single continuous teaching mainline|Politics continuous teaching is Chat-primary/.test(rule));
 }
 assert.ok(semantics.includes('not political truth or the Leg-informed recommended baseline'));
 const {buildPoliticsMemoryCandidateCatalogCurrent} = await import('../src/lib/politicsMemoryCandidates.mjs');
 const m = await import('../src/lib/politicsMemoryRuntime.mjs');
 const catalog=buildPoliticsMemoryCandidateCatalogCurrent(), candidate=catalog.candidates[0];
 const marxBaselineRoles=new Set(['LEG27_MAIN_PROMPT_ABSORBED','LEG27_MAIN_PROMPT_ABSORBED_WITH_CORE_EXTRA','LEG27_MAIN_PROMPT_WITH_RESIDUAL_COMPONENT','LEG27_RESIDUAL_RECOMMENDED']);
 const marxBaseline=catalog.candidates.filter(row=>row.subject==='marxism' && marxBaselineRoles.has(row.handbook_alignment));
 const marxCore=catalog.candidates.filter(row=>row.subject==='marxism' && row.handbook_alignment==='LEG27_CORE_REFERENCE_ONLY');
 assert.equal(marxBaseline.length,112,'Marxism default active-memory baseline must contain 112 reviewed old objects');
 assert.equal(marxCore.length,69,'Marxism Core/reference-only pool must contain 69 hidden-by-default old objects');
 const state=new Map(), storage={getItem:k=>state.get(k)??null,setItem:(k,v)=>state.set(k,v),removeItem:k=>state.delete(k)};
 const recommendedEmpty=m.politicsMemoryRecommendedCandidateIds(storage,catalog);
 assert.ok(marxBaseline.every(row=>recommendedEmpty.has(row.id)),'all 112 active-memory Marxism objects must be default-recommended');
 assert.ok(marxCore.every(row=>!recommendedEmpty.has(row.id)),'all 69 Core/reference-only Marxism objects must be hidden by default');
 const gapState=new Map(),gapStorage={getItem:k=>gapState.get(k)??null,setItem:(k,v)=>gapState.set(k,v),removeItem:k=>gapState.delete(k)};
 const gapCandidate=marxCore[0];
 m.recordPoliticsMemoryFreeResponse(gapStorage,catalog,{session_id:'gap-fuzzy',candidate_id:gapCandidate.id,response:'FUZZY',study_day:'2026-10-07',observed_at:'2026-10-07T09:00:00Z'});
 assert.ok(m.politicsMemoryRecommendedCandidateIds(gapStorage,catalog).has(gapCandidate.id),'latest FUZZY must temporarily elevate a hidden Core/reference card');
 m.recordPoliticsMemoryFreeResponse(gapStorage,catalog,{session_id:'gap-stable',candidate_id:gapCandidate.id,response:'STABLE',study_day:'2026-10-07',observed_at:'2026-10-07T09:30:00Z'});
 assert.ok(!m.politicsMemoryRecommendedCandidateIds(gapStorage,catalog).has(gapCandidate.id),'later STABLE must remove the non-baseline Core/reference card again');
 const baselineStable=marxBaseline[0];
 m.recordPoliticsMemoryFreeResponse(gapStorage,catalog,{session_id:'baseline-stable',candidate_id:baselineStable.id,response:'STABLE',study_day:'2026-10-07',observed_at:'2026-10-07T09:40:00Z'});
 assert.ok(m.politicsMemoryRecommendedCandidateIds(gapStorage,catalog).has(baselineStable.id),'STABLE must not remove an active-memory baseline object');
 const day='2026-10-07', time='2026-10-07T10:00:00Z';
 const input={session_id:'isolated-free-regression',candidate_id:candidate.id,response:'FUZZY',study_day:day,observed_at:time};
 const row=m.recordPoliticsMemoryFreeResponse(storage,catalog,input);
 assert.equal(storage.getItem(m.POLITICS_MEMORY_PLAN_KEY),null,'free practice must not create a day plan');
 assert.equal(row.plan_id,'manual:isolated-free-regression','legacy plan_id field is a manual practice-batch identity, not a fabricated schedule');
 assert.equal(row.candidate_snapshot.prompt,candidate.prompt);
 assert.deepEqual(row.candidate_snapshot.answer_items,candidate.answer_items);
 assert.throws(()=>m.recordPoliticsMemoryFreeResponse(storage,catalog,input),/ALREADY_RECORDED/);
 assert.throws(()=>m.recordPoliticsMemoryFreeResponse(storage,catalog,{...input,candidate_id:'missing'}),/CANDIDATE_STALE/);
 assert.throws(()=>m.recordPoliticsMemoryFreeResponse(storage,{...catalog,candidates:[{...candidate,admission_verified:false}]},{...input,session_id:'unreviewed'}),/NOT_REVIEWED/);
 const daily=m.politicsMemoryDailyEvidence(storage,{day,catalog,now:Date.parse(time)});
 assert.equal(daily.current_plan,null);assert.equal(daily.summary.recall_count,1);
 assert.equal(daily.history_profile.summary.current_compatible_events,1);
 const plan={schema:m.POLITICS_MEMORY_PLAN_SCHEMA,plan_id:'isolated-existing-plan',study_day:day,generated_at:time,catalog_revision:catalog.revision,items:[{candidate_id:candidate.id}]};
 m.applyPoliticsMemoryPlan(storage,catalog,plan,{expectedDay:day,now:Date.parse(time)});
 const before=storage.getItem(m.POLITICS_MEMORY_PLAN_KEY);
 m.recordPoliticsMemoryFreeResponse(storage,catalog,{...input,session_id:'another-free-round'});
 assert.equal(storage.getItem(m.POLITICS_MEMORY_PLAN_KEY),before,'manual practice must not overwrite an existing Chat plan');
 assert.equal(m.resolvePoliticsMemoryResume(storage,catalog,{expectedDay:day}).status,'ACTIVE','manual practice must not complete a planned attempt');
 console.log('POLITICS_SOURCE_FIRST_AND_FREE_PRACTICE_PASS',JSON.stringify({catalogTargets:catalog.candidates.length,marxDefaultBaseline:marxBaseline.length,marxCoreHidden:marxCore.length,learnerWrites:0,scope:'112 active-memory baseline + 69 hidden Core/reference, with gap re-elevation; not learner efficacy'}));
}
