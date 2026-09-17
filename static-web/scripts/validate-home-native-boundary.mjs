import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relative) => fs.readFileSync(path.join(webRoot, relative), 'utf8');
const projection = read('src/components/HomeSubjectProjection.astro');
const css = read('src/styles/home-workbench.css');
const resumeClient = read('src/lib/homeResumeClient.mjs');
const xizongResumeClient = read('src/lib/xizongHomeResumeClient.mjs');
const politicsResumeClient = read('src/lib/politicsHomeResumeClient.mjs');
const schedulerClient = read('src/lib/homeSchedulerClient.mjs');

for (const nativeImport of ['XizongHomeTools', 'PoliticsHomeTools', 'EnglishResume']) {
  assert.equal(projection.includes(nativeImport), false,
    `Home must not import subject-native component ${nativeImport}.`);
}

for (const nativeSelector of [
  '.xzHome', '.xizongHomeTools', '.xizongContinue',
  '.politicsHomeTools', '.politicsContinue', '.politicsHandoff', '.politicsReviewEntry',
  '.englishResume', '.primaryLink'
]) {
  assert.equal(css.includes(nativeSelector), false,
    `Home CSS must not style subject-native selector ${nativeSelector}.`);
}

assert.ok(projection.includes('data-home-resume-subject'), 'Home must render a Home-owned resume surface.');
assert.ok(projection.includes('data-home-resume-link'), 'Home-owned resume surface must expose a link.');
assert.ok(projection.includes('data-home-actual') && projection.includes('data-home-target') && projection.includes('data-home-remaining'),
  'Home subject rows must expose Home-owned scheduler time slots.');
assert.ok(resumeClient.includes('resolveXizongHomeResume') && resumeClient.includes('resolvePoliticsHomeResume'),
  'Home resume composition must delegate subject-specific meaning to dedicated adapters.');
assert.ok(politicsResumeClient.includes('resolvePoliticsContinue'),
  'Politics Home resume must reuse the subject-owned resolver.');
assert.ok(xizongResumeClient.includes('kianos-xizong-last-location-v1'),
  'Xizong Home resume must consume the established read-only last-location record.');
assert.ok(resumeClient.includes('English owns highest-value task selection'),
  'English fallback must explicitly refuse to duplicate English priority semantics until its resolver exists.');
assert.ok(schedulerClient.includes('buildHomeSchedulerProjection'),
  'Home scheduler client must consume the stable Home scheduler projection.');
assert.ok(schedulerClient.includes('kianos:exam-plan-read-model'),
  'Home scheduler client must subscribe to the Exam Plan read-model event.');
for (const forbiddenDomInference of ['examSubjectAllocation', 'data-allocation', 'data-exam-capacity']) {
  assert.equal(schedulerClient.includes(forbiddenDomInference), false,
    `Home scheduler client must not infer scheduling from legacy DOM hook ${forbiddenDomInference}.`);
}

console.log('PASS home native boundary: Home owns presentation; subjects and Orchestrator own semantics');
