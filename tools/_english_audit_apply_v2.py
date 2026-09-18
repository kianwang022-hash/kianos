from pathlib import Path
R=Path.cwd()
def edit(f,a,b,n=1):
 p=R/f;s=p.read_text();assert s.count(a)>=n,(f,a[:90]);p.write_text(s.replace(a,b,n))
def add(f,s):
 p=R/f;p.parent.mkdir(parents=True,exist_ok=True);assert not p.exists();p.write_text(s)
p=R/'static-web/src/lib/englishTaskEvidence.mjs'
p.write_text(p.read_text()+'''
export function englishReturnBinding(record, repair = false) {
  const attempt = String(record?.firstSubmittedAt || record?.submittedAt || '');
  if (!attempt) throw new Error('ENGLISH_RETURN_FIRST_ATTEMPT_REQUIRED');
  return {
    attemptSubmittedAt: attempt,
    contentRevision: record?.evidence_binding?.content_revision || null,
    ...(repair ? { regenerationSubmittedAt: record?.regenerationSubmittedAt || '' } : {})
  };
}
export function assertEnglishReturnBinding(payload, record, repair = false) {
  const expected=englishReturnBinding(record,repair);
  for (const [key,value] of Object.entries(expected)) {
    if (payload?.[key] !== value || (key==='regenerationSubmittedAt' && !value)) {
      throw new Error('ENGLISH_RETURN_STALE_EVIDENCE:'+key);
    }
  }
}
export function sameEnglishReturn(a,b) {
  const stable=v=>Array.isArray(v)?v.map(stable):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])])):v;
  return !!a && !!b && JSON.stringify(stable(a))===JSON.stringify(stable(b));
}
''')
edit('static-web/src/lib/translationRuntimeModel.mjs','export const ',"import { assertEnglishReturnBinding, sameEnglishReturn } from './englishTaskEvidence.mjs';\n\nexport const ")
edit('static-web/src/lib/translationRuntimeModel.mjs','export function applyTranslationReturn(state, payload, prompts = [], ledger = null, context = {}) {', "export function applyTranslationReturn(state, payload, prompts = [], ledger = null, context = {}) {\n  assertEnglishReturnBinding(payload,state);\n  payload=parseTranslationReturn(JSON.stringify(payload),context.task);\n  if(sameEnglishReturn(state.chatReturn,payload)) return {state:structuredClone(state),ledger:normalizeTransferLedger(ledger)};")
edit('static-web/src/components/TranslationWorkspace.astro','<script>\n', "<script>\n  import { englishReturnBinding } from '../lib/englishTaskEvidence.mjs';\n")
edit('static-web/src/components/TranslationWorkspace.astro',"      'SOURCE SEGMENTS',", "      'WHOLE SOURCE CONTEXT',\n      root.querySelector('[data-exam-task-context]')?.textContent || document.querySelector('[data-exam-task-context]')?.textContent || 'Context unavailable; do not infer missing passage.',\n      'SOURCE SEGMENTS',")
edit('static-web/src/components/TranslationWorkspace.astro','        schema: TRANSLATION_RETURN_SCHEMA,\n        task: objectId,', '        schema: TRANSLATION_RETURN_SCHEMA,\n        task: objectId,\n        ...englishReturnBinding(state),')
edit('static-web/src/lib/writingRuntimeModel.mjs','export const WRITING_RUNTIME_VERSION', "import { englishReturnBinding, assertEnglishReturnBinding, sameEnglishReturn } from './englishTaskEvidence.mjs';\n\nexport const WRITING_RUNTIME_VERSION")
edit('static-web/src/lib/writingRuntimeModel.mjs','        schema: WRITING_REVIEW_RETURN_SCHEMA,\n        taskId: task.id,','        schema: WRITING_REVIEW_RETURN_SCHEMA,\n        ...englishReturnBinding(record),\n        taskId: task.id,')
edit('static-web/src/lib/writingRuntimeModel.mjs','      schema: WRITING_REVIEW_RETURN_SCHEMA,\n      taskId: clean(taskId),','      schema: WRITING_REVIEW_RETURN_SCHEMA,\n      attemptSubmittedAt:value.attemptSubmittedAt,contentRevision:value.contentRevision,\n      taskId: clean(taskId),')
edit('static-web/src/lib/writingRuntimeModel.mjs','    schema: WRITING_REVIEW_RETURN_SCHEMA,\n    taskId: clean(taskId),','    schema: WRITING_REVIEW_RETURN_SCHEMA,\n    attemptSubmittedAt:value.attemptSubmittedAt,contentRevision:value.contentRevision,\n    taskId: clean(taskId),')
edit('static-web/src/lib/writingRuntimeModel.mjs','export function applyWritingReviewReturn(record, reviewReturn, now) {', 'export function applyWritingReviewReturn(record, reviewReturn, now) {\n  reviewReturn=validateWritingReviewReturn(reviewReturn,record?.taskId);\n  assertEnglishReturnBinding(reviewReturn,record);\n  if(sameEnglishReturn(record.reviewReturn,reviewReturn)) return clone(record);')
edit('static-web/src/lib/writingRuntimeModel.mjs','  next.regeneration = clean(regeneration);','  next.regenerationSubmittedAt = nowIso(now);\n  next.regeneration = clean(regeneration);')
edit('static-web/src/lib/writingRuntimeModel.mjs','        schema: WRITING_REPAIR_RETURN_SCHEMA,\n        taskId: task.id,','        schema: WRITING_REPAIR_RETURN_SCHEMA,\n        ...englishReturnBinding(record,true),\n        taskId: task.id,')
edit('static-web/src/lib/writingRuntimeModel.mjs','  const value = parseJsonInput(input);\n  if (value?.schema !== WRITING_REPAIR_RETURN_SCHEMA)', '  const value = parseJsonInput(input);\n  assertEnglishReturnBinding(value,record,true);\n  if (value?.schema !== WRITING_REPAIR_RETURN_SCHEMA)')
edit('static-web/src/lib/writingRuntimeModel.mjs','      schema: WRITING_REPAIR_RETURN_SCHEMA,\n      taskId: record.taskId,','      schema: WRITING_REPAIR_RETURN_SCHEMA,\n      ...englishReturnBinding(record,true),\n      taskId: record.taskId,')
edit('static-web/src/lib/writingRuntimeModel.mjs','    schema: WRITING_REPAIR_RETURN_SCHEMA,\n    taskId: record.taskId,','    schema: WRITING_REPAIR_RETURN_SCHEMA,\n    ...englishReturnBinding(record,true),\n    taskId: record.taskId,')
edit('static-web/src/lib/writingRuntimeModel.mjs','export function applyWritingRepairReturn(record, repairReturn, now) {','export function applyWritingRepairReturn(record, repairReturn, now) {\n  assertEnglishReturnBinding(repairReturn,record,true);\n  if(sameEnglishReturn(record.repairReturn,repairReturn)) return clone(record);\n  repairReturn=validateWritingRepairReturn(repairReturn,record);')
edit('static-web/src/lib/writingRuntimeModel.mjs','  return Boolean(record) && [', "  return Boolean(record?.firstDraft?.trim() && record?.firstSubmittedAt && record?.sourceKind==='synthetic') && [")
add('static-web/src/pages/vocabulary/targets/[ordinal].json.js', '''import { listLexicalOrdinals, loadLexicalWordByOrdinal } from '../../../lib/lexical.mjs';
export function getStaticPaths(){return listLexicalOrdinals().map(ordinal=>({params:{ordinal:String(ordinal)}}));}
export function GET({params}){
  const owner=loadLexicalWordByOrdinal(Number(params.ordinal));const targets=[];
  const visit=value=>{if(!value||typeof value!=='object')return;if(value.repair?.target_kind)targets.push(value.repair);for(const [k,v]of Object.entries(value))if(k!=='repair')visit(v);};
  visit(owner.record);
  return new Response(JSON.stringify({word_id:owner.objectId,ordinal:owner.ordinal,source_revision:owner.sourceHash,targets}),{headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
}
''')
p=R/'static-web/src/lib/lexicalEnglishEvidence.mjs';p.write_text(p.read_text()+'''
// This checks Current identity; labels, approximate spelling and historical
// aliases are never a substitute for a real repair target.
export function assertCurrentLexicalTarget(event, current) {
  if(current?.word_id!==event?.word_id||Number(current?.ordinal)!==Number(event?.ordinal))throw new Error('LEXICAL_CURRENT_WORD_MISMATCH');
  const target=(current.targets||[]).find(t=>t.target_kind===event.target_kind && (event.target_id?t.target_id===event.target_id:t.target_locator===event.target_locator));
  if(!target)throw new Error('LEXICAL_CURRENT_TARGET_UNRESOLVED');
  if(event.target_locator&&event.target_locator!==target.target_locator)throw new Error('LEXICAL_CURRENT_LOCATOR_MISMATCH');
  if(!event.target_id&&event.target_revision!==current.source_revision)throw new Error('LEXICAL_CURRENT_REVISION_MISMATCH');
  if(!DEMANDS.has(event.demand))throw new Error('LEXICAL_EXACT_DEMAND_REQUIRED');
  return target;
}
''')
for f in ['static-web/src/components/ObjectiveHandoff.astro','static-web/src/components/ReadingPassageHandoff.astro']:
 edit(f,'<script>\n',"<script>\n  import { englishReturnBinding } from '../lib/englishTaskEvidence.mjs';\n")
 edit(f,"JSON.stringify({ schema: 'kianos.english.objective_review_return.v1',", "JSON.stringify({ ...englishReturnBinding(attempt), schema: 'kianos.english.objective_review_return.v1',")
 edit(f,"            schema: 'kianos.english.objective_handoff.v1',", "            schema: 'kianos.english.objective_handoff.v1',\n            ...englishReturnBinding(attempt),")
for f in ['ReadingDeferredReviewShield.astro','ReadingPassageHandoff.astro','ReadingSessionHandoff.astro']:
 edit('static-web/src/components/'+f,'if (readingRoot) {',"if (readingRoot && !new URLSearchParams(location.search).has('exam_session')) {")
edit('static-web/src/components/ReadingPassageNavigator.astro','if (passageNavigator && result) {',"if (passageNavigator && result && !new URLSearchParams(location.search).has('exam_session')) {")
edit('static-web/src/components/ObjectiveHandoff.astro','if (!(root instanceof HTMLElement)) return;', "if (!(root instanceof HTMLElement)) return;\n    if (new URLSearchParams(location.search).has('exam_session')) return;")
edit('static-web/src/lib/lexicalEnglishEvidence.mjs','  const explicitEventId = clean(evidence.event_id);\n  const eventId = explicitEventId || [','  const eventId = [')
p=R/'static-web/src/components/ReadingWorkspace.astro';s=p.read_text().replace('稳定 · 可以直接下一篇','本次全对 · 可以直接下一篇').replace('待复盘','可回看');p.write_text(s)
