import fs from 'node:fs';

const issues = [];

function read(relativeUrl) {
  return fs.readFileSync(new URL(relativeUrl, import.meta.url), 'utf8');
}

function requireText(label, text, needle) {
  if (!text.includes(needle)) issues.push(`${label}: missing ${needle}`);
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
  const required = [
    'Objective Global Map',
    '<a id="reading-a"></a>',
    '<a id="cloze"></a>',
    '<a id="reading-b"></a>',
    '<a id="ra-core-1"></a>',
    '<a id="ra-core-2"></a>',
    '<a id="ra-core-3"></a>',
    '<a id="ra-core-4"></a>',
    '<a id="ra-skill-map"></a>',
    '<a id="ra-skill-boundary"></a>',
    '<a id="ra-skill-cause"></a>',
    '<a id="ra-skill-attribution"></a>',
    '<a id="ra-skill-local-global"></a>',
    '<a id="ra-skill-true-irrelevant"></a>',
    '<a id="cl-core-1"></a>',
    '<a id="cl-core-2"></a>',
    '<a id="cl-core-3"></a>',
    '<a id="cl-core-4"></a>',
    '<a id="cl-skill-map"></a>',
    '<a id="cl-skill-best-fit"></a>',
    '<a id="cl-skill-collocation"></a>',
    '<a id="cl-skill-relation"></a>',
    '<a id="rb-core-1"></a>',
    '<a id="rb-core-2"></a>',
    '<a id="rb-core-3"></a>',
    '<a id="rb-core-4"></a>',
    '<a id="rb-skill-map"></a>',
    '<a id="rb-skill-local-global"></a>',
    '<a id="rb-skill-coupled"></a>',
    '<a id="rb-skill-reference"></a>',
    '<a id="runtime-bridge"></a>',
    '静态内容策略',
    'Deep Skill Content',
    'Fast Track 改变阅读路径，不改变静态资产完整度'
  ];
  required.forEach((needle) => requireText('objective-learning asset', asset, needle));
} catch (error) {
  issues.push(`objective-learning asset: ${error instanceof Error ? error.message : String(error)}`);
}

try {
  const page = read('../src/pages/objective-learn.astro');
  const required = [
    'content/english/modules/objective-learning.md',
    "from 'marked'",
    'href="#reading-a"',
    'href="#ra-core-2"',
    'href="#ra-skill-boundary"',
    'href="#cloze"',
    'href="#cl-core-2"',
    'href="#cl-skill-collocation"',
    'href="#reading-b"',
    'href="#rb-core-4"',
    'href="#rb-skill-coupled"',
    'href="#runtime-bridge"',
    'Skippable · Complete Static Asset'
  ];
  required.forEach((needle) => requireText('objective-learn page', page, needle));
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
    staticAssetMode: 'complete_skippable',
    taskCoverage: ['reading_a', 'cloze', 'reading_b']
  }
};

console.log(JSON.stringify(summary, null, 2));
if (issues.length) {
  console.error('\nObjective first-learning issues:');
  issues.forEach((issue) => console.error(`- ${issue}`));
  process.exitCode = 1;
}
