import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const src = path.join(root, 'src');
const layouts = path.join(src, 'layouts');
const pages = path.join(src, 'pages');

const read = (file) => fs.readFileSync(file, 'utf8');
const styleImports = (file) => [...read(file).matchAll(/import '\.\.\/styles\/([^']+\.css)';/g)].map((m) => m[1]);

const expected = {
  'Base.astro': [
    'global.css',
    'shared-visual-foundation.css',
    'runtime.css',
    'visual-convergence.css',
    'shared-workspace-composition.css',
    'shared-shell.css',
    'study-timer.css'
  ],
  'EnglishBase.astro': [
    'global.css',
    'shared-visual-foundation.css',
    'runtime.css',
    'english.css',
    'visual-convergence.css',
    'shared-workspace-composition.css',
    'english-presentation.css',
    'shared-shell.css',
    'study-timer.css'
  ],
  'PoliticsBase.astro': [
    'global.css',
    'shared-visual-foundation.css',
    'runtime.css',
    'visual-convergence.css',
    'politics-presentation.css',
    'shared-workspace-composition.css',
    'politics-visual-tuning.css',
    'shared-shell.css',
    'study-timer.css'
  ],
  'XizongBase.astro': [
    'global.css',
    'shared-visual-foundation.css',
    'runtime.css',
    'xizong-dense-calm.css',
    'visual-convergence.css',
    'xizong-presentation.css',
    'shared-workspace-composition.css',
    'xizong-visual-tuning.css',
    'shared-shell.css',
    'study-timer.css'
  ],
  'LexicalBase.astro': [
    'global.css',
    'shared-visual-foundation.css',
    'runtime.css',
    'visual-convergence.css',
    'shared-workspace-composition.css',
    'lexical-presentation.css',
    'shared-shell.css',
    'study-timer.css'
  ]
};

for (const [file, imports] of Object.entries(expected)) {
  assert.deepEqual(styleImports(path.join(layouts, file)), imports, `${file}: style ownership/order drift`);
}

const frame = read(path.join(layouts, 'BaseFrame.astro'));
assert.ok(!/styles\/[^'"]+\.css/.test(frame), 'BaseFrame must remain presentation-style free');

const retired = [
  'stage-one-composition.css',
  'viewport-workspaces.css',
  'site-visual-tuning.css'
];
for (const file of retired) {
  assert.ok(!fs.existsSync(path.join(src, 'styles', file)), `retired style still exists: ${file}`);
}

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

for (const file of walk(src)) {
  if (!/\.(astro|mjs|js|ts|tsx|css)$/.test(file)) continue;
  const text = read(file);
  for (const retiredFile of retired) {
    assert.ok(!text.includes(retiredFile), `${path.relative(root, file)} still references ${retiredFile}`);
  }
}

const pageFiles = walk(pages).filter((file) => file.endsWith('.astro'));
for (const file of pageFiles) {
  const rel = path.relative(pages, file).replaceAll(path.sep, '/');
  const text = read(file);
  let layout = null;
  if (rel.startsWith('politics/')) layout = 'PoliticsBase.astro';
  else if (rel.startsWith('xizong/')) layout = 'XizongBase.astro';
  else if (
    rel === 'answer.astro' ||
    /^lexical-validation(?:-\d+)?\.astro$/.test(rel) ||
    rel.startsWith('vocabulary/')
  ) layout = 'LexicalBase.astro';
  else if (
    /^(?:cloze(?:\/|\.astro)|english(?:-exam(?:-writing)?(?:\/|\.astro)|\.astro)|external-reading\.astro|objective-learn\.astro|reading(?:-b)?(?:\/|\.astro)|translation(?:-learn)?(?:\/|\.astro)|writing(?:-learn)?(?:\/|\.astro))/.test(rel)
  ) layout = 'EnglishBase.astro';

  if (!layout) continue;
  assert.ok(text.includes(`layouts/${layout}`), `${rel}: expected ${layout}`);
  assert.ok(!text.includes('layouts/Base.astro'), `${rel}: subject page fell back to shared Base`);
}

for (const [name, forbidden] of [
  ['Base.astro', ['english.css','english-presentation.css','politics-presentation.css','politics-visual-tuning.css','xizong-dense-calm.css','xizong-presentation.css','xizong-visual-tuning.css','lexical-presentation.css']]
]) {
  const imports = new Set(styleImports(path.join(layouts, name)));
  for (const file of forbidden) assert.ok(!imports.has(file), `${name}: subject style leaked into shared Base: ${file}`);
}

console.log('PASS UI CSS ownership closure');
