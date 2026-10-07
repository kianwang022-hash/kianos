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
 const sideApproved=extract(sideChapter,opts)[0];assert.equal(sideApproved.prompt,side.prompt);assert.ok(sideApproved.admission_verified,'independent Current-source review does not require inspected handbook');
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
 verify(manifest.source_roles.chengfeng.role === 'FIRST_ROUND_SOURCE_BASIS_WITH_CALIBRATION', 'source-role-must-not-route-Chat-back-to-old-continuous-reader');
 for (const [subject, entry] of Object.entries(manifest.subjects)) {
  const prepared = entry.teaching_preparation;
  verify(Boolean(prepared?.subject_model && prepared?.chapter_directory), subject + ':prepared-owner-entry-missing');
  if (!prepared) continue;
  for (const relative of [prepared.subject_model, prepared.chapter_directory]) {
   const resolved = path.resolve(repoRoot, relative);
   verify(resolved.startsWith(path.resolve(repoRoot, 'content/politics/learning') + path.sep) && fs.existsSync(resolved), subject + ':invalid-preparation-reference:' + relative);
  }
  verify(prepared.scope === 'PER_ASSET_REVIEW_AND_SOURCE_LIMITS', subject + ':entry-must-not-grant-whole-subject-admission');
 }
 for (const relative of ['content/politics/ACCEPTANCE.md', 'content/politics/learning/marxism/ACCEPTANCE.md', 'content/politics/learning/ethics-law/ACCEPTANCE.md']) {
  const text = read(relative);
  verify(text.includes('REVIEWED_TARGET_DELIVERY_ACCEPTED'), relative + ':landed-delivery-still-marked-pending');
  verify(!/\*\*bounded candidate evidence only\*\*|currently has bounded candidate evidence only/.test(text), relative + ':stale-candidate-only-claim');
  verify(/U\s+UNTESTED|real-learner-only/.test(text), relative + ':real-user-boundary-lost');
 }
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
 for (const label of ['首次填充01–04', '首次填充05–07', '首次填充08–10', '理解后补全', '易混与同模型恢复']) {
  verify(brief.includes('|' + label + '|'), 'stable-prepared-stage-missing:' + label);
 }
 const stageText=brief.split('### 从下一段直接续讲')[1]?.split('### 原22组精记的交接')[0] || '';
 const stageRows=stageText.split('\n').filter(line=>/^\|(?:入章定位|首次填充|理解后补全|易混与同模型恢复)/.test(line)).map(line=>line.slice(1,-1).split('|'));
 verify(JSON.stringify(stageRows.map(row=>row[0]))===JSON.stringify(['入章定位','首次填充01–04','首次填充05–07','首次填充08–10','理解后补全','易混与同模型恢复']),'prepared-stage-order-drift');
 for (let i=0;i<3;i++) verify(stageRows[i]?.at(-1)===stageRows[i+1]?.[0],'fresh-reader-next-stage-drift:'+i);
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
 console.log('POLITICS_PREPARED_HANDOFF_' + (process.exitCode ? 'FAIL' : 'PASS'), JSON.stringify({checks, chapter:chapter.chapter_id, modelNodes:spine.length, exactTargets:rawTargets.length, catalogTargets:catalog.candidates.length, syntheticEvents:events.length, learnerWrites:0}));
}
