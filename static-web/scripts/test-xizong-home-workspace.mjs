import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const PORT = 4336;
const BASE = `http://127.0.0.1:${PORT}`;
const auditDir = path.resolve(process.cwd(), '.qa');
fs.mkdirSync(auditDir, { recursive: true });
const reportPath = path.join(auditDir, 'xizong-home-workspace.json');
const report = { schema: 'kianos.xizong.home_workspace.v2', started_at: new Date().toISOString(), checks: [] };
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const check = (condition, name, detail = '') => {
  if (!condition) throw new Error(`XIZONG_HOME_WORKSPACE_FAIL:${name}${detail ? `:${detail}` : ''}`);
  report.checks.push({ name, pass: true, detail });
};

async function waitForServer() {
  for (let i = 0; i < 100; i += 1) {
    try {
      const response = await fetch(`${BASE}/xizong/`);
      if (response.ok) return;
    } catch {}
    await sleep(250);
  }
  throw new Error('XIZONG_HOME_SERVER_NOT_READY');
}

async function scanTypeFloor(root) {
  return root.evaluate((node) => {
    const rows = [...node.querySelectorAll('p,span,small,strong,b,a,button,li,em,h1,h2')]
      .filter((el) => {
        const style = getComputedStyle(el);
        return (el.textContent || '').trim() && style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) !== 0 && el.getClientRects().length > 0;
      })
      .map((el) => ({
        text: (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 80),
        size: Number.parseFloat(getComputedStyle(el).fontSize || '0')
      }));
    return {
      min: rows.length ? Math.min(...rows.map((row) => row.size)) : null,
      failures: rows.filter((row) => row.size < 14.99).slice(0, 20)
    };
  });
}

const server = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', String(PORT)], {
  cwd: process.cwd(), stdio: ['ignore', 'pipe', 'pipe'], detached: process.platform !== 'win32'
});

let browser;
try {
  await waitForServer();
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1512, height: 982 } });
  const page = await context.newPage();

  await page.goto(`${BASE}/xizong/`, { waitUntil: 'domcontentloaded' });
  const root = page.locator('[data-xizong-home-workspace]');
  await root.waitFor({ state: 'visible' });

  check(await root.evaluate((node) => node.classList.contains('xzHome')), 'current_home_namespace');
  check(await root.evaluate((node) => ![...node.querySelectorAll('*')].some((el) => [...el.classList].some((name) => [
    'xzOverviewHeader','xzOverviewLayout','xzSystemWorkbench','xzOpenDomain','xzSystemRows',
    'xzSystemRow','xzOverviewCompanion','xizongHomeTools','xizongContinue'
  ].includes(name)))), 'retired_home_namespace_absent');

  check(await root.locator('[data-xizong-memory-entry]').count() === 0, 'permanent_memory_promotion_absent');
  check(await root.getByText('How it works', { exact: true }).count() === 0, 'permanent_method_explainer_absent');

  const systems = root.locator('.xzHomeSystemEntry');
  check(await systems.count() >= 3, 'current_system_entries_present', String(await systems.count()));
  check(await root.locator('.xzHomeKnowledgeItem').count() === 6, 'knowledge_map_has_A_to_F');
  check((await root.locator('.xzHomeKnowledgeItem[data-domain="E"]').textContent() || '').includes('生殖'), 'taxonomy_E_is_reproductive');
  check((await root.locator('.xzHomeKnowledgeItem[data-domain="F"]').textContent() || '').includes('其余临床整合'), 'taxonomy_F_is_remaining_clinical');

  const attention = root.locator('[data-xizong-home-attention]');
  check(await attention.isHidden(), 'attention_absent_without_real_state');

  const type = await scanTypeFloor(root);
  check(type.failures.length === 0, 'visible_type_floor_15', JSON.stringify(type));

  const geometry = await root.evaluate((node) => {
    const rootBox = node.getBoundingClientRect();
    const cont = node.querySelector('.xzHomeContinue')?.getBoundingClientRect();
    const systemsBox = node.querySelector('.xzHomeCurrentSystems')?.getBoundingClientRect();
    const knowledge = node.querySelector('.xzHomeKnowledgeMap')?.getBoundingClientRect();
    const entries = [...node.querySelectorAll('.xzHomeSystemEntry')].map((el) => el.getBoundingClientRect());
    return {
      rootWidth: rootBox.width,
      continueHeight: cont?.height || 0,
      systemsHeight: systemsBox?.height || 0,
      knowledgeTop: knowledge?.top || 0,
      maxSystemEntryHeight: entries.length ? Math.max(...entries.map((box) => box.height)) : 0,
      viewportHeight: window.innerHeight
    };
  });
  check(geometry.rootWidth > 1100, 'home_uses_mac_width', JSON.stringify(geometry));
  check(geometry.continueHeight > 70 && geometry.continueHeight < 230, 'continue_is_dense_not_hero', JSON.stringify(geometry));
  check(geometry.maxSystemEntryHeight > 80 && geometry.maxSystemEntryHeight < 190, 'system_index_is_dense', JSON.stringify(geometry));
  check(geometry.knowledgeTop < geometry.viewportHeight, 'knowledge_map_begins_in_first_viewport', JSON.stringify(geometry));

  await page.evaluate(() => {
    localStorage.setItem('kianos-xizong-last-location-v1', JSON.stringify({
      href:'/xizong/circulation/b01/',
      systemCanonical:'A1',
      systemId:'circulation',
      systemTitle:'循环系统',
      blockSlug:'b01',
      blockLabel:'B1',
      blockTitle:'循环总论'
    }));
    localStorage.setItem('kianos-xizong-astro-v2:xizong:circulation-b01', JSON.stringify({
      stage:'kp_recall',
      groupIndex:0,
      kpIndex:2,
      learned:{},
      ratings:{},
      blockRecallDone:false,
      completed:false
    }));
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
  check((await page.locator('[data-xizong-continue-title]').textContent() || '').includes('B1'), 'continue_restores_last_block');
  check((await page.locator('[data-xizong-continue-stage]').textContent() || '').trim() === 'KP RECALL', 'continue_translates_real_stage');
  check((await page.locator('[data-xizong-continue-position]').textContent() || '').includes('KP 3'), 'continue_translates_real_kp_position');
  check((await page.locator('[data-xizong-continue]').getAttribute('href') || '').includes('/xizong/circulation/b01/'), 'continue_restores_last_href');

  await page.evaluate(() => {
    localStorage.setItem('kianos-xizong-memory-v1', JSON.stringify({
      schema:'kianos.xizong.memory.v1',
      revision:1,
      releasedBlocks:{},
      cards:{
        'core:circulation-b01-kp01':{
          id:'core:circulation-b01-kp01',
          family:'CORE',
          kpId:'circulation-b01-kp01',
          canonicalId:'A1',
          blockLabel:'B1',
          displayId:'KP01',
          title:'Test'
        }
      },
      promptOverrides:{},
      marks:{
        'mark:test':{
          id:'mark:test',
          cardId:'core:circulation-b01-kp01',
          kpId:'circulation-b01-kp01',
          surface:'CORE',
          text:'test fragment',
          createdAt:new Date().toISOString(),
          reviewRequested:true
        }
      },
      evidence:[],
      attention:{
        'core:circulation-b01-kp01':{
          reviewRequested:true,
          reason:'TEST'
        }
      },
      repairTasks:[{
        id:'repair:test',
        cardId:'core:circulation-b01-kp01',
        kpId:'circulation-b01-kp01',
        title:'Test repair',
        status:'ACTIVE'
      }]
    }));
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
  check(await page.locator('[data-xizong-home-attention]').isVisible(), 'attention_appears_from_real_state');
  check((await page.locator('[data-xizong-attention-memory-count]').textContent() || '').trim() === '1', 'attention_memory_count');
  check((await page.locator('[data-xizong-attention-marked-count]').textContent() || '').trim() === '1', 'attention_marked_count');
  check((await page.locator('[data-xizong-attention-repair-count]').textContent() || '').trim() === '1', 'attention_repair_count');

  const screenshot = path.join(auditDir, 'xizong-home.png');
  await page.screenshot({ path: screenshot, fullPage: false });
  report.status = 'PASS';
  report.min_visible_type_px = type.min;
  report.geometry = geometry;
  report.finished_at = new Date().toISOString();
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log('XIZONG_HOME_WORKSPACE_PASS');
  await context.close();
} catch (error) {
  report.status = 'FAIL';
  report.error = String(error?.stack || error);
  report.finished_at = new Date().toISOString();
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.error(error);
  process.exitCode = 1;
} finally {
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
