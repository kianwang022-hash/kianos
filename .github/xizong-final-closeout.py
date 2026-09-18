from pathlib import Path
root=Path('.')
def replace(path, old, new):
 p=root/path;s=p.read_text();assert old in s,(path,old[:120]);p.write_text(s.replace(old,new))
def append(path, value):
 p=root/path;p.write_text(p.read_text()+value)
append('static-web/src/lib/xizong.mjs', '''
// Identity-only read model for downstream completion gates. No medical payload.
export function loadXizongSystemCompletionRequirements(system) {
  return (system?.blocks || []).map((ref) => {
    const block = loadXizongBlock(system.systemId, ref.slug);
    return {
      schema: 'kianos.xizong.learner_object.v1', objectType: 'BLOCK',
      identity: { blockId: block.blockId },
      kps: block.kpRecords.map((kp) => ({ identity: { kpId: kp.kpId } })),
      evidenceVersion: [block.sourceHash, block.systemSourceHash, block.learningSupportSourceHash].join(':')
    };
  });
}
''')
replace('static-web/src/lib/xizongMemoryAutoRelease.mjs', "  if (study.completed !== true)", "  if (study.schema && study.schema !== 'kianos.xizong.block-state.v2') return { complete: false, reason: 'UNSUPPORTED_STUDY_SCHEMA', blockId, kpIds: ids };\n  if (study.completed !== true)")
append('static-web/src/lib/xizongMemoryAutoRelease.mjs', '''
// Reuse the exact Block-completion predicate at System entry and Resume.
// Missing legacy version metadata does not manufacture contact: exact owned KP
// evidence is still required. A known stale/invalid version never unlocks work.
export function inspectXizongSystemCompletion(requirements, storage) {
  const rows = Array.isArray(requirements) ? requirements : [];
  if (!rows.length) return { complete: false, completed: 0, total: 0 };
  const seen = new Set();
  const checks = rows.map((row) => {
    const id = row?.identity?.blockId;
    if (!id || seen.has(id)) return false;
    seen.add(id);
    try {
      const study = JSON.parse(storage.getItem(`kianos-xizong-astro-v2:xizong:${id}`) || 'null');
      const rawMeta = storage.getItem(`kianos-xizong-evidence-meta-v1:xizong:${id}`);
      if (rawMeta !== null) {
        const meta = JSON.parse(rawMeta);
        if (!meta || typeof meta.version !== 'string' || meta.version !== row.evidenceVersion) return false;
      }
      return inspectXizongBlockCompletion(row, study).complete;
    } catch { return false; }
  });
  return { complete: checks.every(Boolean), completed: checks.filter(Boolean).length, total: rows.length };
}

export function hasXizongSystemRecall(storage, systemId) {
  try {
    const row = JSON.parse(storage.getItem(`kianos:xizong:system-recall:${systemId}:v1`) || 'null');
    return typeof row?.completedAt === 'string' && Number.isFinite(Date.parse(row.completedAt));
  } catch { return false; }
}
''')
replace('static-web/src/components/XizongRuntimeStageGuard.astro', '---\nconst { system, block = null }', "---\nimport { loadXizongSystemCompletionRequirements } from '../lib/xizong.mjs';\nconst { system, block = null }")
replace('static-web/src/components/XizongRuntimeStageGuard.astro', "const blockIds = (system?.blocks || []).map((row) => row.blockId).filter(Boolean);", "const blockIds = (system?.blocks || []).map((row) => row.blockId).filter(Boolean);\nconst requirements = block ? [] : loadXizongSystemCompletionRequirements(system);")
replace('static-web/src/components/XizongRuntimeStageGuard.astro', '<script define:vars={{ blockId, blockIds }}>', '''<script type="application/json" data-xizong-completion-input set:html={JSON.stringify({ blockId, blockIds, requirements }).replace(/</g, String.fromCharCode(92) + 'u003c')}></script>
<script>
  import { inspectXizongSystemCompletion } from '../lib/xizongMemoryAutoRelease.mjs';
  const { blockId, blockIds, requirements } = JSON.parse(document.querySelector('[data-xizong-completion-input]')?.textContent || '{}');''')
replace('static-web/src/components/XizongRuntimeStageGuard.astro', 'Boolean(state?.blockRecallDone)', '(state?.blockRecallDone === true)')
replace('static-web/src/components/XizongRuntimeStageGuard.astro', "    const completedBlocks = () => blockIds.filter((id) => Boolean(readBlockState(id)?.completed));", "    const completedBlocks = () => inspectXizongSystemCompletion(requirements, localStorage);")
replace('static-web/src/components/XizongRuntimeStageGuard.astro', '      const completed = completedBlocks();\n      const ready = completed.length >= blockIds.length;', '      const check = completedBlocks();\n      const completed = { length: check.completed };\n      const ready = check.complete;')
replace('static-web/src/components/XizongLastLocation.astro', '---\nconst {', "---\nimport { loadXizongSystemCompletionRequirements } from '../lib/xizong.mjs';\nconst {")
replace('static-web/src/components/XizongLastLocation.astro', 'const requiredBlocks = Array.isArray(requiredBlockIds) ? requiredBlockIds.filter(Boolean) : [];', 'const requiredBlocks = (requiredBlockIds?.length || requiredSystemRecall) ? loadXizongSystemCompletionRequirements(system) : [];')
replace('static-web/src/components/XizongLastLocation.astro', '<script>\n', "<script>\n  import { inspectXizongSystemCompletion, hasXizongSystemRecall } from '../lib/xizongMemoryAutoRelease.mjs';\n")
replace('static-web/src/components/XizongLastLocation.astro', "const blocksReady = !requiredBlocks.length || requiredBlocks.every((blockId) =>\n      Boolean(readJson(`kianos-xizong-astro-v2:xizong:${blockId}`, {})?.completed)\n    );\n    const recallReady = !requiredSystemRecall || Boolean(\n      readJson(`kianos:xizong:system-recall:${requiredSystemRecall}:v1`, {})?.completedAt\n    );", "const blocksReady = !requiredBlocks.length || inspectXizongSystemCompletion(requiredBlocks, localStorage).complete;\n    const recallReady = !requiredSystemRecall || hasXizongSystemRecall(localStorage, requiredSystemRecall);")
replace('static-web/src/components/XizongPracticeWorkbench.astro', '---\nimport {', "---\nimport { loadXizongSystemCompletionRequirements } from '../lib/xizong.mjs';\nimport {")
replace('static-web/src/components/XizongPracticeWorkbench.astro', '  scopeKind,\n  base', "  scopeKind,\n  completionRequirements: scopeKind === 'SYSTEM' ? loadXizongSystemCompletionRequirements(system) : [],\n  base")
replace('static-web/src/components/XizongPracticeWorkbench.astro', '<script>\n', "<script>\n  import { inspectXizongSystemCompletion, hasXizongSystemRecall } from '../lib/xizongMemoryAutoRelease.mjs';\n")
replace('static-web/src/components/XizongPracticeWorkbench.astro', '      if (!recallState?.completedAt) {', '      if (!inspectXizongSystemCompletion(data.completionRequirements, localStorage).complete || !hasXizongSystemRecall(localStorage, initialSystemId)) {')
replace('static-web/src/components/XizongBlockV6.astro', "        state = { ...state, ...saved };", "        if (['completed', 'blockRecallDone', 'sourceContactDone'].some((key) => saved[key] != null && typeof saved[key] !== 'boolean')) throw new Error('Invalid completion evidence');\n        state = { ...state, ...saved };")
path='static-web/scripts/test-xizong-final-independent.mjs'
replace(path, "async function state(page,key){return page.evaluate(k=>JSON.parse(localStorage.getItem(k)||'null'),key);}", """async function state(page,key){return page.evaluate(k=>JSON.parse(localStorage.getItem(k)||'null'),key);}
async function seedCompletedSystem(page, systemId='circulation') {
 const sys=loadXizongSystem(systemId);
 const rows=Object.fromEntries(sys.blocks.map(ref=>{const b=loadXizongBlock(systemId,ref.slug);return [`kianos-xizong-astro-v2:xizong:${b.blockId}`,JSON.stringify({completed:true,blockRecallDone:true,learned:Object.fromEntries(b.kpRecords.map(k=>[k.kpId,true])),ratings:Object.fromEntries(b.kpRecords.map(k=>[k.kpId,'known']))})];}));
 await page.evaluate(rows=>{for(const[k,v]of Object.entries(rows))localStorage.setItem(k,v);},rows);
}
""")
replace(path, "await visit(page,'/xizong/');await page.evaluate(()=>{localStorage.setItem('kianos:xizong:system-recall:circulation:v1'", "await visit(page,'/xizong/');await seedCompletedSystem(page);await page.evaluate(()=>{localStorage.setItem('kianos:xizong:system-recall:circulation:v1'")
newtest="""
 await test('Incomplete flags, stale contact versions and invalid completion types never unlock System or Resume',async()=>{const {c,page}=await context();try{
 await visit(page,'/xizong/');const sys=loadXizongSystem('circulation');
 await page.evaluate(ids=>{for(const id of ids)localStorage.setItem(`kianos-xizong-astro-v2:xizong:${id}`,JSON.stringify({completed:true}));},sys.blocks.map(b=>b.blockId));
 await visit(page,'/xizong/circulation/recall/');assert.equal(await page.locator('[data-xizong-system-exit]').isVisible(),false);
 const loc=await state(page,'kianos-xizong-last-location-v1');assert.notEqual(loc?.resumeKind,'SYSTEM_RECALL');
 await page.evaluate(()=>localStorage.setItem('kianos:xizong:system-recall:circulation:v1',JSON.stringify({completedAt:'2026-09-19T01:00:00Z'})));
 await visit(page,'/xizong/practice/circulation/');assert.equal(await page.locator('[data-question-card]').isVisible(),false);
 await seedCompletedSystem(page);await page.evaluate(()=>localStorage.setItem('kianos-xizong-evidence-meta-v1:xizong:circulation-b01',JSON.stringify({version:'stale'})));
 await visit(page,'/xizong/circulation/recall/');assert.equal(await page.locator('[data-xizong-system-exit]').isVisible(),false);
 assert.equal((await state(page,'kianos-xizong-evidence-meta-v1:xizong:circulation-b01')).version,'stale');
 await page.evaluate(()=>{localStorage.removeItem('kianos-xizong-evidence-meta-v1:xizong:circulation-b01');localStorage.setItem('kianos:xizong:system-recall:circulation:v1',JSON.stringify({completedAt:'not-a-date'}));});
 await visit(page,'/xizong/practice/circulation/');assert.equal(await page.locator('[data-question-card]').isVisible(),false);
 await page.evaluate(k=>localStorage.setItem(k,JSON.stringify({completed:'false',blockRecallDone:'false'})),studyKey);
 await visit(page,'/xizong/circulation/b01/');assert.equal(await page.locator('[data-xizong-v6-block]').evaluate(n=>n.inert),true);assert.equal((await state(page,studyKey)).completed,'false');
 return {originalProductionCounterexample:'completed:true alone unlocked all System work',repair:'same exact owned-KP completion predicate; no deletion',synthetic:true};
 }finally{await c.close();}});
 await test('A2 and A3 real first-pass contact, Recall and refresh preserve their own Core',async()=>{
 const rows=[];for(const[s,b]of [['respiratory','r01'],['urinary','b01']]){const {c,page}=await context();try{await beginRecall(page,s,b);const block=loadXizongBlock(s,b),k=`kianos-xizong-astro-v2:${block.objectId}`;
 assert.equal(Object.keys((await state(page,k)).learned).length,block.kpRecords.length);await page.keyboard.press('Space');await page.keyboard.press('2');await page.waitForTimeout(180);assert.equal(Object.keys((await state(page,k)).ratings).length,1);await page.reload({waitUntil:'networkidle'});assert.equal(Object.keys((await state(page,k)).ratings).length,1);rows.push({system:s,contact:block.kpRecords.length,attempts:1});}finally{await c.close();}}return rows;
 });
"""
replace(path, " await test('Current Mac-wide heterogeneous visible geometry", newtest+" await test('Current Mac-wide heterogeneous visible geometry")
