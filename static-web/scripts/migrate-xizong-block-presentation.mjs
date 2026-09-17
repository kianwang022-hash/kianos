import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const webRoot = path.join(repoRoot, 'static-web');
const read = (relative) => fs.readFileSync(path.join(repoRoot, relative), 'utf8');
const write = (relative, content) => fs.writeFileSync(path.join(repoRoot, relative), content);

const ownerPath = 'static-web/src/styles/xizong-block-workspace.css';
if (fs.existsSync(path.join(repoRoot, ownerPath))) {
  console.log('XIZONG_BLOCK_PRESENTATION_ALREADY_MIGRATED');
  process.exit(0);
}

const blockSelector = /(?:\.xv6Block(?:\b|[A-Z_-])|\.portedStudy(?:Runtime|Header|ContextRow|ShellActions|Identity|IdentityMeta|Tabs|Layout|Outline|KpRail|Main|Lead|Article|StageAction)(?:\b|[A-Z_-])|\.portedKp(?:Workspace|WorkspaceHeader|Cards|Card|RecallCard|Canonical)(?:\b|[A-Z_-])|\.portedRecall(?:Prompt|Answer|Rating)(?:\b|[A-Z_-])|\.portedBlock(?:Recall|Complete)(?:\b|[A-Z_-])|\.portedPrimaryAction\b|\.xv6(?:MinimalModel|Logic|Lecture|Group|VisualGate|LaterCue|Recall|Attention|PersonalDock|Learner|Kp)(?:\b|[A-Z_-])|\[data-study-stage|\[data-kp-recall-card|\[data-kp-answer)/;
const xizongScope = /(?:\.surface-xizong\b|\.surfaceBody-xizong\b)/;

function isBlockSpecificSelector(selector) {
  return xizongScope.test(selector) && blockSelector.test(selector);
}

function splitSelectorList(selectorText) {
  const out = [];
  let start = 0;
  let paren = 0;
  let bracket = 0;
  let quote = '';
  for (let i = 0; i < selectorText.length; i += 1) {
    const ch = selectorText[i];
    if (quote) {
      if (ch === '\\') i += 1;
      else if (ch === quote) quote = '';
      continue;
    }
    if (ch === '"' || ch === "'") { quote = ch; continue; }
    if (ch === '(') paren += 1;
    else if (ch === ')') paren = Math.max(0, paren - 1);
    else if (ch === '[') bracket += 1;
    else if (ch === ']') bracket = Math.max(0, bracket - 1);
    else if (ch === ',' && paren === 0 && bracket === 0) {
      out.push(selectorText.slice(start, i).trim());
      start = i + 1;
    }
  }
  out.push(selectorText.slice(start).trim());
  return out.filter(Boolean);
}

function consumeTrivia(source, from) {
  let i = from;
  while (i < source.length) {
    if (/\s/.test(source[i])) { i += 1; continue; }
    if (source.startsWith('/*', i)) {
      const end = source.indexOf('*/', i + 2);
      if (end < 0) return source.length;
      i = end + 2;
      continue;
    }
    break;
  }
  return i;
}

function findTerminator(source, from) {
  let quote = '';
  let comment = false;
  let paren = 0;
  let bracket = 0;
  for (let i = from; i < source.length; i += 1) {
    const ch = source[i];
    const next = source[i + 1];
    if (comment) {
      if (ch === '*' && next === '/') { comment = false; i += 1; }
      continue;
    }
    if (quote) {
      if (ch === '\\') i += 1;
      else if (ch === quote) quote = '';
      continue;
    }
    if (ch === '/' && next === '*') { comment = true; i += 1; continue; }
    if (ch === '"' || ch === "'") { quote = ch; continue; }
    if (ch === '(') { paren += 1; continue; }
    if (ch === ')') { paren = Math.max(0, paren - 1); continue; }
    if (ch === '[') { bracket += 1; continue; }
    if (ch === ']') { bracket = Math.max(0, bracket - 1); continue; }
    if (paren === 0 && bracket === 0 && (ch === '{' || ch === ';')) return { index: i, type: ch };
  }
  return null;
}

function findMatchingBrace(source, openIndex) {
  let depth = 1;
  let quote = '';
  let comment = false;
  for (let i = openIndex + 1; i < source.length; i += 1) {
    const ch = source[i];
    const next = source[i + 1];
    if (comment) {
      if (ch === '*' && next === '/') { comment = false; i += 1; }
      continue;
    }
    if (quote) {
      if (ch === '\\') i += 1;
      else if (ch === quote) quote = '';
      continue;
    }
    if (ch === '/' && next === '*') { comment = true; i += 1; continue; }
    if (ch === '"' || ch === "'") { quote = ch; continue; }
    if (ch === '{') depth += 1;
    else if (ch === '}') {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  throw new Error(`CSS_UNBALANCED_BRACE_AT:${openIndex}`);
}

function partitionCss(source) {
  let kept = '';
  let moved = '';
  let cursor = 0;
  while (cursor < source.length) {
    const significant = consumeTrivia(source, cursor);
    const trivia = source.slice(cursor, significant);
    if (significant >= source.length) { kept += trivia; break; }
    const term = findTerminator(source, significant);
    if (!term) { kept += source.slice(cursor); break; }
    if (term.type === ';') {
      kept += source.slice(cursor, term.index + 1);
      cursor = term.index + 1;
      continue;
    }

    const prelude = source.slice(significant, term.index).trim();
    const close = findMatchingBrace(source, term.index);
    const inner = source.slice(term.index + 1, close);
    if (prelude.startsWith('@')) {
      const nested = partitionCss(inner);
      if (nested.kept.trim()) kept += `${trivia}${prelude}{${nested.kept}}`;
      else kept += trivia;
      if (nested.moved.trim()) moved += `\n${prelude}{${nested.moved}}\n`;
      cursor = close + 1;
      continue;
    }

    const selectors = splitSelectorList(prelude);
    const movedSelectors = selectors.filter(isBlockSpecificSelector);
    const keptSelectors = selectors.filter((selector) => !isBlockSpecificSelector(selector));
    if (movedSelectors.length) moved += `\n${movedSelectors.join(',\n')}{${inner}}\n`;
    if (keptSelectors.length) kept += `${trivia}${keptSelectors.join(',\n')}{${inner}}`;
    else kept += trivia;
    cursor = close + 1;
  }
  return { kept, moved };
}

const broadFiles = [
  'static-web/src/styles/xizong-dense-calm.css',
  'static-web/src/styles/xizong-presentation.css',
  'static-web/src/styles/viewport-workspaces.css',
  'static-web/src/styles/site-visual-tuning.css'
];

const movedSections = [];
for (const file of broadFiles) {
  const original = read(file);
  const { kept, moved } = partitionCss(original);
  write(file, kept.replace(/\n{4,}/g, '\n\n\n'));
  movedSections.push(`\n/* Migrated from ${file.replace('static-web/src/styles/', '')}. */\n${moved.trim()}\n`);
}

const componentFiles = [
  'static-web/src/components/XizongBlockV6.astro',
  'static-web/src/components/XizongCognitiveProjectionStage.astro',
  'static-web/src/components/XizongLearnerObjectBridge.astro',
  'static-web/src/components/XizongBlockWorkspaceShell.astro',
  'static-web/src/components/XizongStudyEnhancer.astro',
  'static-web/src/components/XizongVisibleTypeFloor.astro'
];

const componentStyles = [];
for (const file of componentFiles) {
  const original = read(file);
  let styleCount = 0;
  const stripped = original.replace(/<style(?:\s[^>]*)?>([\s\S]*?)<\/style>/gi, (_match, css) => {
    styleCount += 1;
    componentStyles.push(`\n/* Migrated from ${path.basename(file)}. */\n${css.trim()}\n`);
    return '';
  });
  if (styleCount === 0) throw new Error(`EXPECTED_BLOCK_STYLE_MISSING:${file}`);
  write(file, stripped.replace(/\n{4,}/g, '\n\n\n'));
}

const blockComponentPath = 'static-web/src/components/XizongBlockV6.astro';
let blockComponent = read(blockComponentPath);
if (!blockComponent.includes('xzBlockWorkspace')) {
  blockComponent = blockComponent.replace(
    'class="portedStudyRuntime portedStudyRuntimeV2 xv6Block"',
    'class="portedStudyRuntime portedStudyRuntimeV2 xv6Block xzBlockWorkspace"'
  );
  if (!blockComponent.includes('xzBlockWorkspace')) throw new Error('BLOCK_ROOT_PRESENTATION_NAMESPACE_INSERT_FAILED');
  write(blockComponentPath, blockComponent);
}

const routePath = 'static-web/src/pages/xizong/[system]/[block].astro';
let route = read(routePath);
if (!route.includes("../../../styles/xizong-block-workspace.css")) {
  route = route.replace(
    "import Base from '../../../layouts/Base.astro';",
    "import Base from '../../../layouts/Base.astro';\nimport '../../../styles/xizong-block-workspace.css';"
  );
  if (!route.includes("../../../styles/xizong-block-workspace.css")) throw new Error('BLOCK_OWNER_IMPORT_INSERT_FAILED');
  write(routePath, route);
}

const auxPath = 'static-web/src/components/XizongBlockAuxLayoutSync.astro';
let aux = read(auxPath);
const applyPattern = /const apply = \(\) => \{[\s\S]*?layout\.style\.setProperty\('grid-template-columns',[\s\S]*?\n\s*\};/;
if (!applyPattern.test(aux)) throw new Error('AUX_INLINE_GRID_OWNER_PATTERN_NOT_FOUND');
aux = aux.replace(applyPattern, `const apply = () => {\n      const weight = root.dataset.auxWeight || 'none';\n      layout.dataset.auxWeight = ['none', 'light', 'rich'].includes(weight) ? weight : 'none';\n    };`);
write(auxPath, aux);

let owner = `/* Xizong Block Workspace — sole Current Xizong-specific presentation owner.\n   Shared Shell / global tokens / runtime.css stay upstream. Learning, Runtime, learner-object, Evidence and Repair semantics stay in their existing components. */\n\nbody#kianos-workspace.surfaceBody-xizong .xzBlockWorkspace {\n  --xz-rail:252px;\n  --xz-context:304px;\n  --xz-reading:900px;\n  --xz-panel-radius:11px;\n  --xz-soft:#f7f8f7;\n  --xz-soft-2:#f1f4f2;\n  --xz-line:#d7ddd9;\n  --xz-muted:#59665f;\n}\n`;
owner += movedSections.join('\n');
owner += componentStyles.join('\n');
owner = owner.replace(/\s*!important\b/gi, '');
owner += `\n/* Readability is a property of the exact owner, not a late cascade-recovery component. */\n@media (min-width:1101px) and (min-height:680px) {\n  body#kianos-workspace.surfaceBody-xizong .xzBlockWorkspace :is(p,li,td,th,figcaption) { font-size:max(16px,1em); }\n  body#kianos-workspace.surfaceBody-xizong .xzBlockWorkspace :is(span,small,b,strong,em,label,button,summary,code,kbd) { font-size:max(15px,1em); }\n  body#kianos-workspace.surfaceBody-xizong .xzBlockWorkspace :is(.xv6KpLearnPrompt p,.xv6KpLearnCore p,.xv6KpLearnCore li,.xv6KpLearnCore td,.xv6KpLearnCore th,[data-kp-answer] p,[data-kp-answer] li,[data-kp-answer] td,[data-kp-answer] th,.xv6LearnerAsset p,.xv6LogicGoal,.xv6LogicTarget p) { font-size:max(16px,1em); }\n}\n`;
write(ownerPath, owner.replace(/\n{4,}/g, '\n\n\n'));

// Fail closed if the migration left any active exact-surface owner behind.
for (const file of broadFiles) {
  const source = read(file);
  const { moved } = partitionCss(source);
  if (moved.trim()) throw new Error(`BLOCK_SELECTOR_STILL_OWNED_OUTSIDE_EXACT_STYLESHEET:${file}`);
}
for (const file of componentFiles) {
  if (/<style(?:\s|>)/i.test(read(file))) throw new Error(`BLOCK_COMPONENT_STYLE_STILL_PRESENT:${file}`);
}
const finalOwner = read(ownerPath);
if (/!\s*important\b/i.test(finalOwner)) throw new Error('BLOCK_OWNER_HAS_IMPORTANT_RECOVERY');
for (const token of ['.portedStudyLayout', '.xv6LogicStage', '.xv6BlockWorkspaceShell', '.xv6LearnerAuxSurface', '.xv6KpLearnCompanion']) {
  if (!finalOwner.includes(token)) throw new Error(`BLOCK_OWNER_MISSING_FAMILY:${token}`);
}
const finalAux = read(auxPath);
if (finalAux.includes("style.setProperty('grid-template-columns'")) throw new Error('AUX_INLINE_GRID_OWNER_STILL_PRESENT');
if (!finalAux.includes("root.addEventListener('kianos:xizong-aux-change'")) throw new Error('AUX_RUNTIME_EVENT_CONTRACT_LOST');

console.log(JSON.stringify({
  pass: true,
  owner: ownerPath,
  broad_sources_migrated: broadFiles,
  component_style_owners_migrated: componentFiles,
  aux_layout_handoff: 'data-only',
  important_recovery: false
}, null, 2));
