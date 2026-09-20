import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, execFileSync } from 'node:child_process';
import { chromium } from 'playwright';

import { readPrivateLearnerCheckpoint as readCheckpointFile } from './privateLearnerStore.mjs';
import {
  EXAM_PROFILE_KEY,
  emptyExamProfile
} from '../src/lib/examOrchestrator.mjs';
import {
  EXAM_CHAT_PLAN_KEY,
  EXAM_CHAT_PLAN_SCHEMA
} from '../src/lib/examChatPlan.mjs';
import {
  STUDY_TIMER_LEDGER_KEY,
  STUDY_TIMER_SCHEMA,
  STUDY_TIMER_STATE_KEY
} from '../src/lib/studyTimer.mjs';
import { PRACTICE_KEYS } from '../src/lib/politicsPracticeState.mjs';
import { POLITICS_CHAT_RETURN_LATEST_KEY } from '../src/lib/politicsChatReturn.mjs';
import { buildPoliticsPracticeCatalogCurrent } from '../src/lib/politicsPractice.mjs';
import { loadXizongBlock } from '../src/lib/xizong.mjs';
import { buildXizongProductionBlock } from '../src/lib/xizongProductionProjection.mjs';

const PORT = 4427;
const BASE = `http://127.0.0.1:${PORT}`;
const DAY = '2026-09-19';
const FIXTURE_NOW = Date.parse('2026-09-19T03:00:00.000Z');
const privateDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kianos-final-cross-subject-'));
const sourceWebRoot = process.cwd();
const repoRoot = path.resolve(sourceWebRoot, '..');
const currentSyncScratch = fs.mkdtempSync(path.join(os.tmpdir(), 'kianos-current-sync-regression-'));
const currentSyncRemoteDir = path.join(currentSyncScratch, 'remote.git');
const currentSyncMirrorDir = path.join(currentSyncScratch, 'mirror');
const evidenceDir = path.resolve('../final-cross-subject-evidence');
fs.mkdirSync(evidenceDir, { recursive: true });

const report = {
  schema: 'kianos.final-cross-subject-regression.v1',
  tested_commit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  environment: 'synthetic browser state + real Current routes + disposable Current mirror sync + Astro restart; learner U is UNTESTED',
  checks: [],
  screenshots: []
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const check = (condition, name, detail = '') => {
  assert.equal(Boolean(condition), true, detail || name);
  report.checks.push({ name, pass: true, detail });
  console.log('PASS', name);
};

let server = null;
let serverOutput = '';

async function startServer(cwd = sourceWebRoot) {
  serverOutput = '';
  server = spawn('npm', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', String(PORT)], {
    cwd,
    env: { ...process.env, KIANOS_PRIVATE_DIR: privateDir },
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: process.platform !== 'win32'
  });
  server.stdout?.on('data', (chunk) => { serverOutput += chunk.toString(); });
  server.stderr?.on('data', (chunk) => { serverOutput += chunk.toString(); });

  for (let i = 0; i < 120; i += 1) {
    try {
      const response = await fetch(BASE);
      if (response.ok) return;
    } catch {}
    if (server.exitCode != null) throw new Error('FINAL_CROSS_SUBJECT_SERVER_EXITED:' + serverOutput.slice(-2400));
    await sleep(250);
  }
  throw new Error('FINAL_CROSS_SUBJECT_SERVER_NOT_READY:' + serverOutput.slice(-2400));
}

async function stopServer() {
  if (!server) return;
  try {
    if (process.platform === 'win32') server.kill('SIGTERM');
    else process.kill(-server.pid, 'SIGTERM');
  } catch {
    try { server.kill('SIGTERM'); } catch {}
  }
  await Promise.race([
    new Promise((resolve) => server.once('exit', resolve)),
    sleep(1500)
  ]);
  server = null;
}

function prepareSyncedCurrentMirror() {
  execFileSync('git', ['clone', '--bare', repoRoot, currentSyncRemoteDir], { stdio: 'pipe' });
  execFileSync('git', [`--git-dir=${currentSyncRemoteDir}`, 'update-ref', ['refs', 'heads', 'main'].join('/'), report.tested_commit], { stdio: 'pipe' });
  execFileSync('git', ['clone', '--branch', 'main', currentSyncRemoteDir, currentSyncMirrorDir], { stdio: 'pipe' });
  execFileSync('git', ['config', 'user.email', 'regression@kianos.local'], { cwd: currentSyncMirrorDir });
  execFileSync('git', ['config', 'user.name', 'KianOS Regression'], { cwd: currentSyncMirrorDir });
  execFileSync('git', ['commit', '--allow-empty', '-m', 'synthetic pre-sync Current state'], {
    cwd: currentSyncMirrorDir,
    stdio: 'pipe'
  });
  fs.writeFileSync(path.join(currentSyncMirrorDir, '.git', 'kianos-current-mirror'), 'regression\n');

  const mirrorWebRoot = path.join(currentSyncMirrorDir, 'static-web');
  execFileSync(process.execPath, ['scripts/kianos-current-sync.mjs'], {
    cwd: mirrorWebRoot,
    env: {
      ...process.env,
      KIANOS_SYNC_ONCE: '1',
      KIANOS_SKIP_ASTRO: '1',
      KIANOS_PRIVATE_DIR: privateDir
    },
    stdio: 'pipe'
  });

  const syncedSha = execFileSync('git', ['rev-parse', 'HEAD'], {
    cwd: currentSyncMirrorDir,
    encoding: 'utf8'
  }).trim();

  const sourceModules = path.join(sourceWebRoot, 'node_modules');
  const mirrorModules = path.join(mirrorWebRoot, 'node_modules');
  if (!fs.existsSync(sourceModules)) throw new Error('FINAL_CROSS_SUBJECT_NODE_MODULES_MISSING');
  if (!fs.existsSync(mirrorModules)) {
    fs.symlinkSync(sourceModules, mirrorModules, process.platform === 'win32' ? 'junction' : 'dir');
  }
  return { mirrorWebRoot, syncedSha };
}

function freezeAndCaptureClipboard(context) {
  return context.addInitScript(({ fixtureNow }) => {
    const NativeDate = Date;
    const offset = fixtureNow - NativeDate.now();
    class FixtureDate extends NativeDate {
      constructor(...args) { super(...(args.length ? args : [NativeDate.now() + offset])); }
      static now() { return NativeDate.now() + offset; }
    }
    window.Date = FixtureDate;
    window.__kianosCopies = [];
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: async (text) => { window.__kianosCopies.push(text); } },
      configurable: true
    });
  }, { fixtureNow: FIXTURE_NOW });
}

const politicsCatalog = buildPoliticsPracticeCatalogCurrent('/');
const politicsQuestion = politicsCatalog.questions.find((row) => row.subject === 'history')
  || politicsCatalog.questions.find((row) => row.subject === 'marxism')
  || politicsCatalog.questions[0];
if (!politicsQuestion) throw new Error('FINAL_CROSS_SUBJECT_POLITICS_QUESTION_MISSING');

const canonicalBlock = loadXizongBlock('circulation', 'b02');
const productionBlock = buildXizongProductionBlock(canonicalBlock);
const firstKp = productionBlock.kpRecords[0];
const secondKp = productionBlock.kpRecords[1] || firstKp;
if (!firstKp) throw new Error('FINAL_CROSS_SUBJECT_XIZONG_KP_MISSING');

const xizongStateKey = `kianos-xizong-astro-v2:${canonicalBlock.objectId}`;
const xizongLastLocation = {
  systemId: canonicalBlock.systemId,
  systemTitle: canonicalBlock.systemTitle,
  systemCanonical: canonicalBlock.systemCanonicalId,
  blockSlug: canonicalBlock.slug,
  blockLabel: canonicalBlock.label,
  blockTitle: canonicalBlock.title,
  href: `/xizong/${canonicalBlock.systemId}/${canonicalBlock.slug}/`,
  observed_at: new Date(FIXTURE_NOW - 5 * 60 * 1000).toISOString()
};
const xizongState = {
  schema: 'kianos.xizong.block-state.v2',
  stage: 'kp_recall',
  groupIndex: Math.max(0, productionBlock.logicGroups.findIndex((g) => g.groupId === secondKp.groupId)),
  kpIndex: Math.max(0, productionBlock.kpRecords.findIndex((kp) => kp.kpId === secondKp.kpId)),
  learned: { [firstKp.kpId]: true, [secondKp.kpId]: true },
  ratings: { [firstKp.kpId]: 'known', [secondKp.kpId]: 'fuzzy' },
  ttsxEvidence: {},
  ttsxAnnotations: {},
  pendingTtsx: null,
  sourceContactDone: true,
  sourceContactEvidence: [],
  blockRecallDone: false,
  completed: false
};

const chatPlan = {
  schema: EXAM_CHAT_PLAN_SCHEMA,
  study_day: DAY,
  generated_at: new Date(FIXTURE_NOW - 10 * 60 * 1000).toISOString(),
  subjects: {
    xizong: { target_minutes: 360, role: '主推进', note: '继续当前西综断点。', session_ref: null },
    english: { target_minutes: 120, role: '保连续', note: '完成一个完整英语任务。', session_ref: null },
    politics: { target_minutes: 90, role: '保连续', note: '保持一轮推进。', session_ref: null }
  },
  next_subject: 'xizong',
  attention: null
};

const profile = {
  ...emptyExamProfile(),
  capacityByDay: { [DAY]: 570 },
  defaultDailyMinutes: 570
};

const timerLedger = {
  schema: STUDY_TIMER_SCHEMA,
  sessions: [
    {
      id: 'synthetic-xz',
      subject: 'xizong',
      context: { subject: 'xizong', route: `xizong/${canonicalBlock.systemId}/${canonicalBlock.slug}/`, detailKey: 'circulation/b02', detailLabel: '循环 B02' },
      startedAt: FIXTURE_NOW - 120 * 60 * 1000,
      endedAt: FIXTURE_NOW - 80 * 60 * 1000,
      source: 'timer'
    },
    {
      id: 'synthetic-en',
      subject: 'english',
      context: { subject: 'english', route: 'reading/', detailKey: 'reading-a', detailLabel: 'Reading A' },
      startedAt: FIXTURE_NOW - 80 * 60 * 1000,
      endedAt: FIXTURE_NOW - 50 * 60 * 1000,
      source: 'timer'
    },
    {
      id: 'synthetic-pol',
      subject: 'politics',
      context: { subject: 'politics', route: 'politics/practice/', detailKey: 'xiao1000', detailLabel: '肖1000' },
      startedAt: FIXTURE_NOW - 50 * 60 * 1000,
      endedAt: FIXTURE_NOW - 20 * 60 * 1000,
      source: 'timer'
    }
  ]
};

const timerState = {
  schema: STUDY_TIMER_SCHEMA,
  running: true,
  manualPaused: false,
  subject: 'xizong',
  context: {
    subject: 'xizong',
    route: `xizong/${canonicalBlock.systemId}/${canonicalBlock.slug}/`,
    detailKey: 'circulation/b02',
    detailLabel: '循环 B02'
  },
  segmentStartedAt: FIXTURE_NOW - 2000,
  lastSeenAt: FIXTURE_NOW - 1000,
  revision: 5,
  updatedAt: FIXTURE_NOW - 1000
};

const englishAttemptKey = 'kianos-reading-attempt-v1:final-regression-reading';
const englishAttempt = {
  binding: {
    task: 'reading_a',
    object_id: 'final-regression-reading',
    source_hash: 'synthetic-final-regression-hash',
    attempt_id: 'final-regression-attempt',
    prior_exposure: 'unknown',
    assistance: 'unassisted'
  },
  submitted: true,
  answers: { q1: 'A' },
  results: {},
  saved_at: new Date(FIXTURE_NOW - 15 * 60 * 1000).toISOString()
};

const politicsAttempts = {
  schema: 'kianos.politics.attempt_snapshot.v1',
  units: {
    [politicsQuestion.unitKey]: {
      unit_key: politicsQuestion.unitKey,
      attempts: {
        [politicsQuestion.id]: {
          question_id: politicsQuestion.id,
          outcome: 'UNCERTAIN',
          selected: politicsQuestion.answer?.[0] || 'A',
          correct_answer: politicsQuestion.answer,
          uncertain: true,
          study_day: DAY,
          observed_at: new Date(FIXTURE_NOW - 12 * 60 * 1000).toISOString(),
          source_context: {
            unit_key: politicsQuestion.unitKey,
            source: 'xiao1000',
            source_href: politicsQuestion.unitHref,
            content_revision: politicsCatalog.revision,
            task_revision: politicsQuestion.taskRevision || politicsCatalog.revision
          }
        }
      }
    }
  }
};
const politicsMeta = {
  latestOutcome: { [politicsQuestion.id]: 'UNCERTAIN' },
  notes: { [politicsQuestion.id]: 'final regression synthetic note' },
  causes: { [politicsQuestion.id]: 'understanding' },
  discussion: { [politicsQuestion.id]: true }
};
const politicsEvidence = [{
  question_id: politicsQuestion.id,
  outcome: 'UNCERTAIN',
  study_day: DAY,
  observed_at: new Date(FIXTURE_NOW - 12 * 60 * 1000).toISOString()
}];
const politicsLast = {
  href: politicsQuestion.unitHref,
  subject: politicsQuestion.subject,
  chapter: politicsQuestion.chapter,
  title: politicsQuestion.unitTitle
};

const parseDailyCopy = (text) => {
  const marker = 'DAILY_PACKET_JSON\n';
  const index = text.indexOf(marker);
  if (index < 0) throw new Error('DAILY_PACKET_JSON_MARKER_MISSING');
  return JSON.parse(text.slice(index + marker.length));
};

let browser;
try {
  await startServer();
  browser = await chromium.launch({ headless: true });

  // 1. Cold Home must not invent strategy without a Chat Plan.
  const context = await browser.newContext({ viewport: { width: 1512, height: 982 }, timezoneId: 'Asia/Shanghai' });
  await freezeAndCaptureClipboard(context);
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.locator('[data-exam-home][data-ready="true"]').waitFor();
  check(await page.locator('[data-exam-home]').getAttribute('data-chat-plan-status') === 'missing',
    'cold Home has no Chat Plan');
  check((await page.locator('[data-exam-next]').innerText()).includes('等待今日安排')
      && (await page.locator('[data-exam-next]').getAttribute('href')) === null,
    'cold Home does not infer a next subject');

  // 2. Seed exact, subject-owned synthetic state.
  await page.evaluate((seed) => {
    for (const [key, value] of Object.entries(seed)) {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }, {
    [EXAM_PROFILE_KEY]: profile,
    [STUDY_TIMER_STATE_KEY]: timerState,
    [STUDY_TIMER_LEDGER_KEY]: timerLedger,
    'kianos-xizong-last-location-v1': xizongLastLocation,
    [xizongStateKey]: xizongState,
    [englishAttemptKey]: englishAttempt,
    [PRACTICE_KEYS.attempts]: politicsAttempts,
    [PRACTICE_KEYS.meta]: politicsMeta,
    [PRACTICE_KEYS.evidence]: politicsEvidence,
    [PRACTICE_KEYS.last]: politicsLast
  });

  await page.evaluate(async ({ key, plan, day }) => {
    const mod = await import('/src/lib/examChatPlan.mjs');
    plan.learner_evidence_basis = mod.buildExamChatPlanBasis(localStorage, day);
    localStorage.setItem(key, JSON.stringify(plan));
  }, { key: EXAM_CHAT_PLAN_KEY, plan: chatPlan, day: DAY });

  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.locator('[data-exam-home][data-ready="true"]').waitFor();
  check(await page.locator('[data-exam-home]').getAttribute('data-chat-plan-status') === 'ready',
    'Home consumes exact Chat Plan');
  check((await page.locator('[data-exam-next]').innerText()).includes('西综'),
    'Home next action follows Chat Plan');

  // 3. One-click Daily Learning Packet must carry all three subject-owned evidence payloads.
  await page.locator('[data-exam-copy-daily]').click();
  await page.waitForTimeout(100);
  const copies = await page.evaluate(() => window.__kianosCopies.slice());
  check(copies.length === 1, 'Home copies exactly one Daily Learning Packet');
  const daily = parseDailyCopy(copies[0]);
  check(daily.schema === 'kianos.daily-learning-packet.v1', 'Home uses the one shared Daily Learning Packet schema');
  check(daily.subjects.xizong.evidence?.schema === 'kianos.xizong.study_packet.v3',
    'Daily Packet carries exact Xizong study packet');
  check(daily.subjects.xizong.evidence?.learning_state?.resume?.kp_id === secondKp.kpId,
    'Daily Packet preserves exact Xizong KP resume');
  check(daily.subjects.english.evidence?.schema === 'kianos.english.evidence.v1',
    'Daily Packet carries English evidence');
  check(daily.subjects.politics.evidence?.schema === 'kianos.politics.study_packet.v1',
    'Daily Packet carries Politics evidence');
  check(daily.subjects.xizong.time.minutes >= 40
    && daily.subjects.english.time.minutes >= 30
    && daily.subjects.politics.time.minutes >= 30,
    'Daily Packet preserves three-subject timer evidence');
  await page.screenshot({ path: path.join(evidenceDir, 'home-daily-packet.png'), fullPage: false });
  report.screenshots.push('home-daily-packet.png');

  // 4. Real route switching must preserve one global Timer and hand control to the active subject.
  await page.goto(`${BASE}/xizong/${canonicalBlock.systemId}/${canonicalBlock.slug}/`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1200);
  let timer = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || 'null'), STUDY_TIMER_STATE_KEY);
  check(timer?.subject === 'xizong', 'Timer follows Xizong route');

  await page.goto(`${BASE}/reading/`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1200);
  timer = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || 'null'), STUDY_TIMER_STATE_KEY);
  check(timer?.subject === 'english', 'Timer follows English route');

  await page.goto(`${BASE}${politicsQuestion.unitHref}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1200);
  timer = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || 'null'), STUDY_TIMER_STATE_KEY);
  check(timer?.subject === 'politics', 'Timer follows Politics route');
  const ledgerAfterSwitch = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || 'null'), STUDY_TIMER_LEDGER_KEY);
  check(ledgerAfterSwitch.sessions.some((row) => row.subject === 'xizong')
    && ledgerAfterSwitch.sessions.some((row) => row.subject === 'english'),
    'Timer closes prior subject segments during cross-subject switching');

  // 5. Politics Review typed Chat Return must be batch-bound, replay-safe and conflict-safe in the real UI.
  await page.goto(`${BASE}/politics/review/`, { waitUntil: 'domcontentloaded' });
  await page.locator('[data-politics-review][data-ready="true"]').waitFor();
  await page.locator('[data-review-question]').first().waitFor();
  await page.locator('[data-review-copy]').click();
  await page.waitForTimeout(80);
  const reviewCopies = await page.evaluate(() => window.__kianosCopies.slice());
  const outbound = JSON.parse(reviewCopies.at(-1));
  check(Boolean(outbound.batch_id), 'Politics Review export carries exact batch identity');

  const chatReturn = {
    schema: 'kianos.politics.chat-return.v1',
    direction: 'CHAT_TO_LEARNER',
    batch_id: outbound.batch_id,
    catalog_revision: outbound.catalog_revision,
    study_day: outbound.study_day,
    scope: outbound.scope,
    generated_at: new Date(FIXTURE_NOW + 1000).toISOString(),
    verdict: 'FOLLOW_UP',
    diagnosis_summary: 'Synthetic final-regression diagnosis.',
    follow_ups: [{
      id: 'final-regression-follow-up',
      question_ids: [politicsQuestion.id],
      action: 'SOURCE_RETURN',
      reason: '条件边界仍不稳。',
      instruction: '只回当前 Unit 复核这一条边界，然后继续主线。'
    }]
  };

  await page.locator('[data-review-return] summary').click();
  await page.locator('[data-review-return-text]').fill(JSON.stringify(chatReturn));
  await page.locator('[data-review-return-apply]').click();
  await page.waitForTimeout(80);
  check((await page.locator('[data-review-return-status]').innerText()).includes('已核对并导入'),
    'Politics typed Return applies through learner UI');
  check(await page.locator('[data-review-return-result] .reviewReturnItem').count() === 1,
    'Politics typed Return renders one bounded follow-up');
  const storedPoliticsReturn = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key) || 'null'),
    POLITICS_CHAT_RETURN_LATEST_KEY
  );
  check(storedPoliticsReturn?.follow_ups?.[0]?.contexts?.[0]?.provenance?.recorded_unit_key === politicsQuestion.unitKey
    && storedPoliticsReturn?.follow_ups?.[0]?.contexts?.[0]?.provenance?.original_source_context?.task_revision
      === (politicsQuestion.taskRevision || politicsCatalog.revision),
    'Politics typed Return preserves exact attempt provenance');

  await page.locator('[data-review-return-apply]').click();
  await page.waitForTimeout(50);
  check((await page.locator('[data-review-return-status]').innerText()).includes('已经导入过'),
    'Identical Politics Return replay is idempotent');

  const conflict = structuredClone(chatReturn);
  conflict.follow_ups[0].reason = 'conflicting replay';
  await page.locator('[data-review-return-text]').fill(JSON.stringify(conflict));
  await page.locator('[data-review-return-apply]').click();
  await page.waitForTimeout(50);
  check((await page.locator('[data-review-return-status]').innerText()).includes('CONFLICT_KEEP_FIRST'),
    'Conflicting Politics Return fails closed');
  await page.screenshot({ path: path.join(evidenceDir, 'politics-typed-return.png'), fullPage: false });
  report.screenshots.push('politics-typed-return.png');

  // 6. Let the private checkpoint autosave the integrated shared + subject state.
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  await page.waitForTimeout(3600);
  const remote = await page.evaluate(async () => {
    const response = await fetch('/__kianos-private/checkpoint', { cache: 'no-store' });
    return { status: response.status, body: await response.json() };
  });
  check(remote.status === 200 && remote.body?.status === 'ready',
    'Private checkpoint is available after integrated work');
  check(Boolean(remote.body.checkpoint?.payload?.subjects?.xizong)
    && Boolean(remote.body.checkpoint?.payload?.subjects?.english)
    && Boolean(remote.body.checkpoint?.payload?.subjects?.politics),
    'Private checkpoint captures Xizong + English + Politics subject payloads');

  // 7. Simulate the real Current mirror lifecycle: Git replaces the disposable mirror,
  // Astro restarts from the synced checkout, and private learner truth stays outside Git.
  const checkpointBeforeSync = readCheckpointFile(privateDir);
  check(!path.resolve(privateDir).startsWith(path.resolve(currentSyncMirrorDir) + path.sep),
    'Private checkpoint lives outside the disposable Current mirror');

  await context.close();
  await stopServer();

  const syncedCurrent = prepareSyncedCurrentMirror();
  check(syncedCurrent.syncedSha === report.tested_commit,
    'Current sync advances the disposable mirror to the tested commit');

  const checkpointAfterSync = readCheckpointFile(privateDir);
  check(checkpointAfterSync.checkpoint_id === checkpointBeforeSync.checkpoint_id,
    'Current sync leaves the private checkpoint intact');

  await startServer(syncedCurrent.mirrorWebRoot);
  check(fs.existsSync(path.join(privateDir, 'latest.json')),
    'private checkpoint survives Current sync and Astro process restart');

  const restoredContext = await browser.newContext({ viewport: { width: 1512, height: 982 }, timezoneId: 'Asia/Shanghai' });
  await freezeAndCaptureClipboard(restoredContext);
  const restoredPage = await restoredContext.newPage();
  const restoredErrors = [];
  restoredPage.on('pageerror', (error) => restoredErrors.push(error.message));
  await restoredPage.goto(BASE, { waitUntil: 'domcontentloaded' });
  await restoredPage.waitForFunction((key) => localStorage.getItem(key) !== null, EXAM_CHAT_PLAN_KEY, { timeout: 10000 });
  await restoredPage.locator('[data-exam-home][data-ready="true"]').waitFor();
  await restoredPage.waitForTimeout(300);

  const restored = await restoredPage.evaluate((keys) => Object.fromEntries(
    keys.map((key) => [key, localStorage.getItem(key)])
  ), [
    EXAM_CHAT_PLAN_KEY,
    STUDY_TIMER_LEDGER_KEY,
    xizongStateKey,
    englishAttemptKey,
    PRACTICE_KEYS.attempts
  ]);
  check(Object.values(restored).every((value) => typeof value === 'string' && value.length > 0),
    'Current sync + Astro restart + fresh browser restore shared + three-subject durable state');
  check(JSON.parse(restored[EXAM_CHAT_PLAN_KEY]).next_subject === 'xizong',
    'Restored Home keeps exact Chat Plan');

  await restoredPage.locator('[data-exam-copy-daily]').click();
  await restoredPage.waitForTimeout(100);
  const restoredCopy = await restoredPage.evaluate(() => window.__kianosCopies.at(-1));
  const restoredDaily = parseDailyCopy(restoredCopy);
  check(restoredDaily.subjects.xizong.evidence?.schema === 'kianos.xizong.study_packet.v3'
    && restoredDaily.subjects.english.evidence?.schema === 'kianos.english.evidence.v1'
    && restoredDaily.subjects.politics.evidence?.schema === 'kianos.politics.study_packet.v1',
    'Restored Home reproduces one three-subject Daily Learning Packet');

  check(pageErrors.length === 0 && restoredErrors.length === 0,
    'Integrated browser journey has no page exceptions',
    JSON.stringify({ pageErrors, restoredErrors }));

  await restoredPage.screenshot({ path: path.join(evidenceDir, 'home-restored.png'), fullPage: false });
  report.screenshots.push('home-restored.png');
  await restoredContext.close();

  report.status = 'PASS';
  report.completed_at = new Date().toISOString();
  fs.writeFileSync(path.join(evidenceDir, 'result.json'), JSON.stringify(report, null, 2));
  console.log(`FINAL_CROSS_SUBJECT_REGRESSION PASS | checks=${report.checks.length}`);
} catch (error) {
  report.status = 'FAIL';
  report.completed_at = new Date().toISOString();
  report.error = String(error?.stack || error);
  fs.writeFileSync(path.join(evidenceDir, 'result.json'), JSON.stringify(report, null, 2));
  throw error;
} finally {
  try { await browser?.close(); } catch {}
  await stopServer();
  fs.rmSync(privateDir, { recursive: true, force: true });
  fs.rmSync(currentSyncScratch, { recursive: true, force: true });
}
