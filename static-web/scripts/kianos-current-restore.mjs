#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  privateCheckpointPath,
  resolvePrivateLearnerDir,
  validatePrivateLearnerCheckpoint,
  writePrivateLearnerCheckpoint
} from './privateLearnerStore.mjs';

const args = process.argv.slice(2);
const valueAfter = (flag) => {
  const index = args.indexOf(flag);
  return index >= 0 ? String(args[index + 1] || '').trim() : '';
};

const sourceArg = valueAfter('--from');
if (!sourceArg) {
  console.error('RESTORE REFUSED: specify one backup file with --from <path>.');
  process.exit(2);
}

const source = path.resolve(sourceArg.replace(/^~(?=\/)/, os.homedir()));
if (!fs.existsSync(source) || !fs.statSync(source).isFile()) {
  console.error(`RESTORE REFUSED: backup file not found: ${source}`);
  process.exit(2);
}

let checkpoint;
try {
  checkpoint = validatePrivateLearnerCheckpoint(JSON.parse(fs.readFileSync(source, 'utf8')));
} catch (error) {
  console.error(`RESTORE REFUSED: backup is unreadable or invalid: ${error?.message || error}`);
  process.exit(1);
}

const privateDir = resolvePrivateLearnerDir();
fs.mkdirSync(privateDir, { recursive: true, mode: 0o700 });
try { fs.chmodSync(privateDir, 0o700); } catch {}

const destination = privateCheckpointPath(privateDir);
let safetyCopy = null;
if (fs.existsSync(destination)) {
  const safetyDir = path.join(privateDir, 'restore-safety');
  fs.mkdirSync(safetyDir, { recursive: true, mode: 0o700 });
  try { fs.chmodSync(safetyDir, 0o700); } catch {}

  const stamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').replace('Z', '');
  safetyCopy = path.join(safetyDir, `pre-restore-${stamp}.json`);
  fs.copyFileSync(destination, safetyCopy, fs.constants.COPYFILE_EXCL);
  try { fs.chmodSync(safetyCopy, 0o600); } catch {}
}

const restored = writePrivateLearnerCheckpoint(checkpoint, privateDir, { allowOlder: true });

console.log('KianOS learner checkpoint restored to the private recovery store.');
console.log(`Source: ${source}`);
console.log(`Destination: ${destination}`);
if (safetyCopy) console.log(`Previous checkpoint safety copy: ${safetyCopy}`);
console.log(`Study day: ${restored.study_day}`);
console.log(`Generated: ${restored.generated_at}`);
console.log('');
console.log('Safety note: this command does not clear an existing browser profile.');
console.log('Existing browser-local learner state wins by design; private restore is used when local state is empty.');
