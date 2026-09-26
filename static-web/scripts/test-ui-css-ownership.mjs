import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const src = path.join(root, 'src');
const layouts = path.join(src, 'layouts');
const pages = path.join(src, 'pages');
const styles = path.join(src, 'styles');
const repoRoot = path.resolve(root, '..');

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


function stripCssComments(value) {
  return value.replace(/\/\*[\s\S]*?\*\//g, '');
}

function matchingBrace(value, openIndex) {
  let depth = 0;
  let quote = null;
  for (let index = openIndex; index < value.length; index += 1) {
    const char = value[index];
    if (quote) {
      if (char === '\\') {
        index += 1;
        continue;
      }
      if (char === quote) quote = null;
      continue;
    }
    if (char === "'" || char === '"') {
      quote = char;
      continue;
    }
    if (char === '{') depth += 1;
    if (char === '}') {
      depth -= 1;
      if (depth === 0) return index;
    }
  }
  return value.length - 1;
}

function scopedCssRules(value, start = 0, end = value.length, scopes = [], out = []) {
  let position = start;
  while (position < end) {
    const open = value.indexOf('{', position);
    if (open < 0 || open >= end) break;

    let prelude = value.slice(position, open);
    const lastStatement = prelude.lastIndexOf(';');
    if (lastStatement >= 0) prelude = prelude.slice(lastStatement + 1);
    prelude = prelude.trim().replace(/\s+/g, ' ');

    const close = matchingBrace(value, open);
    if (!prelude) {
      position = close + 1;
      continue;
    }

    if (/^@(media|supports|container|layer)\b/.test(prelude)) {
      scopedCssRules(value, open + 1, close, [...scopes, prelude], out);
    } else if (!prelude.startsWith('@')) {
      out.push(`${scopes.join(' > ')}||${prelude}`);
    }
    position = close + 1;
  }
  return out;
}

function cascadeDebt(value) {
  const counts = new Map();
  for (const key of scopedCssRules(stripCssComments(value))) {
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  const duplicates = [...counts.entries()].filter(([, count]) => count > 1);
  return {
    duplicateKinds: duplicates.length,
    extraDefinitions: duplicates.reduce((sum, [, count]) => sum + count - 1, 0),
  };
}

assert.equal(
  cascadeDebt('.a { color: red; } .a { color: blue; }').extraDefinitions,
  1,
  'same-scope duplicate selector must count as cascade debt',
);
assert.equal(
  cascadeDebt('.a { color: red; } @media (max-width: 700px) { .a { color: blue; } }').extraDefinitions,
  0,
  'responsive refinement must not count as same-scope cascade debt',
);
assert.equal(
  cascadeDebt('.a { color: red; } .a.active { color: blue; }').extraDefinitions,
  0,
  'state refinement must not count as same-scope cascade debt',
);

function gitShow(ref, relativePath) {
  try {
    return execFileSync('git', ['show', `${ref}:${relativePath}`], {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch {
    return null;
  }
}

const cssBaseRef = String(process.env.KIANOS_CSS_BASE_REF || '').trim();
if (cssBaseRef && !/^0+$/.test(cssBaseRef)) {
  for (const file of walk(styles).filter((entry) => entry.endsWith('.css'))) {
    const relative = path.relative(repoRoot, file).replaceAll(path.sep, '/');
    const current = read(file);
    const currentDebt = cascadeDebt(current);
    const base = gitShow(cssBaseRef, relative);

    if (base === null) {
      assert.equal(
        currentDebt.extraDefinitions,
        0,
        `${relative}: new stylesheet starts with ${currentDebt.extraDefinitions} same-scope duplicate definitions`,
      );
      continue;
    }

    if (base === current) continue;
    const baseDebt = cascadeDebt(base);
    assert.ok(
      currentDebt.extraDefinitions <= baseDebt.extraDefinitions,
      `${relative}: same-scope cascade debt grew ${baseDebt.extraDefinitions} → ${currentDebt.extraDefinitions}; consolidate the existing visual owner instead of appending an override layer`,
    );
    console.log(
      `CSS cascade debt ${relative}: ${baseDebt.extraDefinitions} → ${currentDebt.extraDefinitions}`,
    );
  }
}

console.log('PASS UI CSS ownership closure');
