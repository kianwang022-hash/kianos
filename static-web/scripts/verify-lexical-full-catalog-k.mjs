import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { inspectLexicalSources, listLexicalOrdinals, loadLexicalWordByOrdinal } from '../src/lib/lexical.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '../..');
const lexicalRoot = path.join(repoRoot, 'content/lexical');
const wordsRoot = path.join(lexicalRoot, 'words/by-ordinal');
const relationRoot = path.join(lexicalRoot, 'relations/by-id');
const acceptanceRoot = path.join(lexicalRoot, 'acceptance');
fs.mkdirSync(acceptanceRoot, { recursive: true });

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const stable = (value) => {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stable(value[key])}`).join(',')}}`;
};
const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');
const walkJson = (dir) => {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkJson(p));
    else if (entry.isFile() && entry.name.endsWith('.json')) out.push(p);
  }
  return out;
};
const truthy = (value) => value === true || value === 1 || value === '1' || String(value).toLowerCase() === 'true';
const nonempty = (value) => typeof value === 'string' && value.trim().length > 0;
const setEqual = (a, b) => a.size === b.size && [...a].every((x) => b.has(x));
const normalizeSpelling = (value) => String(value || '').normalize('NFKC').toLocaleLowerCase('en-US');

const failures = [];
const fail = (condition, code, detail = '') => {
  if (!condition) failures.push({ code, detail: String(detail || '') });
};

const topManifest = readJson(path.join(lexicalRoot, 'manifest.json'));
const wordManifest = readJson(path.join(lexicalRoot, 'words/manifest.json'));
const relationManifest = readJson(path.join(lexicalRoot, 'relations/manifest.json'));
const auditCoverageText = fs.readFileSync(path.join(lexicalRoot, 'semantic-audit/reconciliation/CATALOG_COVERAGE_RECONCILIATION.md'), 'utf8');
const sources = inspectLexicalSources();
const ordinals = listLexicalOrdinals();
const relationFiles = walkJson(relationRoot);

fail(topManifest.status === 'CURRENT_NATURAL_OWNER' && topManifest.semantic_authority === true, 'TOP_MANIFEST_NOT_AUTHORITATIVE');
fail(wordManifest.status === 'CURRENT_NATURAL_OWNER' && wordManifest.semantic_authority === true, 'WORD_MANIFEST_NOT_AUTHORITATIVE');
fail(relationManifest.status === 'CURRENT_NATURAL_OWNER' && relationManifest.semantic_authority === true, 'RELATION_MANIFEST_NOT_AUTHORITATIVE');
fail(Number(wordManifest.word_count) === 7946 && Number(sources.wordCount) === 7946, 'WORD_COUNT_NOT_7946', `${wordManifest.word_count}|${sources.wordCount}`);
fail(ordinals.length === 7946 && ordinals[0] === 1 && ordinals.at(-1) === 7946 && ordinals.every((o, i) => o === i + 1), 'ORDINAL_COVERAGE_NOT_EXACT');
fail(/mechanically implemented frontier:\s+o7946/.test(currentText) && /Catalog Content execution:\s*\*\*COMPLETE/.test(currentText), 'CURRENT_NOT_FULL_CATALOG_COMPLETE');
fail(/authoritative terminal coverage:\s*7946/.test(auditCoverageText) && /not terminally covered:\s*0/.test(auditCoverageText), 'AUDIT_COVERAGE_NOT_TERMINAL_7946');

const seenWordIds = new Map();
const seenSenseIds = new Map();
const lookupCache = new Map();
const conclusions = [];
const representatives = {};
const byWord = new Map();
const structuralCounts = {
  owners: 0,
  active_senses: 0,
  zero_active_sense_owners: 0,
  reference_senses: 0,
  constructions: 0,
  fixed_collocations: 0,
  relation_refs: 0,
  form_identity: 0,
  legacy_needs_delta_review: 0,
  physical_relation_json_files: relationFiles.length,
  manifest_current_relation_count: Number(relationManifest.relation_count),
  owners_with_reference_only: 0,
  owners_with_register_signal: 0,
  owners_with_hidden_branch_candidate: 0
};
const qualityCounts = { SAFE_SIMPLE: 0, DEPTH_READY: 0, BLOCKED: 0 };

const lookupCandidates = (sourcePath, spelling) => {
  const abs = path.join(repoRoot, sourcePath);
  if (!lookupCache.has(abs)) lookupCache.set(abs, readJson(abs));
  const obj = lookupCache.get(abs);
  return Array.isArray(obj?.[spelling]) ? obj[spelling] : [];
};

for (const ordinal of ordinals) {
  structuralCounts.owners += 1;
  const ownerPath = path.join(wordsRoot, `o${String(ordinal).padStart(4, '0')}.json`);
  fail(fs.existsSync(ownerPath), 'OWNER_FILE_MISSING', ordinal);
  if (!fs.existsSync(ownerPath)) continue;

  const ownerFailureStart = failures.length;
  const raw = readJson(ownerPath);
  const answer = loadLexicalWordByOrdinal(ordinal);
  const record = raw.record || {};
  const projected = answer.record || {};
  const word = String(record.word || raw.word || '');
  byWord.set(word, { ordinal, word_id: raw.word_id });

  fail(raw.schema === 'kianos.lexical.word_owner.v1', 'OWNER_SCHEMA_INVALID', ordinal);
  fail(raw.ordinal === ordinal, 'OWNER_ORDINAL_MISMATCH', ordinal);
  fail(nonempty(raw.word_id) && record.word_id === raw.word_id && answer.objectId === raw.word_id, 'WORD_IDENTITY_MISMATCH', ordinal);
  fail(nonempty(word), 'WORD_SURFACE_EMPTY', ordinal);
  if (seenWordIds.has(raw.word_id)) fail(false, 'DUPLICATE_WORD_ID', `${raw.word_id}:${seenWordIds.get(raw.word_id)}:${ordinal}`);
  else seenWordIds.set(raw.word_id, ordinal);
  fail(nonempty(answer.sourceHash), 'PROJECTION_SOURCE_HASH_MISSING', ordinal);
  fail(record.processing_status === 'completed', 'OWNER_PROCESSING_NOT_COMPLETED', `${ordinal}:${record.processing_status || ''}`);
  if (truthy(record.needs_delta_review)) structuralCounts.legacy_needs_delta_review += 1;

  const rawLocal = JSON.parse(JSON.stringify(record));
  const projectedLocal = JSON.parse(JSON.stringify(projected));
  delete rawLocal.semantic_neighbors; delete rawLocal.confusables;
  delete projectedLocal.semantic_neighbors; delete projectedLocal.confusables;
  fail(stable(rawLocal) === stable(projectedLocal), 'OWNER_LOCAL_PROJECTION_DRIFT', ordinal);

  const core = record.core_concept;
  fail(core && typeof core === 'object', 'CORE_MISSING', ordinal);
  if (core && typeof core === 'object') {
    fail(nonempty(core.core_meaning_cn) || nonempty(core.core_meaning_en) || nonempty(core.mental_model_cn) || nonempty(core.mental_model_en), 'CORE_EMPTY', ordinal);
  }

  const senses = Array.isArray(record.senses) ? record.senses : [];
  structuralCounts.active_senses += senses.length;
  if (!senses.length) structuralCounts.zero_active_sense_owners += 1;
  fail(senses.length >= 1, 'NO_LEARNER_ACTIVE_SENSE', `${ordinal}:${word}`);
  const activeIds = new Set();
  const identityRows = Array.isArray(raw.identity_refs?.senses) ? raw.identity_refs.senses : [];
  const identityById = new Map(identityRows.map((row) => [String(row?.sense_id || ''), row]));
  const activeCollocations = new Set();
  let fixedCount = 0;
  let hasRegisterSignal = false;
  let hasHiddenBranchCandidate = false;
  const levels = new Set();

  for (const [senseIndex, sense] of senses.entries()) {
    const sid = String(sense?.sense_id || '');
    fail(nonempty(sid), 'ACTIVE_SENSE_ID_MISSING', `${ordinal}:${senseIndex}`);
    if (!sid) continue;
    fail(!activeIds.has(sid), 'DUPLICATE_SENSE_WITHIN_OWNER', `${ordinal}:${sid}`);
    activeIds.add(sid);
    if (seenSenseIds.has(sid) && seenSenseIds.get(sid) !== ordinal) fail(false, 'SENSE_ID_CROSS_OWNER_COLLISION', `${sid}:${seenSenseIds.get(sid)}:${ordinal}`);
    else seenSenseIds.set(sid, ordinal);
    fail(identityById.get(sid)?.status === 'active', 'ACTIVE_SENSE_LIFECYCLE_NOT_ACTIVE', `${ordinal}:${sid}:${identityById.get(sid)?.status || 'missing'}`);
    fail(nonempty(sense.definition_cn) || nonempty(sense.definition_en), 'ACTIVE_SENSE_DEFINITION_EMPTY', `${ordinal}:${sid}`);
    fail(!truthy(sense.needs_human_review), 'ACTIVE_SENSE_NEEDS_HUMAN_REVIEW', `${ordinal}:${sid}`);
    const level = String(sense.level || '');
    if (level) levels.add(level);
    if (nonempty(sense.register) || sense.writing_safe === false || nonempty(sense.sensitivity_note) || nonempty(sense.stance)) hasRegisterSignal = true;
    for (const [ci, collocation] of (Array.isArray(sense.collocations) ? sense.collocations : []).entries()) {
      const cid = String(collocation?.collocation_id || '');
      if (cid) activeCollocations.add(cid);
      if (collocation?.exam_value === 'fixed_pattern') {
        fixedCount += 1;
        fail(nonempty(cid), 'FIXED_COLLOCATION_ID_MISSING', `${ordinal}:${sid}:${ci}`);
      }
    }
  }
  if (levels.has('L1') && [...levels].some((x) => x === 'L2' || x === 'L3')) hasHiddenBranchCandidate = true;
  if (hasRegisterSignal) structuralCounts.owners_with_register_signal += 1;
  if (hasHiddenBranchCandidate) structuralCounts.owners_with_hidden_branch_candidate += 1;

  const registryActiveCollocations = new Set((raw.identity_refs?.active_collocations || []).map(String));
  fail(setEqual(activeCollocations, registryActiveCollocations), 'ACTIVE_COLLOCATION_REGISTRY_DRIFT', `${ordinal}:owner=${[...activeCollocations].sort().join(',')}:registry=${[...registryActiveCollocations].sort().join(',')}`);
  for (const cluster of (Array.isArray(core?.core_clusters) ? core.core_clusters : [])) {
    for (const sid of (Array.isArray(cluster?.sense_ids) ? cluster.sense_ids : [])) fail(activeIds.has(String(sid)), 'CORE_CLUSTER_POINTS_OUTSIDE_ACTIVE_SENSES', `${ordinal}:${sid}`);
  }

  const references = Array.isArray(raw.reference_senses) ? raw.reference_senses : [];
  structuralCounts.reference_senses += references.length;
  if (references.length) structuralCounts.owners_with_reference_only += 1;
  for (const ref of references) {
    const sid = String(ref?.stable_sense_id || '');
    fail(nonempty(sid), 'REFERENCE_SENSE_ID_MISSING', ordinal);
    fail(!activeIds.has(sid), 'REFERENCE_SENSE_DUPLICATES_LEARNER_ACTIVE', `${ordinal}:${sid}`);
    fail(ref?.reference_only === true, 'REFERENCE_SENSE_NOT_MARKED_REFERENCE_ONLY', `${ordinal}:${sid}`);
    if (sid) fail(Boolean(identityById.get(sid)), 'REFERENCE_SENSE_MISSING_IDENTITY_ROW', `${ordinal}:${sid}`);
  }

  const lookupRefs = Array.isArray(raw.lookup_refs) ? raw.lookup_refs : [];
  fail(lookupRefs.length >= 1, 'LOOKUP_REFS_EMPTY', ordinal);
  const lookupSpellings = new Set();
  for (const ref of lookupRefs) {
    const spelling = String(ref?.spelling || '');
    lookupSpellings.add(spelling);
    fail(ref?.word_id === raw.word_id && Number(ref?.ordinal) === ordinal, 'LOOKUP_REF_OWNER_DRIFT', `${ordinal}:${spelling}`);
    const candidates = lookupCandidates(String(ref?.source || ''), spelling);
    fail(candidates.some((candidate) => candidate?.word_id === raw.word_id && Number(candidate?.ordinal) === ordinal), 'LOOKUP_SOURCE_MISSING_OWNER', `${ordinal}:${spelling}:${ref?.source || ''}`);
  }
  fail([...lookupSpellings].some((surface) => normalizeSpelling(surface) === normalizeSpelling(word)), 'PRIMARY_SPELLING_LOOKUP_MISSING', `${ordinal}:${word}`);

  const formIdentity = record.form_identity && typeof record.form_identity === 'object' ? record.form_identity : null;
  if (formIdentity) structuralCounts.form_identity += 1;

  const rawRefs = Array.isArray(raw.relation_refs) ? raw.relation_refs : [];
  structuralCounts.relation_refs += rawRefs.length;
  const projectedByField = {
    semantic_neighbors: Array.isArray(projected.semantic_neighbors) ? projected.semantic_neighbors : [],
    confusables: Array.isArray(projected.confusables) ? projected.confusables : []
  };
  for (const field of ['semantic_neighbors', 'confusables']) {
    const expected = rawRefs.filter((ref) => ref?.field === field).length;
    fail(projectedByField[field].length === expected, 'RELATION_PROJECTION_COUNT_DRIFT', `${ordinal}:${field}:${projectedByField[field].length}:${expected}`);
  }
  const expectedRelationPaths = new Set(rawRefs.map((ref) => String(ref?.owner_path || '')).filter(Boolean));
  const actualRelationPaths = new Set(answer.relationPaths || []);
  fail(setEqual(expectedRelationPaths, actualRelationPaths), 'RELATION_PATH_PROJECTION_DRIFT', ordinal);
  for (const ref of rawRefs) {
    const relationPath = path.join(repoRoot, String(ref?.owner_path || ''));
    fail(fs.existsSync(relationPath), 'RELATION_OWNER_PATH_MISSING', `${ordinal}:${ref?.relation_id || ''}:${ref?.owner_path || ''}`);
  }

  const constructions = Array.isArray(record.constructions) ? record.constructions : [];
  structuralCounts.constructions += constructions.length;
  structuralCounts.fixed_collocations += fixedCount;

  const riskFlags = [];
  if (senses.length > 1) riskFlags.push('polysemy');
  if (hasHiddenBranchCandidate) riskFlags.push('familiar_new_candidate');
  if (constructions.length > 0) riskFlags.push('construction');
  if (fixedCount > 0) riskFlags.push('phraseology');
  if (rawRefs.length > 0) riskFlags.push('relation_or_confusable');
  if (formIdentity || senses.some((s) => Boolean(s?.lexical_identity_overlay))) riskFlags.push('form_identity');
  if ((record.secondary_senses || []).length > 0) riskFlags.push('secondary_sense');
  if (hasRegisterSignal) riskFlags.push('register_stance');
  if ((core?.core_clusters || []).length > 1) riskFlags.push('multi_cluster_core');
  if (senses.some((s) => nonempty(s?.governing_pattern))) riskFlags.push('governing_pattern');
  if ((record.phraseology || []).length > 0) riskFlags.push('phraseology_asset');

  const ownerHardFailed = failures.length > ownerFailureStart;
  const status = ownerHardFailed ? 'BLOCKED' : (riskFlags.length ? 'DEPTH_READY' : 'SAFE_SIMPLE');
  qualityCounts[status] += 1;
  conclusions.push({ ordinal, word_id: raw.word_id, word, status, risk_flags: [...new Set(riskFlags)].sort() });

  if (!representatives.safe_simple && status === 'SAFE_SIMPLE') representatives.safe_simple = { ordinal, word_id: raw.word_id, word };
  if (!representatives.rich_polysemous && status !== 'BLOCKED' && senses.length >= 3) representatives.rich_polysemous = { ordinal, word_id: raw.word_id, word };
  if (!representatives.familiar_new && status !== 'BLOCKED' && hasHiddenBranchCandidate && senses.length >= 2) representatives.familiar_new = { ordinal, word_id: raw.word_id, word };
  if (!representatives.construction_heavy && status !== 'BLOCKED' && constructions.length >= 2) representatives.construction_heavy = { ordinal, word_id: raw.word_id, word };
  if (!representatives.relation_owned && status !== 'BLOCKED' && rawRefs.length >= 1) representatives.relation_owned = { ordinal, word_id: raw.word_id, word };
  if (!representatives.register_sensitivity && status !== 'BLOCKED' && hasRegisterSignal) representatives.register_sensitivity = { ordinal, word_id: raw.word_id, word };
  if (!representatives.same_owner_form && status !== 'BLOCKED' && formIdentity) representatives.same_owner_form = { ordinal, word_id: raw.word_id, word };
  if (!representatives.reference_only && status !== 'BLOCKED' && references.length >= 1) representatives.reference_only = { ordinal, word_id: raw.word_id, word };
}

for (const pair of [['vigor', 'vigour'], ['practice', 'practise'], ['plow', 'plough']]) {
  if (byWord.has(pair[0]) && byWord.has(pair[1])) {
    representatives.distinct_owner_spelling = [
      { word: pair[0], ...byWord.get(pair[0]) },
      { word: pair[1], ...byWord.get(pair[1]) }
    ];
    break;
  }
}
for (const key of ['safe_simple','rich_polysemous','familiar_new','construction_heavy','relation_owned','register_sensitivity','same_owner_form','reference_only','distinct_owner_spelling']) fail(Boolean(representatives[key]), 'REPRESENTATIVE_RISK_FAMILY_MISSING', key);

fail(conclusions.length === 7946, 'CONCLUSION_COUNT_NOT_7946', conclusions.length);
fail(qualityCounts.SAFE_SIMPLE + qualityCounts.DEPTH_READY + qualityCounts.BLOCKED === 7946, 'QUALITY_TERMINAL_ACCOUNTING_DRIFT', JSON.stringify(qualityCounts));
const conclusionOrdinals = new Set(conclusions.map((row) => row.ordinal));
fail(conclusionOrdinals.size === 7946 && [...conclusionOrdinals].every((o) => o >= 1 && o <= 7946), 'QUALITY_ORDINAL_COVERAGE_DRIFT');

const conclusionDigest = sha256(stable(conclusions));
const report = {
  schema: 'kianos.lexical.full_catalog_k_reacceptance.v1',
  issue: 56,
  status: failures.length ? 'FAIL' : 'PHASE_AB_PASS_PENDING_BROWSER',
  head: String(process.env.GITHUB_SHA || '').trim() || 'local',
  catalog: { start: 1, end: 7946, owner_count: 7946 },
  source_truth: {
    current_content_complete: /mechanically implemented frontier:\s+o7946/.test(currentText),
    independent_audit_terminal_coverage: 7946,
    manifest_word_count: Number(wordManifest.word_count),
    manifest_current_relation_count: Number(relationManifest.relation_count),
    physical_relation_json_files: relationFiles.length
  },
  quality_counts: qualityCounts,
  conclusion_digest_sha256: conclusionDigest,
  structural_counts: structuralCounts,
  representatives,
  failures
};
fs.writeFileSync(path.join(acceptanceRoot, 'full-catalog-k-conclusions.json'), JSON.stringify({
  schema: 'kianos.lexical.full_catalog_k_conclusions.v1', issue: 56, head: report.head,
  owner_count: conclusions.length, digest_sha256: conclusionDigest, conclusions
}, null, 2) + '\n');
fs.writeFileSync(path.join(acceptanceRoot, 'full-catalog-k-report.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
assert.equal(failures.length, 0, `FULL_CATALOG_K_PHASE_AB_FAILURES:${JSON.stringify(failures.slice(0, 80))}`);
