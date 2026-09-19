import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'kianos-restore-test-'));
const privateDir = path.join(temp, 'private');
const sourceDir = path.join(temp, 'source');
fs.mkdirSync(privateDir, { recursive: true });
fs.mkdirSync(sourceDir, { recursive: true });

const current = {
  schema: 'kianos.private-checkpoint.v1',
  checkpoint_id: 'checkpoint-current',
  study_day: '2026-09-19',
  generated_at: '2026-09-19T10:00:00.000Z',
  payload: { shared: { current: true }, subjects: { xizong: { value: 'old' } } }
};
const backup = {
  schema: 'kianos.private-checkpoint.v1',
  checkpoint_id: 'checkpoint-backup',
  study_day: '2026-09-20',
  generated_at: '2026-09-20T09:00:00.000Z',
  payload: { shared: { restored: true }, subjects: { xizong: { value: 'new' } } }
};

const latest = path.join(privateDir, 'latest.json');
const source = path.join(sourceDir, 'backup.json');
fs.writeFileSync(latest, JSON.stringify(current), 'utf8');
fs.writeFileSync(source, JSON.stringify(backup), 'utf8');

const run = spawnSync(process.execPath, [
  path.resolve('scripts/kianos-current-restore.mjs'),
  '--from', source
], {
  cwd: process.cwd(),
  env: { ...process.env, KIANOS_PRIVATE_DIR: privateDir },
  encoding: 'utf8'
});

assert.equal(run.status, 0, run.stderr || run.stdout);
const restored = JSON.parse(fs.readFileSync(latest, 'utf8'));
assert.equal(restored.checkpoint_id, 'checkpoint-backup');
assert.equal(restored.study_day, '2026-09-20');
assert.equal(restored.payload.subjects.xizong.value, 'new');

const safetyDir = path.join(privateDir, 'restore-safety');
const safetyFiles = fs.readdirSync(safetyDir).filter((name) => name.endsWith('.json'));
assert.equal(safetyFiles.length, 1);
const safety = JSON.parse(fs.readFileSync(path.join(safetyDir, safetyFiles[0]), 'utf8'));
assert.equal(safety.checkpoint_id, 'checkpoint-current');
assert.equal(safety.payload.subjects.xizong.value, 'old');

if (process.platform !== 'win32') {
  assert.equal(fs.statSync(latest).mode & 0o777, 0o600);
  assert.equal(fs.statSync(path.join(safetyDir, safetyFiles[0])).mode & 0o777, 0o600);
}

const invalid = path.join(sourceDir, 'invalid.json');
fs.writeFileSync(invalid, JSON.stringify({ schema: 'wrong' }), 'utf8');
const beforeInvalid = fs.readFileSync(latest, 'utf8');
const invalidRun = spawnSync(process.execPath, [
  path.resolve('scripts/kianos-current-restore.mjs'),
  '--from', invalid
], {
  cwd: process.cwd(),
  env: { ...process.env, KIANOS_PRIVATE_DIR: privateDir },
  encoding: 'utf8'
});
assert.notEqual(invalidRun.status, 0);
assert.equal(fs.readFileSync(latest, 'utf8'), beforeInvalid, 'invalid backup must not mutate current checkpoint');

const noSource = spawnSync(process.execPath, [
  path.resolve('scripts/kianos-current-restore.mjs')
], {
  cwd: process.cwd(),
  env: { ...process.env, KIANOS_PRIVATE_DIR: privateDir },
  encoding: 'utf8'
});
assert.equal(noSource.status, 2);
assert.match(noSource.stderr, /specify one backup file/);

fs.rmSync(temp, { recursive: true, force: true });
console.log('PASS Current learner checkpoint restore');
