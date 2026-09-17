import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(webRoot, 'src');
const basePath = path.join(src, 'layouts', 'Base.astro');
const pagePath = path.join(src, 'pages', 'vocabulary', '[ordinal].astro');
const ownerPath = path.join(src, 'styles', 'lexical-presentation.css');
const errors = [];

const read = (file) => fs.readFileSync(file, 'utf8');
const base = read(basePath);
const page = read(pagePath);
const owner = read(ownerPath);
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
if (!/\.lexicalSenseRow\{[^}]*border:0;[^}]*border-bottom:/s.test(owner)) fail('sense rows must be rule-separated, not cards');
if (!/\.lexicalExpansionSection\{[^}]*border:0;[^}]*border-bottom:/s.test(owner)) fail('Expansion sections must be continuous rail sections, not cards');
if (!/\.portedVocabStudySheet\{[^}]*border:0;/s.test(owner)) fail('Word study sheet must not be a giant outer card');
if (!owner.includes('sparse words do not')) fail('natural-height sparse-word rule missing');

const forbidden = [
  ['sense-card-radius', /\.lexicalSenseRow\{[^}]*border-radius:(?!0)/s],
  ['sense-card-shadow', /\.lexicalSenseRow\{[^}]*box-shadow:(?!none)/s],
  ['expansion-card-radius', /\.lexicalExpansionSection\{[^}]*border-radius:(?!0)/s],
  ['expansion-card-shadow', /\.lexicalExpansionSection\{[^}]*box-shadow:(?!none)/s]
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
