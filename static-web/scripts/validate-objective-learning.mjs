import fs from 'node:fs';

const issues = [];

function read(relativeUrl) {
  return fs.readFileSync(new URL(relativeUrl, import.meta.url), 'utf8');
}
function requireText(label, text, needle) {
  if (!text.includes(needle)) issues.push(`${label}: missing ${needle}`);
}
function requireAny(label, text, needles) {
  if (!needles.some((needle) => text.includes(needle))) issues.push(`${label}: missing any of ${needles.join(' | ')}`);
}

try {
  const manifest = JSON.parse(read('../../content/english/manifest.json'));
  if (manifest?.owners?.objective_learning !== 'content/english/modules/objective-learning.md') {
    issues.push('manifest: objective_learning owner missing or incorrect');
  }
  if (manifest?.readiness?.objective_learning_present !== true) {
    issues.push('manifest: objective_learning_present is not true');
  }
} catch (error) {
  issues.push(`manifest: ${error instanceof Error ? error.message : String(error)}`);
}

try {
  const asset = read('../../content/english/modules/objective-learning.md');

  // Coverage floor: all three task objects and the shared decision kernel must exist.
  [
    'Reading A',
    'Cloze',
    'Reading B',
    'Question Demand',
    'Decisive Evidence',
    'Option Proposition',
    'Slot Demand',
    'Candidate',
    'Discourse',
    'Fast Track'
  ].forEach((needle) => requireText('objective-learning asset', asset, needle));

  requireAny('objective-learning asset', asset, ['REPRESENT', 'TEXT REPRESENTATION', 'Representation']);
  requireAny('objective-learning asset', asset, ['ADJUDICATE', 'Adjudication', 'best fit']);
  requireAny('objective-learning asset', asset, ['LexicalOS', 'Lexical']);

  // Minimality: the asset must explicitly remain skippable / repair-reservoir compatible.
  requireAny('objective-learning asset', asset, ['Fast Track 改变阅读路径', '强基础路径', '可以直接跳过']);

  // Do not validate exact block counts, exact anchor inventory, or symmetrical Skill Map shape.
  // Those are current content choices, not Logic truth.
} catch (error) {
  issues.push(`objective-learning asset: ${error instanceof Error ? error.message : String(error)}`);
}

try {
  const page = read('../src/pages/objective-learn.astro');
  requireText('objective-learn page', page, 'content/english/modules/objective-learning.md');
  requireAny('objective-learn page', page, ['Skippable', 'Fast Track', '可跳过']);
  requireText('objective-learn page', page, 'reading-a');
  requireText('objective-learn page', page, 'cloze');
  requireText('objective-learn page', page, 'reading-b');
} catch (error) {
  issues.push(`objective-learn page: ${error instanceof Error ? error.message : String(error)}`);
}

for (const [label, file, anchor] of [
  ['Cloze home', '../src/pages/cloze.astro', 'objective-learn/#cloze'],
  ['Reading A home', '../src/pages/reading.astro', 'objective-learn/#reading-a'],
  ['Reading B home', '../src/pages/reading-b.astro', 'objective-learn/#reading-b']
]) {
  try {
    requireText(label, read(file), anchor);
  } catch (error) {
    issues.push(`${label}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

const summary = {
  objectiveLearning: {
    status: issues.length ? 'invalid' : 'ready',
    issueCount: issues.length,
    canonicalOwner: 'content/english/modules/objective-learning.md',
    learnerPage: 'static-web/src/pages/objective-learn.astro',
    validationPolicy: 'semantic-coverage-and-skippability-not-exact-decomposition',
    taskCoverage: ['reading_a', 'cloze', 'reading_b']
  }
};

console.log(JSON.stringify(summary, null, 2));
if (issues.length) {
  console.error('\nObjective first-learning issues:');
  issues.forEach((issue) => console.error(`- ${issue}`));
  process.exitCode = 1;
}