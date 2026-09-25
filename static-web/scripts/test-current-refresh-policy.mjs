import assert from 'node:assert/strict';
import { createCurrentRefreshPolicy } from '../src/lib/currentRefreshPolicy.mjs';

const policy = createCurrentRefreshPolicy();

let state = policy.observe('sha-a');
assert.equal(state.status, 'unknown-document');
assert.equal(state.reload, false);

state = policy.observe('sha-a');
assert.equal(state.status, 'unknown-document');
assert.equal(state.reload, false);

state = policy.observe('sha-b');
assert.equal(state.status, 'unknown-document');
assert.equal(state.reload, false, 'foreground polling must never force a reload');

state = policy.observe('sha-c');
assert.equal(state.status, 'unknown-document');
assert.equal(state.reload, false);
assert.equal(state.pending_sha, 'sha-c', 'latest synced Current should win while reload is deferred');

state = policy.onForegroundReturn();
assert.equal(state.status, 'current');
assert.equal(state.reload, false, 'missing document identity must not adopt a server identity');
assert.equal(state.pending_sha, 'sha-c');

const clean = createCurrentRefreshPolicy();
clean.observe('same');
assert.equal(clean.onForegroundReturn().reload, false);

const documentA = createCurrentRefreshPolicy('sha-a');
state = documentA.observe('sha-b');
assert.equal(state.status, 'pending');
assert.equal(state.reload, false);
assert.equal(documentA.onForegroundReturn().reload, true);
assert.equal(documentA.snapshot().baseline_sha, 'sha-a');

console.log('PASS Current non-interrupting refresh policy');
