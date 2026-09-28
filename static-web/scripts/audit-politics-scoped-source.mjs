import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const repoRoot = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(process.cwd(), '..');

const monoliths = [
  'content/politics/source/xiao_2027_questions.jsonl',
  'content/politics/source/source_node_registry.v2.jsonl'
];

const expectedK03 = new Set([
  'X1000-MARX-S-028', 'X1000-MARX-S-029', 'X1000-MARX-S-039',
  'X1000-MARX-M-026', 'X1000-MARX-M-027', 'X1000-MARX-M-028',
  'X1000-MARX-M-029', 'X1000-MARX-M-030', 'X1000-MARX-M-035',
  'X1000-MARX-M-045', 'X1000-MARX-M-046', 'X1000-MARX-M-047',
  'X1000-MARX-M-048', 'X1000-MARX-M-049', 'X1000-MARX-M-074'
]);

const held = [];
function fail(message) { throw new Error(`POLITICS_SCOPED_SOURCE_ACCEPTANCE_FAIL:${message}`); }

try {
  for (const relativePath of monoliths) {
    const source = path.join(repoRoot, relativePath);
    if (!fs.existsSync(source)) fail(`missing source monolith before hold: ${relativePath}`);
    const hold = `${source}.acceptance-hold-${process.pid}`;
    fs.renameSync(source, hold);
    held.push({ source, hold, relativePath });
  }

  const moduleUrl = pathToFileURL(path.join(repoRoot, 'static-web/src/lib/politicsRuntimeScoped.mjs'));
  moduleUrl.searchParams.set('acceptance', String(Date.now()));
  const runtime = await import(moduleUrl.href);

  const health = runtime.politicsCurrentHealth();
  if (health.status !== 'ready') fail(`health=${health.status}`);
  if (health.monolithRuntimeDependency !== false) fail('runtime still declares monolith dependency');
  if (health.parity !== true) fail('source shard parity not admitted');

  const chapter = runtime.loadPoliticsChapterCurrent('marxism', 'ch02');
  const k03Unit = chapter.units.find((unit) => (unit.representedNaturalUnitIds || []).includes('POL27-CF-MARX-C02-K03'));
  if (!k03Unit) fail('K03 represented unit missing from Marxism ch02');
  if (!k03Unit.sourceNodes?.length) fail('K03-bearing unit has no resolved scoped source nodes');

  const chapterQuestionIds = new Set(chapter.units.flatMap((unit) => (unit.questions || []).map((question) => question.id)));
  const missingK03 = [...expectedK03].filter((id) => !chapterQuestionIds.has(id));
  if (missingK03.length) fail(`K03 scoped questions missing: ${missingK03.join(',')}`);

  for (const { source, relativePath } of held) {
    if (fs.existsSync(source)) fail(`monolith unexpectedly available during load: ${relativePath}`);
  }

  const diagnostics = runtime.politicsRuntimeDiagnostics();
  if (diagnostics.monolithRuntimeDependency !== false) fail('diagnostics report monolith dependency');
  if (diagnostics.sourceShardParity !== true) fail('diagnostics report shard parity failure');
  if (!diagnostics.loadedQuestionShards?.length) fail('no question shard was consumed');
  if (!diagnostics.loadedNodeShards?.length) fail('no node shard was consumed');
  if (!diagnostics.loadedNodeShards.some((item) => item.endsWith('/pol27-cf/marx/c02.json'))) {
    fail('Marx C02 source-node shard was not consumed');
  }

  console.log('POLITICS_SCOPED_SOURCE_ACCEPTANCE');
  console.log(JSON.stringify({
    status: 'PASS',
    monolithsUnavailableDuringLoad: monoliths,
    k03QuestionCount: expectedK03.size,
    loadedQuestionShards: diagnostics.loadedQuestionShards,
    loadedNodeShards: diagnostics.loadedNodeShards,
    sourceShardParity: diagnostics.sourceShardParity
  }, null, 2));
} finally {
  for (const { source, hold } of held.reverse()) {
    if (fs.existsSync(hold) && !fs.existsSync(source)) fs.renameSync(hold, source);
  }
}
