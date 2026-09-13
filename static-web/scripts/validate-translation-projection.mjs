import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { listTranslationSets, loadTranslationReferencesById } from '../src/lib/englishTranslation.mjs';

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
function any(text, needles) {
  return needles.some((needle) => text.includes(needle));
}
function read(relativePath) {
  return fs.readFileSync(path.resolve(here, relativePath), 'utf8');
}
function built(relativePath) {
  const full = path.resolve(here, '../dist', relativePath);
  check(fs.existsSync(full), `built page missing: ${relativePath}`);
  return fs.existsSync(full) ? fs.readFileSync(full, 'utf8') : '';
}

const learningOwner = read('../../content/english/modules/translation/learning.md');
const referenceOwner = read('../../content/english/modules/translation/learning.reference.md');
const homeSource = read('../src/pages/translation.astro');
const learnSource = read('../src/pages/translation-learn.astro');
const taskSource = read('../src/pages/translation/[id].astro');
const workspaceSource = read('../src/components/TranslationWorkspace.astro');
const loaderSource = read('../src/components/TranslationReferenceLoader.astro');

// Coverage floor: the lean learner asset must still preserve all meaning needed for high-score performance.
check(any(learningOwner, ['English Representation', 'REPRESENT']), 'learning: English representation coverage missing');
check(any(learningOwner, ['Fidelity Guard', 'fidelity']), 'learning: fidelity invariant missing');
check(any(learningOwner, ['Chinese Reconstruction', 'RECONSTRUCT']), 'learning: Chinese reconstruction coverage missing');
check(any(learningOwner, ['Exam Execution', 'DELIVER']), 'learning: timed delivery/execution coverage missing');
check(any(learningOwner, ['LexicalOS', 'lexical retrieval failure']), 'learning: lexical handoff boundary missing');
check(learningOwner.includes('learning.reference.md'), 'learning: semantic reconciliation target for demoted detail missing');

// Truth conservation: previous rich detail remains owned as a repair/reference reservoir.
check(referenceOwner.includes('# B2｜Preservation & Fidelity'), 'reference: prior Fidelity detail missing');
check(referenceOwner.includes('# C｜Skill Map'), 'reference: prior Skill Map missing');
check(referenceOwner.includes('# D｜Skill Content'), 'reference: prior Deep Skill detail missing');
check(referenceOwner.includes('# H｜Translation Runtime v1'), 'reference: prior Runtime semantics missing');

// Minimality: current canonical must not recreate the old four-course decomposition.
check(learningOwner.includes('3 个 Core Blocks'), 'learning: three-block first-learning boundary missing');
check(!learningOwner.includes('连续学习 4 个 Core Learning Blocks'), 'learning: stale four-block first-learning requirement remains');
check(learningOwner.includes('不是第 4 门课'), 'learning: Fidelity demotion not explicit');
check(any(learningOwner, ['pending claim\n≠\nlearner owes an action', 'pending claim 可以静默存在']), 'learning: pending claim still behaves like learner debt');

// First-learning projection: three productive blocks foregrounded; Fidelity remains available but not a mandatory nav step.
check(homeSource.includes('translation-learn/'), 'home: targeted First Learning entry missing');
check(learnSource.includes("const coreKeys = ['A', 'B', 'B1', 'B3', 'B4', 'B5', 'F', 'G']"), 'learn: core projection does not match three-block model');
check(learnSource.includes("const diagnosticKeys = ['B2', 'C', 'D']"), 'learn: Fidelity/diagnostic reservoir is not demoted behind disclosure');
check(!learnSource.includes("['B2', 'B2 · Fidelity']"), 'learn: Fidelity still appears as mandatory first-learning nav step');
check(!learnSource.includes('<span>PRESERVE</span>'), 'learn: stale sequential PRESERVE step remains in learner path');
check(learnSource.includes('RECONSTRUCT <em>faithfully</em>'), 'learn: fidelity constraint missing from reconstruction path');
check(any(learnSource, ['已经会的直接跳', '可以跳', '按需展开']), 'learn: first-learning skippability missing');
check(learnSource.includes('<details class="translationReferenceSection">'), 'learn: diagnostic/reference material must support progressive disclosure');
check(learnSource.includes('<details class="translationReferenceSection runtimeReference">'), 'learn: runtime/system reference must support progressive disclosure');
check(learnSource.includes('href={`${base}translation/`}'), 'learn: direct return/entry to Translation Runtime missing');

// Clean-task projection: preserve first attempt; reference data must not leak before explicit post-attempt action.
check(taskSource.includes('references: []'), 'task: initial reference payload must be empty');
check(taskSource.includes('TranslationReferenceLoader'), 'task: delayed reference loader missing');
check(!taskSource.includes('loadTranslationReferencesById'), 'task: canonical references loaded server-side into clean-attempt HTML');
check(taskSource.includes('protectCleanAttempt'), 'task: clean-attempt projection guard missing');
check(workspaceSource.includes('data-stage="attempt"'), 'workspace: clean attempt stage missing');
check(workspaceSource.includes('data-reference-panel hidden'), 'workspace: reference panel must start hidden');
check(loaderSource.includes('if (!isRevealButton && !isCompleteButton) return;'), 'reference loader: reference fetch must require an explicit allowed action');

// Fresh-logic invariant: pending backend transfer state must not itself create learner-facing work.
check(!homeSource.includes('data-translation-pending-count'), 'home: backend pending count surfaced as learner attention');
check(!homeSource.includes('data-translation-pending-home'), 'home: pending transfer panel creates learner work');

// Built-output checks validate actual projection rather than only source strings.
const homeHtml = built('translation/index.html');
const learnHtml = built('translation-learn/index.html');
check(homeHtml.includes('translation-learn/'), 'built home: First Learning link missing');
check(learnHtml.includes('translation/'), 'built learn: Runtime/exit link missing');
check(/<details[^>]*class="[^"]*translationReferenceSection[^"]*"(?![^>]*\bopen\b)/.test(learnHtml), 'built learn: reference sections should be collapsed by default');
check(learnHtml.includes('REPRESENT') && learnHtml.includes('RECONSTRUCT') && learnHtml.includes('DELIVER'), 'built learn: three productive stages not visible');
check(!learnHtml.includes('<span>PRESERVE</span>'), 'built learn: stale mandatory PRESERVE stage visible');

const sets = listTranslationSets();
check(sets.length > 0, 'built tasks: no Translation sets resolved');
for (const set of sets) {
  const html = built(path.join('translation', set.id, 'index.html'));
  if (!html) continue;
  taskPages += 1;

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
  schema: 'kianos.english.translation.projection-gate-validation.v3',
  gate: 'P',
  decision: issues.length ? 'BLOCKED' : 'PASS',
  pass: issues.length === 0,
  counts: { checks, sets: sets.length, taskPages, availableReferenceRows, leakedReferenceRows, issues: issues.length },
  semantics: {
    representationCovered: true,
    fidelityIsInvariantNotMandatoryStep: true,
    richReferenceSemanticsConserved: true,
    reconstructionCovered: true,
    executionCovered: true,
    exactFirstLearningOrderCanonical: false,
    threeProductiveBlocksForegrounded: true,
    firstLearningSkippable: true,
    cleanAttemptReferenceProtected: leakedReferenceRows === 0,
    backendPendingMustNotCreateLearnerWork: true
  },
  issues,
  note: 'This validator protects Translation semantic coverage and semantic conservation while rejecting the old mandatory four-block learner decomposition. Rich prior detail remains in learning.reference.md; first-learning foregrounds Representation / Reconstruction / Execution with Fidelity as a cross-cutting guard.'
};

const out = process.env.KIANOS_TRANSLATION_PROJECTION_GATE_OUT;
if (out) fs.writeFileSync(out, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result, null, 2));
if (!result.pass) process.exit(1);