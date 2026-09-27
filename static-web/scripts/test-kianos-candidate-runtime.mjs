#!/usr/bin/env node
import assert from 'node:assert/strict';
import path from 'node:path';

import {
  DEFAULT_CANDIDATE_HOST,
  DEFAULT_CANDIDATE_PORT,
  STABLE_CURRENT_PORT,
  isolatedCandidateEnv,
  resolveCandidateConfig
} from './kianos-candidate-runtime.mjs';

assert.equal(DEFAULT_CANDIDATE_HOST, '127.0.0.1');
assert.equal(DEFAULT_CANDIDATE_PORT, 4322);
assert.equal(STABLE_CURRENT_PORT, 4321);

const defaults = resolveCandidateConfig({});
assert.equal(defaults.host, '127.0.0.1');
assert.equal(defaults.port, 4322);
assert.equal(defaults.base, 'http://127.0.0.1:4322/');
assert.equal(defaults.openBrowser, true);

const custom = resolveCandidateConfig({
  KIANOS_CANDIDATE_HOST: 'localhost',
  KIANOS_CANDIDATE_PORT: '4332',
  KIANOS_CANDIDATE_OPEN: '0'
});
assert.equal(custom.host, 'localhost');
assert.equal(custom.port, 4332);
assert.equal(custom.openBrowser, false);

assert.throws(
  () => resolveCandidateConfig({ KIANOS_CANDIDATE_PORT: '4321' }),
  /KIANOS_CANDIDATE_MUST_NOT_USE_STABLE_PORT_4321/
);
assert.throws(
  () => resolveCandidateConfig({ KIANOS_CANDIDATE_PORT: 'not-a-port' }),
  /KIANOS_CANDIDATE_PORT_INVALID/
);

const root = path.resolve('/tmp/kianos-candidate-test');
const isolated = isolatedCandidateEnv(root, {
  KIANOS_PRIVATE_DIR: '/real/private',
  KIANOS_CONTROL_DIR: '/real/control',
  KIANOS_CONTROL_ENABLED: '1',
  KIANOS_PACKET_RELAY_ENABLED: '1'
}, 'candidate-test');
assert.equal(isolated.KIANOS_CANDIDATE_RUNTIME, '1');
assert.equal(isolated.KIANOS_RELEASE_SHA, 'candidate-test');
assert.equal(isolated.KIANOS_ASTRO_ALLOW_LIVE_PRIVATE, '0');
assert.equal(isolated.KIANOS_PRIVATE_DIR, path.join(root, 'learner-state'));
assert.equal(isolated.KIANOS_CONTROL_DIR, path.join(root, 'control'));
assert.equal(isolated.KIANOS_CONTROL_REPO_DIR, path.join(root, 'control-repo'));
assert.equal(isolated.KIANOS_PACKET_REPO_DIR, path.join(root, 'packet-repo'));
assert.equal(isolated.KIANOS_EXTERNAL_READING_DIR, path.join(root, 'external-reading'));
assert.equal(isolated.KIANOS_ENGLISH_GENERATED_DIR, path.join(root, 'english-generated'));
assert.equal(isolated.KIANOS_CONTROL_ENABLED, '0');
assert.equal(isolated.KIANOS_PACKET_RELAY_ENABLED, '0');

console.log('KIANOS_CANDIDATE_RUNTIME PASS: fixed lane, stable-port guard and private isolation');
