from pathlib import Path
root=Path('.')
def edit(rel,fn):
 p=root/rel;s=p.read_text();t=fn(s);assert t!=s,rel;p.write_text(t)
def runtime(s):
 s=s.replace("const learnedCount = () => Object.values(state.learned || {}).filter(Boolean).length;", "const learnedCount = () => kpData.filter((kp) => state.learned?.[kp.kpId] === true).length;")
 s=s.replace("const recallCount = () => Object.keys(state.ratings || {}).length;", "const recallCount = () => kpData.filter((kp) => ['unknown', 'fuzzy', 'known', 'mastered'].includes(state.ratings?.[kp.kpId])).length;")
 s=s.replace("const legacyLearned = Object.values(state.learned || {}).filter(Boolean).length;", "const legacyLearned = kpData.filter((kp) => state.learned?.[kp.kpId] === true).length;")
 s=s.replace("const answer = card.querySelector('[data-kp-answer]');\n      const rating =", "card.dataset.ratingCommitted = 'false';\n      const answer = card.querySelector('[data-kp-answer]');\n      const rating =",1)
 s=s.replace("const value = button.getAttribute('data-rating') || '';\n        state.ratings", "const value = button.getAttribute('data-rating') || '';\n        if (state.stage !== 'kp_recall' || card.hidden || answer?.hidden !== false || state.learned?.[kpId] !== true || card.dataset.ratingCommitted === 'true') return;\n        if (!['unknown', 'fuzzy', 'known', 'mastered'].includes(value)) return;\n        card.dataset.ratingCommitted = 'true';\n        state.ratings")
 s=s.replace("if (state.stage !== 'kp_recall') return;\n      if (event.key", "if (state.stage !== 'kp_recall' || event.repeat) return;\n      if (event.key")
 s=s.replace("if (event.code === 'Space') { event.preventDefault(); kpRecallCards[state.kpIndex]?.querySelector('[data-kp-reveal]')?.click(); }", "if (event.code === 'Space') {\n        event.preventDefault();\n        const card = kpRecallCards[state.kpIndex];\n        if (card?.querySelector('[data-kp-answer]')?.hidden === false) resetRecallCard(card);\n        else card?.querySelector('[data-kp-reveal]')?.click();\n      }")
 s=s.replace("<span>← → 切换 · Space 隐藏 Core · Enter 学好并继续</span>","<span data-block-keyboard-hint>← → 切换 · Space 显示 / 隐藏 Core</span>")
 s=s.replace("const syncState = () => {", "const syncState = () => {\n      const shortcutHint = root.querySelector('[data-block-keyboard-hint]');\n      if (shortcutHint) shortcutHint.textContent = state.stage === 'kp_recall' ? 'Space 核对 Core · 1–4 记录回忆并继续 · ← → 切换' : '← → 切换伴读 · Source 单元学完后一次确认';")
 return s
edit('static-web/src/components/XizongBlockV6.astro',runtime)
def guard(s):
 s=s.replace("const total = root?.querySelectorAll('[data-kp-recall-card]').length || 0;", "const ids = [...(root?.querySelectorAll('[data-kp-recall-card]') || [])].map((card) => card.getAttribute('data-kp-id'));\n    const total = ids.length;")
 s=s.replace("learned: Object.values(state?.learned || {}).filter(Boolean).length,\n      recalled: Object.keys(state?.ratings || {}).length", "learned: ids.filter((id) => state?.learned?.[id] === true).length,\n      recalled: ids.filter((id) => ['unknown', 'fuzzy', 'known', 'mastered'].includes(state?.ratings?.[id])).length")
 s=s.replace("const kpId = rating.closest('[data-kp-id]')?.getAttribute('data-kp-id') || '';\n        if (kpId && !state?.learned?.[kpId]) {", "const card = rating.closest('[data-kp-recall-card]');\n        const kpId = card?.getAttribute('data-kp-id') || '';\n        if (!kpId || state?.stage !== 'kp_recall' || card?.hidden || card?.querySelector('[data-kp-answer]')?.hidden !== false || card?.dataset.ratingCommitted === 'true' || state?.learned?.[kpId] !== true) {")
 s=s.replace("'先完成这个 KP 的正式学习，再记录 Recall'", "'先完成对应原讲义接触并 Reveal 当前 Core，再记录本次 Recall'")
 s=s.replace("const blockRecallDone = target.closest('[data-block-recall-complete]');", "const blockReveal = target.closest('[data-block-recall-reveal]');\n      if (blockReveal && (!counts.total || counts.learned < counts.total || counts.recalled < counts.total)) { stop(event); return; }\n      const blockRecallDone = target.closest('[data-block-recall-complete]');\n      if (blockRecallDone && root.querySelector('[data-block-recall-answer]')?.hidden !== false) { stop(event); return; }")
 return s
edit('static-web/src/components/XizongRuntimeStageGuard.astro',guard)
def recall(s):
 s=s.replace('].slice(-400);','];')
 s=s.replace("{ at: new Date().toISOString(), type: 'KP_RECALL', kp_id: kpId, rating, evidence_origin: evidenceOrigin }", "{ at: new Date().toISOString(), type: 'KP_RECALL', kp_id: kpId, rating, evidence_origin: evidenceOrigin, core_revealed: true, source_hash: bridge.getAttribute('data-study-source-hash') || '', context_asset_ids: [...root.querySelectorAll('[data-xizong-aux-surface]:not([hidden]) [data-learner-asset-id]')].map((row) => row.getAttribute('data-learner-asset-id')).filter(Boolean) }")
 s=s.replace("if (!kpId || !rating || !currentStudy?.learned?.[kpId]) return;", "if (!kpId || !['unknown', 'fuzzy', 'known', 'mastered'].includes(rating) || currentStudy?.learned?.[kpId] !== true || card?.querySelector('[data-kp-answer]')?.hidden !== false) return;")
 return s
edit('static-web/src/components/XizongRecallEvidenceBridge.astro',recall)
edit('static-web/src/lib/xizongMemoryModel.mjs',lambda s:s.replace('].slice(-3000);','];'))
def representation(s):
 anchor="  if ((type === 'VISUAL' || type === 'SOURCE_VISUAL') && hasSourceVisual(asset)) {"
 insert="""  const timing = upper(asset?.displayPolicy?.timing || asset?.display_policy?.timing || asset?.raw?.display_policy?.timing);
  const answerBearing = asset?.answerBearing === true || asset?.answer_bearing === true || asset?.raw?.answer_bearing === true || asset?.raw?.answerBearing === true;
  if (normalizedStage === 'KP_RECALL_FRONT' && (answerBearing || timing === 'POST_REVEAL')) {
    return { schema: XIZONG_REPRESENTATION_SCHEMA, kind: 'STRUCTURED_TEXT', visible: false,
      reason: answerBearing ? 'KP_ANSWER_PAYLOAD_PROTECTED' : 'OWNED_POST_REVEAL_TIMING', sourceAssetId: text(asset?.id) };
  }

"""
 assert anchor in s;return s.replace(anchor,insert+anchor)
edit('static-web/src/lib/xizongRepresentationGate.mjs',representation)
edit('static-web/src/lib/xizongLearnerObject.mjs',lambda s:s.replace("    kind,\n    anchor:", "    kind,\n    answerBearing: row?.answer_bearing === true || row?.answerBearing === true,\n    displayPolicy: row?.display_policy || row?.displayPolicy || null,\n    anchor:").replace("    kind: 'EXTENSION',", "    kind: 'EXTENSION',\n    answerBearing: row?.answer_bearing === true || row?.answerBearing === true,"))
def projection(s):
 s=s.replace("import path from 'node:path';", "import path from 'node:path';\nimport crypto from 'node:crypto';")
 s=s.replace("  if (binding.kind === 'OWNER_REF') {", "  if (binding.kind === 'OWNER_REF') {\n    if (binding.owner_type === 'BLOCK' && binding.id !== canonicalBlock.blockId) fail('OWNER_ID_MISMATCH', String(binding.id));")
 a="  if (!source?.path || !exists(source.path)) fail('SOURCE_UNRESOLVED', String(binding.source_id || ''));"
 b=a+"""
  const sourceBytes = fs.readFileSync(absolute(source.path));
  if (binding.kind === 'DERIVED_FRAGMENT' || source.kind === 'EXTERNAL_SOURCE_CONTRACT' || source.freshness === 'STRICT_BLOB') {
    const expected = source.blob_sha || source.baseline_blob_sha;
    const actual = crypto.createHash('sha1').update(`blob ${sourceBytes.length}\\0`).update(sourceBytes).digest('hex');
    if (!/^[a-f0-9]{40}$/.test(String(expected || '')) || expected !== actual) fail('STRICT_SOURCE_STALE', source.path);
  }
"""
 assert a in s;s=s.replace(a,b)
 s=s.replace("    return jsonPointer(readJson(source.path), pointer);", "    const value = jsonPointer(JSON.parse(sourceBytes.toString('utf8')), pointer);\n    const actualType = Array.isArray(value) ? 'array' : value === null ? 'null' : typeof value;\n    if (!binding.value_type || actualType !== binding.value_type) fail('FIELD_TYPE_MISMATCH', `${source.path}:${pointer}`);\n    return value;")
 s=s.replace("  const view = found.asset?.views?.BLOCK_ORIENT;", "  if (found.asset.system_id !== canonicalBlock.systemId || found.asset.canonical_scope?.id !== canonicalBlock.blockId) fail('ASSET_SCOPE_MISMATCH', canonicalBlock.blockId);\n  const view = found.asset?.views?.BLOCK_ORIENT;")
 return s
edit('static-web/src/lib/xizongProductionProjection.mjs',projection)
def blockarchive(s):
 s=s.replace('      writeJson(archiveKey, {','      const archived = writeJson(archiveKey, {',1)
 s=s.replace("        repair_inbox: oldRepairInbox\n      });", "        repair_inbox: oldRepairInbox,\n        raw: Object.fromEntries([studyKey, personalKey, extensionKey, repairInboxKey].map((key) => [key, localStorage.getItem(key)]))\n      });\n      if (!archived) {\n        root.inert = true;\n        const notice = document.createElement('p');\n        notice.setAttribute('role', 'alert');\n        notice.textContent = '旧学习记录未能安全归档，已保留原记录并暂停本页。请先导出备份或释放本机存储，再重新打开；不要清除浏览器数据。';\n        root.before(notice);\n      } else {")
 s=s.replace("      window.location.reload();\n    } else {", "      window.location.reload();\n      }\n    } else {")
 return s
edit('static-web/src/components/XizongBlockEvidenceGuard.astro',blockarchive)
def systemarchive(s):
 s=s.replace("      const staleBlockQuestionPlans = {};", "      const cleanup = [];\n      const staleBlockQuestionPlans = {};")
 s=s.replace("        try { localStorage.removeItem(inboxKey); } catch {}", "        cleanup.push(() => { try { localStorage.removeItem(inboxKey); } catch {} });")
 s=s.replace("          writeJson(key, ext);", "          cleanup.push(() => writeJson(key, ext));")
 s=s.replace("        writeJson(XIZONG_MEMORY_STORAGE_KEY, {", "        cleanup.push(() => writeJson(XIZONG_MEMORY_STORAGE_KEY, {")
 s=s.replace("          )\n        });", "          )\n        }));")
 s=s.replace("      writeJson(archiveKey, {", "      const archived = writeJson(archiveKey, {")
 s=s.replace("        stale_visible_memory_repairs: staleVisibleRepairs\n      });", "        stale_visible_memory_repairs: staleVisibleRepairs\n      });\n      if (!archived) {\n        root.inert = true;\n        document.querySelectorAll('[data-xizong-repair-return]').forEach((node) => { node.inert = true; });\n        const notice = document.createElement('p');\n        notice.setAttribute('role', 'alert');\n        notice.textContent = '旧系统学习记录未能安全归档，原记录未删除，本页暂停。请先备份或释放存储，再重新打开；不要清除浏览器数据。';\n        root.before(notice);\n      } else {\n      cleanup.forEach((apply) => apply());")
 s=s.replace("      window.location.reload();\n    } else {", "      window.location.reload();\n      }\n    } else {")
 s=s.replace('].slice(-300);','];')
 return s
edit('static-web/src/components/XizongSystemEvidenceGuard.astro',systemarchive)
edit('static-web/src/components/XizongSystemExitRuntime.astro',lambda s:s.replace("    document.addEventListener('keydown', (event) => {\n      const target", "    document.addEventListener('keydown', (event) => {\n      if (root.inert || event.repeat) return;\n      const target"))
edit('static-web/src/styles/xizong-block-workspace.css',lambda s:s.replace('/* The source/LG footer no longer competes with the per-KP Enter action. */','/* Keep one accepted Source-unit confirmation reachable; per-KP Enter is optional. */').replace('[data-study-stage="kp_learn"].xv6LearnerCompanionStage > footer {\n  display: none;','[data-study-stage="kp_learn"].xv6LearnerCompanionStage > footer {\n  display: flex;'))
def bridge(s):
 s=s.replace("slot = learner.slots?.kpLearnAux?.[kp?.identity?.kpId] || {};", "slot = mergeSlots(learner.slots?.logicGroupPrelearn?.[kp?.identity?.logicGroupId] || {}, learner.slots?.kpLearnAux?.[kp?.identity?.kpId] || {});")
 s=s.replace("learner.slots?.kpRecallContext?.[kpId] || learner.slots?.kpLearnAux?.[kpId] || {}\n          );", "learner.slots?.kpRecallContext?.[kpId] || learner.slots?.kpLearnAux?.[kpId] || {},\n            recallAnswerVisible() ? learner.slots?.logicGroupPostlearn?.[groupId] || {} : {}\n          );")
 return s.replace("'本段原讲义已完成，回来做学习节 Recall'", "'本 Block 对应原讲义已学完，开始 Recall'")
edit('static-web/src/components/XizongLearnerObjectBridge.astro',bridge)
edit('static-web/src/components/XizongCognitiveProjectionStage.astro',lambda s:s.replace('<details class="xv6CognitiveProjection xv6FrameworkEntry"','<details open class="xv6CognitiveProjection xv6FrameworkEntry"').replace('打开当前 Block 框架','当前 Block 框架').replace('按需展开','可收起'))
def protocol(s):
 s=s.replace('→ current Logic Group orientation\n→ original Lecture / MarginNote continuous study for the whole Logic Group\n→ one return to KianOS\n→ KP Recall for that Logic Group\n→ Logic Group closure\n→ next Logic Group', '→ current Source-contact orientation under the System Learning owner\n→ original Lecture / MarginNote continuous study at that accepted granularity\n→ return at the accepted retrieval point\n→ KP Recall in the accepted Logic Group order\n→ automatic Logic Group closure\n→ next retrieval group; reopen Source only when the owning Source unit requires it')
 s=s.replace('This journey is not a UI proposal.', 'Source-contact granularity is System-specific, not a global whole-LG rule. A confirmed accepted segment may supply formal contact evidence for all of its exact member KPs; evidence granularity never requires one learner click per KP/LG. Whole-LG handoff applies only where the System Learning owner explicitly chooses it.\n\nThis journey is not a UI proposal.')
 s=s.replace('- neutral Recall front remains neutral;\n- answer-type title / canonical answer remains protected until legitimate Reveal;', '- KP Recall keeps its approved title, Prompt and permitted Context; canonical Core and explicitly answer-bearing / POST_REVEAL payload stay protected;\n- Block/System Recall retains its stricter neutral-front reconstruction boundary;')
 return s
edit('static-web/XIZONG_UI_REVIEW_PROTOCOL.md',protocol)
edit('static-web/XIZONG_PRODUCT_BRIEF.md',lambda s:s.replace('→ continuous original-Lecture contact for the whole Logic Group\n→ one return\n→ this Logic Group\'s KP Recall\n→ group closure','→ continuous original-Lecture contact at System-specific accepted Source granularity\n→ one natural return at its retrieval point\n→ KP Recall in accepted LG order\n→ automatic group closure without mandatory Source re-entry').replace('- neutral Recall front;\n- protect answer-type title / canonical answer until legitimate Reveal;', '- same-KP Recall front with approved title / Prompt / permitted Context;\n- protect canonical Core and any explicitly answer-bearing or POST_REVEAL payload until legitimate Reveal;'))
def blockdoc(s):
 s=s.replace('- Logic Group continuous-Lecture model;\n- one return after the whole Logic Group;', '- accepted System-specific continuous Source-contact model;\n- one return at the accepted Source boundary, not an automatic trip per LG;')
 start=s.index('## 7｜MarginNote handoff');end=s.index('## 8｜',start)
 return s[:start]+'''## 7｜MarginNote handoff / bound TTSX checkpoint / one return — ACCEPTED

Source-contact authority remains `LEARNING_CONTRACT.md` plus the exact System Learning owner. This workspace consumes that decision; it does not set whole-LG as a lane-wide default.

Before leaving, expose the exact owned Source locator / bounded instruction and the retrieval return map. Missing exact locators stay explicitly unavailable; do not infer ranges from KP order.

- Whole-LG source mode: one group confirmation covers that accepted segment's exact KP IDs.
- Block / canonical Source-unit mode: continuous Source contact may span multiple retrieval LGs. Returning starts the accepted retrieval order, without reopening Source for every LG.
- Multiple natural sections may be studied across sittings. A Block-wide completion confirmation means all owned Source coverage is complete, not that any arbitrary partial section covers the whole Block.

Formal Lecture contact is per-KP evidence, but may be derived from confirmed accepted Source coverage. The normal path must not require one click per KP or per retrieval LG. Optional per-KP companion navigation/marking never replaces the one-source-unit confirmation.

A real reviewed Source boundary plus reviewed TTSX binding may insert one lightweight checkpoint. Answering, options, explanation and question-side expansion stay in original Lecture / MarginNote. Each bound question may have an optional short note; no default web answer entry, scoring or formal Question Attempt is created. Boundary decides WHEN, binding decides WHICH. Missing binding creates no checkpoint and no guessed question list.

For whole-LG mode, a checkpoint can interrupt the group's return only when its reviewed binding explicitly owns that LG / Source segment. Never spread a Block-wide binding across every LG. After the checkpoint, return to the interrupted retrieval mainline. Do not add a second “I am back” confirmation.

'''+s[end:]
edit('static-web/XIZONG_BLOCK_WORKSPACE_DESIGN.md',blockdoc)
def projdoc(s):
 s=s.replace('Protected Recall is workspace-wide. Each cognitive object declares', 'This section constrains the **compiled cognitive-object Front channel**, not the complete KP learner-object workspace. Its objects may not smuggle answer payloads through maps, labels, inspectors or hidden semantic slots. Each cognitive object declares')
 s=s.replace('The current declarative allowlist is:', '''The KP learner object separately follows `LEARNER_OBJECT_CONTRACT.md` / Block Workspace §9: same identity/title, Prompt, exact locators and Current-approved Context may remain visible. That permission does not override an asset's explicit `answer_bearing` or `POST_REVEAL` restriction, nor authorize copying canonical Core into an auxiliary slot. Block/System reconstruction remains stricter. These are different output layers, not rival Learning models.

The current **compiled-channel** declarative allowlist is:''')
 return s.replace('No protected view may expose canonical Guide/Core,', 'No protected compiled view may expose canonical Guide/Core,')
edit('content/xizong/projection/PROJECTION_CONTRACT.md',projdoc)
edit('content/xizong/LEARNER_OBJECT_CONTRACT.md',lambda s:s.replace('The canonical KP Core itself stays hidden until Reveal.', 'The canonical KP Core itself stays hidden until Reveal. Context membership is not blanket permission for every payload: an explicit answer-bearing flag or owned `POST_REVEAL` policy remains binding. The compiled Projection Front is a separate, stricter output channel; it cannot suppress the learner object\'s approved non-answer Context or be used to smuggle Core back into it.'))
print('bounded repairs applied; no medical Core or Learning model edits')
