import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(webRoot, 'src');
const routePath = path.join(src, 'pages', 'xizong', 'memory', 'index.astro');
const componentPath = path.join(src, 'components', 'XizongMemoryWorkspace.astro');
const ownerPath = path.join(src, 'styles', 'xizong-memory-workspace.css');
const broadPath = path.join(src, 'styles', 'xizong-presentation.css');
const stylesDir = path.join(src, 'styles');
const errors = [];
const read = (file) => fs.readFileSync(file, 'utf8');
const fail = (message) => errors.push(message);

for (const file of [routePath, componentPath, ownerPath, broadPath]) {
  if (!fs.existsSync(file)) fail(`required file missing: ${path.relative(webRoot, file)}`);
}

if (!errors.length) {
  const route = read(routePath);
  const component = read(componentPath);
  const owner = read(ownerPath);
  const broad = read(broadPath);

  if (!route.includes("import '../../../styles/xizong-memory-workspace.css';")) fail('Memory route must load xizong-memory-workspace.css');
  if (/<style(?:\s|>)/i.test(route)) fail('Memory route must not own visual CSS');
  if (/<style(?:\s|>)/i.test(component)) fail('Memory component must not own visual CSS');
  if (!component.includes('class="xzMemory"')) fail('Memory Current root namespace is missing');
  if (!component.includes('data-memory-view="TODAY"') || !component.includes('data-memory-view="CORE"') || !component.includes('data-memory-view="PRECISION"') || !component.includes('data-memory-view="MARKED"') || !component.includes('data-memory-view="REPAIR"')) {
    fail('Memory canonical five-view surface changed during visual migration');
  }
  if (!owner.includes('.xzMemory')) fail('Memory stylesheet does not target Current Memory root');
  if (/!important/.test(owner)) fail('Memory stylesheet must not rely on !important cascade recovery');
  if (/\.xzMemory(?:\b|[A-Z])/.test(broad)) fail('broad xizong-presentation.css must not own Current Memory namespace');

  const competing = fs.readdirSync(stylesDir)
    .filter((name) => name !== 'xizong-memory-workspace.css' && /memory/i.test(name));
  if (competing.length) fail(`competing Memory stylesheet(s): ${competing.join(', ')}`);

  const numericSizes = [...owner.matchAll(/font-size\s*:\s*([0-9.]+)px/g)].map((match) => Number(match[1]));
  const belowFloor = numericSizes.filter((value) => value < 15);
  if (belowFloor.length) fail(`Memory owner contains explicit font size below 15px: ${[...new Set(belowFloor)].join(', ')}`);
}

if (errors.length) {
  console.error(JSON.stringify({ pass: false, errors }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({
  pass: true,
  component: 'static-web/src/components/XizongMemoryWorkspace.astro',
  visual_owner: 'static-web/src/styles/xizong-memory-workspace.css',
  route_css: 'none',
  component_css: 'none',
  views: ['TODAY', 'CORE', 'PRECISION', 'MARKED', 'REPAIR'],
  explicit_font_floor_px: 15
}, null, 2));
