import { listPoliticsChapterPathsCurrent } from '../src/lib/politicsRuntimeFirstReady.mjs';
import { loadPoliticsChapterCurrent as loadBase } from '../src/lib/politicsRuntimeFirstReady.mjs';
import {
  applyMarxismGlobalFirstReady,
  marxismFirstReadyDiagnostics,
  marxismFirstReadyOwnerForQuestion
} from '../src/lib/politicsMarxismFirstReady.mjs';

const EXPECTED_COUNTS = Object.freeze({
  'POL27-CF-MARX-C00-S01': 7,
  'POL27-CF-MARX-C00-S02': 3,
  'POL27-CF-MARX-C01-S01': 6,
  'POL27-CF-MARX-C01-S02': 26,
  'POL27-CF-MARX-C02-S01': 28,
  'POL27-CF-MARX-C02-K03': 11,
  'POL27-CF-MARX-C02-S02': 8,
  'POL27-CF-MARX-C03-S01': 31,
  'POL27-CF-MARX-C03-S02': 22,
  'POL27-CF-MARX-C03-S03': 6,
  'POL27-CF-MARX-C04-S01': 43,
  'POL27-CF-MARX-C04-S02': 6,
  'POL27-CF-MARX-C04-S03': 10,
  'POL27-CF-MARX-C05-S01': 39,
  'POL27-CF-MARX-C05-S02': 68,
  'POL27-CF-MARX-C05-S03': 6,
  'POL27-CF-MARX-C06-S01': 27,
  'POL27-CF-MARX-C06-S02': 16,
  'POL27-CF-MARX-C06-S03': 1,
  'POL27-CF-MARX-C07-S01': 18,
  'POL27-CF-MARX-C07-S02': 8,
  'POL27-CF-MARX-C08': 6
});

const K03_EXPECTED = new Set([
  'X1000-MARX-M-026','X1000-MARX-M-027','X1000-MARX-M-028','X1000-MARX-M-030',
  'X1000-MARX-M-045','X1000-MARX-M-047','X1000-MARX-M-048','X1000-MARX-M-049',
  'X1000-MARX-S-028','X1000-MARX-S-029','X1000-MARX-S-039'
]);

function fail(message) {
  console.error(`POLITICS_MARXISM_FIRST_READY_FAIL: ${message}`);
  process.exitCode = 1;
}

const diagnostics = marxismFirstReadyDiagnostics();
if (diagnostics.missingRegions.length) fail(`missing regions: ${diagnostics.missingRegions.join(', ')}`);
if (diagnostics.orderedUnitIds.length !== Object.keys(EXPECTED_COUNTS).length) {
  fail(`unit count ${diagnostics.orderedUnitIds.length}/${Object.keys(EXPECTED_COUNTS).length}`);
}
if (diagnostics.questionCount !== 396) fail(`question count ${diagnostics.questionCount}/396`);
for (const [unitId, expected] of Object.entries(EXPECTED_COUNTS)) {
  const actual = Number(diagnostics.counts[unitId] || 0);
  if (actual !== expected) fail(`${unitId} first-ready count ${actual}/${expected}`);
}

const seen = new Map();
const runtimeByUnit = new Map();
for (const row of listPoliticsChapterPathsCurrent().filter((row) => row.subject === 'marxism')) {
  const chapter = applyMarxismGlobalFirstReady(loadBase(row.subject, row.chapter), row.subject);
  for (const unit of chapter.units || []) {
    const unitId = String(unit?.unitId || '');
    if (!runtimeByUnit.has(unitId)) runtimeByUnit.set(unitId, []);
    for (const question of unit.questions || []) {
      const questionId = String(question?.id || '');
      runtimeByUnit.get(unitId).push(questionId);
      if (seen.has(questionId)) fail(`duplicate runtime question ${questionId}: ${seen.get(questionId)} + ${unitId}`);
      else seen.set(questionId, unitId);
      const owner = marxismFirstReadyOwnerForQuestion(questionId);
      const represented = new Set([unitId, ...(unit.representedNaturalUnitIds || []).map(String)]);
      if (!represented.has(owner)) fail(`${questionId} rendered at ${unitId} but formal owner is ${owner}`);
    }
  }
}
if (seen.size !== 396) fail(`rendered unique questions ${seen.size}/396`);

const k03Actual = new Set(runtimeByUnit.get('POL27-CF-MARX-C02-K03') || []);
if (k03Actual.size !== K03_EXPECTED.size || [...K03_EXPECTED].some((id) => !k03Actual.has(id))) {
  fail(`K03 exact first-ready set drift: ${[...k03Actual].sort().join(',')}`);
}

const knownDeferrals = {
  'X1000-MARX-M-029': 'POL27-CF-MARX-C03-S02',
  'X1000-MARX-M-035': 'POL27-CF-MARX-C02-S02',
  'X1000-MARX-M-046': 'POL27-CF-MARX-C02-S02',
  'X1000-MARX-M-074': 'POL27-CF-MARX-C03-S02',
  'X1000-MARX-M-054': 'POL27-CF-MARX-C03-S01',
  'X1000-MARX-M-011': 'POL27-CF-MARX-C03-S01'
};
for (const [questionId, expectedOwner] of Object.entries(knownDeferrals)) {
  const actual = marxismFirstReadyOwnerForQuestion(questionId);
  if (actual !== expectedOwner) fail(`${questionId} owner ${actual}/${expectedOwner}`);
}

if (!process.exitCode) {
  console.log('POLITICS_MARXISM_FIRST_READY_PASS');
  console.log(JSON.stringify({ units: diagnostics.orderedUnitIds.length, questions: diagnostics.questionCount, exactK03: k03Actual.size, knownDeferrals: Object.keys(knownDeferrals).length }));
}
