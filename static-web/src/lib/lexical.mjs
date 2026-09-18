import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(process.cwd(), '..');

const LEXICAL_MANIFEST = 'content/lexical/manifest.json';
const ANSWER_ORDINAL = 209;
let lexicalSnapshotCache = null;

function absolute(relativePath) {
  return path.join(repoRoot, relativePath);
}

function readText(relativePath) {
  return fs.readFileSync(absolute(relativePath), 'utf8');
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function stableJson(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(',')}}`;
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function lexicalManifestSnapshot() {
  if (lexicalSnapshotCache) return lexicalSnapshotCache;

  const manifest = readJson(LEXICAL_MANIFEST);
  if (manifest?.status !== 'CURRENT_NATURAL_OWNER' || manifest?.semantic_authority !== true) {
    throw new Error('CURRENT_LEXICAL_MANIFEST_NOT_AUTHORITATIVE');
  }

  const wordManifestPath = manifest.word_manifest;
  const relationManifestPath = manifest.relation_manifest;
  if (!wordManifestPath || !relationManifestPath) {
    throw new Error('CURRENT_LEXICAL_OWNER_MANIFEST_PATH_MISSING');
  }

  const wordManifest = readJson(wordManifestPath);
  const relationManifest = readJson(relationManifestPath);
  if (wordManifest?.status !== 'CURRENT_NATURAL_OWNER' || wordManifest?.semantic_authority !== true) {
    throw new Error('CURRENT_LEXICAL_WORD_MANIFEST_NOT_AUTHORITATIVE');
  }
  if (relationManifest?.status !== 'CURRENT_NATURAL_OWNER' || relationManifest?.semantic_authority !== true) {
    throw new Error('CURRENT_LEXICAL_RELATION_MANIFEST_NOT_AUTHORITATIVE');
  }

  lexicalSnapshotCache = { manifest, wordManifest, relationManifest };
  return lexicalSnapshotCache;
}

function wordOwnerPath(wordManifest, ordinal) {
  const template = String(wordManifest?.path_rule || '');
  if (!template.includes('{ordinal:04d}')) {
    throw new Error('CURRENT_LEXICAL_WORD_PATH_RULE_INVALID');
  }
  return template.replace('{ordinal:04d}', String(ordinal).padStart(4, '0'));
}

function senseLineageForOwner(owner) {
  const refs = Array.isArray(owner?.identity_refs?.senses) ? owner.identity_refs.senses : [];
  return refs
    .filter((ref) => ref?.sense_id && String(ref.status || '').toLowerCase() !== 'active')
    .map((ref) => ({
      word_id: owner.word_id,
      target_kind: 'sense',
      from_target_id: String(ref.sense_id),
      status: String(ref.status || 'unknown').toLowerCase(),
      to_target_id: ref.merged_into_sense_id ? String(ref.merged_into_sense_id) : null
    }));
}

function hydrateRelations(owner, record) {
  const refs = Array.isArray(owner?.relation_refs) ? [...owner.relation_refs] : [];
  const relationPaths = new Set();
  const byField = new Map();

  for (const ref of refs) {
    const field = String(ref?.field || '');
    const index = Number(ref?.index);
    const relationId = String(ref?.relation_id || '');
    const ownerPath = String(ref?.owner_path || '');
    if (!field || !Number.isInteger(index) || !relationId || !ownerPath) {
      throw new Error(`CURRENT_LEXICAL_RELATION_REF_INVALID:${owner?.word_id || ''}`);
    }

    const relation = readJson(ownerPath);
    if (relation?.relation_id !== relationId) {
      throw new Error(`CURRENT_LEXICAL_RELATION_ID_MISMATCH:${relationId}`);
    }
    // Retired compatibility pointers may remain addressable for provenance, but they
    // are no longer semantic Relation owners and must not project as learner cards.
    if (String(relation?.provenance?.status || '').toUpperCase() === 'RETIRED_AS_SEMANTIC_OWNER') {
      continue;
    }
    const views = Array.isArray(relation.word_views) ? relation.word_views : [];
    const view = views.find((candidate) =>
      candidate?.source_word_id === owner.word_id &&
      candidate?.field === field &&
      Number(candidate?.index) === index
    );
    if (!view || !view.payload || typeof view.payload !== 'object') {
      throw new Error(`CURRENT_LEXICAL_RELATION_VIEW_NOT_FOUND:${relationId}:${owner.word_id}:${field}:${index}`);
    }

    relationPaths.add(ownerPath);
    if (!byField.has(field)) byField.set(field, []);
    byField.get(field).push({ index, payload: clone(view.payload) });
  }

  for (const [field, views] of byField.entries()) {
    views.sort((a, b) => a.index - b.index);
    record[field] = views.map((row) => row.payload);
  }

  return [...relationPaths].sort();
}

export function inspectLexicalSources() {
  const { manifest, wordManifest, relationManifest } = lexicalManifestSnapshot();
  return {
    status: 'ready',
    manifestPath: LEXICAL_MANIFEST,
    wordManifestPath: manifest.word_manifest,
    relationManifestPath: manifest.relation_manifest,
    wordCount: wordManifest.word_count,
    relationCount: relationManifest.relation_count,
    auditPath: manifest.audit,
    semanticAuthority: manifest.semantic_authority === true
  };
}

export function listLexicalOrdinals() {
  const { wordManifest } = lexicalManifestSnapshot();
  const count = Number(wordManifest.word_count || 0);
  if (!Number.isInteger(count) || count < 1) throw new Error('CURRENT_LEXICAL_WORD_COUNT_INVALID');
  return Array.from({ length: count }, (_, index) => index + 1);
}

export function listLexicalWordSummaries() {
  const { wordManifest } = lexicalManifestSnapshot();
  return listLexicalOrdinals().map((ordinal) => {
    const sourcePath = wordOwnerPath(wordManifest, ordinal);
    const owner = readJson(sourcePath);
    if (owner?.schema !== 'kianos.lexical.word_owner.v1' || owner?.ordinal !== ordinal || !owner?.record) {
      throw new Error(`CURRENT_LEXICAL_WORD_OWNER_SUMMARY_INVALID:${ordinal}`);
    }
    const record = owner.record;
    const senses = Array.isArray(record.senses) ? record.senses : [];
    const constructions = Array.isArray(record.constructions) ? record.constructions : [];
    const fixedPatternCount = senses.reduce((count, sense) => count + (sense.collocations || []).filter((item) => item.exam_value === 'fixed_pattern').length, 0);
    const relationCount = Array.isArray(owner.relation_refs) ? owner.relation_refs.length : 0;
    return {
      objectId: owner.word_id,
      ordinal,
      word: record.word || owner.word || '',
      coreCn: record.core_concept?.core_meaning_cn || '',
      coreEn: record.core_concept?.core_meaning_en || '',
      senseCount: senses.length,
      promptCount: constructions.length + fixedPatternCount,
      relationCount,
      senseLineage: senseLineageForOwner(owner)
    };
  });
}

export function loadLexicalWordByOrdinal(ordinal) {
  if (!Number.isInteger(ordinal) || ordinal < 1) {
    throw new Error(`CURRENT_LEXICAL_ORDINAL_INVALID:${ordinal}`);
  }

  const { wordManifest } = lexicalManifestSnapshot();
  const maxOrdinal = Number(wordManifest.word_count || 0);
  if (ordinal > maxOrdinal) throw new Error(`CURRENT_LEXICAL_ORDINAL_OUT_OF_RANGE:${ordinal}`);

  const sourcePath = wordOwnerPath(wordManifest, ordinal);
  const owner = readJson(sourcePath);
  if (owner?.schema !== 'kianos.lexical.word_owner.v1') {
    throw new Error(`CURRENT_LEXICAL_WORD_OWNER_SCHEMA_INVALID:${ordinal}`);
  }
  if (owner?.ordinal !== ordinal || !owner?.word_id || !owner?.record) {
    throw new Error(`CURRENT_LEXICAL_WORD_OWNER_IDENTITY_INVALID:${ordinal}`);
  }
  if (owner.record.word_id !== owner.word_id) {
    throw new Error(`CURRENT_LEXICAL_WORD_RECORD_ID_MISMATCH:${ordinal}`);
  }

  const record = clone(owner.record);
  const relationPaths = hydrateRelations(owner, record);
  const sourceHash = sha256(stableJson({ owner: record, relationPaths }));
  const senseLineage = senseLineageForOwner(owner);

  return {
    objectId: owner.word_id,
    ordinal,
    record,
    sourcePath,
    sourceHash,
    relationPaths,
    senseLineage,
    shardEntries: [{
      objectId: owner.word_id,
      ordinal,
      record,
      sourcePath,
      sourceHash
    }]
  };
}

export function loadAnswer() {
  const answer = loadLexicalWordByOrdinal(ANSWER_ORDINAL);
  if (answer.objectId !== 'word:answer') throw new Error('CURRENT_ANSWER_NOT_FOUND');
  return answer;
}
