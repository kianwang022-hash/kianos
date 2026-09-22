#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '../..');
const root = path.join(repoRoot, 'content', 'skills');
const fail = (msg) => { throw new Error(msg); };
const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const safe = (base, rel) => {
  if (!rel || path.isAbsolute(rel) || String(rel).split(/[\\/]+/).includes('..')) fail('invalid relative path: ' + rel);
  const full = path.resolve(base, rel);
  if (!(full === base || full.startsWith(base + path.sep))) fail('path escape: ' + rel);
  return full;
};

const library = readJson(path.join(root, 'manifest.json'));
if (library.schema !== 'kianos.skills.manifest.v1') fail('library schema');
const ids = new Set();
for (const row of library.skills || []) {
  if (!row.id || ids.has(row.id)) fail('duplicate/blank skill id: ' + row.id);
  ids.add(row.id);
  const manifestPath = safe(root, row.manifest);
  if (!fs.existsSync(manifestPath)) fail('missing skill manifest: ' + row.id);
  const skill = readJson(manifestPath);
  if (skill.schema !== 'kianos.skill.manifest.v1' || skill.id !== row.id) fail('skill manifest identity: ' + row.id);
  const skillRoot = path.dirname(manifestPath);
  const assetIds = new Set();
  for (const asset of skill.assets || []) {
    if (!asset.id || assetIds.has(asset.id)) fail('duplicate/blank asset: ' + row.id + ':' + asset.id);
    assetIds.add(asset.id);
    const file = safe(skillRoot, asset.path);
    if (!fs.existsSync(file)) fail('missing asset file: ' + row.id + ':' + asset.id);
    if (asset.kind === 'verify' && asset.protected !== true) fail('verify must be protected: ' + row.id + ':' + asset.id);
  }
  if (skill.current_asset && !assetIds.has(skill.current_asset)) fail('unknown current asset: ' + row.id);
  for (const review of skill.source_reviews || []) {
    const file = safe(skillRoot, review.path);
    if (!fs.existsSync(file)) fail('missing source review: ' + row.id + ':' + review.id);
  }
}
console.log(JSON.stringify({ status: 'PASS', skills: ids.size }));
