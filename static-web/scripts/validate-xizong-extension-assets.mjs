import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  EXTENSION_SCHEMA,
  allXizongExtensionAssets,
  createCurrentExtensionOwnerContext,
  validateExtensionAsset,
  validateExtensionManifests
} from '../src/lib/xizongExtensionAssets.mjs';

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(webRoot, '..');
const learnerRoot = path.join(repoRoot, 'content/xizong/knowledge/learner');
const rendererPath = path.join(webRoot, 'src/components/XizongExtensionAssets.astro');
const failures = [];

function check(condition, message) {
  if (!condition) failures.push(message);
}

function expectFailure(label, expectedCode, fn) {
  try {
    fn();
    failures.push(`${label}: accepted invalid input`);
  } catch (error) {
    const message = String(error?.message || error);
    if (!message.includes(expectedCode)) failures.push(`${label}: unexpected error ${message}`);
  }
}

const fixtureBlock = {
  blockId: 'fixture-b01',
  systemId: 'fixture',
  canonicalId: 'F1'
};
const fixtureLoadedBlock = {
  ...fixtureBlock,
  logicGroups: [
    { groupId: 'fixture-b01-lg01', kpIds: ['fixture-b01-kp01'] },
    { groupId: 'fixture-b01-lg02', kpIds: ['fixture-b01-kp02'] }
  ],
  kpRecords: [{ kpId: 'fixture-b01-kp01' }, { kpId: 'fixture-b01-kp02' }]
};
const fixtureContext = {
  systemsById: new Map([['fixture', { systemId: 'fixture', canonicalId: 'F1' }]]),
  blocks: new Map([[fixtureBlock.blockId, fixtureBlock]]),
  loadedBlocks: new Map([[fixtureBlock.blockId, fixtureLoadedBlock]]),
  cuesBySystem: new Map()
};

const tableAsset = {
  slot_id: 'fixture-table',
  owner: { block_id: fixtureBlock.blockId, logic_group_id: 'fixture-b01-lg01' },
  asset_type: 'STRUCTURED_TABLE',
  revision: 1,
  title: 'Fixture table',
  provenance: { kind: 'CHAT_STRUCTURED_FROM_CURRENT' },
  display_policy: { timing: 'LEARNING_MOMENT', default_state: 'EXPANDED' },
  payload: {
    columns: [{ key: 'left', label: 'Left' }, { key: 'right', label: 'Right' }],
    rows: [{ left: 'A', right: 'B' }]
  }
};

const compositeOwnerAsset = {
  ...tableAsset,
  slot_id: 'fixture-table-kp-owned',
  owner: {
    block_id: fixtureBlock.blockId,
    logic_group_id: 'fixture-b01-lg01',
    kp_id: 'fixture-b01-kp01'
  },
  display_policy: { timing: 'POST_REVEAL', default_state: 'COLLAPSED' }
};

const imageAsset = {
  slot_id: 'fixture-image',
  owner: { block_id: fixtureBlock.blockId, logic_group_id: 'fixture-b01-lg01' },
  asset_type: 'SOURCE_VISUAL',
  revision: 1,
  title: 'Fixture image',
  provenance: { kind: 'LECTURE_SOURCE', source_locator: 'Fixture PDF P1' },
  display_policy: { timing: 'LEARNING_MOMENT', default_state: 'EXPANDED' },
  payload: {
    asset_path: 'fixture/fixture.webp',
    width: 100,
    height: 50,
    alt: 'Fixture image',
    source_crop_sha256: 'a'.repeat(64),
    derived_asset_sha256: 'a'.repeat(64)
  }
};

validateExtensionAsset(tableAsset, { context: fixtureContext, detail: 'fixture:valid-table' });
validateExtensionAsset(compositeOwnerAsset, { context: fixtureContext, detail: 'fixture:valid-composite-owner' });
expectFailure('KP outside declared Logic Group', 'OWNER_KP_OUTSIDE_LOGIC_GROUP', () => validateExtensionAsset({
  ...compositeOwnerAsset,
  slot_id: 'fixture-table-kp-outside-group',
  owner: {
    block_id: fixtureBlock.blockId,
    logic_group_id: 'fixture-b01-lg01',
    kp_id: 'fixture-b01-kp02'
  }
}, { context: fixtureContext, detail: 'fixture:bad-composite-owner' }));
expectFailure('duplicate active slot', 'SLOT_DUPLICATE', () => validateExtensionManifests([
  { fileName: 'one', raw: { schema: EXTENSION_SCHEMA, status: 'CURRENT', authority: 'CHAT_APPROVED', assets: [tableAsset] } },
  { fileName: 'two', raw: { schema: EXTENSION_SCHEMA, status: 'CURRENT', authority: 'CHAT_APPROVED', assets: [{ ...tableAsset }] } }
], { context: fixtureContext }));
expectFailure('unknown owner anchor', 'OWNER_BLOCK_UNKNOWN', () => validateExtensionAsset({
  ...tableAsset,
  owner: { block_id: 'fixture-unknown', logic_group_id: 'fixture-unknown-lg01' }
}, { context: fixtureContext, detail: 'fixture:bad-owner' }));
expectFailure('malformed structured table', 'TABLE_COLUMN_DUPLICATE', () => validateExtensionAsset({
  ...tableAsset,
  payload: {
    columns: [{ key: 'same', label: 'A' }, { key: 'same', label: 'B' }],
    rows: [{ same: 'value' }]
  }
}, { context: fixtureContext, detail: 'fixture:bad-table' }));
expectFailure('bad image hash', 'IMAGE_HASH_MISMATCH', () => validateExtensionAsset({
  ...imageAsset,
  payload: { ...imageAsset.payload, derived_asset_sha256: 'b'.repeat(64) }
}, {
  context: fixtureContext,
  detail: 'fixture:bad-image-hash',
  resolveImage: () => ({ exists: true, sha256: 'a'.repeat(64), src: 'fixture://image' })
}));
expectFailure('unsafe display timing', 'DISPLAY_OWNER_TIMING_UNSAFE', () => validateExtensionAsset({
  ...tableAsset,
  display_policy: { timing: 'ORIENTATION_SAFE', default_state: 'EXPANDED' },
  owner: { block_id: fixtureBlock.blockId, kp_id: 'fixture-b01-kp01' }
}, { context: fixtureContext, detail: 'fixture:unsafe-timing' }));

const currentFiles = fs.existsSync(learnerRoot)
  ? fs.readdirSync(learnerRoot).filter((name) => name.endsWith('-extensions.json')).sort()
  : [];
const currentManifests = currentFiles.map((fileName) => ({
  fileName,
  manifestPath: `content/xizong/knowledge/learner/${fileName}`,
  raw: JSON.parse(fs.readFileSync(path.join(learnerRoot, fileName), 'utf8'))
}));
const current = validateExtensionManifests(currentManifests, { context: createCurrentExtensionOwnerContext() });
check(currentFiles.length >= 1, 'Current extension registry convention is missing');
check(allXizongExtensionAssets().length === current.assets.length, 'runtime loader and validator asset counts diverge');
const infrastructureRegistry = currentManifests.find((item) => item.fileName === 'xizong-extensions.json');
check(!infrastructureRegistry || infrastructureRegistry.raw.assets.length === 0, 'infrastructure registry must remain content-free');

const renderer = fs.readFileSync(rendererPath, 'utf8');
for (const marker of [
  'data-kp-answer',
  'POST_REVEAL',
  'xizongExtensionTable',
  'data-study-stage="logic_group"',
  'data-study-stage="group_close"',
  "default_state === 'COLLAPSED'",
  '!asset.owner?.kp_id'
]) {
  check(renderer.includes(marker), `generic renderer contract marker missing: ${marker}`);
}

if (failures.length) {
  console.error('Xizong Extension Asset validation FAILED');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(JSON.stringify({
  status: 'PASS',
  schema: EXTENSION_SCHEMA,
  manifests: currentFiles.length,
  active_assets: current.assets.length,
  renderer: 'GENERIC_OWNER_AND_TIMING_SURFACES',
  owner_contract: 'BLOCK_PLUS_OPTIONAL_LG_PLUS_OPTIONAL_CANONICAL_KP_WITH_MEMBERSHIP_CHECK',
  mutations: {
    duplicate_slot: 'REJECTED',
    bad_owner: 'REJECTED',
    kp_outside_logic_group: 'REJECTED',
    malformed_table: 'REJECTED',
    bad_image_hash: 'REJECTED',
    unsafe_display_timing: 'REJECTED'
  },
  legacy_source_visual_pipeline: 'UNMODIFIED_COMPATIBILITY_PATH'
}, null, 2));
