import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const src = path.join(root, 'src');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');

const base = read('src/layouts/Base.astro');
const frame = read('src/layouts/BaseFrame.astro');
const layouts = {
  english: read('src/layouts/EnglishBase.astro'),
  politics: read('src/layouts/PoliticsBase.astro'),
  xizong: read('src/layouts/XizongBase.astro'),
  lexical: read('src/layouts/LexicalBase.astro')
};

for (const forbidden of [
  'english.css',
  'english-presentation.css',
  'politics-presentation.css',
  'politics-visual-tuning.css',
  'xizong-dense-calm.css',
  'xizong-presentation.css',
  'xizong-visual-tuning.css',
  'lexical-presentation.css',
  'site-visual-tuning.css',
  'stage-one-composition.css',
  'viewport-workspaces.css'
]) {
  assert.ok(!base.includes(forbidden), `shared Base must not import subject/historical CSS: ${forbidden}`);
}

for (const required of [
  'global.css',
  'shared-visual-foundation.css',
  'runtime.css',
  'visual-convergence.css',
  'shared-workspace-composition.css',
  'shared-shell.css',
  'study-timer.css'
]) {
  assert.ok(base.includes(required), `shared Base missing shared owner: ${required}`);
}

assert.ok(!/styles\/.+\.css/.test(frame), 'BaseFrame must remain style-free');

for (const [subject, required] of Object.entries({
  english: ['english.css', 'english-presentation.css'],
  politics: ['politics-presentation.css', 'politics-visual-tuning.css'],
  xizong: ['xizong-dense-calm.css', 'xizong-presentation.css', 'xizong-visual-tuning.css'],
  lexical: ['lexical-presentation.css']
})) {
  for (const css of required) {
    assert.ok(layouts[subject].includes(css), `${subject} layout missing ${css}`);
  }
}

const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
  const full = path.join(dir, entry.name);
  return entry.isDirectory() ? walk(full) : [full];
});

const pages = walk(path.join(src, 'pages')).filter((p) => p.endsWith('.astro'));
const rel = (p) => path.relative(root, p).replaceAll(path.sep, '/');

const rules = [
  { match: (p) => p.includes('/pages/politics/'), layout: 'PoliticsBase.astro' },
  { match: (p) => p.includes('/pages/xizong/'), layout: 'XizongBase.astro' },
  { match: (p) => /\/pages\/(cloze|english|english-exam|external-reading|objective-learn|reading|reading-b|translation|translation-learn|writing|writing-learn)(\/|\.|-)/.test(p), layout: 'EnglishBase.astro' },
  { match: (p) => /\/pages\/(vocabulary|lexical-validation|answer)(\/|\.|-)/.test(p), layout: 'LexicalBase.astro' }
];

for (const page of pages) {
  const p = rel(page);
  const rule = rules.find((r) => r.match('/' + p));
  if (!rule) continue;
  const text = fs.readFileSync(page, 'utf8');
  assert.ok(text.includes(rule.layout), `${p} must use ${rule.layout}`);
  assert.ok(!text.includes('layouts/Base.astro'), `${p} must not fall back to shared Base`);
}

for (const retired of [
  'src/styles/stage-one-composition.css',
  'src/styles/viewport-workspaces.css',
  'src/styles/site-visual-tuning.css'
]) {
  assert.ok(!fs.existsSync(path.join(root, retired)), `retired CSS still exists: ${retired}`);
}

console.log('PASS CSS ownership closure contract');
