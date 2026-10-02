#!/usr/bin/env node
// Bounded synthetic user-flow acceptance. No production target URL is accepted.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import net from 'node:net';
import { createHash } from 'node:crypto';
import { spawn, execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { isolatedTestEnv, reserveLoopbackPort, stopOwnedProcess, waitFor, waitForLearnerWriter, sleep } from '../test-support/isolated-runtime.mjs';
import { readPrivateLearnerCheckpoint } from '../privateLearnerStore.mjs';
import { PRACTICE_KEYS as K } from '../../src/lib/politicsPracticeState.mjs';
import { catalog } from '../fixtures/politics-practice/catalog.mjs';
import { verifyNativeEvidenceBrowser } from '../test-support/native-evidence-browser.mjs';

const webRoot = fileURLToPath(new URL('../../', import.meta.url));
const require = createRequire(import.meta.url);
const args = process.argv.slice(2);
const allowed = new Set(['--prove-detector', '--help']);
if (args.some(arg => !allowed.has(arg))) throw new Error('Only --prove-detector and --help are accepted; external targets are forbidden.');
if (args.includes('--help')) {
  console.log('node scripts/personal-system-acceptance/run.mjs [--prove-detector]\nUses installed Playwright/Astro and an installed browser (KIANOS_TEST_CHROME). Never installs dependencies.\nReports: static-web/.qa/output/playwright/personal-system-acceptance/<unique-run>/report.md');
  process.exit(0);
}
const definitions = [
  { id: 'native-evidence', name: '原生 KP/System 证据写入', contract: '完整生产组件处理重复 Recall、三种 System phase、未揭示阻断及存储失败保护。' },
  { id: 'save-refresh', name: '学习保存 → 刷新 → 空浏览器恢复', contract: '实际首答、复盘、备注和继续位置在刷新及私有存档恢复后保持一致。' },
  { id: 'cross-day', name: '跨学习日继续', contract: '上海午夜后旧首答保持原日期，新作答归属新日期，checkpoint 更新为新学习日。' },
  { id: 'offline-recovery', name: '存档网络中断 → 本地继续 → 恢复', contract: 'checkpoint 网络中断时本地首答不丢，警告可见；恢复后磁盘存档和空浏览器恢复一致。' }
];
const faults = args.includes('--prove-detector') ? [
  { id: 'legacy-fixture-revision', scenario: 'save-refresh', expected: 'REFRESH_UI_RESULT', description: '回放已证实的旧 fixture 缺字段：临时副本移除 taskRevision，刷新被原生版本保护拒绝。' },
  { id: 'false-ack', scenario: 'save-refresh', expected: 'DURABLE_RESULT', description: 'PUT 返回 saved/HTTP 200 但不写入磁盘，重现虚假存档成功/恢复丢失的故障签名。' },
  { id: 'stale-read', scenario: 'cross-day', expected: 'RESTORED_RESULT', description: '新浏览器仅收到第一天的旧 checkpoint，重现恢复旧快照丢掉后续事实的故障签名。' },
  { id: 'stuck-offline', scenario: 'offline-recovery', expected: 'RECOVERY_DURABLE_RESULT', description: '恢复网络阶段仍中断 checkpoint PUT，证明本地保存不能冒充持久恢复。' }
] : [];
const outputRoot = path.join(webRoot, '.qa/output/playwright/personal-system-acceptance');
fs.mkdirSync(outputRoot, { recursive: true });
const out = fs.mkdtempSync(path.join(outputRoot, 'run-'));
// Astro virtual component modules must stay beneath the common project root.
// This ignored, unique directory is disposable and never a real private root.
const scratch = fs.mkdtempSync(path.join(webRoot, '.qa/system-acceptance-runtime-'));
fs.chmodSync(scratch, 0o700);
const report = {
  schema: 'kianos.personal-system-acceptance.v1', startedAt: new Date().toISOString(),
  commit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: webRoot, encoding: 'utf8' }).trim(),
  scope: 'Synthetic Politics and KP/System fixtures with production components, browser writer, checkpoint adapters and static server; engineering evidence only.',
  status: 'NOT_RUN', setup: { status: 'NOT_RUN' }, scenarios: [], detector: [],
  notRun: ['真实学习数据 / Stable', '页面 writer 竞争', 'A2 readiness', '日程链路与筛选', '完整语料与真实 learner U', 'managed Current doctor（本工具只启动临时 fixture，不宣称 Current readiness）'],
  isolation: { scratch, externalRequests: [], contexts: [], inheritedKianosEnvironment: 'removed', relays: 'disabled', cleanup: 'NOT_RUN' }
};
const children = new Set();
const sourceFiles = ['scripts/fixtures/politics-practice/catalog.mjs', 'src/layouts/BaseFrame.astro', 'src/components/PoliticsPracticeWorkbench.astro', 'src/components/XizongRecallEvidenceBridge.astro', 'src/components/XizongSystemEvidenceGuard.astro', 'src/lib/politicsPracticeClient.mjs', 'src/lib/politicsPracticeState.mjs', 'src/lib/browserLearnerWriter.mjs', 'src/lib/privateCheckpointRuntime.mjs', 'scripts/privateLearnerStore.mjs', 'scripts/kianos-static-server.mjs'];
const sourceHashes = () => Object.fromEntries(sourceFiles.map(file => [file, createHash('sha256').update(fs.readFileSync(path.join(webRoot, file))).digest('hex')]));
report.sources = { before: sourceHashes(), unchanged: 'NOT_RUN' };
let browser;
let interrupted = false;
const json = (file, value) => fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n', { mode: 0o600 });
json(path.join(out, 'run-plan.json'), { scratch, scenarios: definitions, faults, status: 'NOT_RUN' });
console.log('RUN ' + out);
const envFor = isolatedTestEnv;

function launch(command, argv, options) {
  const child = spawn(command, argv, { ...options, stdio: ['ignore', 'pipe', 'pipe'], detached: true });
  children.add(child);
  child.log = '';
  child.stdout.on('data', chunk => { child.log += chunk; });
  child.stderr.on('data', chunk => { child.log += chunk; });
  child.on('error', error => { child.spawnError = error.message; });
  return child;
}
const stop = child => stopOwnedProcess(child, { processGroup: true });
for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => {
  interrupted = true;
  void browser?.close().catch(() => {});
  for (const child of children) void stop(child);
});
const until = (fn, code, timeout = 12000) => waitFor(fn, { code, timeout, signal: { get aborted() { return interrupted; } } });
const freePort = reserveLoopbackPort;
async function portOpen(port) {
  return new Promise(resolve => {
    const socket = net.createConnection({ host: '127.0.0.1', port });
    const done = value => { socket.destroy(); resolve(value); };
    socket.once('connect', () => done(true)); socket.once('error', () => done(false)); socket.setTimeout(400, () => done(false));
  });
}
function verify(row, code, actual, expected = true) {
  try { assert.deepEqual(actual, expected); }
  catch (cause) {
    row.checks.push({ code, status: 'FAIL', actual, expected });
    throw Object.assign(new Error(code, { cause }), { code });
  }
  row.checks.push({ code, status: 'PASS' });
}
function projection(entries) {
  const parse = key => entries[key] == null ? null : JSON.parse(entries[key]);
  const session = parse(K.session);
  return { attempts: parse(K.attempts), evidence: parse(K.evidence), meta: parse(K.meta),
    session: session && { id: session.id, ids: session.ids, index: session.index, status: session.status, pending: session.pending, results: session.results } };
}
const native = page => page.evaluate(keys => Object.fromEntries(Object.values(keys).map(key => [key, localStorage.getItem(key)])), K).then(projection);
const fromDisk = env => {
  const checkpoint = readPrivateLearnerCheckpoint(env.KIANOS_PRIVATE_DIR);
  return { checkpoint, result: projection(checkpoint?.payload?.subjects?.politics?.entries || {}) };
};
const same = (a, b) => { try { assert.deepEqual(a, b); return true; } catch { return false; } };
async function ready(page) {
  await waitForLearnerWriter(page);
  await page.locator('[data-start-session]').waitFor({ state: 'attached' });
}
async function submit(page, labels) {
  for (const label of labels) await page.locator(`[data-option="${label}"]`).click();
  await page.locator('[data-submit]').click();
  await page.locator('[data-submitted-result]').waitFor({ state: 'visible' });
}
async function buildFixture(legacy = false) {
  // Copy only the existing synthetic fixture, mounting production components.
  const fixture = path.join(scratch, legacy ? 'fixture-legacy' : 'fixture');
  const source = path.join(webRoot, 'scripts/fixtures/politics-practice');
  fs.mkdirSync(fixture);
  // Never share a mutable dependency tree with a different checkout.
  assert.equal(fs.lstatSync(path.join(webRoot, 'node_modules')).isSymbolicLink(), false, 'Materialize dependencies inside this checkout first.');
  fs.cpSync(path.join(source, 'src'), path.join(fixture, 'src'), { recursive: true });
  fs.copyFileSync(fileURLToPath(new URL('./fixtures/native-evidence.astro', import.meta.url)), path.join(fixture, 'src/pages/native-evidence.astro'));
  fs.copyFileSync(path.join(source, 'catalog.mjs'), path.join(fixture, 'catalog.mjs'));
  if (legacy) {
    fs.appendFileSync(path.join(fixture, 'catalog.mjs'), '\nfor (const question of catalog.questions) delete question.taskRevision;\n');
  }
  fs.writeFileSync(path.join(fixture, 'src/pages/index.astro'), '<!doctype html><title>Synthetic acceptance only</title><a href="/politics/practice/">Synthetic acceptance only</a>');
  const config = `import {defineConfig} from ${JSON.stringify(pathToFileURL(require.resolve('astro/config')).href)};
export default defineConfig({ output:'static', trailingSlash:'always',
  srcDir:${JSON.stringify(path.join(fixture, 'src'))}, outDir:${JSON.stringify(path.join(fixture, 'dist'))}, publicDir:${JSON.stringify(path.join(fixture, 'empty-public'))}, cacheDir:${JSON.stringify(path.join(fixture, '.cache'))},
  vite:{resolve:{alias:{'@runtime':${JSON.stringify(path.join(webRoot, 'src'))}}},server:{fs:{allow:[${JSON.stringify(webRoot)},${JSON.stringify(fixture)}]}}}
});\n`;
  fs.writeFileSync(path.join(fixture, 'astro.config.mjs'), config);
  const child = launch(process.execPath, [path.join(webRoot, 'node_modules/astro/astro.js'), 'build', '--root', webRoot, '--config', path.relative(webRoot, path.join(fixture, 'astro.config.mjs'))], { cwd: webRoot, env: { ...envFor(path.join(scratch, 'build')), ASTRO_TELEMETRY_DISABLED: '1' } });
  try {
    await until(() => child.spawnError || child.exitCode !== null || child.signalCode !== null, 'FIXTURE_BUILD_TIMEOUT', 90000);
    assert.equal(child.exitCode, 0, child.log || child.spawnError);
  } finally { fs.writeFileSync(path.join(out, legacy ? 'build-legacy.log' : 'build.log'), child.log); }
  return path.join(fixture, 'dist');
}

async function runCase(def, fault, artifact) {
  const id = def.id + (fault ? '--' + fault.id : '');
  const row = { ...def, id, scenario: def.id, fault: fault?.id || null, status: 'NOT_RUN', checks: [], artifacts: [], requests: [], errors: [], injection: { hits: 0 }, cleanup: 'NOT_RUN' };
  (fault ? report.detector : report.scenarios).push(row);
  if (fault) Object.assign(row, { expectedFailure: fault.expected, description: fault.description, detectorStatus: 'NOT_RUN' });
  if (fault?.id === 'legacy-fixture-revision') row.injection = { hits: 1, replay: 'known missing-taskRevision fixture regression; temporary copy only' };
  const dir = path.join(out, id); fs.mkdirSync(dir);
  const root = path.join(scratch, id); fs.mkdirSync(root, { mode: 0o700 });
  const env = envFor(root), port = await freePort(), base = `http://127.0.0.1:${port}`;
  row.isolation = { root, port, base, privateRoots: Object.fromEntries(Object.entries(env).filter(([k]) => /^KIANOS_.*_DIR$/.test(k))), contextIds: [] };
  for (const target of Object.values(row.isolation.privateRoots)) assert.ok(target.startsWith(root + path.sep));
  const server = launch(process.execPath, [path.join(webRoot, 'scripts/kianos-static-server.mjs'), '--host', '127.0.0.1', '--port', String(port), '--root', artifact, '--release-probe-only'], { cwd: root, env });
  let context, page, dayOneCheckpoint;
  let disconnected = false, recovering = false;
  const contexts = [];
  const startTime = new Date('2030-01-01T15:59:00Z');
  async function open(fresh = false, nextDay = false) {
    context = await browser.newContext({ viewport: { width: 1440, height: 900 }, timezoneId: 'Asia/Shanghai', serviceWorkers: 'block', acceptDownloads: false });
    contexts.push(context);
    const contextId = `${id}:${contexts.length}`;
    row.isolation.contextIds.push(contextId);
    report.isolation.contexts.push({ id: contextId, persistent: false, freshStorage: true });
    await context.tracing.start({ screenshots: true, snapshots: true, sources: false });
    await context.route('**/*', async route => {
      const request = route.request(), url = new URL(request.url());
      if (url.origin !== base) {
        report.isolation.externalRequests.push({ case: id, url: request.url(), blocked: true });
        return route.abort('blockedbyclient');
      }
      if (url.pathname === '/__kianos-private/checkpoint') {
        const entry = { method: request.method(), phase: disconnected ? 'disconnected' : recovering ? 'recovering' : 'online' };
        row.requests.push(entry);
        if (request.method() === 'PUT' && fault?.id === 'false-ack') {
          row.injection.hits++; entry.injected = 'false-ack';
          return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'saved', checkpoint_id: request.postDataJSON().checkpoint_id }) });
        }
        if (disconnected || (recovering && fault?.id === 'stuck-offline' && request.method() === 'PUT')) {
          if (recovering) row.injection.hits++;
          entry.injected = 'network-abort'; return route.abort('internetdisconnected');
        }
        if (fresh && fault?.id === 'stale-read' && request.method() === 'GET') {
          row.injection.hits++; entry.injected = 'stale-read';
          return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'ready', checkpoint: dayOneCheckpoint }) });
        }
      }
      await route.continue();
    });
    page = await context.newPage();
    page.setDefaultTimeout(12000);
    page.on('pageerror', error => row.errors.push(error.message));
    page.on('response', response => {
      if (response.url().includes('/__kianos-private/checkpoint')) row.requests.push({ response: response.status(), method: response.request().method() });
    });
    // Clock changes only the isolated browser. Timers continue at real speed.
    await page.clock.install({ time: nextDay ? new Date('2030-01-01T16:02:00Z') : fresh ? new Date('2030-01-01T15:59:30Z') : startTime });
    await page.addInitScript(() => {
      window.__acceptanceStorageAtBoot = Object.keys(localStorage);
      window.__acceptanceEvents = [];
      for (const name of ['kianos:private-checkpoint-error', 'kianos:private-checkpoint-saved']) {
        window.addEventListener(name, event => window.__acceptanceEvents.push({ name, detail: event.detail || null }));
      }
    });
    await page.goto(base + (def.id === 'native-evidence' ? '/native-evidence/' : '/politics/practice/'), { waitUntil: 'domcontentloaded' });
    if (def.id === 'native-evidence') await waitForLearnerWriter(page); else await ready(page);
    verify(row, 'EMPTY_CONTEXT_' + contexts.length, await page.evaluate(() => window.__acceptanceStorageAtBoot), []);
    return page;
  }
  async function saveEvidence(label) {
    if (!page || page.isClosed()) return;
    const screenshot = `${label}.png`, state = `${label}.json`;
    await page.screenshot({ path: path.join(dir, screenshot), fullPage: true });
    const nativeEvidence = def.id === 'native-evidence' ? await page.evaluate(() => Object.fromEntries(Object.keys(localStorage).filter(key => key.includes('synthetic-evidence')).map(key => [key, localStorage.getItem(key)]))) : undefined;
    json(path.join(dir, state), { native: await native(page), nativeEvidence, durable: fromDisk(env), browser: await page.evaluate(() => ({ writer: document.documentElement.dataset.learnerWriter, notice: document.querySelector('[data-learner-writer-notice]')?.textContent, events: window.__acceptanceEvents, url: location.pathname })) });
    row.artifacts.push(screenshot, state);
  }
  async function flushAndCheck(expected, code = 'DURABLE_RESULT', day = '2030-01-01') {
    // Existing blur flush is the real leave-surface save path; no production hook is replaced.
    await page.evaluate(() => window.dispatchEvent(new Event('blur')));
    await until(() => same(fromDisk(env).result, expected) && fromDisk(env).checkpoint?.study_day === day, code);
    verify(row, code, fromDisk(env).result, expected);
    verify(row, code + '_WARNINGS', fromDisk(env).checkpoint.payload.shared.capture_warnings, []);
    verify(row, code + '_MODE', fs.statSync(path.join(env.KIANOS_PRIVATE_DIR, 'latest.json')).mode & 0o777, 0o600);
  }
  try {
    await until(() => {
      if (server.spawnError || server.exitCode !== null || server.signalCode !== null) throw new Error(server.log || server.spawnError);
      return server.log.includes('KianOS static runtime listening on ' + base);
    }, 'OWNED_SERVER_READY');
    // Doctor-like transport observation is recorded separately from business assertions.
    const health = await fetch(base + '/__kianos-private/checkpoint').then(async r => ({ status: r.status, body: await r.json() }));
    verify(row, 'EMPTY_PRIVATE_ROOT', health, { status: 404, body: { status: 'missing', checkpoint: null } });
    await open();
    if (def.id === 'native-evidence') {
      row.nativeEvidence = await verifyNativeEvidenceBrowser(page);
      verify(row, 'NATIVE_COMPONENT_BEHAVIOR', true);
      verify(row, 'NO_UNCAUGHT_ERRORS', row.errors, []);
      await saveEvidence('native-evidence-protected');
      row.status = 'PASS';
      return;
    }
    await page.selectOption('[data-filter-count]', '5');
    await page.check('[data-learned-scope]'); await page.locator('[data-start-session]').click();
    await page.locator('[data-question-card]').waitFor({ state: 'visible' });
    if (def.id === 'offline-recovery') {
      await flushAndCheck(await native(page), 'BASELINE_DURABLE_RESULT');
      disconnected = true;
    }
    await submit(page, 'A'); // known wrong answer: must create native first attempt + one evidence event.
    await page.fill('[data-note]', '仅合成验收：保存原始首答和继续位置');
    await until(async () => (await native(page)).meta?.notes?.[catalog.questions[0].id] === '仅合成验收：保存原始首答和继续位置', 'NOTE_SAVED');
    const first = await native(page), firstAttempt = first.attempts?.units?.[catalog.units[0].key]?.attempts?.[catalog.questions[0].id];
    verify(row, 'NATIVE_FIRST_ATTEMPT', { selected: firstAttempt?.selected, outcome: firstAttempt?.outcome, day: firstAttempt?.study_day, events: first.evidence?.length, results: Object.keys(first.session.results).length }, { selected: 'A', outcome: 'WRONG', day: '2030-01-01', events: 1, results: 1 });
    if (def.id === 'offline-recovery') {
      await page.evaluate(() => window.dispatchEvent(new Event('blur')));
      await page.locator('[data-learner-writer-notice]').filter({ hasText: '尚未确认存档' }).waitFor({ state: 'visible' });
      verify(row, 'OFFLINE_LOCAL_RESULT', await native(page), first);
      verify(row, 'OFFLINE_NOT_DURABLE', !same(fromDisk(env).result, first));
      await saveEvidence('offline-warning');
    } else await flushAndCheck(first);
    await page.reload({ waitUntil: 'domcontentloaded' }); await ready(page);
    verify(row, 'REFRESH_RESULT', await native(page), first);
    await until(async () => await page.locator('[data-submitted-result]').isVisible() || await page.locator('[data-practice-error]').isVisible(), 'REFRESH_UI_READY');
    verify(row, 'REFRESH_UI_RESULT', await page.locator('[data-submitted-result]').isVisible());
    verify(row, 'REFRESH_NOTE', await page.inputValue('[data-note]'), first.meta.notes[catalog.questions[0].id]);
    let expected = first;
    if (def.id === 'cross-day') {
      dayOneCheckpoint = structuredClone(fromDisk(env).checkpoint);
      await page.clock.setSystemTime(new Date('2030-01-01T16:01:00Z'));
      await page.locator('[data-next-question]').click(); await submit(page, 'A');
      expected = await native(page);
      verify(row, 'OLD_FACT_UNCHANGED', expected.attempts.units[catalog.units[0].key].attempts[catalog.questions[0].id], firstAttempt);
      verify(row, 'NEW_FACT_NEW_DAY', expected.attempts.units[catalog.units[0].key].attempts[catalog.questions[1].id].study_day, '2030-01-02');
      verify(row, 'TWO_DISTINCT_EVENTS', { events: expected.evidence.length, unique: new Set(expected.evidence.map(e => e.event_id)).size }, { events: 2, unique: 2 });
      await flushAndCheck(expected, 'CROSS_DAY_DURABLE_RESULT', '2030-01-02');
    } else if (def.id === 'offline-recovery') {
      disconnected = false; recovering = true;
      await flushAndCheck(expected, 'RECOVERY_DURABLE_RESULT');
      await page.waitForFunction(() => document.querySelector('[data-learner-writer-notice]')?.hidden === true);
      verify(row, 'RECOVERY_NOTICE_CLEARED', true);
    }
    await saveEvidence('before-fresh-context');
    await context.tracing.stop({ path: path.join(dir, 'initial-context.zip') }); row.artifacts.push('initial-context.zip');
    await context.close();
    await open(true, def.id === 'cross-day');
    verify(row, 'RESTORED_RESULT', await native(page), expected);
    await page.locator('[data-submitted-result]').waitFor({ state: 'visible' });
    verify(row, 'RESTORED_POSITION', (await native(page)).session.index, def.id === 'cross-day' ? 1 : 0);
    verify(row, 'NO_UNCAUGHT_ERRORS', row.errors, []);
    await saveEvidence('restored');
    row.status = 'PASS';
  } catch (error) {
    row.status = 'FAIL'; row.failure = { code: error.code || 'UNEXPECTED_FAILURE', message: error.message, stack: error.stack };
    if (!row.checks.some(check => check.code === row.failure.code && check.status === 'FAIL')) row.checks.push({ code: row.failure.code, status: 'FAIL' });
    try { await saveEvidence('failure'); } catch (captureError) { row.evidenceError = captureError.message; }
  } finally {
    for (let i = 0; i < contexts.length; i++) {
      try { const name = `context-${i + 1}.zip`; await contexts[i].tracing.stop({ path: path.join(dir, name) }); row.artifacts.push(name); } catch {}
      await contexts[i].close().catch(() => {});
    }
    try {
      await stop(server);
      verify(row, 'OWNED_PORT_CLOSED', await portOpen(port), false);
      fs.rmSync(root, { recursive: true, force: true });
      verify(row, 'PRIVATE_ROOT_REMOVED', fs.existsSync(root), false);
      row.cleanup = 'PASS';
    } catch (error) { row.cleanup = 'FAIL'; row.cleanupError = error.message; row.status = 'FAIL'; }
    fs.writeFileSync(path.join(dir, 'server.log'), server.log);
    row.artifacts.push('server.log');
    if (fault) row.detectorStatus = row.status === 'FAIL' && row.failure?.code === fault.expected && row.injection.hits > 0 && row.cleanup === 'PASS' ? 'PASS' : 'FAIL';
    json(path.join(dir, 'result.json'), row);
    console.log(`${fault ? 'DETECTOR ' + row.detectorStatus : row.status} ${id}${row.failure ? ' (' + row.failure.code + ')' : ''}`);
  }
}

function writeReport() {
  for (const def of definitions) if (!report.scenarios.some(row => row.scenario === def.id)) {
    report.scenarios.push({ ...def, scenario: def.id, status: 'NOT_RUN', cleanup: 'NOT_RUN', checks: [], artifacts: [] });
  }
  report.finishedAt = new Date().toISOString();
  json(path.join(out, 'report.json'), report);
  const lines = [
    '# 个人系统流程验收', '', `结果：**${report.status}** · 基线 \`${report.commit}\``, '',
    '仅合成学习记录。Politics fixture 与最小 KP/System fixture 挂载完整生产组件；不代表 Stable、真实学习记录或整站验收。', '',
    '| 场景 | 业务结果 | 清理 | 失败原因 |', '| --- | --- | --- | --- |',
    ...report.scenarios.map(r => `| ${r.name} | ${r.status} | ${r.cleanup} | ${r.failure?.code || '—'} |`), '',
    ...definitions.filter(d => !report.scenarios.some(r => r.scenario === d.id)).map(d => `- ${d.name}：NOT_RUN`),
    '## 检测能力证明', '', '故障运行的业务结果保留 FAIL；只有命中预先指定断言才算检测成功。HTTP 200 本身不是业务成功。', '',
    ...report.detector.map(r => `- ${r.fault}：业务 ${r.status}，检测器 ${r.detectorStatus}，触发 ${r.injection.hits} 次，断言 \`${r.failure?.code || '未触发'}\`。${r.description}`),
    ...(report.detector.length ? [] : ['- NOT_RUN：使用 --prove-detector 执行。']), '',
    '## 隔离与证据', '', `- 临时资源清理：${report.isolation.cleanup}。独立浏览器关闭：${report.isolation.browserClosed || 'NOT_RUN'}。`,
    '- 每个场景独占动态 loopback 端口和 private roots；每次恢复使用空 BrowserContext。',
    '- 继承的 KIANOS_* 配置被删除；外部浏览器请求拦截；私有远端 relay 关闭；无真实浏览器连接。',
    `- ${sourceFiles.length} 个生产/共享 fixture 文件的运行前后 SHA-256 比对：${report.sources.unchanged}。`,
    ...report.scenarios.concat(report.detector).map(r => `- [${r.id}](./${r.id}/result.json)：${r.artifacts.filter(x => /png|json|zip/.test(x)).map(a => `[${a}](./${r.id}/${a})`).join(' · ')}`), '',
    '## 未运行范围', '', ...report.notRun.map(s => '- ' + s), '',
    ...(report.runnerError ? ['## 运行阻断', '', report.runnerError, ''] : [])
  ];
  fs.writeFileSync(path.join(out, 'report.md'), lines.join('\n'));
}

try {
  const { chromium } = await import('playwright');
  const executablePath = process.env.KIANOS_TEST_CHROME || chromium.executablePath();
  assert.ok(fs.existsSync(executablePath), 'Installed browser missing. Set KIANOS_TEST_CHROME to an already installed Chromium; nothing is installed automatically.');
  const artifact = await buildFixture();
  const legacyArtifact = faults.some(fault => fault.id === 'legacy-fixture-revision') ? await buildFixture(true) : null;
  browser = await chromium.launch({ executablePath, headless: true, chromiumSandbox: true, downloadsPath: path.join(scratch, 'downloads'), args: ['--disable-background-networking', '--disable-sync', '--disable-extensions'] });
  report.setup = { status: 'PASS', browser: browser.version(), playwright: require('playwright/package.json').version, executablePath, fixture: 'scripts/fixtures/politics-practice', fixtureAdapter: 'shared synthetic catalog supplies taskRevision; legacy replay removes it only in temporary copy' };
  for (const def of definitions) { if (interrupted) throw new Error('INTERRUPTED'); await runCase(def, null, artifact); }
  for (const fault of faults) { if (interrupted) throw new Error('INTERRUPTED'); await runCase(definitions.find(d => d.id === fault.scenario), fault, fault.id === 'legacy-fixture-revision' ? legacyArtifact : artifact); }
  report.status = report.scenarios.length === definitions.length && report.scenarios.every(r => r.status === 'PASS') && report.detector.every(r => r.detectorStatus === 'PASS') ? 'PASS' : 'FAIL';
} catch (error) {
  report.status = report.scenarios.length ? 'FAIL' : 'NOT_RUN';
  report.runnerError = error.stack;
  if (report.setup.status !== 'PASS') report.setup = { ...report.setup, status: 'FAIL', error: error.stack };
} finally {
  try { if (browser) { await browser.close(); report.isolation.browserClosed = 'PASS'; } }
  catch (error) { report.status = 'FAIL'; report.isolation.browserClosed = error.message; }
  try {
    for (const child of children) await stop(child);
    fs.rmSync(scratch, { recursive: true, force: true });
    assert.equal(fs.existsSync(scratch), false);
    report.isolation.cleanup = 'PASS';
  } catch (error) { report.status = 'FAIL'; report.isolation.cleanup = 'FAIL'; report.isolation.cleanupError = error.message; }
  try {
    report.sources.after = sourceHashes();
    assert.deepEqual(report.sources.after, report.sources.before);
    report.sources.unchanged = 'PASS';
  } catch (error) { report.sources.unchanged = 'FAIL'; report.sources.error = error.message; report.status = 'FAIL'; }
  writeReport();
  console.log('REPORT ' + path.join(out, 'report.md'));
  process.exitCode = report.status === 'PASS' ? 0 : report.status === 'NOT_RUN' ? 2 : 1;
}
