import fs from 'node:fs';
import path from 'node:path';

// A synchronous, task-local read snapshot, not a persistent content registry.
// Nothing survives compilation; a subsequent compile sees current owner bytes.
let current = null;
export function withXizongCompileContext(resolve) {
  if (current) return resolve();
  current = { bytes: new Map(), json: new Map(), values: new Map() };
  try { return resolve(); } finally { current = null; }
}
export function readXizongCompileFile(file, encoding = null) {
  const key = path.resolve(file);
  if (!current) return fs.readFileSync(key, encoding || undefined);
  if (!current.bytes.has(key)) current.bytes.set(key, fs.readFileSync(key));
  const bytes = current.bytes.get(key);
  return encoding ? bytes.toString(encoding) : bytes;
}
export function readXizongCompileJson(file) {
  const key = path.resolve(file);
  if (!current) return JSON.parse(readXizongCompileFile(key, 'utf8'));
  if (!current.json.has(key)) current.json.set(key, JSON.parse(readXizongCompileFile(key, 'utf8')));
  return current.json.get(key);
}
export function memoXizongCompile(key, resolve) {
  if (!current) return resolve();
  if (!current.values.has(key)) current.values.set(key, resolve());
  return current.values.get(key);
}
export function seedXizongCompile(key, value) { if (current) current.values.set(key, value); }
