import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
const root = fileURLToPath(new URL('../../', import.meta.url));
// Test receipt only; not a product owner, admission list or evidence store.
export function writeBTestProof(name, details, ownerPaths = []) {
  const files = [
    'content/xizong/LEARNING_CONTRACT.md',
    'content/xizong/knowledge/learner/BIOCHEMISTRY_CONTRACT.md',
    'content/xizong/knowledge/learner/b-digestive-metabolic-endocrine-tumor-learning.json',
    'content/xizong/knowledge/learner/b-digestive-metabolic-endocrine-tumor-learning-cues.json',
    'content/xizong/knowledge/learner/biochemistry-27-source-map.json',
    'content/xizong/knowledge/learner/shared-fields.json',
    'content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/system.json',
    ...['xizong.mjs', 'xizongAcceptedLearningOwner.mjs', 'xizongSemanticAdapter.mjs', 'xizongProductionProjection.mjs', 'xizongLearnerObject.mjs', 'xizongContentRevision.mjs', 'xizongRevisionWitness.mjs', 'xizongLearningCues.mjs', 'xizongMemoryAutoRelease.mjs', 'xizongMemoryModel.mjs', 'xizongMemoryRelease.mjs'].map(file => `static-web/src/lib/${file}`),
    ...['XizongBlockV6.astro', 'XizongRuntimeStageGuard.astro', 'XizongRecallEvidenceBridge.astro', 'XizongStudyEnhancer.astro', 'XizongKpLearnInteraction.astro'].map(file => `static-web/src/components/${file}`),
    `static-web/scripts/test-${name}.mjs`, 'static-web/scripts/xizong-b-test-proof.mjs', 'static-web/scripts/fixtures/xizong-b-readiness-preintegration.json', ...ownerPaths
  ];
  const hashes = Object.fromEntries([...new Set(files)].filter(file => fs.existsSync(path.join(root, file))).map(file => [file,
    crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex')]));
  let testedCommit = null;
  try {
    const options = { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] };
    const gitRoot = execFileSync('git', ['rev-parse', '--show-toplevel'], options).trim();
    if (path.resolve(gitRoot) === path.resolve(root)) testedCommit = execFileSync('git', ['rev-parse', 'HEAD'], options).trim();
  } catch {}
  const report = { status: 'PASS', testedCommit, ciRequestedCommit: process.env.GITHUB_SHA || null, node: process.version,
    evidenceScope: 'Native/controller or isolated raw-owner tests only; no browser, original image inspection, medical acceptance or learner U claim.',
    ...details, sha256: hashes };
  const destination = path.join(root, 'static-web/.qa', `${name}.json`);
  fs.mkdirSync(path.dirname(destination), { recursive: true }); fs.writeFileSync(destination, `${JSON.stringify(report, null, 2)}\n`);
  return report;
}
