import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

// PR #210 sentinel for presentation-only extraction. These hashes are NOT content
// authority. A future intentional runtime change must update its own contract/test.
const checks = [];
const hash = text => createHash('sha256').update(text).digest('hex');
const source = fs.readFileSync('src/components/EnglishResume.astro', 'utf8');
const script = source.split('<script>')[1].split('</script>')[0];
assert.equal(hash(script), '9b96ae9923ed5d096b36c0866f5cdbdf35a704f1e222223b163030a9cc657dac');
checks.push('English resolver exact body: original priorities/eligibility/sorting/storage; only mount selector changed');
for (const [file, expected] of Object.entries({
  'XizongHomeTools.astro': 'bbb2283f60189ace413c1bf50ec450ad4fe21b6264ebebebd38bfe0d88ab3ab5'
})) {
  assert.equal(hash(fs.readFileSync(`src/components/${file}`)), expected);
  checks.push(`${file}: identical native component reused, no new reducer`);
}
function project(records) {
  class Element {}
  const elements = Object.fromEntries(['resume','resume-title','resume-meta','resume-link'].map(key => [key, { hidden: true, textContent: '', href: '' }]));
  const root = new Element();
  root.getAttribute = () => '/';
  root.querySelector = selector => elements[selector.replace('[data-english-', '').replace(']', '')];
  vm.runInNewContext(script, {
    HTMLElement: Element,
    document: { querySelector: () => root },
    localStorage: {
      getItem: key => key in records ? JSON.stringify(records[key]) : null,
      setItem: () => { throw new Error('Home/Resume must be read-only'); }
    }
  }, { timeout: 1000 });
  return { visible: !elements.resume.hidden, href: elements['resume-link'].href, title: elements['resume-title'].textContent, meta: elements['resume-meta'].textContent };
}
const keys = { reading: 'kianos-reading-last-location-v1', translation: 'kianos-translation-last-location-v1', writing: 'kianos-writing-last-location-v1' };
const id = 'english1-2000-reading-a-text1';
const last = { id, updatedAt: '2026-09-16T00:00:00Z' };
assert.equal(project({}).visible, false); checks.push('Cold start: no fabricated English Resume');
for (const [stage, visible] of Object.entries({ ATTEMPT: true, DECISION: true, DIAGNOSIS: true, RECONSTRUCT: true, PASS: false, TRANSFER_PENDING: false, COMPLETE: false })) {
  assert.equal(project({ [keys.translation]: { id: 'synthetic', stage } }).visible, visible);
  checks.push(`Translation ${stage}: original eligibility`);
}
for (const [state, visible] of Object.entries({ ATTEMPT: true, REVIEW_PENDING: true, REPAIR_NEEDED: true, REPAIR_CHECK_PENDING: true, PASS: false, ACCEPTABLE: false, TRANSFER_PENDING: false, REPAIR_COMPLETE: false })) {
  assert.equal(project({ [keys.writing]: { id: 'synthetic', state } }).visible, visible);
  checks.push(`Writing ${state}: original eligibility`);
}
for (const [attempt, visible, label] of [
  [{ submitted: false }, true, 'unfinished'],
  [{ submitted: true, results: { q1: 'correct' } }, false, 'stable clean'],
  [{ submitted: true, results: { q1: 'wrong' } }, true, 'problem triage'],
  [{ submitted: true, results: { q1: 'wrong' }, reviewUnlocked: false }, false, 'sealed continuous'],
  [{ submitted: true, results: { q1: 'correct' }, uncertain: ['q1'] }, true, 'uncertain triage']
]) {
  assert.equal(project({ [keys.reading]: last, [`kianos-reading-attempt-v1:${id}`]: attempt }).visible, visible);
  checks.push(`Reading ${label}: original eligibility`);
}
const readingWins = project({ [keys.reading]: last, [`kianos-reading-attempt-v1:${id}`]: { submitted: false }, [keys.writing]: { id: 'synthetic', state: 'REPAIR_NEEDED', updatedAt: '2026-09-16T01:00:00Z' } });
assert.equal(readingWins.href, `/reading/${id}/`); checks.push('Priority beats recency: native 100 before 96');
const tied = project({ [keys.translation]: { id: 'synthetic-translation', stage: 'RECONSTRUCT', updatedAt: '2026-09-16T00:00:00Z' }, [keys.writing]: { id: 'synthetic-writing', state: 'REPAIR_NEEDED', updatedAt: '2026-09-16T01:00:00Z' } });
assert.equal(tied.href, '/writing/synthetic-writing/'); checks.push('Equal priority: native recency tie-break retained');
// Politics Home is now intentionally owned by #116; its read-only exact-Resume
// and first-attempt boundaries are exercised by test-product-closure-model/browser.
const out = path.resolve('../visual-evidence'); fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, 'contract-checks.json'), JSON.stringify({ schema: 'kianos.visual-home.zero-semantic-diff.v1', status: 'PASS', checks, learnerValidation: 'UNTESTED', screenshotAcceptance: 'SEPARATE_HUMAN_GATE' }, null, 2));
console.log(`Home presentation contract: ${checks.length} checks passed; U remains UNTESTED.`);
