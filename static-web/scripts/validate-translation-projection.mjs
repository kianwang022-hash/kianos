import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  listTranslationSets,
  loadTranslationReferencesById
} from '../src/lib/englishTranslation.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const issues = [];
let checks = 0;
let taskPages = 0;
let availableReferenceRows = 0;
let leakedReferenceRows = 0;

function check(condition, message) {
  checks += 1;
  if (!condition) issues.push(message);
}

function read(relativePath) {
  return fs.readFileSync(path.resolve(here, relativePath), 'utf8');
}

function built(relativePath) {
  const full = path.resolve(here, '../dist', relativePath);
  check(fs.existsSync(full), `built page missing: ${relativePath}`);
  return fs.existsSync(full) ? fs.readFileSync(full, 'utf8') : '';
}

const homeSource = read('../src/pages/translation.astro');
const learnSource = read('../src/pages/translation-learn.astro');
const taskSource = read('../src/pages/translation/[id].astro');
const workspaceSource = read('../src/components/TranslationWorkspace.astro');
const loaderSource = read('../src/components/TranslationReferenceLoader.astro');

// Home: first learning is a first-class entry, but browsing remains freely navigable.
check(homeSource.includes('translationLearn'), 'home: First Learning entry missing');
check(homeSource.indexOf('translationLearn') < homeSource.indexOf('translationHomeGrid'), 'home: First Learning should be foregrounded before set browsing');
check(homeSource.includes('具体 Pending 已隐藏'), 'home: pending weakness details should be hidden before a fresh attempt');
check(!homeSource.includes('target.underlyingDemand'), 'home: underlying pending demand must not be projected before a fresh attempt');

// First Learning: approved main trunk stays continuous; F teaches the execution/repair bridge before G tests the exit.
check(learnSource.includes("['F', 'How You Learn It']"), 'learn: HOW YOU LEARN IT must be visible on the first-learning main path');
check(learnSource.includes("const coreKeys = ['A', 'B', 'B1', 'B2', 'B3', 'B4', 'B5', 'F', 'G'];"), 'learn: expected A/B1-B5/F/G first-learning order missing');
check(learnSource.includes("const diagnosticKeys = ['C', 'D'];"), 'learn: Skill Map / Deep Skills must remain separately projectable');
check(learnSource.includes("const runtimeKeys = ['E', 'H'];"), 'learn: Material Routing + Runtime should remain folded reference, without hiding F');
check(learnSource.includes('<details class="translationReferenceSection">'), 'learn: Skill Map / Deep Skills must use progressive disclosure');
check(learnSource.includes('<details class="translationReferenceSection runtimeReference">'), 'learn: long system/runtime reference must use progressive disclosure');

// Task projection: clean production is visible first; answer/reference data is not embedded in the initial task payload.
check(taskSource.includes('references: []'), 'task: initial reference payload must be empty');
check(taskSource.includes('TranslationReferenceLoader'), 'task: delayed reference loader missing');
check(!taskSource.includes('loadTranslationReferencesById'), 'task: must not load canonical references server-side into clean-attempt HTML');
check(taskSource.includes('protectCleanAttempt'), 'task: pending-cue clean-attempt projection guard missing');
check(taskSource.includes("observer.observe(pending, { attributes: true, attributeFilter: ['hidden'] });"), 'task: pending panel mutations must be guarded during Clean Attempt');
check(workspaceSource.includes('data-pending-panel hidden'), 'workspace: pending panel must be hidden in initial markup');
check(workspaceSource.indexOf('data-stage="attempt"') < workspaceSource.indexOf('data-stage="decision"'), 'workspace: Clean Attempt must precede PASS/Review projection');
check(workspaceSource.includes('data-reference-panel hidden'), 'workspace: diagnosis reference panel must start hidden');
check(loaderSource.includes('if (!isRevealButton && !isCompleteButton) return;'), 'reference loader: reference fetch must be gated by explicit reveal/open action');
check(loaderSource.includes('if (restoredOpen)'), 'reference loader: restored previously-open reference state should be the only non-click reload path');

// Built-output checks: validate what the learner page actually contains after Astro projection.
const homeHtml = built('translation/index.html');
const learnHtml = built('translation-learn/index.html');
check(homeHtml.includes('translation-learn/'), 'built home: First Learning link missing');
const fPos = learnHtml.indexOf('id="translation-f"');
const gPos = learnHtml.indexOf('id="translation-g"');
check(fPos >= 0 && gPos > fPos, 'built learn: HOW YOU LEARN IT must render before first-learning exit');
check(/<details[^>]*class="[^"]*translationReferenceSection[^"]*"(?![^>]*\bopen\b)/.test(learnHtml), 'built learn: reference sections should be collapsed by default');

const sets = listTranslationSets();
check(sets.length > 0, 'built tasks: no Translation sets resolved');
for (const set of sets) {
  const html = built(path.join('translation', set.id, 'index.html'));
  if (!html) continue;
  taskPages += 1;

  check(/data-pending-panel(?:="")? hidden/.test(html) || /hidden(?:="")? data-pending-panel/.test(html), `${set.id}: pending panel not hidden in initial HTML`);
  check(html.includes('data-translation-reference-loader'), `${set.id}: delayed reference loader marker missing`);

  const payloadMatch = html.match(/<script[^>]*data-translation-reference[^>]*>([\s\S]*?)<\/script>/i);
  check(Boolean(payloadMatch), `${set.id}: initial reference metadata payload missing`);
  if (payloadMatch) {
    try {
      const payload = JSON.parse(payloadMatch[1]);
      check(Array.isArray(payload.references) && payload.references.length === 0, `${set.id}: clean-attempt HTML embeds reference rows`);
    } catch (error) {
      issues.push(`${set.id}: initial reference metadata is not valid JSON (${error instanceof Error ? error.message : String(error)})`);
    }
  }

  const references = loadTranslationReferencesById(set.id).references || [];
  for (const row of references) {
    if (!row?.available || !String(row?.text || '').trim()) continue;
    availableReferenceRows += 1;
    if (html.includes(String(row.text))) {
      leakedReferenceRows += 1;
      issues.push(`${set.id}:${row.id}: canonical reference text leaked into clean-attempt HTML`);
    }
  }
}

const result = {
  schema: 'kianos.english.translation.projection-gate-validation.v1',
  gate: 'P',
  decision: issues.length ? 'BLOCKED' : 'PASS',
  pass: issues.length === 0,
  counts: {
    checks,
    sets: sets.length,
    taskPages,
    availableReferenceRows,
    leakedReferenceRows,
    issues: issues.length
  },
  boundaries: {
    firstLearningBridgeBeforeExit: fPos >= 0 && gPos > fPos,
    skillAndRuntimeProgressiveDisclosure: true,
    cleanAttemptReferencePayloadEmpty: leakedReferenceRows === 0,
    pendingCueGuard: taskSource.includes('protectCleanAttempt')
  },
  issues
};

const out = process.env.KIANOS_TRANSLATION_PROJECTION_GATE_OUT;
if (out) fs.writeFileSync(out, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result, null, 2));
if (!result.pass) process.exit(1);
