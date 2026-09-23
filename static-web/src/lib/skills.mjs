import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';
import crypto from 'node:crypto';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '../../..');
const skillsRoot = path.join(repoRoot, 'content', 'skills');

function readUtf8(file) { return fs.readFileSync(file, 'utf8'); }
function readJson(file) { return JSON.parse(readUtf8(file)); }

function assertSafeRelative(value, label) {
  const raw = String(value || '');
  if (!raw || path.isAbsolute(raw) || raw.split(/[\\/]+/).includes('..')) {
    throw new Error('SKILL_LIBRARY_INVALID_PATH:' + label);
  }
  return raw;
}

function resolveWithin(root, relative, label) {
  const safe = assertSafeRelative(relative, label);
  const full = path.resolve(root, safe);
  if (!(full === root || full.startsWith(root + path.sep))) {
    throw new Error('SKILL_LIBRARY_PATH_ESCAPE:' + label);
  }
  return full;
}

function normalizeAsset(asset) {
  return {
    id: String(asset?.id || ''),
    unit_id: String(asset?.unit_id || ''),
    kind: String(asset?.kind || 'unit'),
    stage: String(asset?.stage || asset?.kind || 'unit'),
    title: String(asset?.title || ''),
    label: String(asset?.label || ''),
    path: String(asset?.path || ''),
    order: Number(asset?.order || 0),
    learner_visible: asset?.learner_visible !== false,
    protected: asset?.protected === true,
    chat_review: asset?.chat_review === true,
    provisional: asset?.provisional === true,
    completable: asset?.completable === true
  };
}

function normalizeUnit(unit) {
  return {
    id: String(unit?.id || ''),
    title: String(unit?.title || ''),
    capability: String(unit?.capability || ''),
    order: Number(unit?.order || 0),
    next_unit: unit?.next_unit == null ? null : String(unit.next_unit),
    assets: { ...(unit?.assets || {}) }
  };
}

function validateSkillManifest(input, expectedId) {
  if (!input || input.schema !== 'kianos.skill.manifest.v1') throw new Error('SKILL_MANIFEST_SCHEMA_INVALID:' + expectedId);
  if (String(input.id || '') !== expectedId) throw new Error('SKILL_MANIFEST_ID_MISMATCH:' + expectedId);
  const assets = Array.isArray(input.assets) ? input.assets.map(normalizeAsset) : [];
  const ids = new Set();
  for (const asset of assets) {
    if (!asset.id || !asset.title || !asset.path) throw new Error('SKILL_ASSET_INVALID:' + expectedId);
    if (ids.has(asset.id)) throw new Error('SKILL_ASSET_DUPLICATE:' + expectedId + ':' + asset.id);
    ids.add(asset.id);
  }
  if (input.current_asset && !ids.has(String(input.current_asset))) throw new Error('SKILL_CURRENT_ASSET_UNKNOWN:' + expectedId);
  const units = Array.isArray(input.units) ? input.units.map(normalizeUnit).sort((a,b) => a.order - b.order) : [];
  const unitIds = new Set();
  for (const unit of units) {
    if (!unit.id || !unit.title || unitIds.has(unit.id)) throw new Error('SKILL_UNIT_INVALID:' + expectedId + ':' + unit.id);
    unitIds.add(unit.id);
    for (const [stage, assetId] of Object.entries(unit.assets || {})) {
      if (!assetId || !ids.has(String(assetId))) throw new Error('SKILL_UNIT_ASSET_UNKNOWN:' + expectedId + ':' + unit.id + ':' + stage);
      const asset = assets.find((row) => row.id === String(assetId));
      if (asset?.unit_id && asset.unit_id !== unit.id) throw new Error('SKILL_UNIT_ASSET_MISMATCH:' + expectedId + ':' + unit.id + ':' + stage);
    }
  }
  for (const unit of units) if (unit.next_unit && !unitIds.has(unit.next_unit)) throw new Error('SKILL_UNIT_NEXT_UNKNOWN:' + expectedId + ':' + unit.id);
  return { ...input, assets: assets.sort((a,b) => a.order - b.order), units };
}

export function loadSkillLibrary() {
  const manifest = readJson(path.join(skillsRoot, 'manifest.json'));
  if (manifest?.schema !== 'kianos.skills.manifest.v1') throw new Error('SKILL_LIBRARY_SCHEMA_INVALID');
  const rows = Array.isArray(manifest.skills) ? manifest.skills : [];
  const ids = new Set();
  return rows.map((row) => {
    const id = String(row?.id || '');
    if (!id || ids.has(id)) throw new Error('SKILL_LIBRARY_ID_INVALID:' + id);
    ids.add(id);
    const manifestRel = assertSafeRelative(row.manifest, id + ':manifest');
    const skillRoot = path.join(skillsRoot, path.dirname(manifestRel));
    const skillManifest = validateSkillManifest(readJson(resolveWithin(skillsRoot, manifestRel, id + ':manifest')), id);
    return { ...row, id, order: Number(row?.order || 0), manifest: skillManifest, skillRoot };
  }).sort((a,b) => a.order - b.order);
}

export function listSkills() {
  return loadSkillLibrary().map((row) => ({
    id: row.id,
    title: String(row.title || row.manifest.title || row.id),
    subtitle: String(row.subtitle || row.manifest.description || ''),
    portfolioState: String(row.portfolio_state || row.manifest.portfolio_state || ''),
    status: String(row.manifest.status || ''),
    currentAsset: String(row.manifest.current_asset || ''),
    assets: row.manifest.assets.filter((asset) => asset.learner_visible),
    units: row.manifest.units || []
  }));
}

export function loadSkill(skillId) {
  const row = loadSkillLibrary().find((item) => item.id === skillId);
  if (!row) throw new Error('SKILL_NOT_FOUND:' + skillId);
  return {
    id: row.id,
    title: String(row.title || row.manifest.title || row.id),
    subtitle: String(row.subtitle || row.manifest.description || ''),
    portfolioState: String(row.portfolio_state || row.manifest.portfolio_state || ''),
    status: String(row.manifest.status || ''),
    manifest: row.manifest,
    skillRoot: row.skillRoot,
    assets: row.manifest.assets.filter((asset) => asset.learner_visible),
    units: row.manifest.units || []
  };
}

export function loadSkillAsset(skillId, assetId) {
  const skill = loadSkill(skillId);
  const asset = skill.assets.find((item) => item.id === assetId);
  if (!asset) throw new Error('SKILL_ASSET_NOT_FOUND:' + skillId + ':' + assetId);
  const file = resolveWithin(skill.skillRoot, asset.path, skillId + ':' + assetId);
  if (!fs.existsSync(file)) throw new Error('SKILL_ASSET_FILE_MISSING:' + skillId + ':' + assetId);
  const markdown = readUtf8(file);
  const html = marked.parse(markdown, { gfm: true, breaks: false });
  return { skill, asset, markdown, html };
}

export function listSkillAssetRoutes() {
  return listSkills().flatMap((skill) => skill.assets.map((asset) => ({ skillId: skill.id, assetId: asset.id })));
}

export function skillAssetHref(base, skillId, assetId) {
  return base + 'skills/' + encodeURIComponent(skillId) + '/' + encodeURIComponent(assetId) + '/';
}


export function skillUnitForAsset(skill, assetId) {
  const asset = skill.assets.find((item) => item.id === assetId);
  if (!asset?.unit_id) return null;
  return (skill.units || []).find((unit) => unit.id === asset.unit_id) || null;
}

export function skillUnitFingerprint(skillId, unitId) {
  const skill = loadSkill(skillId);
  const unit = (skill.units || []).find((row) => row.id === unitId);
  if (!unit) throw new Error('SKILL_UNIT_NOT_FOUND:' + skillId + ':' + unitId);
  const hash = crypto.createHash('sha256');
  hash.update(JSON.stringify({ skill_id:skill.id, unit }));
  const assetIds = Object.values(unit.assets || {}).map(String);
  for (const assetId of assetIds) {
    const asset = skill.manifest.assets.find((row) => row.id === assetId);
    if (!asset) throw new Error('SKILL_UNIT_ASSET_NOT_FOUND:' + assetId);
    hash.update('\n' + asset.id + '\n' + readUtf8(resolveWithin(skill.skillRoot, asset.path, asset.id)));
  }
  const review = (skill.manifest.source_reviews || []).find((row) => String(row?.unit_id || '') === unitId);
  if (review?.path) hash.update('\nsource-review\n' + readUtf8(resolveWithin(skill.skillRoot, review.path, unitId + ':source-review')));
  return 'hu-' + hash.digest('hex').slice(0, 16);
}
