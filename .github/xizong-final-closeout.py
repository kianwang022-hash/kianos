from pathlib import Path
import subprocess
def replace(path, old, new):
 p=Path(path);s=p.read_text();assert old in s,(path,old[:80]);p.write_text(s.replace(old,new))
def append(path, value):
 p=Path(path);p.write_text(p.read_text()+value)
append('static-web/src/lib/xizong.mjs', '''
// Identity-only Current requirements; never ship medical Core to a stage guard.
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
replace('static-web/src/lib/xizongMemoryAutoRelease.mjs', '  if (study.completed !== true)', "  if (study.schema && study.schema !== 'kianos.xizong.block-state.v2') return { complete: false, reason: 'UNSUPPORTED_STUDY_SCHEMA', blockId, kpIds: ids };\n  if (study.completed !== true)")
append('static-web/src/lib/xizongMemoryAutoRelease.mjs', '''
// One completion predicate for Memory, System release and learner Resume.
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
replace('static-web/src/components/XizongRuntimeStageGuard.astro', 'const blockIds = (system?.blocks || []).map((row) => row.blockId).filter(Boolean);', 'const blockIds = (system?.blocks || []).map((row) => row.blockId).filter(Boolean);\nconst requirements = block ? [] : loadXizongSystemCompletionRequirements(system);')
replace('static-web/src/components/XizongRuntimeStageGuard.astro', '<script define:vars={{ blockId, blockIds }}>', '''<script type="application/json" data-xizong-completion-input set:html={JSON.stringify({ blockId, blockIds, requirements }).replace(/</g, String.fromCharCode(92) + 'u003c')}></script>
<script>
  import { inspectXizongSystemCompletion } from '../lib/xizongMemoryAutoRelease.mjs';
  const { blockId, blockIds, requirements } = JSON.parse(document.querySelector('[data-xizong-completion-input]')?.textContent || '{}');''')
replace('static-web/src/components/XizongRuntimeStageGuard.astro', 'Boolean(state?.blockRecallDone)', '(state?.blockRecallDone === true)')
replace('static-web/src/components/XizongRuntimeStageGuard.astro', '    const completedBlocks = () => blockIds.filter((id) => Boolean(readBlockState(id)?.completed));', '    const completedBlocks = () => inspectXizongSystemCompletion(requirements, localStorage);')
replace('static-web/src/components/XizongRuntimeStageGuard.astro', '      const completed = completedBlocks();\n      const ready = completed.length >= blockIds.length;', '      const check = completedBlocks();\n      const completed = { length: check.completed };\n      const ready = check.complete;')
replace('static-web/src/components/XizongLastLocation.astro', '---\nconst {', "---\nimport { loadXizongSystemCompletionRequirements } from '../lib/xizong.mjs';\nconst {")
replace('static-web/src/components/XizongLastLocation.astro', 'const requiredBlocks = Array.isArray(requiredBlockIds) ? requiredBlockIds.filter(Boolean) : [];', 'const requiredBlocks = (requiredBlockIds?.length || requiredSystemRecall) ? loadXizongSystemCompletionRequirements(system) : [];')
replace('static-web/src/components/XizongLastLocation.astro', '<script>\n', "<script>\n  import { inspectXizongSystemCompletion, hasXizongSystemRecall } from '../lib/xizongMemoryAutoRelease.mjs';\n")
replace('static-web/src/components/XizongLastLocation.astro', "const blocksReady = !requiredBlocks.length || requiredBlocks.every((blockId) =>\n      Boolean(readJson(`kianos-xizong-astro-v2:xizong:${blockId}`, {})?.completed)\n    );\n    const recallReady = !requiredSystemRecall || Boolean(\n      readJson(`kianos:xizong:system-recall:${requiredSystemRecall}:v1`, {})?.completedAt\n    );", "const blocksReady = !requiredBlocks.length || inspectXizongSystemCompletion(requiredBlocks, localStorage).complete;\n    const recallReady = !requiredSystemRecall || hasXizongSystemRecall(localStorage, requiredSystemRecall);")
replace('static-web/src/components/XizongBlockV6.astro', '        state = { ...state, ...saved };', "        if (['completed', 'blockRecallDone', 'sourceContactDone'].some((key) => saved[key] != null && typeof saved[key] !== 'boolean')) throw new Error('Invalid completion evidence');\n        state = { ...state, ...saved };")
