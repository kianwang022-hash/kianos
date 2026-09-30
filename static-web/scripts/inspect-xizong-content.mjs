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
  const supportOwner = (row, family) => {
    if (family === 'medicalvisual' || family === 'precision') return resolved.learningCues.sourcePath || null;
    if (family === 'extension') return extRefs.find(ref => ref.slotId === row.id)?.manifestPath || null;
    return row.sourcePath || row.raw?.sourcePath || (family === 'connection' ? pathwayOwner : null);
  };
  const trace = learner.kps.map(kp => {
    const source = canonical.kpRecords.find(row => row.kpId === kp.identity.kpId);
    if (!source) fail('CANONICAL_KP_MISSING', kp.identity.kpId);
    const supports = [];
    for (const [family, rows] of [
      ['attention', kp.attention], ['medicalvisual', kp.visual], ['precision', kp.precision],
      ['extension', kp.extension], ['connection', [...kp.connection.incoming, ...kp.connection.outgoing]]
    ]) for (const row of rows) supports.push({
      family, id: row.id, ownerPath: supportOwner(row, family),
      ownerResolution: supportOwner(row, family) ? 'REFERENCED' : 'UNRESOLVED',
      // Keep the native object unchanged, including answerBearing/displayPolicy.
      native: row,
      sourceAssetBindings: family === 'medicalvisual'
        ? semanticBlock.visualGates.find(gate => gate.cueId === row.id)?.sourceAssets || [] : []
    });
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
    ...trace.flatMap(kp => kp.supports.map(row => row.ownerPath)),
    ...extRefs.map(row => row.manifestPath)
  ].filter(value => typeof value === 'string' && value));
  const witnesses = [...paths].sort().map(ownerWitness);
  if (git('rev-parse', 'HEAD') !== head) fail('HEAD_CHANGED_DURING_READ');
  return {
    authority: 'READ_ONLY_DERIVED_INSPECTION_NOT_CONTENT_OWNER',
    basis: { head, sourceHash: canonical.sourceHash, owners, witnesses },
    terminology: { MedicalVisual: 'Medical content/support; existing native visual fields are retained unchanged.',
      Visual: 'Accepted interface design/typography/layout, not medical image knowledge.' },
    proof: { parsedCanonicalToLearnerObject: 'CHECKED', rawOwnerPromptPresence: 'CHECKED',
      sourceQualityAndCompleteness: 'NOT_AUDITED', servedWebsite: 'NOT_OBSERVED',
      actualBrowserKp: 'UNKNOWN', personalPromptOverride: 'NOT_READ', effectiveDisplayedPrompt: 'UNKNOWN',
      timing: 'NATIVE_DECLARATIONS_ONLY_NOT_BROWSER_PROOF',
      medicalVisualUrls: 'ASTRO_URL_ATTACHMENT_NOT_RUN; source asset bindings are references only',
      scope: 'One native resolution; not an atomic live-browser/source snapshot or learner evidence.' },
    summary: { identity: learner.identity, kpCount: learner.kps.length, logicGroupCount: learner.logicGroups.length,
      medicalVisualKpCount: learner.kps.reduce((n,k) => n+k.visual.length,0),
      medicalVisualGroupCount: learner.logicGroups.reduce((n,g) => n+g.visual.length,0),
      precisionKpCount: learner.kps.reduce((n,k) => n+k.precision.length,0),
      attentionKpCount: learner.kps.reduce((n,k) => n+k.attention.length,0),
      outgoingKpCount: learner.kps.reduce((n,k) => n+k.connection.outgoing.length,0),
      incomingKpCount: learner.kps.reduce((n,k) => n+k.connection.incoming.length,0) },
    requestedKpId: kpId,
    contentDiagnostics: trace.filter(row => row.contentDiagnostics.length).map(row => ({ kpId: row.identity.kpId, ownerPath: canonical.sourcePath, diagnostics: row.contentDiagnostics })),
    // Full native data stays available: Block Framework/MI/Source/group support
    // must not disappear merely because the concise human view has KP rows.
    canonicalBlock: canonical, semanticBlock, learnerObject: learner,
    trace: kpId ? trace.filter(row => row.identity.kpId === kpId) : trace,
    selectedKp: selected,
    validation: resolved.report
  };
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
  for (const group of report.learnerObject.logicGroups) lines.push(
    `${group.identity.logicGroupId} · ${group.identity.label}`, `  ${group.kpIds.join(' → ')}`,
    `  Goal: ${group.goal}`, `  Closure: ${group.closure}`);
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
  const positional = args.filter(arg => arg !== '--json');
  if (positional.some(arg => arg.startsWith('--')) || positional.length < 2 || positional.length > 3) {
    console.error('Usage: node scripts/inspect-xizong-content.mjs <system-id> <block-id-or-slug> [exact-kp-id] [--json]');
    process.exitCode = 2;
  } else {
    try {
      const report = await inspectXizongContent({systemId:positional[0],blockRef:positional[1],kpId:positional[2] || null});
      console.log(json ? JSON.stringify(report,null,2) : formatXizongInspection(report));
    } catch (error) { console.error(String(error?.stack || error)); process.exitCode = 1; }
  }
}
