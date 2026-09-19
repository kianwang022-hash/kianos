import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'kianos-backup-test-'));
const sourceDir = path.join(temp, 'source');
const backupDir = path.join(temp, 'backup');
fs.mkdirSync(sourceDir, { recursive: true });

const checkpoint = {
  schema: 'kianos.private-checkpoint.v1',
  checkpoint_id: 'checkpoint-test-1',
  study_day: '2026-09-20',
  generated_at: '2026-09-20T01:02:03.000Z',
  payload: {
    shared: { schema: 'fixture.shared' },
    subjects: { xizong: { schema: 'fixture.xizong' } }
  }
};
const source = path.join(sourceDir, 'latest.json');
fs.writeFileSync(source, JSON.stringify(checkpoint), 'utf8');

const run = spawnSync(process.execPath, [
  path.resolve('scripts/kianos-current-backup.mjs'),
  '--source', source,
  '--dest', backupDir
], {
  cwd: process.cwd(),
  encoding: 'utf8'
});

assert.equal(run.status, 0, run.stderr || run.stdout);
const files = fs.readdirSync(backupDir).filter((name) => name.endsWith('.json'));
assert.equal(files.length, 1);

const copied = JSON.parse(fs.readFileSync(path.join(backupDir, files[0]), 'utf8'));
assert.equal(copied.schema, checkpoint.schema);
assert.equal(copied.checkpoint_id, checkpoint.checkpoint_id);
assert.equal(copied.study_day, checkpoint.study_day);
assert.deepEqual(copied.payload, checkpoint.payload);

if (process.platform !== 'win32') {
  const mode = fs.statSync(path.join(backupDir, files[0])).mode & 0o777;
  assert.equal(mode, 0o600);
}

const missing = spawnSync(process.execPath, [
  path.resolve('scripts/kianos-current-backup.mjs'),
  '--source', path.join(temp, 'missing.json'),
  '--dest', backupDir
], {
  cwd: process.cwd(),
  encoding: 'utf8'
});
assert.equal(missing.status, 0);
assert.match(missing.stdout, /NO CHECKPOINT YET/);

fs.rmSync(temp, { recursive: true, force: true });
console.log('PASS Current learner checkpoint backup');
