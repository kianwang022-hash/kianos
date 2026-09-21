import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('../content/politics/analysis-output');

const normalizeMaterial = (value) => String(value ?? '').trim().replace(/\s+/g, ' ');
function materialIdentity(value) {
  let hash = 0xcbf29ce484222325n;
  const text = normalizeMaterial(value);
  for (let i = 0; i < text.length; i += 1) {
    hash ^= BigInt(text.charCodeAt(i));
    hash = BigInt.asUintN(64, hash * 0x100000001b3n);
  }
  return 'fnv1a64-utf16:' + hash.toString(16).padStart(16, '0');
}
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'drill-bank.manifest.v1.json'), 'utf8'));
const prompts = JSON.parse(fs.readFileSync(path.join(root, 'drill-bank.prompts.v1.json'), 'utf8'));
const answers = JSON.parse(fs.readFileSync(path.join(root, 'drill-bank.answers.v1.json'), 'utf8'));

assert.equal(manifest.schema, 'kianos.politics.analysis-drill-bank.v1');
assert.equal(manifest.status, 'READY_STABLE_BASELINE_CURRENT_YEAR_OVERLAYS_PENDING');
assert.equal(manifest.prompt_count, 104);
assert.equal(manifest.bank_revision, 4);
assert.equal(manifest.rules?.generated_asset_lifecycle?.calibration_status,
  'STRUCTURAL_MECHANISM_EVIDENCE_ONLY_NOT_EXAM_SCORE_CALIBRATED');
assert.match(manifest.rules?.generated_asset_lifecycle?.dedupe_rule || '', /duplicate|near-derived/i);
assert.match(manifest.rules?.generated_asset_lifecycle?.retirement_rule || '', /retired|STALE|INVALID/i);
assert.match(manifest.rules?.generated_asset_lifecycle?.promotion_rule || '', /ephemeral|validated reusable/i);
assert.match(manifest.rules?.generated_asset_lifecycle?.authentic_challenge_rule || '', /fresh|current-year|authentic/i);
assert.equal(prompts.length, manifest.prompt_count);
assert.equal(answers.length, manifest.prompt_count);

const requiredRoles = new Set([
  'PRINCIPLE_RETRIEVAL',
  'SKELETON',
  'MATERIAL_BINDING',
  'COMPLETE_ANALYSIS',
  'STRESS_VARIANT',
  'FORMULATION_RETRIEVAL',
  'MATERIAL_SEGMENTATION'
]);
assert.deepEqual(new Set(Object.keys(manifest.role_counts)), requiredRoles);

const promptIds = new Set();
const answerById = new Map(answers.map((row) => [row.id, row]));
assert.equal(answerById.size, answers.length, 'answer ids must be unique');

const observedRoleCounts = {};
let blockedExactness = 0;
let maoCount = 0;
let xiCount = 0;

for (const prompt of prompts) {
  assert.ok(prompt && typeof prompt === 'object' && !Array.isArray(prompt));
  assert.ok(prompt.id && !promptIds.has(prompt.id), 'duplicate prompt id: ' + prompt.id);
  promptIds.add(prompt.id);

  assert.ok(requiredRoles.has(prompt.role), prompt.id + ': unknown role');
  assert.ok(String(prompt.evidence_role || '').trim(), prompt.id + ': evidence_role missing');
  observedRoleCounts[prompt.role] = (observedRoleCounts[prompt.role] || 0) + 1;

  const materialText = String(prompt.material || '').trim();
  if (prompt.role === 'FORMULATION_RETRIEVAL') {
    assert.ok(materialText.length >= 5, prompt.id + ': formulation topic cue missing');
    assert.match(materialText, /主题提示：/, prompt.id + ': formulation task should expose a topic cue by design');
  } else {
    assert.ok(materialText.length >= 10, prompt.id + ': material too thin');
  }
  assert.ok(String(prompt.question || '').trim().length >= 10, prompt.id + ': question too thin');
  assert.ok(String(prompt.source_basis || '').trim(), prompt.id + ': source_basis missing');
  assert.equal(prompt.task_revision, 'bank-r4', prompt.id + ': task revision mismatch');
  assert.equal(prompt.material_identity, materialIdentity(prompt.material), prompt.id + ': exact material identity mismatch');
  assert.equal(prompt.material_family_id, 'source-family:' + prompt.source_basis, prompt.id + ': material family mismatch');
  assert.ok(String(prompt.transfer_identity || '').trim(), prompt.id + ': transfer identity missing');
  assert.equal(prompt.anti_leakage, true, prompt.id + ': anti_leakage must be true');

  const answer = answerById.get(prompt.id);
  assert.ok(answer, prompt.id + ': answer row missing');
  assert.equal(answer.source_hook, prompt.source_basis, prompt.id + ': prompt/answer source mismatch');
  if (prompt.role === 'MATERIAL_SEGMENTATION') {
    assert.ok(Array.isArray(answer.expected_cues) && answer.expected_cues.length >= 2, prompt.id + ': segmentation cues too thin');
    assert.ok(Array.isArray(answer.expected_categories) && answer.expected_categories.length >= 1, prompt.id + ': segmentation categories missing');
    assert.ok(String(answer.scoring?.segmentation || '').trim(), prompt.id + ': segmentation scoring missing');
  } else {
    assert.ok(String(answer.expected_topic || '').trim(), prompt.id + ': expected topic missing');
    assert.ok(Array.isArray(answer.expected_moves) && answer.expected_moves.length >= 2, prompt.id + ': expected moves too thin');
  }
  assert.match(String(answer.contamination_rule || ''), /repair evidence only, not fresh transfer/i);

  if (prompt.role === 'STRESS_VARIANT') {
    assert.ok(String(prompt.competing_principle || '').trim(), prompt.id + ': stress task lacks competitor');
  }
  if (prompt.role === 'FORMULATION_RETRIEVAL') {
    assert.equal(prompt.topic_revealed_by_design, true, prompt.id + ': formulation task must reveal topic by design');
  }
  if (prompt.role === 'COMPLETE_ANALYSIS') {
    assert.ok(Number(prompt.time_box_minutes) > 0, prompt.id + ': complete analysis must be time-boxed');
  }
  if (/EXACTNESS_BLOCKED/.test(String(prompt.source_status || ''))) blockedExactness += 1;
  if (/mao\//i.test(String(prompt.source_basis || ''))) maoCount += 1;
  if (/^XI-/i.test(String(prompt.source_basis || ''))) xiCount += 1;
}

assert.deepEqual(observedRoleCounts, manifest.role_counts);
assert.equal(promptIds.size, 104);

const byExactMaterial = new Map();
for (const prompt of prompts) {
  const key = normalizeMaterial(prompt.material);
  const prior = byExactMaterial.get(key);
  if (prior) {
    assert.equal(prompt.material_identity, prior.material_identity, prompt.id + ': same exact material must share identity');
  } else {
    byExactMaterial.set(key, prompt);
  }
}
assert.ok(blockedExactness > 0, 'current-year exactness gate must be represented');
assert.ok(maoCount > 0, 'Mao structural coverage must be represented');
assert.ok(xiCount > 0, 'Xi structural coverage must be represented');
assert.equal(manifest.coverage.current_year_high_delta_exactness, 'BLOCKED_UNTIL_2027_DESIGNATED_SOURCE');
assert.match(manifest.builder_self_attack?.status || '', /^PASS/);

console.log('PASS Politics Analysis bank: 104 tasks, seven role families, explicit evidence role + generated-asset calibration/dedupe/retirement lifecycle, exact material/family identity, source binding, anti-leakage, stress competitors, time-boxed delivery, Mao/Xi bounded coverage, current-year exactness blocked.');
