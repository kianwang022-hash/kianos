import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(webRoot, 'src');
const routePath = path.join(src, 'pages', 'xizong', '[system]', 'index.astro');
const componentPath = path.join(src, 'components', 'XizongSystemWorkspace.astro');
const retiredComponentPath = path.join(src, 'components', 'XizongSystemV6.astro');
const ownerPath = path.join(src, 'styles', 'xizong-system-workspace.css');
const legacyLanePath = path.join(src, 'styles', 'xizong-presentation.css');
const errors = [];

const read = (file) => fs.readFileSync(file, 'utf8');
const fail = (message) => errors.push(message);

for (const file of [routePath, componentPath, ownerPath, legacyLanePath]) {
  if (!fs.existsSync(file)) fail(`required file missing: ${path.relative(webRoot, file)}`);
}

if (!errors.length) {
  const route = read(routePath);
  const component = read(componentPath);
  const owner = read(ownerPath);
  const legacy = read(legacyLanePath);

  if (!route.includes("import XizongSystemWorkspace from '../../../components/XizongSystemWorkspace.astro';")) {
    fail('System route must consume XizongSystemWorkspace.astro');
  }
  if (!route.includes("import '../../../styles/xizong-system-workspace.css';")) {
    fail('System route must load xizong-system-workspace.css');
  }
  if (route.includes('XizongSystemV6')) fail('System route still references retired XizongSystemV6');
  if (/<style(?:\s|>)/i.test(route)) fail('System route must not own visual CSS');
  if (/<style(?:\s|>)/i.test(component)) fail('System component must not own visual CSS');
  if (!component.includes('class="xzSystemWorkspace"')) fail('Current System namespace root is missing');
  if (/\bxv6[A-Za-z0-9_-]*/.test(component)) fail('Current System component still exposes legacy xv6 class tokens');
  if (/\.xv6[A-Za-z0-9_-]*/.test(owner)) fail('Current System visual owner still styles legacy xv6 selectors');
  if (!owner.includes('.xzSystemWorkspace')) fail('Current System visual owner does not target xzSystemWorkspace');
  if (/!important/.test(owner)) fail('Current System visual owner must not rely on !important cascade recovery');

  const retiredSystemSelector = /\.xv6(?:System|Spine|Mother|Parallel|DensePair|Chips|Relations|Failure|SelectedBlock|Dependency)/;
  if (retiredSystemSelector.test(legacy)) {
    fail('retired System Framework selectors must be physically absent from broad xizong-presentation.css');
  }
}

if (fs.existsSync(retiredComponentPath)) fail('retired XizongSystemV6.astro still exists');

if (errors.length) {
  console.error(JSON.stringify({ pass: false, errors }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({
  pass: true,
  current_component: 'static-web/src/components/XizongSystemWorkspace.astro',
  visual_owner: 'static-web/src/styles/xizong-system-workspace.css',
  route_css: 'none',
  component_css: 'none',
  retired_component: 'XizongSystemV6.astro',
  legacy_css_status: 'retired System Framework selectors physically absent from broad presentation'
}, null, 2));
