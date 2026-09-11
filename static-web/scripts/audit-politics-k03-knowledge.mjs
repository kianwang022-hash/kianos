import fs from 'node:fs';
import path from 'node:path';
import { loadPoliticsChapterCurrent } from '../src/lib/politicsCurrent.mjs';

const repoRoot = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(process.cwd(), '..');

const K03 = 'POL27-CF-MARX-C02-K03';
const NODE_IDS = [`${K03}-N01`, `${K03}-N02`, `${K03}-N03`, `${K03}-N04`];
const shardPath = path.join(repoRoot, 'content/politics/source/nodes/shards/pol27-cf/marx/c02.json');
const repairPath = path.join(repoRoot, 'content/politics/learning/marxism/ch02.repair.json');
const memoryPath = path.join(repoRoot, 'content/politics/learning/marxism/ch02.memory.json');

function fail(message) { throw new Error(`POLITICS_K03_KNOWLEDGE_AUDIT_FAIL:${message}`); }
function readJson(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }

const shard = readJson(shardPath);
const repair = readJson(repairPath);
const memory = readJson(memoryPath);
const subtree = Object.entries(shard)
  .filter(([id]) => id === K03 || id.startsWith(`${K03}-`))
  .map(([id, row]) => ({ id, ...row }));

for (const nodeId of NODE_IDS) {
  const row = shard[nodeId];
  if (!row) fail(`missing canonical node ${nodeId}`);
  const descendants = subtree.filter((item) => item.id.startsWith(`${nodeId}-`));
  if (!descendants.length) fail(`canonical node has no teaching descendants: ${nodeId}`);
}

const expectedTitles = {
  [`${K03}-N01`]: ['同一性', '斗争性', '辩证关系'],
  [`${K03}-N02`]: ['同一性', '斗争性', '发展中的作用'],
  [`${K03}-N03`]: ['普遍性', '特殊性', '共性', '个性'],
  [`${K03}-N04`]: ['不平衡性']
};
for (const [nodeId, terms] of Object.entries(expectedTitles)) {
  const text = String(shard[nodeId]?.title || shard[nodeId]?.original_text_span || '');
  for (const term of terms) if (!text.includes(term)) fail(`${nodeId} missing title semantic ${term}`);
}

const criticalEvidence = [
  ['N01_IDENTITY', `${K03}-N01-I01`, ['相互依存', '相互贯通']],
  ['N01_STRUGGLE', `${K03}-N01-I02`, ['相互排斥', '相互分离']],
  ['N01_RELATION', `${K03}-N01-I03`, ['相互联结', '相辅相成']],
  ['N02_IDENTITY_ROLE', `${K03}-N02-I01`, ['同一性', '发展']],
  ['N02_STRUGGLE_ROLE', `${K03}-N02-I02`, ['斗争性', '发展']],
  ['N02_COMBINED_ROLE', `${K03}-N02-I03`, ['共同发生作用', '不是各自孤立']],
  ['N03_UNIVERSAL', `${K03}-N03-I01`, ['普遍性', '无处不在', '无时不有']],
  ['N03_SPECIAL', `${K03}-N03-I02`, ['特殊性', '各有其特点']],
  ['N03_RELATION', `${K03}-N03-I03`, ['普遍性', '特殊性', '辩证统一', '共性', '个性']],
  ['N04_STRUCTURE', `${K03}-N04-I01`, ['多种矛盾']],
  ['N04_RESOLUTION', `${K03}-N04-I02`, ['矛盾的解决形式']],
  ['N04_METHOD', `${K03}-N04-I03`, ['方法论意义']]
];

for (const [label, nodeId, terms] of criticalEvidence) {
  const row = shard[nodeId];
  if (!row) fail(`missing critical source evidence ${label}:${nodeId}`);
  const text = `${row.title || ''}\n${row.original_text_span || ''}`;
  for (const term of terms) if (!text.includes(term)) fail(`${label} missing term ${term}`);
}

const projection = repair?.k03_question_node_evidence?.node_projection || [];
const projectedNodeIds = new Set(projection.map((row) => row.node_id));
if (projection.length !== 4 || NODE_IDS.some((id) => !projectedNodeIds.has(id))) {
  fail('question-node evidence does not use the four canonical K03 nodes exactly');
}
if (repair?.k03_question_node_evidence?.coverage?.mapped_question_count !== 15) fail('15/15 question coverage missing');
if (repair?.k03_question_node_evidence?.unit_return_gate?.emit_mastery_states !== false) fail('repair projection is emitting mastery before learner evidence');

const memoryCandidates = memory?.units?.[K03]?.candidates || [];
if (memory?.admission_gate?.default !== 'NOT_ADMITTED') fail('Memory default is not NOT_ADMITTED');
if (memoryCandidates.some((item) => item.admission !== 'CANDIDATE_ONLY')) fail('K03 Memory candidate was admitted before evidence');

const chapter = loadPoliticsChapterCurrent('marxism', 'ch02');
const learnerUnit = chapter.units.find((unit) => (unit.representedNaturalUnitIds || []).includes(K03));
if (!learnerUnit) fail('K03 is not represented in Current learner projection');
const k03Source = (learnerUnit.sourceNodes || []).find((node) => node.id === K03);
if (!k03Source?.resolved || !k03Source.text) fail('K03 canonical source is not actually rendered into first learning');
for (const required of ['同一性', '斗争性', '普遍性', '特殊性', '不平衡性']) {
  if (!k03Source.text.includes(required)) fail(`learner source projection missing ${required}`);
}

const nonCrossEngine = subtree
  .filter((row) => row.verification_status !== 'source_bound_cross_engine_ocr')
  .map((row) => ({
    id: row.id,
    node_type: row.node_type || '',
    title: row.title || '',
    verification_status: row.verification_status || ''
  }));
const criticalNonCrossEngine = nonCrossEngine.filter((row) => criticalEvidence.some(([, id]) => id === row.id));

console.log('POLITICS_K03_KNOWLEDGE_AUDIT');
console.log(JSON.stringify({
  status: criticalNonCrossEngine.length ? 'BLOCKED_BY_CRITICAL_SOURCE_REVIEW' : 'PASS',
  canonicalNodeIds: NODE_IDS,
  sourceSubtreeRows: subtree.length,
  renderedInFirstLearning: true,
  questionNodeProjectionCount: projection.length,
  mappedQuestionCount: repair?.k03_question_node_evidence?.coverage?.mapped_question_count || 0,
  repairIsAdaptiveNotMastery: repair?.k03_question_node_evidence?.unit_return_gate?.emit_mastery_states === false,
  memoryCandidateCount: memoryCandidates.length,
  memoryPrematureAdmissions: memoryCandidates.filter((item) => item.admission !== 'CANDIDATE_ONLY').length,
  nonCrossEngineSourceRows: nonCrossEngine,
  criticalNonCrossEngineSourceRows: criticalNonCrossEngine
}, null, 2));

if (criticalNonCrossEngine.length) process.exit(2);
