import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(webRoot, 'src');
const routePath = path.join(src, 'pages', 'xizong', 'index.astro');
const toolsPath = path.join(src, 'components', 'XizongHomeTools.astro');
const ownerPath = path.join(src, 'styles', 'xizong-home-workspace.css');
const legacyPath = path.join(src, 'styles', 'xizong-presentation.css');
const errors = [];
const read = (file) => fs.readFileSync(file, 'utf8');
const fail = (message) => errors.push(message);

for (const file of [routePath, toolsPath, ownerPath, legacyPath]) {
  if (!fs.existsSync(file)) fail(`required file missing: ${path.relative(webRoot, file)}`);
}

if (!errors.length) {
  const route = read(routePath);
  const tools = read(toolsPath);
  const owner = read(ownerPath);
  const legacy = read(legacyPath);
  const retiredHomeSelector = /\.(?:xzOverview|xzSystemWorkbench|xzOpenDomain|xzSystemRows|xzSystemRow|xzOverviewCompanion|xzLearnerChain|xzFutureRow|xzFutureMap|xizongHomeTools|xizongContinue)\b/;

  if (!route.includes("import '../../styles/xizong-home-workspace.css';")) fail('Home route must load xizong-home-workspace.css');
  if (!route.includes('class="xzHome"')) fail('Home route must expose Current xzHome root');
  if (/<style(?:\s|>)/i.test(route)) fail('Home route must not own visual CSS');
  if (/<style(?:\s|>)/i.test(tools)) fail('XizongHomeTools must not own visual CSS');
  if (!tools.includes('class="xzHomeActionBar"')) fail('Home tools must use Current namespace');
  if (!tools.includes('data-xizong-memory-entry')) fail('Home must expose explicit standalone Memory entry');
  if (/\b(?:xzOverview|xzSystemWorkbench|xzOpenDomain|xzSystemRows|xzSystemRow|xzOverviewCompanion|xizongHomeTools|xizongContinue)\b/.test(route + tools)) {
    fail('Current Home still exposes retired Home class namespace');
  }
  if (!owner.includes('.xzHome')) fail('Home stylesheet does not target Current root');
  if (/!important/.test(owner)) fail('Home stylesheet must not rely on !important cascade recovery');
  if (retiredHomeSelector.test(owner)) fail('Current Home stylesheet still styles retired Home namespace');
  if (/\.xzHome(?:\b|[A-Z])/.test(legacy)) fail('broad legacy xizong-presentation.css must not own Current xzHome namespace');
  if (retiredHomeSelector.test(legacy)) fail('retired Home selectors must be physically absent from broad xizong-presentation.css');
}

if (errors.length) {
  console.error(JSON.stringify({ pass: false, errors }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({
  pass: true,
  route: 'static-web/src/pages/xizong/index.astro',
  visual_owner: 'static-web/src/styles/xizong-home-workspace.css',
  helper_component_css: 'none',
  current_namespace: 'xzHome*',
  retired_home_css: 'physically absent from broad presentation',
  memory_entry: 'explicit'
}, null, 2));
