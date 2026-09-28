import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(process.cwd(), '..');

const LEXICAL_MANIFEST = 'content/lexical/manifest.json';
const ANSWER_ORDINAL = 209;

let lexicalSnapshotCache = null;
const finalShardCache = new Map();

function absolute(relativePath) {
  return path.join(repoRoot, relativePath);
}

function readText(relativePath) {
  return fs.readFileSync(absolute(relativePath), 'utf8');
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function lexicalManifestSnapshot() {
  if (lexicalSnapshotCache) return lexicalSnapshotCache;

  const manifest = readJson(LEXICAL_MANIFEST);
  if (manifest?.status !== 'CURRENT_NATURAL_OWNER' || manifest?.semantic_authority !== true) {
    throw new Error('CURRENT_LEXICAL_MANIFEST_NOT_AUTHORITATIVE');
  }

  const wordManifestPath = manifest.word_manifest;
  const relationManifestPath = manifest.relation_manifest;
  const finalManifestPath = manifest?.final_learner_object?.materialized_manifest;
  if (!wordManifestPath || !relationManifestPath || !finalManifestPath) {
    throw new Error('CURRENT_LEXICAL_MANIFEST_PATH_MISSING');
  }

  const wordManifest = readJson(wordManifestPath);
  const relationManifest = readJson(relationManifestPath);
  const finalManifest = readJson(finalManifestPath);

  if (wordManifest?.status !== 'CURRENT_NATURAL_OWNER' || wordManifest?.semantic_authority !== true) {
    throw new Error('CURRENT_LEXICAL_WORD_MANIFEST_NOT_AUTHORITATIVE');
  }
  if (relationManifest?.status !== 'CURRENT_NATURAL_OWNER' || relationManifest?.semantic_authority !== true) {
    throw new Error('CURRENT_LEXICAL_RELATION_MANIFEST_NOT_AUTHORITATIVE');
  }
  if (finalManifest?.schema !== 'kianos.lexical.final_learner_manifest.v1'
    || finalManifest?.status !== 'CURRENT_DERIVED_LEARNER_OBJECT'
    || finalManifest?.semantic_authority !== false) {
    throw new Error('CURRENT_LEXICAL_FINAL_LEARNER_MANIFEST_INVALID');
  }

  const wordCount = Number(wordManifest.word_count || 0);
  const finalCount = Number(finalManifest.object_count || 0);
  if (!Number.isInteger(wordCount) || wordCount < 1 || finalCount !== wordCount) {
    throw new Error(`CURRENT_LEXICAL_FINAL_LEARNER_COUNT_MISMATCH:${wordCount}:${finalCount}`);
  }

  lexicalSnapshotCache = {
    manifest,
    wordManifest,
    relationManifest,
    finalManifest,
    finalManifestPath
  };
  return lexicalSnapshotCache;
}

function finalShardDescriptor(finalManifest, ordinal) {
  const shard = (Array.isArray(finalManifest?.shards) ? finalManifest.shards : [])
    .find((row) => Number(row?.start) <= ordinal && ordinal <= Number(row?.end));
  if (!shard?.path) throw new Error(`CURRENT_LEXICAL_FINAL_LEARNER_SHARD_MISSING:${ordinal}`);
  return shard;
}

function readFinalShard(relativePath) {
  if (!finalShardCache.has(relativePath)) {
    const rows = readJson(relativePath);
    if (!Array.isArray(rows)) throw new Error(`CURRENT_LEXICAL_FINAL_LEARNER_SHARD_INVALID:${relativePath}`);
    finalShardCache.set(relativePath, rows);
  }
  return finalShardCache.get(relativePath);
}

function finalLearnerObjectByOrdinal(ordinal) {
  if (!Number.isInteger(ordinal) || ordinal < 1) {
    throw new Error(`CURRENT_LEXICAL_ORDINAL_INVALID:${ordinal}`);
  }

  const { finalManifest } = lexicalManifestSnapshot();
  const maxOrdinal = Number(finalManifest.object_count || 0);
  if (ordinal > maxOrdinal) throw new Error(`CURRENT_LEXICAL_ORDINAL_OUT_OF_RANGE:${ordinal}`);

  const shard = finalShardDescriptor(finalManifest, ordinal);
  const rows = readFinalShard(shard.path);
  const object = rows.find((row) => Number(row?.ordinal) === ordinal);
  if (!object
    || object?.schema !== 'kianos.lexical.final_learner_object.v1'
    || !object?.word_id
    || !object?.word) {
    throw new Error(`CURRENT_LEXICAL_FINAL_LEARNER_OBJECT_INVALID:${ordinal}`);
  }

  return { object, shard };
}

export function inspectLexicalSources() {
  const { manifest, wordManifest, relationManifest, finalManifest, finalManifestPath } = lexicalManifestSnapshot();
  return {
    status: 'ready',
    manifestPath: LEXICAL_MANIFEST,
    wordManifestPath: manifest.word_manifest,
    relationManifestPath: manifest.relation_manifest,
    finalLearnerObjectManifestPath: finalManifestPath,
    wordCount: finalManifest.object_count,
    relationCount: relationManifest.relation_count,
    auditPath: manifest.audit,
    semanticAuthority: manifest.semantic_authority === true,
    websiteConsumesFinalLearnerObject: true,
    finalLearnerObjectStatus: finalManifest.status,
    canonicalWordCount: wordManifest.word_count
  };
}

export function listLexicalOrdinals() {
  const { finalManifest } = lexicalManifestSnapshot();
  const count = Number(finalManifest.object_count || 0);
  if (!Number.isInteger(count) || count < 1) throw new Error('CURRENT_LEXICAL_FINAL_LEARNER_COUNT_INVALID');
  return Array.from({ length: count }, (_, index) => index + 1);
}

export function listLexicalWordSummaries() {
  return listLexicalOrdinals().map((ordinal) => {
    const { object } = finalLearnerObjectByOrdinal(ordinal);
    const senses = Array.isArray(object.senses) ? object.senses : [];
    const secondary = Array.isArray(object.secondary_senses) ? object.secondary_senses : [];
    const constructions = Array.isArray(object.constructions) ? object.constructions : [];
    const fixedPatternCount = senses.reduce(
      (count, sense) => count + (Array.isArray(sense?.usage)
        ? sense.usage.filter((item) => item?.kind === 'fixed_pattern').length
        : 0),
      0
    );
    const reference = object.reference && typeof object.reference === 'object' ? object.reference : {};
    const relationCount = (Array.isArray(reference.confusables) ? reference.confusables.length : 0)
      + (Array.isArray(reference.relations) ? reference.relations.length : 0);

    const familyCount = Array.isArray(reference.family) ? reference.family.length : 0;
    const hasForm = Boolean(reference.form);

    return {
      objectId: object.word_id,
      ordinal,
      word: object.word,
      coreCn: object.word_feel?.summary_cn || '',
      coreEn: '',
      senseCount: senses.length + secondary.length,
      secondarySenseCount: secondary.length,
      constructionCount: constructions.length,
      fixedPatternCount,
      promptCount: constructions.length + fixedPatternCount,
      relationCount,
      familyCount,
      hasForm,
      senseLineage: Array.isArray(object.sense_lineage) ? object.sense_lineage : []
    };
  });
}

export function loadLexicalWordByOrdinal(ordinal) {
  const { object, shard } = finalLearnerObjectByOrdinal(ordinal);
  const sourceHash = String(object.source_fingerprint || shard.sha256 || '');

  return {
    objectId: object.word_id,
    ordinal,
    record: object,
    sourcePath: shard.path,
    sourceHash,
    relationPaths: [],
    senseLineage: Array.isArray(object.sense_lineage) ? object.sense_lineage : [],
    shardEntries: [{
      objectId: object.word_id,
      ordinal,
      record: object,
      sourcePath: shard.path,
      sourceHash
    }]
  };
}

export function loadAnswer() {
  const answer = loadLexicalWordByOrdinal(ANSWER_ORDINAL);
  if (answer.objectId !== 'word:answer') throw new Error('CURRENT_ANSWER_NOT_FOUND');
  return answer;
}
