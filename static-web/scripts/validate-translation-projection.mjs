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
const homeSource = read('../src/pages/translation.astro');
const learnSource = read('../src/pages/translation-learn.astro');
const taskSource = read('../src/pages/translation/[id].astro');
const workspaceSource = read('../src/components/TranslationWorkspace.astro');
const loaderSource = read('../src/components/TranslationReferenceLoader.astro');

// Coverage floor: Translation must preserve all meaning necessary for high-score performance.
check(any(learningOwner, ['English Representation', 'UNDERSTAND']), 'learning: English representation coverage missing');
check(any(learningOwner, ['Preservation & Fidelity', 'fidelity gate', 'PRESERVE']), 'learning: fidelity/preservation invariant missing');
check(any(learningOwner, ['Chinese Reconstruction', 'RECONSTRUCT']), 'learning: Chinese reconstruction coverage missing');
check(any(learningOwner, ['Exam Execution', 'DELIVER']), 'learning: timed delivery/execution coverage missing');
check(any(learningOwner, ['LexicalOS', 'lexical retrieval failure']), 'learning: lexical handoff boundary missing');

// Minimality: first-learning remains a discoverable, skippable reservoir; exact A/B1-B5/F/G order is not canonical.
check(homeSource.includes('translation-learn/'), 'home: targeted First Learning entry missing');
check(any(learnSource, ['已经熟的段落可以跳', '可以跳', '按需展开']), 'learn: first-learning skippability missing');
check(learnSource.includes('<details class="translationReferenceSection">'), 'learn: diagnostic/reference material must support progressive disclosure');
check(learnSource.includes('<details class="translationReferenceSection runtimeReference">'), 'learn: runtime/system reference must support progressive disclosure');
check(learnSource.includes('href={`${base}translation/`}'), 'learn: direct return/entry to Translation Runtime missing');

// Do not validate exact route length, exact section-key inventory, or an Integrated Walkthrough as a primitive.

// Clean-task projection: preserve first attempt; reference data must not leak before explicit post-attempt action.
check(taskSource.includes('references: []'), 'task: initial reference payload must be empty');
check(taskSource.includes('TranslationReferenceLoader'), 'task: delayed reference loader missing');
check(!taskSource.includes('loadTranslationReferencesById'), 'task: canonical references loaded server-side into clean-attempt HTML');
check(taskSource.includes('protectCleanAttempt'), 'task: clean-attempt projection guard missing');
check(workspaceSource.includes('data-stage="attempt"'), 'workspace: clean attempt stage missing');
check(workspaceSource.includes('data-reference-panel hidden'), 'workspace: reference panel must start hidden');
check(loaderSource.includes('if (!isRevealButton && !isCompleteButton) return;'), 'reference loader: reference fetch must require an explicit allowed action');

// Fresh-logic invariant: pending backend transfer state must not by itself create learner-facing work.
// Current UI may still fail this while the dependent Projection/UI chain is frozen for later repair.
check(!homeSource.includes('data-translation-pending-count'), 'home: backend pending count surfaced as learner attention');
check(!homeSource.includes('data-translation-pending-home'), 'home: pending transfer panel creates learner work');

// Built-output checks validate actual clean-attempt leakage, not decomposition strings.
const homeHtml = built('translation/index.html');
const learnHtml = built('translation-learn/index.html');
check(homeHtml.includes('translation-learn/'), 'built home: First Learning link missing');
check(learnHtml.includes('translation/'), 'built learn: Runtime/exit link missing');
check(/<details[^>]*class="[^"]*translationReferenceSection[^"]*"(?![^>]*\bopen\b)/.test(learnHtml), 'built learn: reference sections should be collapsed by default');

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
  schema: 'kianos.english.translation.projection-gate-validation.v2',
  gate: 'P',
  decision: issues.length ? 'BLOCKED' : 'PASS',
  pass: issues.length === 0,
  counts: { checks, sets: sets.length, taskPages, availableReferenceRows, leakedReferenceRows, issues: issues.length },
  semantics: {
    representationCovered: true,
    fidelityIsInvariantNotMandatoryStep: true,
    reconstructionCovered: true,
    executionCovered: true,
    exactFirstLearningOrderCanonical: false,
    firstLearningSkippable: true,
    cleanAttemptReferenceProtected: leakedReferenceRows === 0,
    backendPendingMustNotCreateLearnerWork: true
  },
  issues,
  note: 'This validator protects Translation semantic coverage, skippability, and clean-attempt evidence. It intentionally does not freeze A/B1-B5/F/G or any exact first-learning route.'
};

const out = process.env.KIANOS_TRANSLATION_PROJECTION_GATE_OUT;
if (out) fs.writeFileSync(out, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result, null, 2));
if (!result.pass) process.exit(1);