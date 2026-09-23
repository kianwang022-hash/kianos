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

  const unitIds = new Set();
  const requiredStages = ['learn','reconstruct','verify','compression','transfer'];
  for (const unit of skill.units || []) {
    if (!unit.id || unitIds.has(unit.id)) fail('duplicate/blank unit: ' + row.id + ':' + unit.id);
    unitIds.add(unit.id);
    if (skill.cognition_model === 'EXPAND_RECONSTRUCT_VERIFY_COMPRESS_TRANSFER_USE') {
      for (const stage of requiredStages) {
        const assetId = unit.assets?.[stage];
        if (!assetId || !assetIds.has(assetId)) fail('missing cognition stage: ' + row.id + ':' + unit.id + ':' + stage);
        const asset = (skill.assets || []).find((candidate) => candidate.id === assetId);
        if (asset?.unit_id !== unit.id || asset?.stage !== stage) fail('cognition stage mismatch: ' + row.id + ':' + unit.id + ':' + stage);
        if (['verify','transfer'].includes(stage) && (asset.protected !== true || asset.chat_review !== true)) {
          fail('evidence stage must be protected/chat-reviewed: ' + row.id + ':' + unit.id + ':' + stage);
        }
      }
    }
  }
  for (const unit of skill.units || []) if (unit.next_unit && !unitIds.has(unit.next_unit)) fail('unknown next unit: ' + row.id + ':' + unit.id);

  for (const review of skill.source_reviews || []) {
    const file = safe(skillRoot, review.path);
    if (!fs.existsSync(file)) fail('missing source review: ' + row.id + ':' + review.id);
    if (review.unit_id && !unitIds.has(review.unit_id)) fail('source review unit unknown: ' + row.id + ':' + review.id);
  }
  if (skill.cognition_model === 'EXPAND_RECONSTRUCT_VERIFY_COMPRESS_TRANSFER_USE') {
    for (const unitId of unitIds) if (!(skill.source_reviews || []).some((review) => review.unit_id === unitId)) fail('missing unit source review: ' + row.id + ':' + unitId);
    if (!skill.learning_design) fail('missing skill learning design: ' + row.id);
    const learningDesign = safe(skillRoot, skill.learning_design);
    if (!fs.existsSync(learningDesign)) fail('missing skill learning design file: ' + row.id);
    for (const asset of skill.assets || []) {
      if (asset.stage === 'compression' && asset.provisional !== true) fail('unit compression must remain provisional: ' + row.id + ':' + asset.id);
    }
  }
}
console.log(JSON.stringify({ status: 'PASS', skills: ids.size }));
