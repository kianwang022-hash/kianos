import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const PORT = 4326;
const BASE = `http://127.0.0.1:${PORT}`;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const auditDir = new URL('../../politics-functional-audit/', import.meta.url);
const checks = [];
let failure = null;
const check = (condition, name, detail = '') => {
  checks.push({ name, pass: Boolean(condition), detail });
  if (!condition) throw new Error(`POLITICS_GOLDEN_PURPOSE_FAIL:${name}${detail ? `:${detail}` : ''}`);
  console.log(`PASS ${name}${detail ? ` · ${detail}` : ''}`);
};

const normalizedText = async (locator) => String(await locator.textContent() || '').replace(/\s+/g, ' ').trim();

async function waitForServer() {
  for (let index = 0; index < 80; index += 1) {
    try {
      const response = await fetch(`${BASE}/politics/`);
      if (response.ok) return;
    } catch {}
    await sleep(250);
  }
  throw new Error('POLITICS_GOLDEN_PREVIEW_SERVER_NOT_READY');
}

async function visibleLearnerTextBelowFloor(locator, floorPx = 15) {
  return locator.evaluate((root, floor) => {
    const offenders = [];
    const seen = new Set();
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const text = String(walker.currentNode.textContent || '').replace(/\s+/g, ' ').trim();
      if (!text || !/[A-Za-z0-9\u3400-\u9FFF]/.test(text)) continue;
      const element = walker.currentNode.parentElement;
      if (!element) continue;
      const closedDetails = element.closest('details:not([open])');
      if (closedDetails && !element.closest('summary')) continue;
      const style = getComputedStyle(element);
      if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) continue;
      if (!element.getClientRects().length) continue;
      const size = Number.parseFloat(style.fontSize);
      if (!Number.isFinite(size) || size >= floor) continue;
      const key = `${element.tagName}.${element.className || ''}:${size}:${text}`;
      if (seen.has(key)) continue;
      seen.add(key);
      offenders.push({ tag: element.tagName, className: String(element.className || ''), size, text: text.slice(0, 90) });
    }
    return offenders.slice(0, 40);
  }, floorPx);
}

const server = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', String(PORT)], {
  cwd: process.cwd(),
  stdio: ['ignore', 'pipe', 'pipe'],
  detached: process.platform !== 'win32'
});

let browser;
try {
  await waitForServer();
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1512, height: 982 } });
  const page = await context.newPage();
  await page.goto(`${BASE}/politics/marxism/ch00/`, { waitUntil: 'networkidle' });

  const body = page.locator('body');
  const workspace = page.locator('[data-politics-cognitive-workspace]');
  await workspace.waitFor({ state: 'visible' });

  const s01 = workspace.locator('[data-workspace-unit][data-unit-id="POL27-CF-MARX-C00-S01"]');
  await s01.waitFor({ state: 'visible' });
  check((await s01.getAttribute('data-politics-representation')) === 'EXPLICIT_SURFACE_MAPPING', 's01_uses_explicit_surface_mapping');
  check((await s01.getAttribute('data-explicit-surface-mapping')) === 'v1', 's01_explicit_mapping_contract_v1');

  const s01Origin = s01.locator('[data-surface-group="s01-origin-conditions"]');
  await s01Origin.waitFor({ state: 'visible' });
  check((await s01Origin.getAttribute('data-surface-primitive')) === 'PARALLEL_SET', 's01_origin_conditions_are_parallel');
  const s01OriginText = await normalizedText(s01Origin);
  check(s01OriginText.includes('社会根源') && s01OriginText.includes('阶级基础') && s01OriginText.includes('思想来源'), 's01_origin_conditions_visible', s01OriginText.slice(0, 220));

  const s01Development = s01.locator('[data-surface-group="s01-development-sequence"]');
  await s01Development.waitFor({ state: 'visible' });
  check((await s01Development.getAttribute('data-surface-primitive')) === 'DIRECTED_SEQUENCE', 's01_real_development_order_is_sequence');
  const s01DevelopmentText = await normalizedText(s01Development);
  check(s01DevelopmentText.includes('理论创立') && s01DevelopmentText.includes('形成完整理论体系') && s01DevelopmentText.includes('继续发展'), 's01_development_sequence_visible', s01DevelopmentText.slice(0, 220));

  const s01Boundary = s01.locator('[data-surface-group="s01-origin-boundary"]');
  check((await s01Boundary.count()) === 1, 's01_boundary_group_present');
  check((await s01Boundary.getAttribute('data-surface-primitive')) === 'COMPARE', 's01_boundary_is_compare_not_chain');
  check((await s01.locator('[data-stage="ORIENT"] .purposeChain,[data-stage="ORIENT"] .purposeTextMap').count()) === 0, 's01_legacy_purpose_renderer_removed');

  const s01TitleSize = Number.parseFloat(await s01.locator('[data-stage="ORIENT"] > h2').evaluate((node) => getComputedStyle(node).fontSize));
  check(s01TitleSize >= 30, 's01_main_title_readable', `${s01TitleSize}px`);
  const s01TinyText = await visibleLearnerTextBelowFloor(body, 15);
  check(s01TinyText.length === 0, 's01_page_visible_text_floor_15px', JSON.stringify(s01TinyText));

  await workspace.locator('[data-workspace-unit-tab="1"]').click();
  const s02 = workspace.locator('[data-workspace-unit][data-unit-id="POL27-CF-MARX-C00-S02"]');
  await s02.waitFor({ state: 'visible' });
  check((await s02.getAttribute('data-politics-representation')) === 'EXPLICIT_SURFACE_MAPPING', 's02_uses_explicit_surface_mapping');
  check((await s02.getAttribute('data-explicit-surface-mapping')) === 'v1', 's02_explicit_mapping_contract_v1');

  const fourCharacteristics = s02.locator('[data-surface-group="s02-four-characteristics"]');
  await fourCharacteristics.waitFor({ state: 'visible' });
  check((await fourCharacteristics.getAttribute('data-surface-primitive')) === 'PARALLEL_SET', 's02_four_characteristics_are_parallel');
  const peers = await fourCharacteristics.locator('.explicitParallel article > b').allTextContents();
  check(JSON.stringify(peers) === JSON.stringify(['科学性', '人民性', '实践性', '发展性']), 's02_peer_characteristics_are_exact', JSON.stringify(peers));
  check(!peers.includes('革命性'), 's02_revolutionarity_not_misdrawn_as_peer');

  const revolutionaryRelations = s02.locator('[data-surface-group="s02-relation-people-practice-development"]');
  check((await revolutionaryRelations.getAttribute('data-surface-primitive')) === 'RELATION_SET', 's02_revolutionary_links_are_relation_set');
  const revolutionaryText = await normalizedText(revolutionaryRelations);
  check(revolutionaryText.includes('人民性') && revolutionaryText.includes('实践性') && revolutionaryText.includes('发展性') && revolutionaryText.includes('革命性'), 's02_revolutionary_relations_visible', revolutionaryText.slice(0, 240));

  const scienceRevolution = s02.locator('[data-surface-group="s02-relation-science-revolution"]');
  check((await scienceRevolution.getAttribute('data-surface-primitive')) === 'RELATION_SET', 's02_science_revolution_is_relation_set');
  const scienceRevolutionText = await normalizedText(scienceRevolution);
  check(scienceRevolutionText.includes('科学性') && scienceRevolutionText.includes('革命性'), 's02_science_revolution_relation_visible', scienceRevolutionText.slice(0, 220));

  const valueBlock = s02.locator('[data-surface-group="s02-contemporary-value"]');
  check((await valueBlock.getAttribute('data-surface-primitive')) === 'PARALLEL_SET', 's02_contemporary_value_is_parallel');
  const valueLabels = await valueBlock.locator('.explicitParallel article > b').allTextContents();
  check(JSON.stringify(valueLabels) === JSON.stringify(['认识工具', '行动指南', '科学真理']), 's02_contemporary_value_labels_exact', JSON.stringify(valueLabels));

  const methodBoundary = s02.locator('[data-surface-group="s02-method-boundary"]');
  check((await methodBoundary.count()) === 1, 's02_method_boundary_present');
  check((await methodBoundary.getAttribute('data-surface-primitive')) === 'COMPARE', 's02_method_boundary_is_compare');
  check((await s02.locator('[data-stage="ORIENT"] .purposeChain,[data-stage="ORIENT"] .purposeTextMap,.goldenGraph').count()) === 0, 's02_legacy_purpose_graphs_removed');

  const exactBlock = s02.locator('[data-surface-group="s02-first-round-exact"]');
  check((await exactBlock.count()) === 1, 's02_first_round_exact_group_present');
  const exactText = await normalizedText(exactBlock);
  check(exactText.includes('人民性是马克思主义的本质属性'), 's02_first_round_exact_visible');
  check(exactText.includes('人民至上是马克思主义的政治立场'), 's02_first_round_exact_complete');

  const mainTitleSize = Number.parseFloat(await s02.locator('[data-stage="ORIENT"] > h2').evaluate((node) => getComputedStyle(node).fontSize));
  const peerSize = Number.parseFloat(await fourCharacteristics.locator('.explicitParallel article > b').first().evaluate((node) => getComputedStyle(node).fontSize));
  const relationSize = Number.parseFloat(await revolutionaryRelations.locator('.edgeStatement strong').first().evaluate((node) => getComputedStyle(node).fontSize));
  check(mainTitleSize >= 30, 's02_main_title_readable', `${mainTitleSize}px`);
  check(peerSize >= 18, 's02_peer_type_readable', `${peerSize}px`);
  check(relationSize >= 17, 's02_relation_type_readable', `${relationSize}px`);
  const s02TinyText = await visibleLearnerTextBelowFloor(body, 15);
  check(s02TinyText.length === 0, 's02_page_visible_text_floor_15px', JSON.stringify(s02TinyText));

  await context.close();
  console.log('POLITICS_GOLDEN_PURPOSE_FIRST_PASS');
} catch (error) {
  failure = error instanceof Error ? error.message : String(error);
  throw error;
} finally {
  await mkdir(auditDir, { recursive: true });
  await writeFile(new URL('golden-purpose.json', auditDir), JSON.stringify({
    schema: 'kianos.politics.golden_purpose_first.v1',
    checks,
    failure,
    status: failure ? 'FAIL' : 'PASS'
  }, null, 2));

  await browser?.close().catch(() => {});
  if (process.platform !== 'win32' && server.pid) {
    try { process.kill(-server.pid, 'SIGTERM'); } catch {}
  } else {
    try { server.kill('SIGTERM'); } catch {}
  }
  server.stdout?.destroy();
  server.stderr?.destroy();
  await Promise.race([new Promise((resolve) => server.once('exit', resolve)), sleep(1000)]);
  if (server.exitCode === null) {
    if (process.platform !== 'win32' && server.pid) {
      try { process.kill(-server.pid, 'SIGKILL'); } catch {}
    } else {
      try { server.kill('SIGKILL'); } catch {}
    }
  }
}
