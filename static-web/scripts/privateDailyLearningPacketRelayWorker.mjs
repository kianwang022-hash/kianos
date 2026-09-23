#!/usr/bin/env node
import path from 'node:path';

import { syncPrivateDailyLearningPacketOnce } from './privateDailyLearningPacketRelay.mjs';

const args = process.argv.slice(2);
const valueAfter = (flag) => {
  const index = args.indexOf(flag);
  return index >= 0 ? String(args[index + 1] || '').trim() : '';
};

const privateDirArg = valueAfter('--private-dir');
const privateDir = privateDirArg ? path.resolve(privateDirArg) : null;

try {
  const result = await syncPrivateDailyLearningPacketOnce({
    privateDir
  });
  process.stdout.write(JSON.stringify(result) + '\n');
} catch (error) {
  console.error(error instanceof Error ? (error.stack || error.message) : String(error));
  process.exit(1);
}
