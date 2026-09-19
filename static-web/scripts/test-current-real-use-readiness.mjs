import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(process.cwd(), '..');
const staticRoot = process.cwd();

const rootPkg = JSON.parse(fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8'));
const staticPkg = JSON.parse(fs.readFileSync(path.join(staticRoot, 'package.json'), 'utf8'));
const installer = fs.readFileSync(path.join(staticRoot, 'scripts', 'install-current-macos.sh'), 'utf8');
const doctor = fs.readFileSync(path.join(staticRoot, 'scripts', 'kianos-current-doctor.mjs'), 'utf8');
const opener = fs.readFileSync(path.join(staticRoot, 'scripts', 'kianos-current-open.mjs'), 'utf8');

assert.equal(rootPkg.scripts['current:install'], 'bash static-web/scripts/install-current-macos.sh');
assert.equal(rootPkg.scripts['current:doctor'], 'node static-web/scripts/kianos-current-doctor.mjs');
assert.equal(rootPkg.scripts['current:open'], 'node static-web/scripts/kianos-current-open.mjs');

assert.equal(staticPkg.scripts['current:doctor'], 'node scripts/kianos-current-doctor.mjs');
assert.equal(staticPkg.scripts['current:open'], 'node scripts/kianos-current-open.mjs');

for (const required of [
  'KianOS-current',
  'com.kianos.current-mirror',
  'learner-state',
  'chmod 700',
  'kianos-current-doctor.mjs'
]) {
  assert.ok(installer.includes(required), `installer missing: ${required}`);
}

for (const required of [
  'kianos-current-mirror',
  'com.kianos.current-mirror',
  '__kianos-current.json',
  'GitHub main sync',
  'Private learner-state directory',
  'Private checkpoint bridge',
  'External Reading private source',
  '/__kianos-private/checkpoint',
  '/__kianos-private/external-reading/status',
  'waitForMirrorSha',
  'mode === 0o700',
  'READY: KianOS Current is ready for learner use'
]) {
  assert.ok(doctor.includes(required), `doctor missing: ${required}`);
}

for (const required of [
  'launchctl',
  'kickstart',
  'current:install',
  'current:doctor',
  '/usr/bin/open'
]) {
  assert.ok(opener.includes(required), `opener missing: ${required}`);
}

console.log('PASS Current real-use readiness contract');
