import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(webRoot, 'src');
const basePath = path.join(src, 'layouts', 'Base.astro');
const pagePath = path.join(src, 'pages', 'vocabulary', '[ordinal].astro');
const ownerPath = path.join(src, 'styles', 'lexical-presentation.css');
const runtimePath = path.join(src, 'components', 'VocabularyWordRuntime.astro');
const errors = [];

const read = (file) => fs.readFileSync(file, 'utf8');
const base = read(basePath);
const page = read(pagePath);
const owner = read(ownerPath);
const runtime = read(runtimePath);
const fail = (message) => errors.push(message);

if (!base.includes("import '../styles/lexical-presentation.css';")) fail('Base must import lexical-presentation.css');
if (!base.includes("import '../styles/english-cloze-polish.css';")) fail('English Cloze polish must stay separated from Lexical');
if (base.includes('responsive-guards.css')) fail('retired responsive-guards.css is still active');
if (base.includes('lexical-card-polish.css')) fail('retired lexical-card-polish.css is still active');
if (fs.existsSync(path.join(src, 'styles', 'responsive-guards.css'))) fail('retired responsive-guards.css still exists');
if (fs.existsSync(path.join(src, 'styles', 'lexical-card-polish.css'))) fail('retired lexical-card-polish.css still exists');

const viewportIndex = base.indexOf("import '../styles/viewport-workspaces.css';");
const lexicalIndex = base.indexOf("import '../styles/lexical-presentation.css';");
if (viewportIndex < 0 || lexicalIndex < viewportIndex) fail('Lexical final owner must load after shared viewport baseline');

if (/<style(?:\s|>)/i.test(page)) fail('vocabulary/[ordinal].astro must not own visual CSS');
if (!owner.includes('--lexical-serif:Georgia')) fail('Lexical serif role missing');
// Architecture-v2 Depth is an editorial lexical sheet, not a semantic-card dashboard.
// Ownership is expressed by canonical placement + typographic hierarchy + quiet rules.
if (!/\.lexicalSenseRow\{[^}]*border-bottom:1px solid/s.test(owner)) fail('sense editorial rule missing');
if (!/\.lexicalSenseRow\{[^}]*border-radius:0/s.test(owner)) fail('sense rows must stay editorial, not rounded cards');
if (!/\.lexicalWordPatterns\{[^}]*border-top:1px solid/s.test(owner)) fail('word-owned pattern section boundary missing');
if (!/\.portedVocabEvidenceColumn\{[^}]*border-left:1px solid/s.test(owner)) fail('cross-sense reference rail boundary missing');
if (!/\.lexicalExpansionSection\{[^}]*border-bottom:1px solid/s.test(owner)) fail('reference section rule missing');
if (!/\.lexicalExpansionSection\{[^}]*border-radius:0/s.test(owner)) fail('reference sections must stay flat');
if (!/\.portedVocabStudySheet\{[^}]*border:1px solid/s.test(owner)) fail('immersive Word study sheet boundary missing');
if (!owner.includes('Legacy visual DNA')) fail('legacy visual DNA marker missing');

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
  preserved_non_lexical_split: 'english-cloze-polish.css'
}, null, 2));
