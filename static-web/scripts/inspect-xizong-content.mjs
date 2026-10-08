import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

// Read-only developer/Chat view of the existing native resolver, not another
// content parser, learner store, IR, or browser-state inspection mechanism.
const repoRoot = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const native = (name) => import(pathToFileURL(path.join(repoRoot, 'static-web/src/lib', name)));
const sha256 = (value) => crypto.createHash('sha256').update(String(value)).digest('hex');
const git = (...args) => execFileSync('git', ['-C', repoRoot, ...args], {
  encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe']
}).trim();
const fail = (code, detail = '') => { throw new Error(`XIZONG_INSPECTION_${code}${detail ? ':' + detail : ''}`); };

function ownerWitness(relativePath) {
  if (!relativePath || path.isAbsolute(relativePath) || relativePath.split('/').includes('..')) {
    fail('INVALID_OWNER_PATH', String(relativePath));
  }
  const bytes = fs.readFileSync(path.join(repoRoot, relativePath));
  const current = crypto.createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
  let committed = null;
  try { committed = git('rev-parse', `HEAD:${relativePath}`); } catch {}
  return { path: relativePath, gitBlob: current, headBlob: committed, matchesHead: current === committed };
}

export function assertContentIdentity(canonical, learner, rawContent) {
  const ids = learner.kps.map(kp => kp.identity.kpId);
  const expected = canonical.kpRecords.map(kp => kp.kpId);
  assert.deepEqual([...ids].sort(), [...expected].sort(), 'canonical KP set drift');
  assert.equal(new Set(ids).size, ids.length, 'duplicate learner KP');
  for (const kp of learner.kps) {
    const source = canonical.kpRecords.find(row => row.kpId === kp.identity.kpId);
    assert.equal(kp.prompt.canonical, source.prompt, `${kp.identity.kpId}:Prompt drift`);
    assert.equal(kp.core.markdown, source.detailMarkdown, `${kp.identity.kpId}:Core drift`);
    assert.equal(kp.source.locator, source.sourceLocator, `${kp.identity.kpId}:Source drift`);
    assert.equal(kp.outline.locator, source.outlineLocator, `${kp.identity.kpId}:Outline drift`);
    if (source.prompt && !rawContent.includes(source.prompt)) fail('PROMPT_NOT_IN_RAW_OWNER', source.kpId);
  }
}

// Inventory native attachments at their actual owner level. A group relation
// must not be copied onto every child KP, nor vanish from the human read view.
function nativeSupports(object, block = false) {
  const families = block
    ? [['attention', object.slots.blockAttention], ['extension', object.blockExtension], ['connection', object.slots.blockConnections]]
    : [['attention', object.attention], ['medicalvisual', object.visual], ['precision', object.precision],
      ['extension', object.extension], ['connection', [...(object.connection?.incoming || []), ...(object.connection?.outgoing || [])]]];
  return families.flatMap(([family, rows]) => (rows || []).map(native => ({ family, native })));
}

export function assertInspectionSupportCoverage(report) {
  const object = report.learnerObject;
  const same = (entry, native, block = false) => {
    assert.ok(entry, 'missing inspection owner scope');
    assert.deepEqual(entry.identity, native.identity, 'inspection owner identity drift');
    assert.deepEqual(entry.supports.map(row => ({family: row.family, native: row.native})),
      nativeSupports(native, block), 'inspection support omission / reparenting / payload drift');
  };
  same(report.blockTrace, object, true);
  assert.deepEqual(report.logicGroupTrace.map(g => g.identity.logicGroupId),
    object.logicGroups.map(g => g.identity.logicGroupId), 'inspection group scope drift');
  report.logicGroupTrace.forEach((entry, i) => {
    same(entry, object.logicGroups[i]);
    assert.deepEqual(entry.kpIds, object.logicGroups[i].kpIds, 'inspection group membership drift');
    assert.deepEqual(entry.slots, object.logicGroups[i].slots, 'inspection group slot drift');
  });
  const kps = report.requestedKpId ? object.kps.filter(k => k.identity.kpId === report.requestedKpId) : object.kps;
  assert.deepEqual(report.trace.map(k => k.identity.kpId), kps.map(k => k.identity.kpId), 'inspection KP scope drift');
  report.trace.forEach((entry, i) => same(entry, kps[i]));
}

export async function inspectXizongContent({ systemId, blockRef, kpId = null }) {
  if (!systemId || !blockRef) fail('SYSTEM_AND_BLOCK_REQUIRED');
  process.env.KIANOS_REPO_ROOT = repoRoot; // Pin all native loaders to this same repository in this CLI process.
  const head = git('rev-parse', 'HEAD');
  const [{ loadXizongBlock }, { resolveXizongLearnerProjection },
    { loadXizongSemanticSystem }, { loadXizongPathways }] = await Promise.all([
    native('xizong.mjs'), native('xizongLearnerProjection.mjs'),
    native('xizongSemanticAdapter.mjs'), native('xizongPathways.mjs')
  ]);
  const canonical = loadXizongBlock(systemId, blockRef);
  const resolved = resolveXizongLearnerProjection(canonical);
  const semanticSystem = loadXizongSemanticSystem(systemId);
  const semanticBlock = semanticSystem.blocks.find(row => row.blockId === canonical.blockId);
  const learner = resolved.learnerObject;
  const selected = kpId ? learner.kps.find(row => row.identity.kpId === kpId) : null;
  if (kpId && !selected) fail('EXACT_KP_NOT_FOUND', kpId);
  const pathwayOwner = loadXizongPathways(resolved.system)?.sourcePath || null;
  const owners = {
    ...semanticSystem.ownerPaths,
    canonicalContent: canonical.sourcePath,
    sharedFields: 'content/xizong/knowledge/learner/shared-fields.json',
    pathways: pathwayOwner,
    cognitiveProjection: resolved.block.cognitiveProjection?.assetPath || null
  };
  const rawContent = fs.readFileSync(path.join(repoRoot, canonical.sourcePath), 'utf8');
  assertContentIdentity(canonical, learner, rawContent);
  const extRefs = semanticBlock?.extensionRefs || [];
  // Locate an explicit stop_line in only the declared owner inputs. This is
  // provenance lookup, not another Learning/alias resolver. Ambiguity stays null.
  const stopLineOwners = new Set();
  const blockKeys = [...new Set([semanticBlock.blockId, semanticBlock.sourceContact?.ownerBlockKey].filter(Boolean))];
  for (const file of [owners.learning, ...(owners.learningShards || []), owners.content].filter(Boolean)) {
    const data = JSON.parse(fs.readFileSync(path.join(repoRoot, file), 'utf8'));
    if (blockKeys.some(key => typeof data.blocks?.[key]?.stop_line === 'string'
        && data.blocks[key].stop_line === semanticBlock.learning?.stopLine)) stopLineOwners.add(file);
  }
  const supportOwner = (row, family) => {
    if (family === 'precision' && learner.semanticOwnership) return learner.semanticOwnership.sourcePath;
    if (family === 'medicalvisual' || family === 'precision') return resolved.learningCues.sourcePath || null;
    if (family === 'extension') return row.raw?.manifestPath || extRefs.find(ref => ref.slotId === row.id)?.manifestPath || null;
    if (family === 'attention' && String(row.raw?.source || '').startsWith('BLOCK_PREENTRY_')) return canonical.sourcePath;
    if (family === 'attention' && row.raw?.source === 'ATTENTION_STOP_LINE' && stopLineOwners.size === 1) return [...stopLineOwners][0];
    // An implicit Learning/shard derivation is retained as UNRESOLVED rather
    // than guessed as the Block Markdown. Native provenance stays in `native`.
    return row.sourcePath || row.raw?.sourcePath || (family === 'connection' ? pathwayOwner : null);
  };
  const traceSupports = (object, block = false) => nativeSupports(object, block).map(({family, native: row}) => ({
    family, id: row.id, ownerPath: supportOwner(row, family),
    ownerResolution: supportOwner(row, family) ? 'REFERENCED' : 'UNRESOLVED',
    native: row,
    sourceAssetBindings: family === 'medicalvisual'
      ? semanticBlock.visualGates.find(gate => gate.cueId === row.id)?.sourceAssets || [] : []
  }));
  const logicGroupTrace = learner.logicGroups.map(group => ({
    identity: group.identity, goal: group.goal, closure: group.closure,
    kpIds: group.kpIds, supports: traceSupports(group), slots: group.slots
  }));
  const blockTrace = { identity: learner.identity, supports: traceSupports(learner, true),
    framework: learner.framework, blockPreentry: learner.blockPreentry, sourceContact: learner.sourceContact };
  const trace = learner.kps.map(kp => {
    const source = canonical.kpRecords.find(row => row.kpId === kp.identity.kpId);
    if (!source) fail('CANONICAL_KP_MISSING', kp.identity.kpId);
    const supports = traceSupports(kp);
    return {
      identity: kp.identity,
      contentOwner: { path: canonical.sourcePath, kpId: source.kpId },
      prompt: { text: source.prompt, sha256: sha256(source.prompt), field: '主提示', rawOwnerContainsText: Boolean(source.prompt) && rawContent.includes(source.prompt) },
      core: { sha256: sha256(source.detailMarkdown), field: 'canonical KP body (native detailMarkdown)' },
      source: kp.source, outline: kp.outline, supports,
      contentDiagnostics: source.contentDiagnostics || [],
      slots: {
        kpLearnAux: learner.slots.kpLearnAux[kp.identity.kpId],
        kpRecallContext: learner.slots.kpRecallContext[kp.identity.kpId],
        kpRecallPostReveal: learner.slots.kpRecallPostReveal[kp.identity.kpId]
      }
    };
  });
  const paths = new Set([
    canonical.sourcePath, ...Object.values(owners).flat(),
    ...[...trace, ...logicGroupTrace, blockTrace].flatMap(entry => entry.supports.map(row => row.ownerPath)),
    ...extRefs.map(row => row.manifestPath)
  ].filter(value => typeof value === 'string' && value));
  const witnesses = [...paths].sort().map(ownerWitness);
  if (git('rev-parse', 'HEAD') !== head) fail('HEAD_CHANGED_DURING_READ');
  const report = {
    authority: 'READ_ONLY_DERIVED_INSPECTION_NOT_CONTENT_OWNER',
    basis: { head, sourceHash: canonical.sourceHash, owners, witnesses },
    terminology: { MedicalVisual: 'Medical content/support; existing native visual fields are retained unchanged.',
      Visual: 'Accepted interface design/typography/layout, not medical image knowledge.' },
    proof: { parsedCanonicalToLearnerObject: 'CHECKED', rawOwnerPromptPresence: 'CHECKED',
      sourceQualityAndCompleteness: 'NOT_AUDITED', servedWebsite: 'NOT_OBSERVED',
      actualBrowserKp: 'UNKNOWN', personalPromptOverride: 'NOT_READ', effectiveDisplayedPrompt: 'UNKNOWN',
      timing: 'NATIVE_DECLARATIONS_ONLY_NOT_BROWSER_PROOF',
      supportTrace: 'NATIVE_BLOCK_GROUP_KP_ATTACHMENTS_CHECKED_NOT_SOURCE_COMPLETENESS',
      medicalVisualUrls: 'ASTRO_URL_ATTACHMENT_NOT_RUN; source asset bindings are references only',
      scope: 'One native resolution; not an atomic live-browser/source snapshot or learner evidence.' },
    summary: { identity: learner.identity, kpCount: learner.kps.length, logicGroupCount: learner.logicGroups.length,
      medicalVisualKpCount: learner.kps.reduce((n,k) => n+k.visual.length,0),
      medicalVisualGroupCount: learner.logicGroups.reduce((n,g) => n+g.visual.length,0),
      precisionKpCount: learner.kps.reduce((n,k) => n+k.precision.length,0),
      attentionKpCount: learner.kps.reduce((n,k) => n+k.attention.length,0),
      outgoingKpCount: learner.kps.reduce((n,k) => n+k.connection.outgoing.length,0),
      incomingKpCount: learner.kps.reduce((n,k) => n+k.connection.incoming.length,0),
      precisionGroupCount: learner.logicGroups.reduce((n,g) => n+g.precision.length,0),
      outgoingGroupCount: learner.logicGroups.reduce((n,g) => n+g.connection.outgoing.length,0),
      incomingGroupCount: learner.logicGroups.reduce((n,g) => n+g.connection.incoming.length,0),
      incomingBlockCount: learner.slots.blockConnections.length,
      extensionBlockCount: learner.blockExtension.length,
      extensionGroupCount: learner.logicGroups.reduce((n,g) => n+g.extension.length,0),
      extensionKpCount: learner.kps.reduce((n,k) => n+k.extension.length,0),
      countMeaning: 'Owner attachments by level; NOT a sum of distinct medical facts or relations.' },
    requestedKpId: kpId, blockTrace, logicGroupTrace,
    contentDiagnostics: trace.filter(row => row.contentDiagnostics.length).map(row => ({ kpId: row.identity.kpId, ownerPath: canonical.sourcePath, diagnostics: row.contentDiagnostics })),
    // Full native data stays available: Block Framework/MI/Source/group support
    // must not disappear merely because the concise human view has KP rows.
    canonicalBlock: canonical, semanticBlock, learnerObject: learner,
    trace: kpId ? trace.filter(row => row.identity.kpId === kpId) : trace,
    selectedKp: selected,
    validation: resolved.report
  };
  assertInspectionSupportCoverage(report);
  return report;
}

// Content-only, read-only model frame. Uses the same native canonical inputs as
// the inspector; never constructs a new medical relation or answer owner.
export function formatXizongModelFrame(report) {
  const block = report?.canonicalBlock;
  if (!block || !Array.isArray(block.kpRecords)) throw new Error('XIZONG_MODEL_FRAME_MISSING_CANONICAL_BLOCK');
  const failFrame = detail => { throw new Error(`XIZONG_MODEL_FRAME_${detail}:${block.blockId}`); };
  const kpById = new Map(block.kpRecords.map(kp => [kp.kpId, kp]));
  const expected = new Set(kpById.keys());
  const header = `# ${block.systemCanonicalId || block.systemId} → ${block.blockId} · ${block.title || report.summary.identity.title}`;
  if (block.modelMarkdown) {
    // Consume the model the native resolver already derived; do not redraw it.
    const matches = [...block.modelMarkdown.matchAll(/<!-- b1:route:start -->([\s\S]*?)<!-- b1:route:end -->/g)];
    if (matches.length !== 1) failFrame('REVIEWED_ROUTE_MISSING_OR_AMBIGUOUS');
    let route = matches[0][1];
    const direct = new Set();
    for (const match of route.matchAll(/\[([^\[\]\n]+)〔([^〕\n]+)〕\]\(#([^)]+)\)/g)) {
      const kp = kpById.get(match[3]);
      if (!kp || match[1] !== kp.title || match[2] !== kp.prompt || direct.has(match[3])) {
        failFrame(`DIRECT_PROMPT_IDENTITY:${match[3]}`);
      }
      direct.add(match[3]);
    }
    const side = new Set();
    route = route.replace(/\[([^\]\n]+)\]\(#([^)]+)\)<!-- b1:external (\{[^\n}]+\}) -->/g, (original, label, id, identity) => {
      const kp = kpById.get(id);
      let metadata;
      try { metadata = JSON.parse(identity); } catch { failFrame(`SIDE_REF_METADATA:${id}`); }
      if (!kp || metadata.kp_id !== id || direct.has(id) || side.has(id)) failFrame(`SIDE_REF_IDENTITY:${id}`);
      side.add(id);
      // Same pre-existing side location, but show the exact current title and Prompt.
      return `[${kp.title}〔${kp.prompt}〕](#${id})<!-- b1:external ${identity} -->`;
    });
    const missing = [...expected].filter(id => !direct.has(id) && !side.has(id));
    if (missing.length || direct.size + side.size !== expected.size) failFrame(`UNACCOUNTED_KPS:${missing.join(',')}`);
    let foldDepth = 0;
    const visible = [];
    for (const line of route.split('\n')) {
      if (/^\s*<details(?:\s[^>]*)?>\s*$/.test(line)) { foldDepth++; continue; }
      if (/^\s*<\/details>\s*$/.test(line)) {
        if (--foldDepth < 0) failFrame('UNBALANCED_DETAILS');
        continue;
      }
      if (foldDepth === 0) visible.push(line);
    }
    if (foldDepth !== 0) failFrame('UNBALANCED_DETAILS');
    const clean = visible.join('\n')
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/\[([^\]\n]+)\]\(#[^)]+\)/g, '$1')
      .replace(/\*\*/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    for (const kp of block.kpRecords) {
      if (!clean.includes(`${kp.title}〔${kp.prompt}〕`)) failFrame(`VISIBLE_PROMPT_MISSING:${kp.kpId}`);
    }
    return `${header}\n\n${clean}`;
  }
  const raw = fs.readFileSync(path.join(repoRoot, block.sourcePath), 'utf8');
  const markers = [...raw.matchAll(/^#{2,3}\s+[^\n]*同一模型上的自然节点〔完整 Prompt〕[^\n]*$/gm)];
  if (markers.length !== 1) failFrame('CURRENT_NATURAL_MODEL_MISSING_OR_AMBIGUOUS');
  const after = raw.slice(markers[0].index + markers[0][0].length);
  const open = after.indexOf('```text\n');
  if (open < 0 || open > 1500) failFrame('NATURAL_MODEL_TEXT_FENCE_MISSING');
  const end = after.indexOf('\n```', open + '```text\n'.length);
  if (end < 0) failFrame('NATURAL_MODEL_TEXT_FENCE_UNCLOSED');
  const source = after.slice(open + '```text\n'.length, end);
  const normalize = value => String(value).trim().replace(/[。．]\s*$/, '');
  const seen = new Set();
  const derived = source.split('\n').map(line => {
    const at = line.indexOf('〔');
    if (at < 0) return line;
    const close = line.indexOf('〕', at + 1);
    if (close < 0 || line.indexOf('〔', at + 1) >= 0 || line.indexOf('〕', close + 1) >= 0) {
      failFrame('MALFORMED_ANNOTATION');
    }
    const prompt = normalize(line.slice(at + 1, close));
    // Exact canonical suffix, allowing only an authored label prefix or terminal period.
    // No KP-number/order match, fuzzy/semantic match, or inferred topology.
    const candidates = block.kpRecords.filter(kp => prompt && normalize(kp.prompt).endsWith(prompt));
    if (candidates.length !== 1) failFrame(`UNRESOLVED_OR_AMBIGUOUS_PROMPT:${prompt}`);
    const kp = candidates[0];
    if (seen.has(kp.kpId)) failFrame(`DUPLICATED_BINDING:${kp.kpId}`);
    seen.add(kp.kpId);
    const front = line.slice(0, at);
    const structuralPrefix = front.match(/^[\s│├└─]*/u)?.[0] || '';
    if (!front.slice(structuralPrefix.length).trim()) failFrame(`MISSING_NODE_LABEL:${kp.kpId}`);
    return `${structuralPrefix}${kp.title}〔${kp.prompt}〕${line.slice(close + 1)}`;
  }).join('\n');
  const missing = [...expected].filter(id => !seen.has(id));
  if (missing.length || seen.size !== expected.size) failFrame(`UNACCOUNTED_KPS:${missing.join(',')}`);
  const topology = text => text.split('\n').map(line => {
    const at = line.indexOf('〔');
    if (at < 0) return line;
    const close = line.indexOf('〕', at + 1);
    return (line.match(/^[\s│├└─]*/u)?.[0] || '') + line.slice(close + 1);
  }).join('\n');
  if (topology(source) !== topology(derived)) failFrame('MODEL_TOPOLOGY_DRIFT');
  return `${header}\n\n${derived}`;
}

export function formatXizongInspection(report) {
  const lines = [`# ${report.summary.identity.blockId} · ${report.summary.identity.title}`,
    `Basis: ${report.basis.head}`, `Content: ${report.basis.owners.canonicalContent}`,
    `KP ${report.summary.kpCount} / LG ${report.summary.logicGroupCount}`,
    'Read-only canonical inspection; live Website / effective personal Prompt = UNKNOWN.',
    'MedicalVisual = medical image knowledge/support; Visual = interface design.',
    `Source contact: ${report.semanticBlock.sourceContact.mode}`,
    '', '## Canonical owner paths', JSON.stringify(report.basis.owners, null, 2),
    '', '## Block/LG map'];
  const describeSupports = supports => {
    if (!supports.length) return ['  Support: none resolved at this owner level'];
    return supports.flatMap(row => [
      `  ${row.family}:${row.id} ${row.native.direction || ''} → ${row.ownerPath || 'OWNER_UNRESOLVED'}`,
      `    ${row.native.cue || row.native.task || row.native.title || ''}`,
      `    Timing: ${row.native.displayPolicy?.timing || 'native slot; no explicit override'}; answerBearing=${row.native.answerBearing === true}`
    ]);
  };
  if (report.learnerObject.model?.markdown) lines.push('', '## Current canonical model', report.learnerObject.model.markdown);
  lines.push('Counts are owner attachments; KP zero does not mean Block/group absence.');
  for (const group of report.logicGroupTrace) {
    lines.push(`${group.identity.logicGroupId} · ${group.identity.label}`,
      `  ${group.kpIds.join(' → ')}`, `  Goal: ${group.goal}`, `  Closure: ${group.closure}`);
    if (!report.requestedKpId || group.kpIds.includes(report.requestedKpId)) lines.push(...describeSupports(group.supports));
  }
  lines.push('', '## Block-owned support', ...describeSupports(report.blockTrace.supports));
  lines.push('', '## KP content');
  for (const item of report.trace) {
    lines.push('', `### ${item.identity.kpId} · ${item.identity.title}`,
      `Prompt: ${item.prompt.text}`, `Source: ${item.source.locator || 'UNAVAILABLE'}`,
      `Outline: ${item.outline.locator || 'UNAVAILABLE'}`,
      `Support: ${item.supports.map(row => `${row.family}:${row.id}`).join(', ') || 'none resolved'}`);
    for (const diagnostic of item.contentDiagnostics || []) {
      lines.push(`CONTENT REVIEW REQUIRED: ${diagnostic.label} has multiple authored values; effective text is not a resolved Content decision.`,
        ...diagnostic.values.map((value, index) => `  Authored ${index + 1}: ${value}`));
    }
    if (report.requestedKpId) {
      lines.push('', '### Full canonical Core', report.selectedKp.core.markdown,
        '', '### Native support / owner / timing declarations', JSON.stringify(item.supports,null,2));
    }
  }
  lines.push('', 'JSON mode retains the full canonical Block, native learner object, all slots and Source policies.',
    'This view does not certify Source completeness, live rendering or mastery.');
  return lines.join('\n');
}

const invoked = process.argv[1] && fs.realpathSync(process.argv[1]) === fs.realpathSync(fileURLToPath(import.meta.url));
if (invoked) {
  const args = process.argv.slice(2);
  const json = args.includes('--json');
  const model = args.includes('--model');
  const positional = args.filter(arg => arg !== '--json' && arg !== '--model');
  if (positional.some(arg => arg.startsWith('--')) || positional.length < 2 || positional.length > (model ? 2 : 3) || (model && json)) {
    console.error('Usage: node scripts/inspect-xizong-content.mjs <system-id> <block-id-or-slug> [exact-kp-id] [--json | --model]');
    process.exitCode = 2;
  } else {
    try {
      const report = await inspectXizongContent({systemId:positional[0],blockRef:positional[1],kpId:positional[2] || null});
      console.log(model ? formatXizongModelFrame(report) : json ? JSON.stringify(report,null,2) : formatXizongInspection(report));
    } catch (error) { console.error(String(error?.stack || error)); process.exitCode = 1; }
  }
}
