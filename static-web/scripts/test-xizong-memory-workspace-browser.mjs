import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const PORT = 4337;
const BASE = `http://127.0.0.1:${PORT}`;
const STORAGE_KEY = 'kianos-xizong-memory-v1';
const reportPath = path.resolve(process.cwd(), '.qa/xizong-memory-workspace-browser.json');
const screenshotPath = path.resolve(process.cwd(), '.qa/xizong-memory-workspace.png');
const report = {
  schema: 'kianos.xizong.memory_browser.v2',
  route: '/xizong/memory/',
  started_at: new Date().toISOString(),
  checks: [],
  type_samples: []
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const check = (condition, name, detail = '') => {
  if (!condition) throw new Error(`XIZONG_MEMORY_BROWSER_FAIL:${name}${detail ? `:${detail}` : ''}`);
  report.checks.push({ name, pass: true, detail });
};

async function waitForHttp(url, attempts = 120) {
  for (let index = 0; index < attempts; index += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {}
    await sleep(200);
  }
  throw new Error(`HTTP_NOT_READY:${url}`);
}

async function scanVisibleType(root, stage) {
  const result = await root.evaluate((node) => {
    const selector = 'a,p,li,td,th,figcaption,span,small,b,strong,em,label,button,summary,code,kbd,dt,dd,blockquote,input,textarea,select';
    const rows = [...node.querySelectorAll(selector)]
      .filter((el) => {
        const value = ((el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) ? (el.value || el.placeholder) : el.textContent || '').trim();
        if (!value) return false;
        const style = getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) !== 0 && el.getClientRects().length > 0;
      })
      .map((el) => ({
        tag: el.tagName.toLowerCase(),
        text: (((el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) ? (el.value || el.placeholder) : el.textContent) || '').trim().replace(/\s+/g, ' ').slice(0, 100),
        size: Number.parseFloat(getComputedStyle(el).fontSize || '0')
      }));
    return {
      count: rows.length,
      min: rows.length ? Math.min(...rows.map((row) => row.size)) : null,
      under15: rows.filter((row) => row.size < 14.99).slice(0, 30)
    };
  });
  report.type_samples.push({ stage, ...result });
  check(result.under15.length === 0, `${stage}_visible_type_floor_15`, JSON.stringify(result.under15));
  return result.min;
}

const fixture = {
  schema: 'kianos.xizong.memory.v1',
  revision: 1,
  releasedBlocks: {
    'respiratory-r01': {
      blockId: 'respiratory-r01',
      systemId: 'respiratory',
      canonicalId: 'A2',
      blockLabel: 'R1',
      blockTitle: '呼吸生理',
      sourceHash: 'browser-fixture-v1',
      releasedAt: '2026-09-17T08:00:00.000Z',
      refreshedAt: '2026-09-17T08:00:00.000Z',
      coreCardIds: ['core:respiratory-r01-kp01'],
      precisionCardIds: ['precision:a2-r01-kp01-precision']
    }
  },
  cards: {
    'core:respiratory-r01-kp01': {
      id: 'core:respiratory-r01-kp01',
      family: 'CORE',
      systemId: 'respiratory',
      canonicalId: 'A2',
      blockId: 'respiratory-r01',
      blockLabel: 'R1',
      blockTitle: '呼吸生理',
      logicGroupId: 'respiratory-r01-lg01',
      groupLabel: '容量与流速',
      kpId: 'respiratory-r01-kp01',
      displayId: 'KP1',
      title: '肺容积与肺容量',
      promptCanonical: '容积 / 容量 → 组合关系',
      coreHtml: '<p><strong>肺容积</strong>与肺容量的 canonical Core browser fixture。</p>',
      sourceLocator: 'P10–11',
      releasedAt: '2026-09-17T08:00:00.000Z'
    },
    'precision:a2-r01-kp01-precision': {
      id: 'precision:a2-r01-kp01-precision',
      family: 'PRECISION',
      systemId: 'respiratory',
      canonicalId: 'A2',
      blockId: 'respiratory-r01',
      blockLabel: 'R1',
      blockTitle: '呼吸生理',
      logicGroupId: 'respiratory-r01-lg01',
      groupLabel: '容量与流速',
      kpId: 'respiratory-r01-kp01',
      displayId: 'KP1',
      title: '肺容积精确项',
      cue: '肺容积 / 肺容量常用数值最终需要精确恢复。',
      answerHtml: '',
      ownerContextHtml: '<p>Current owning Core context；这里不猜取独立阈值。</p>',
      answerResolution: 'OWNER_CONTEXT_ONLY',
      releasedAt: '2026-09-17T08:00:00.000Z'
    }
  },
  promptOverrides: {},
  marks: {
    'mark:fixture': {
      id: 'mark:fixture',
      cardId: 'core:respiratory-r01-kp01',
      kpId: 'respiratory-r01-kp01',
      surface: 'CORE',
      text: '肺容量的 canonical Core browser fixture',
      createdAt: '2026-09-17T09:00:00.000Z',
      reviewRequested: false
    }
  },
  evidence: [
    {
      id: 'memory:fixture:1',
      cardId: 'core:respiratory-r01-kp01',
      family: 'CORE',
      rating: 'unknown',
      origin: 'BROWSER_FIXTURE',
      at: '2026-09-17T09:30:00.000Z'
    }
  ],
  attention: {
    'core:respiratory-r01-kp01': {
      reviewRequested: true,
      reason: 'BROWSER_FIXTURE_WEAK',
      updatedAt: '2026-09-17T09:30:00.000Z'
    }
  },
  repairTasks: [
    {
      id: 'repair:fixture',
      cardId: 'core:respiratory-r01-kp01',
      kpId: 'respiratory-r01-kp01',
      title: '只修一个机制断点',
      reason: 'browser fixture discriminating check',
      action: '重新运行这一局部链条',
      priority: 'high',
      origin: 'BROWSER_FIXTURE',
      status: 'ACTIVE'
    }
  ]
};

const server = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', String(PORT)], {
  cwd: process.cwd(),
  stdio: ['ignore', 'pipe', 'pipe'],
  detached: process.platform !== 'win32'
});
let browser;

try {
  await waitForHttp(`${BASE}/xizong/memory/`);
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1512, height: 982 } });
  await page.goto(`${BASE}/xizong/memory/`, { waitUntil: 'networkidle' });

  await page.evaluate((key) => localStorage.removeItem(key), STORAGE_KEY);
  await page.reload({ waitUntil: 'networkidle' });

  const root = page.locator('[data-xizong-memory-workspace]');
  check(await root.count() === 1, 'workspace_mounted');
  check(await page.locator('[data-memory-view]').count() === 5, 'exact_five_top_views');
  check(await page.locator('[data-xizong-v6-block]').count() === 0, 'memory_is_not_block_runtime');
  check(await page.locator('[data-memory-empty]').isVisible(), 'empty_library_is_honest');
  check((await page.locator('[data-memory-summary-today]').textContent())?.trim() === '0', 'empty_today_zero');
  await scanVisibleType(root, 'empty');

  await page.evaluate(({ key, value }) => localStorage.setItem(key, JSON.stringify(value)), { key: STORAGE_KEY, value: fixture });
  await page.reload({ waitUntil: 'networkidle' });

  const geometry = await root.evaluate((node) => {
    const rootRect = node.getBoundingClientRect();
    const layout = node.querySelector('.xzMemoryLayout')?.getBoundingClientRect();
    const queue = node.querySelector('.xzMemoryQueue')?.getBoundingClientRect();
    const stage = node.querySelector('.xzMemoryStage')?.getBoundingClientRect();
    const context = node.querySelector('.xzMemoryContext')?.getBoundingClientRect();
    return {
      root_width: rootRect.width,
      root_height: rootRect.height,
      layout_width: layout?.width || 0,
      queue_width: queue?.width || 0,
      stage_width: stage?.width || 0,
      context_width: context?.width || 0
    };
  });
  check(geometry.root_width > 1080, 'memory_uses_mac_width', JSON.stringify(geometry));
  check(geometry.queue_width >= 250, 'memory_queue_readable', JSON.stringify(geometry));
  check(geometry.stage_width >= 600, 'memory_stage_dominant', JSON.stringify(geometry));
  check(geometry.context_width >= 220, 'memory_context_readable', JSON.stringify(geometry));
  report.geometry = geometry;

  check((await page.locator('[data-memory-summary-core]').textContent())?.trim() === '1', 'released_core_visible');
  check((await page.locator('[data-memory-summary-precision]').textContent())?.trim() === '1', 'released_precision_visible');
  check((await page.locator('[data-memory-summary-marked]').textContent())?.trim() === '1', 'marked_visible');
  check((await page.locator('[data-memory-summary-repair]').textContent())?.trim() === '1', 'repair_visible');
  check((await page.locator('[data-memory-summary-today]').textContent())?.trim() === '1', 'today_only_contains_signaled_card');
  check(await page.locator('[data-memory-card]').isVisible(), 'today_card_visible');
  check((await page.locator('[data-memory-card-family]').textContent())?.includes('Core'), 'today_core_identity');
  await scanVisibleType(root, 'today');

  await page.locator('[data-memory-view="CORE"]').click();
  check(await page.locator('[data-memory-prompt]').isVisible(), 'core_prompt_visible');
  check((await page.locator('[data-memory-prompt]').textContent())?.includes('容积 / 容量'), 'canonical_prompt_rendered');
  check(await page.locator('[data-memory-answer]').isHidden(), 'core_answer_protected_before_reveal');
  await scanVisibleType(root, 'core_front');
  await page.keyboard.press('Space');
  check(await page.locator('[data-memory-answer]').isVisible(), 'space_reveals_core');
  check(await page.locator('[data-memory-ratings]').isVisible(), 'core_rating_after_reveal');
  await scanVisibleType(root, 'core_reveal');
  await page.locator('[data-memory-rating="fuzzy"]').click();
  let stored = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || 'null'), STORAGE_KEY);
  check(stored?.evidence?.length === 2, 'memory_evidence_appended_not_overwritten');
  check(stored?.evidence?.[0]?.rating === 'unknown', 'original_observation_preserved');
  check(stored?.evidence?.[1]?.rating === 'fuzzy', 'new_recall_observation_persisted');

  await page.locator('[data-memory-prompt-edit]').click();
  await page.locator('[data-memory-prompt-input]').fill('我的私有 Prompt');
  await page.locator('[data-memory-prompt-save]').click();
  check((await page.locator('[data-memory-prompt]').textContent())?.trim() === '我的私有 Prompt', 'personal_prompt_applied');
  stored = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || 'null'), STORAGE_KEY);
  check(stored?.cards?.['core:respiratory-r01-kp01']?.promptCanonical === '容积 / 容量 → 组合关系', 'personal_prompt_does_not_mutate_canonical');
  check(stored?.promptOverrides?.['respiratory-r01-kp01'] === '我的私有 Prompt', 'personal_prompt_private_state');
  await page.locator('[data-memory-prompt-reset]').click();
  check((await page.locator('[data-memory-prompt]').textContent())?.includes('容积 / 容量'), 'prompt_reset_restores_canonical');

  await page.locator('[data-memory-view="PRECISION"]').click();
  check(await page.locator('[data-memory-precision-mode]').isVisible(), 'precision_mode_control_visible');
  check(await page.locator('[data-memory-answer]').isVisible(), 'precision_browse_is_open');
  check(await page.locator('[data-memory-reveal-gate]').isHidden(), 'precision_browse_has_no_fake_reveal_gate');
  check((await page.locator('[data-memory-precision-resolution]').textContent())?.includes('不从正文猜取阈值'), 'precision_owner_context_disclosure');
  await scanVisibleType(root, 'precision_browse');
  await page.locator('[data-precision-mode="RECALL"]').click();
  check(await page.locator('[data-memory-answer]').isHidden(), 'precision_recall_protects_answer');
  await page.keyboard.press('Space');
  check(await page.locator('[data-memory-answer]').isVisible(), 'precision_space_reveals');
  check(await page.locator('[data-memory-ratings]').isVisible(), 'precision_recall_has_rating');
  await scanVisibleType(root, 'precision_recall');

  await page.locator('[data-memory-view="MARKED"]').click();
  check(await page.locator('[data-memory-marked-card]').isVisible(), 'marked_fragment_surface');
  check((await page.locator('[data-marked-text]').textContent())?.includes('canonical Core browser fixture'), 'marked_fragment_exact_text');
  await scanVisibleType(root, 'marked');

  await page.locator('[data-memory-view="REPAIR"]').click();
  check(await page.locator('[data-memory-repair-card]').isVisible(), 'repair_surface');
  check((await page.locator('[data-repair-action]').textContent())?.includes('局部链条'), 'repair_action_visible');
  await scanVisibleType(root, 'repair');

  await page.locator('[data-memory-view="CORE"]').click();
  await page.screenshot({ path: screenshotPath, fullPage: false });
  report.completed_at = new Date().toISOString();
  report.status = 'PASS';
  report.viewport = { width: 1512, height: 982 };
  report.top_views = ['Today', 'Core', 'Precision', 'Marked', 'Repair'];
  report.min_visible_type_px = Math.min(...report.type_samples.map((row) => row.min).filter((value) => Number.isFinite(value)));
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`XIZONG_MEMORY_BROWSER PASS | checks=${report.checks.length} | minType=${report.min_visible_type_px}`);
} catch (error) {
  report.completed_at = new Date().toISOString();
  report.status = 'FAIL';
  report.error = String(error?.stack || error);
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  throw error;
} finally {
  try { await browser?.close(); } catch {}
  try {
    if (process.platform === 'win32') server.kill();
    else process.kill(-server.pid, 'SIGTERM');
  } catch { try { server.kill('SIGTERM'); } catch {} }
}
