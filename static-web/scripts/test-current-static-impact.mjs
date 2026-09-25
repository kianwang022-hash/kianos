#!/usr/bin/env node
import assert from 'node:assert/strict';

import {
  classifyStaticBuild,
  requiresStaticRuntimeReload,
  staticBuildCanReuseFromBase,
  staticBuildPathImpact
} from './currentStaticImpact.mjs';

const reusable = [
  '.github/retired-branches.txt',
  '.github/workflows/branch-hygiene.yml',
  'tools/kianos_repo_doctor.py',
  'BRANCH_LIFECYCLE.md',
  'CURRENT.md',
  'static-web/CURRENT.md',
  'static-web/STEWARD_PRODUCT_CONTRACT.md',
  'static-web/scripts/kianos-current-sync.mjs',
  'static-web/scripts/privateLearnerBridge.mjs'
];

for (const file of reusable) {
  assert.equal(
    staticBuildPathImpact(file).requires_build,
    false,
    'EXPECTED_REUSABLE:' + file
  );
}

const rebuild = [
  'content/xizong/explanations/manifest.json',
  'content/lexical/words/by-ordinal/o0001.json',
  'static-web/src/pages/index.astro',
  'static-web/src/styles/shared-shell.css',
  'static-web/public/favicon.svg',
  'static-web/package.json',
  'EXAM_ORCHESTRATOR_CURRENT.json',
  'unknown-root-input.json'
];

for (const file of rebuild) {
  assert.equal(
    staticBuildPathImpact(file).requires_build,
    true,
    'EXPECTED_REBUILD:' + file
  );
}

assert.equal(
  classifyStaticBuild([
    '.github/retired-branches.txt',
    'tools/kianos_repo_doctor.py'
  ]).required,
  false,
  'INFRA_ONLY_SHOULD_REUSE_BUILD'
);

assert.equal(
  classifyStaticBuild([
    '.github/retired-branches.txt',
    'content/xizong/explanations/manifest.json'
  ]).required,
  true,
  'MIXED_CHANGE_MUST_REBUILD'
);

assert.deepEqual(
  classifyStaticBuild([]),
  {
    required: false,
    changed_paths: 0,
    build_paths: [],
    reusable_paths: [],
    lexical_projection_required: false,
    lexical_projection_paths: []
  }
);

assert.equal(
  staticBuildCanReuseFromBase({ state: 'synced', sha: 'base-a' }, 'base-a'),
  true,
  'SYNCED_BASE_MAY_REUSE'
);
assert.equal(
  staticBuildCanReuseFromBase({ state: 'synced', sha: 'older' }, 'base-a'),
  false,
  'STALE_BUILD_MUST_NOT_BE_BLESSED_BY_CONTROL_ONLY_COMMIT'
);
assert.equal(
  staticBuildCanReuseFromBase({ state: 'degraded', sha: 'base-a' }, 'base-a'),
  false,
  'DEGRADED_BASE_MUST_REBUILD'
);
assert.equal(
  staticBuildCanReuseFromBase(null, 'base-a'),
  false,
  'MISSING_BUILD_PROOF_MUST_REBUILD'
);
assert.equal(
  staticBuildCanReuseFromBase({ state: 'synced', sha: 'base-a' }, ''),
  false,
  'MISSING_BASE_SHA_MUST_REBUILD'
);

console.log('STATIC_CURRENT_IMPACT PASS');

for (const file of ['static-web/src/lib/privateControlCommand.mjs',
  'static-web/src/lib/sharedControlCheckpoint.mjs',
  'static-web/scripts/privateControlStore.mjs']) {
  assert.equal(requiresStaticRuntimeReload([file]), true, file);
}
assert.equal(requiresStaticRuntimeReload(['content/xizong/explanations/manifest.json', 'CURRENT.md']), false);

assert.equal(classifyStaticBuild(['content/xizong/explanations/manifest.json']).lexical_projection_required, false);
for (const file of ['content/lexical/words/by-ordinal/o0001.json',
  'content/lexical/relations/by-id/aa/a.json',
  'content/lexical/final-learner-object-decisions.json',
  'tools/lexical_build_final_learner_objects.py']) {
  assert.equal(classifyStaticBuild([file]).lexical_projection_required, true, file);
}

// Keep the process-level regression on the existing Current CI entrypoint.
await import('./test-current-runtime-reload.mjs');
