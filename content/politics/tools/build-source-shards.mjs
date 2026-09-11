import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(process.cwd());

const POLITICS = path.join(repoRoot, 'content/politics/source');
const QUESTION_SOURCE = path.join(POLITICS, 'xiao_2027_questions.jsonl');
const NODE_SOURCE = path.join(POLITICS, 'source_node_registry.v2.jsonl');
const QUESTION_ROOT = path.join(POLITICS, 'questions');
const NODE_ROOT = path.join(POLITICS, 'nodes');
const AUDIT_PATH = path.join(POLITICS, 'source-shard-audit.json');
const MODE = process.argv.includes('--check') ? 'check' : 'write';
const QUESTION_WIDTH = 25;

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function readJsonl(file) {
  const raw = fs.readFileSync(file, 'utf8');
  const rows = raw.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line, index) => {
    try { return JSON.parse(line); }
    catch (error) { throw new Error(`INVALID_JSONL:${path.relative(repoRoot, file)}:${index + 1}:${error.message}`); }
  });
  return { raw, rows };
}

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]));
}

function canonicalDigest(rows, idFn) {
  const normalized = rows
    .map((row) => [idFn(row), canonicalize(row)])
    .sort((a, b) => a[0].localeCompare(b[0], 'en', { numeric: true }));
  return sha256(normalized.map(([id, row]) => `${id}\t${JSON.stringify(row)}`).join('\n'));
}

function uniqueIds(rows, idFn, label) {
  const ids = rows.map(idFn);
  if (ids.some((id) => !id)) throw new Error(`${label}_MISSING_ID`);
  const seen = new Set();
  const dupes = [];
  for (const id of ids) {
    if (seen.has(id)) dupes.push(id);
    else seen.add(id);
  }
  if (dupes.length) throw new Error(`${label}_DUPLICATE_IDS:${[...new Set(dupes)].join(',')}`);
  return ids;
}

function ensureDir(dir) { fs.mkdirSync(dir, { recursive: true }); }
function removeDir(dir) { if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true }); }
function rel(file) { return path.relative(repoRoot, file).split(path.sep).join('/'); }
function stableJson(value) { return `${JSON.stringify(value, null, 2)}\n`; }

function writeOrCheck(file, content, mismatches) {
  if (MODE === 'write') {
    ensureDir(path.dirname(file));
    fs.writeFileSync(file, content, 'utf8');
    return;
  }
  if (!fs.existsSync(file)) {
    mismatches.push(`MISSING:${rel(file)}`);
    return;
  }
  const actual = fs.readFileSync(file, 'utf8');
  if (actual !== content) mismatches.push(`DRIFT:${rel(file)}`);
}

function questionId(row) { return String(row?.question_id || ''); }
function nodeId(row) { return String(row?.stable_node_id || row?.node_id || row?.id || ''); }

function questionShardFor(id) {
  const match = id.match(/^xiao_2027_(marx|history|mao|xi|ethics)_(single|multiple)_(\d{3})$/i);
  if (!match) throw new Error(`UNSUPPORTED_QUESTION_ID:${id}`);
  const subject = match[1].toLowerCase();
  const kind = match[2].toLowerCase();
  const number = Number(match[3]);
  const start = Math.floor((number - 1) / QUESTION_WIDTH) * QUESTION_WIDTH + 1;
  const end = start + QUESTION_WIDTH - 1;
  const file = path.join(QUESTION_ROOT, 'shards', subject, kind, `q${String(start).padStart(3, '0')}-${String(end).padStart(3, '0')}.json`);
  return { file, subject, kind, start, end };
}

function slug(value) {
  return String(value || 'unknown').toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '') || 'unknown';
}

function nodeShardFor(row) {
  const id = nodeId(row);
  const idMatch = id.match(/^POL27-([A-Z0-9]+)-([A-Z0-9_]+)(?:-|$)/i);
  const source = slug(row?.source_id || (idMatch ? `POL27-${idMatch[1]}` : 'unknown'));
  const subject = slug(idMatch?.[2] || 'unknown');
  const chapter = id.match(/-C(\d{2})(?:-|$)/i)?.[1] || null;
  const page = id.match(/-P(\d{3})(?:-|$)/i)?.[1] || null;
  let partition = 'root';
  if (chapter) partition = `c${chapter}`;
  else if (page) partition = `p${page}`;
  const file = path.join(NODE_ROOT, 'shards', source, subject, `${partition}.json`);
  return { file, source, subject, partition };
}

function buildShardObjects(rows, idFn, shardFn) {
  const byFile = new Map();
  for (const row of rows) {
    const id = idFn(row);
    const shard = shardFn(row, id);
    if (!byFile.has(shard.file)) byFile.set(shard.file, {});
    byFile.get(shard.file)[id] = row;
  }
  return byFile;
}

function sortedObject(object) {
  return Object.fromEntries(Object.keys(object).sort((a, b) => a.localeCompare(b, 'en', { numeric: true })).map((key) => [key, object[key]]));
}

function collectRowsFromShards(byFile) {
  return [...byFile.values()].flatMap((object) => Object.values(object));
}

function main() {
  const questions = readJsonl(QUESTION_SOURCE);
  const nodes = readJsonl(NODE_SOURCE);
  const questionIds = uniqueIds(questions.rows, questionId, 'QUESTIONS');
  const nodeIds = uniqueIds(nodes.rows, nodeId, 'NODES');

  const questionShards = buildShardObjects(questions.rows, questionId, (_row, id) => questionShardFor(id));
  const nodeShards = buildShardObjects(nodes.rows, nodeId, (row) => nodeShardFor(row));

  const questionRebuilt = collectRowsFromShards(questionShards);
  const nodeRebuilt = collectRowsFromShards(nodeShards);
  const questionSourceDigest = canonicalDigest(questions.rows, questionId);
  const questionShardDigest = canonicalDigest(questionRebuilt, questionId);
  const nodeSourceDigest = canonicalDigest(nodes.rows, nodeId);
  const nodeShardDigest = canonicalDigest(nodeRebuilt, nodeId);

  if (questionIds.length !== questionRebuilt.length || questionSourceDigest !== questionShardDigest) {
    throw new Error('QUESTION_SHARD_PARITY_FAIL');
  }
  if (nodeIds.length !== nodeRebuilt.length || nodeSourceDigest !== nodeShardDigest) {
    throw new Error('NODE_SHARD_PARITY_FAIL');
  }

  const questionStats = {};
  for (const id of questionIds) {
    const { subject, kind } = questionShardFor(id);
    questionStats[subject] ||= { single: 0, multiple: 0, total: 0 };
    questionStats[subject][kind] += 1;
    questionStats[subject].total += 1;
  }

  const nodeStats = {};
  for (const row of nodes.rows) {
    const { source, subject } = nodeShardFor(row);
    const key = `${source}/${subject}`;
    nodeStats[key] = (nodeStats[key] || 0) + 1;
  }

  const questionManifest = {
    schema: 'kianos.politics.question_shards.v1',
    status: 'CURRENT_DERIVED_FROM_MONOLITH',
    authority: 'SOURCE_FAITHFUL_QUESTION_TRUTH_PROJECTION',
    source_monolith: rel(QUESTION_SOURCE),
    source_raw_sha256: sha256(questions.raw),
    canonical_row_digest_sha256: questionSourceDigest,
    row_count: questions.rows.length,
    shard_count: questionShards.size,
    shard_width: QUESTION_WIDTH,
    question_id_pattern: '^xiao_2027_(subject)_(single|multiple)_(NNN)$',
    deterministic_path_rule: 'questions/shards/<subject>/<kind>/q<25-wide-range>.json',
    global_index_required: false,
    subject_counts: questionStats,
    semantic_change: false
  };

  const nodeManifest = {
    schema: 'kianos.politics.node_shards.v1',
    status: 'CURRENT_DERIVED_FROM_MONOLITH',
    authority: 'SOURCE_FAITHFUL_NODE_TRUTH_PROJECTION',
    source_monolith: rel(NODE_SOURCE),
    source_raw_sha256: sha256(nodes.raw),
    canonical_row_digest_sha256: nodeSourceDigest,
    row_count: nodes.rows.length,
    shard_count: nodeShards.size,
    deterministic_path_rule: 'nodes/shards/<source>/<subject>/<chapter|page|root>.json',
    stable_id_drives_partition: true,
    global_registry_scan_required_for_exact_owner: false,
    partition_counts: nodeStats,
    semantic_change: false
  };

  const audit = {
    schema: 'kianos.politics.source_shard_audit.v1',
    status: 'PASS',
    questions: {
      source_rows: questions.rows.length,
      shard_rows: questionRebuilt.length,
      source_raw_sha256: sha256(questions.raw),
      source_canonical_digest_sha256: questionSourceDigest,
      shard_canonical_digest_sha256: questionShardDigest,
      shard_count: questionShards.size,
      parity: true
    },
    nodes: {
      source_rows: nodes.rows.length,
      shard_rows: nodeRebuilt.length,
      source_raw_sha256: sha256(nodes.raw),
      source_canonical_digest_sha256: nodeSourceDigest,
      shard_canonical_digest_sha256: nodeShardDigest,
      shard_count: nodeShards.size,
      parity: true
    },
    guarantees: [
      'same immutable IDs',
      'same parsed row content under canonical JSON comparison',
      'no duplicate IDs',
      'no missing rows',
      'no added learning semantics'
    ]
  };

  const mismatches = [];
  if (MODE === 'write') {
    removeDir(path.join(QUESTION_ROOT, 'shards'));
    removeDir(path.join(NODE_ROOT, 'shards'));
  }

  for (const [file, object] of [...questionShards.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    writeOrCheck(file, stableJson(sortedObject(object)), mismatches);
  }
  for (const [file, object] of [...nodeShards.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    writeOrCheck(file, stableJson(sortedObject(object)), mismatches);
  }
  writeOrCheck(path.join(QUESTION_ROOT, 'manifest.json'), stableJson(questionManifest), mismatches);
  writeOrCheck(path.join(NODE_ROOT, 'manifest.json'), stableJson(nodeManifest), mismatches);
  writeOrCheck(AUDIT_PATH, stableJson(audit), mismatches);

  if (MODE === 'check' && mismatches.length) {
    console.error('POLITICS_SOURCE_SHARDS_CHECK_FAIL');
    for (const item of mismatches) console.error(item);
    process.exit(1);
  }

  console.log('POLITICS_SOURCE_SHARDS');
  console.log(JSON.stringify({
    mode: MODE,
    questionRows: questions.rows.length,
    questionShards: questionShards.size,
    nodeRows: nodes.rows.length,
    nodeShards: nodeShards.size,
    parity: true,
    mismatches
  }, null, 2));
}

main();
