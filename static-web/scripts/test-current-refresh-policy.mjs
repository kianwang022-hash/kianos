import assert from 'node:assert/strict';
import { createCurrentRefreshPolicy } from '../src/lib/currentRefreshPolicy.mjs';

const policy = createCurrentRefreshPolicy();

let state = policy.observe('sha-a');
assert.equal(state.status, 'baseline');
assert.equal(state.reload, false);

state = policy.observe('sha-a');
assert.equal(state.status, 'current');
assert.equal(state.reload, false);

state = policy.observe('sha-b');
assert.equal(state.status, 'pending');
assert.equal(state.reload, false, 'foreground polling must never force a reload');

state = policy.observe('sha-c');
assert.equal(state.status, 'pending');
assert.equal(state.reload, false);
assert.equal(state.pending_sha, 'sha-c', 'latest synced Current should win while reload is deferred');

state = policy.onForegroundReturn();
assert.equal(state.status, 'reload');
assert.equal(state.reload, true);
assert.equal(state.pending_sha, 'sha-c');

const clean = createCurrentRefreshPolicy();
clean.observe('same');
assert.equal(clean.onForegroundReturn().reload, false);

console.log('PASS Current non-interrupting refresh policy');
