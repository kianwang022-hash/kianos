#!/usr/bin/env node
import assert from 'node:assert/strict';

import {
  classifyStaticBuild,
  staticBuildPathImpact
} from './currentStaticImpact.mjs';

const reusable = [
  '.github/retired-branches.txt',
  '.github/workflows/branch-hygiene.yml',
  'tools/kianos_repo_doctor.py',
  'BRANCH_LIFECYCLE.md',
  'CURRENT.md',
  'static-web/CURRENT.md',
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
    reusable_paths: []
  }
);

console.log('STATIC_CURRENT_IMPACT PASS');
