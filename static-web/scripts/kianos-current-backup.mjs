#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { validatePrivateLearnerCheckpoint } from './privateLearnerStore.mjs';

const args = process.argv.slice(2);
const valueAfter = (flag) => {
  const index = args.indexOf(flag);
  return index >= 0 ? String(args[index + 1] || '').trim() : '';
};

const home = os.homedir();
const defaultSource = path.join(
  process.env.KIANOS_PRIVATE_DIR || path.join(home, 'Library', 'Application Support', 'KianOS', 'learner-state'),
  'latest.json'
);
const source = path.resolve(valueAfter('--source') || defaultSource);
const destinationDir = path.resolve(
  valueAfter('--dest')
  || process.env.KIANOS_BACKUP_DIR
  || path.join(home, 'Documents', 'KianOS Backups')
);

if (!fs.existsSync(source)) {
  console.log(`NO CHECKPOINT YET: ${source}`);
  console.log('Nothing to back up. This is normal before the first real learner session.');
  process.exit(0);
}

let checkpoint;
try {
  checkpoint = validatePrivateLearnerCheckpoint(JSON.parse(fs.readFileSync(source, 'utf8')));
} catch (error) {
  console.error(`BACKUP REFUSED: learner checkpoint is unreadable or invalid: ${error?.message || error}`);
  process.exit(1);
}

fs.mkdirSync(destinationDir, { recursive: true, mode: 0o700 });
try { fs.chmodSync(destinationDir, 0o700); } catch {}

const stamp = checkpoint.generated_at
  .replace(/[:.]/g, '-')
  .replace('T', '_')
  .replace('Z', '');
const safeId = String(checkpoint.checkpoint_id || 'checkpoint')
  .replace(/[^a-zA-Z0-9._-]+/g, '-')
  .slice(0, 48);
const filename = `kianos-learner-${checkpoint.study_day}_${stamp}_${safeId}.json`;
const target = path.join(destinationDir, filename);
const temp = `${target}.tmp-${process.pid}-${Date.now()}`;
const bytes = JSON.stringify(checkpoint, null, 2) + '\n';

fs.writeFileSync(temp, bytes, { encoding: 'utf8', mode: 0o600, flag: 'wx' });
fs.renameSync(temp, target);
try { fs.chmodSync(target, 0o600); } catch {}

console.log('KianOS learner checkpoint backup created.');
console.log(`Source: ${source}`);
console.log(`Backup: ${target}`);
console.log(`Study day: ${checkpoint.study_day}`);
console.log(`Generated: ${checkpoint.generated_at}`);
