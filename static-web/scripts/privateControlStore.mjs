import fs from 'node:fs';
import path from 'node:path';
import { resolvePrivateLearnerDir } from './privateLearnerStore.mjs';
import {
  PRIVATE_CONTROL_RECEIPT_SCHEMA,
  validatePrivateControlCommand
} from '../src/lib/privateControlCommand.mjs';

export const PRIVATE_CONTROL_COMMAND_FILENAME = 'control-command.json';
export const PRIVATE_CONTROL_RECEIPT_FILENAME = 'control-receipt.json';

const atomicWrite = (file, value) => {
  fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 });
  try { fs.chmodSync(path.dirname(file), 0o700); } catch {}
  const temp = file + '.tmp-' + process.pid + '-' + Date.now();
  fs.writeFileSync(temp, JSON.stringify(value, null, 2) + '\n', { encoding:'utf8', mode:0o600 });
  fs.renameSync(temp, file);
  try { fs.chmodSync(file, 0o600); } catch {}
};

const readJson = (file) => {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch (error) {
    if (error?.code === 'ENOENT') return null;
    throw error;
  }
};

export function privateControlCommandPath(privateDir = resolvePrivateLearnerDir()) {
  return path.join(privateDir, PRIVATE_CONTROL_COMMAND_FILENAME);
}

export function privateControlReceiptPath(privateDir = resolvePrivateLearnerDir()) {
  return path.join(privateDir, PRIVATE_CONTROL_RECEIPT_FILENAME);
}

export function readPrivateControlCommand(privateDir = resolvePrivateLearnerDir()) {
  const value = readJson(privateControlCommandPath(privateDir));
  return value == null ? null : validatePrivateControlCommand(value);
}

export function writePrivateControlCommand(value, privateDir = resolvePrivateLearnerDir()) {
  const command = validatePrivateControlCommand(value);
  atomicWrite(privateControlCommandPath(privateDir), command);
  return command;
}

export function validatePrivateControlReceipt(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('PRIVATE_CONTROL_RECEIPT_OBJECT_REQUIRED');
  if (value.schema !== PRIVATE_CONTROL_RECEIPT_SCHEMA) throw new Error('PRIVATE_CONTROL_RECEIPT_SCHEMA_INVALID');
  if (!String(value.command_id || '').trim()) throw new Error('PRIVATE_CONTROL_RECEIPT_COMMAND_ID_REQUIRED');
  if (!String(value.target || '').trim()) throw new Error('PRIVATE_CONTROL_RECEIPT_TARGET_REQUIRED');
  if (!['APPLIED','IDEMPOTENT','STALE','REJECTED','SUPERSEDED','ERROR'].includes(String(value.status || ''))) {
    throw new Error('PRIVATE_CONTROL_RECEIPT_STATUS_INVALID');
  }
  if (!value.applied_at || Number.isNaN(Date.parse(value.applied_at))) throw new Error('PRIVATE_CONTROL_RECEIPT_APPLIED_AT_INVALID');
  return JSON.parse(JSON.stringify(value));
}

export function readPrivateControlReceipt(privateDir = resolvePrivateLearnerDir()) {
  const value = readJson(privateControlReceiptPath(privateDir));
  return value == null ? null : validatePrivateControlReceipt(value);
}

export function writePrivateControlReceipt(value, privateDir = resolvePrivateLearnerDir()) {
  const receipt = validatePrivateControlReceipt(value);
  atomicWrite(privateControlReceiptPath(privateDir), receipt);
  return receipt;
}
