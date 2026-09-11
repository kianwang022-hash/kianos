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
  requireText('objective-learning asset', asset, 'Objective Global Map');
  requireText('objective-learning asset', asset, '<a id="cloze"></a>');
  requireText('objective-learning asset', asset, '<a id="reading-a"></a>');
  requireText('objective-learning asset', asset, '<a id="reading-b"></a>');
  requireText('objective-learning asset', asset, 'Core Block 1');
  requireText('objective-learning asset', asset, 'Skill Map');
  requireText('objective-learning asset', asset, 'Starter Skill Content');
} catch (error) {
  issues.push(`objective-learning asset: ${error instanceof Error ? error.message : String(error)}`);
}

try {
  const page = read('../src/pages/objective-learn.astro');
  requireText('objective-learn page', page, 'content/english/modules/objective-learning.md');
  requireText('objective-learn page', page, "from 'marked'");
  requireText('objective-learn page', page, 'href="#cloze"');
  requireText('objective-learn page', page, 'href="#reading-a"');
  requireText('objective-learn page', page, 'href="#reading-b"');
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
    learnerPage: 'static-web/src/pages/objective-learn.astro'
  }
};

console.log(JSON.stringify(summary, null, 2));
if (issues.length) {
  console.error('\nObjective first-learning issues:');
  issues.forEach((issue) => console.error(`- ${issue}`));
  process.exitCode = 1;
}
