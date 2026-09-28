import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(webRoot, 'src');
const basePath = path.join(src, 'layouts', 'LexicalBase.astro');
const pagePath = path.join(src, 'pages', 'vocabulary', '[ordinal].astro');
const clozePagePath = path.join(src, 'pages', 'cloze', '[id].astro');
const ownerPath = path.join(src, 'styles', 'lexical-presentation.css');
const runtimePath = path.join(src, 'components', 'VocabularyWordRuntime.astro');
const errors = [];

const read = (file) => fs.readFileSync(file, 'utf8');
const base = read(basePath);
const page = read(pagePath);
const clozePage = read(clozePagePath);
const owner = read(ownerPath);
const runtime = read(runtimePath);
const fail = (message) => errors.push(message);

if (!base.includes("import '../styles/lexical-presentation.css';")) fail('LexicalBase must import lexical-presentation.css');
if (!clozePage.includes("import '../../styles/english-cloze-vertical.css';")) fail('English Cloze vertical polish must stay route-local and separated from Lexical');
if (base.includes('responsive-guards.css')) fail('retired responsive-guards.css is still active');
if (base.includes('lexical-card-polish.css')) fail('retired lexical-card-polish.css is still active');
if (fs.existsSync(path.join(src, 'styles', 'responsive-guards.css'))) fail('retired responsive-guards.css still exists');
if (fs.existsSync(path.join(src, 'styles', 'lexical-card-polish.css'))) fail('retired lexical-card-polish.css still exists');

const foundationIndex = base.indexOf("import '../styles/shared-visual-foundation.css';");
const compositionIndex = base.indexOf("import '../styles/shared-workspace-composition.css';");
const lexicalIndex = base.indexOf("import '../styles/lexical-presentation.css';");
if (foundationIndex < 0 || compositionIndex < foundationIndex || lexicalIndex < compositionIndex) fail('Lexical final owner must load after current shared visual/composition baseline');

if (/<style(?:\s|>)/i.test(page)) fail('vocabulary/[ordinal].astro must not own visual CSS');
if (!owner.includes('--lexical-serif:var(--study-serif)')) fail('Lexical must consume the shared editorial serif role');
// Accepted L2 family: Sense is one bounded learning object, Word-owned patterns stay in
// the primary flow, and genuine Reference objects are independent right-side cards.
if (!/\.lexicalSenseRow\{[^}]*border:1px solid/s.test(owner)) fail('sense learning-object boundary missing');
if (!/\.lexicalSenseRow\{[^}]*border-radius:7px/s.test(owner)) fail('sense family radius missing');
if (!/\.lexicalWordPatterns\{[^}]*border:1px solid/s.test(owner)) fail('word-owned pattern section boundary missing');
if (!/\.lexicalExpansionSection\{[^}]*border:1px solid/s.test(owner)) fail('Reference card boundary missing');
if (!/\.lexicalExpansionSection\{[^}]*border-radius:7px/s.test(owner)) fail('Reference card family radius missing');
if (!/\.portedVocabBody\{[^}]*grid-template-columns:minmax\(0,69fr\) minmax\(330px,31fr\)/s.test(owner)) fail('Mac L3 primary/reference geometry missing');
if (!/\.portedVocabStudySheet\{[^}]*border:1px solid/s.test(owner)) fail('Word study sheet boundary missing');
if (!owner.includes('English-family neutral shell + restrained lexical semantic accent')) fail('accepted L2/L3 marker missing');

if (!runtime.includes('class="lexicalCoreHeadline"')) fail('Word Feel / Core must live in the Depth header');
if (runtime.includes('class="lexicalCoreRow"')) fail('duplicate body Core card must stay removed');
if (!runtime.includes('class="lexicalWordPatterns"')) fail('word-owned Construction projection missing from main lexical flow');
if (runtime.includes('lexicalConstructionSection')) fail('Construction must not render in the cross-sense reference rail');
if (!runtime.includes('data-has-reference=')) fail('reference rail must be content-earned');

const patternIndex = runtime.indexOf('class="lexicalWordPatterns"');
const railIndex = runtime.indexOf('class="portedVocabEvidenceColumn"');
if (patternIndex < 0 || railIndex < 0 || patternIndex > railIndex) fail('word-owned patterns must precede the cross-sense reference rail');

const forbidden = [
  ['sense-card-shadow', /\.lexicalSenseRow\{[^}]*box-shadow:(?!none)/s],
  ['reference-card-shadow', /\.lexicalExpansionSection\{[^}]*box-shadow:(?!none)/s],
  ['sense-left-card-accent', /\.lexicalSenseRow\{[^}]*border-left:[^;]*(?:2px|3px|4px)/s]
];
for (const [name, pattern] of forbidden) if (pattern.test(owner)) fail(name);

if (errors.length) {
  console.error(JSON.stringify({ pass: false, errors }, null, 2));
  process.exit(1);
}
console.log(JSON.stringify({
  pass: true,
  visual_owner: 'static-web/src/styles/lexical-presentation.css',
  route_css: 'none',
  retired_layers: ['responsive-guards.css', 'lexical-card-polish.css'],
  preserved_non_lexical_split: 'english-cloze-vertical.css'
}, null, 2));
