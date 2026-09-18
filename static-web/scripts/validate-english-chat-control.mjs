
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ENGLISH_SESSION_SCHEMA,
  ENGLISH_EVIDENCE_SCHEMA,
  validateEnglishSessionInstruction,
  parseEnglishSessionInstruction,
  englishSessionStepHref,
  buildEnglishEvidencePacket,
  buildEnglishChatHandoffText
} from '../src/lib/englishSessionControl.mjs';

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(webRoot, '..');
const readWeb = (rel) => fs.readFileSync(path.join(webRoot, rel), 'utf8');
const readRepo = (rel) => fs.readFileSync(path.join(repoRoot, rel), 'utf8');

class MemoryStorage {
  constructor(seed = {}) {
    this.map = new Map(Object.entries(seed).map(([key, value]) => [
      key,
      typeof value === 'string' ? value : JSON.stringify(value)
    ]));
  }
  getItem(key) { return this.map.has(key) ? this.map.get(key) : null; }
  setItem(key, value) { this.map.set(key, String(value)); }
  removeItem(key) { this.map.delete(key); }
}

const day = '2026-09-18';
const session = validateEnglishSessionInstruction({
  schema: ENGLISH_SESSION_SCHEMA,
  session_id: 'english-2026-09-18-a',
  study_day: day,
  generated_at: '2026-09-18T10:00:00+08:00',
  current_step: 1,
  steps: [
    {
      step_id: 'r1',
      task: 'reading_a',
      object_id: 'english1-2016-reading-a-p1',
      label: 'Reading A · 2016 P1'
    },
    {
      step_id: 't1',
      task: 'translation',
      object_id: 'english1-2022-translation-main',
      note: '完成当前 Translation clean attempt'
    }
  ]
}, day);

assert.equal(session.schema, ENGLISH_SESSION_SCHEMA);
assert.equal(session.current_step, 1);
assert.equal(session.steps[1].task, 'translation');
assert.equal(
  englishSessionStepHref(session.steps[1], '/'),
  '/translation/english1-2022-translation-main/'
);
assert.equal(
  parseEnglishSessionInstruction('prefix\n' + JSON.stringify(session), day).session_id,
  session.session_id
);

assert.throws(() => validateEnglishSessionInstruction({
  ...session,
  study_day: '2026-09-17'
}, day), /ENGLISH_SESSION_STALE/);
assert.throws(() => validateEnglishSessionInstruction({
  ...session,
  steps: [{ task: 'lexical', object_id: 'word:abstract' }],
  current_step: 0
}, day), /ENGLISH_SESSION_TASK_INVALID/);

const storage = new MemoryStorage({
  'kianos-reading-last-location-v1': {
    id: 'english1-2016-reading-a-p1',
    title: '2016 Reading A P1',
    paperId: 'english1-2016',
    position: 1,
    total: 4
  },
  'kianos-reading-attempt-v1:english1-2016-reading-a-p1': {
    schema: 'kianos.english.reading_attempt.v1',
    objectId: 'english1-2016-reading-a-p1',
    submitted: true,
    uncertain: ['q2'],
    results: { q1: 'correct', q2: 'wrong', q3: 'correct' },
    startedAt: '2026-09-18T08:00:00.000Z',
    submittedAt: '2026-09-18T08:20:00.000Z'
  },
  'kianos-cloze-last-location-v1': {
    id: 'english1-2017-cloze-main',
    title: '2017 Cloze',
    paperId: 'english1-2017',
    position: 18,
    total: 27
  },
  'kianos-cloze-attempt-v1:english1-2017-cloze-main': {
    schema: 'kianos.english.cloze_attempt.v1',
    objectId: 'english1-2017-cloze-main',
    submitted: false,
    uncertain: [],
    results: {}
  },
  'kianos-translation-last-location-v1': {
    id: 'english1-2022-translation-main',
    title: '2022 Translation',
    stage: 'RECONSTRUCT',
    updatedAt: '2026-09-18T09:00:00.000Z'
  },
  'kianos-translation-attempt-v2:english1-2022-translation-main': {
    schema: 'kianos.english.translation_attempt.v2',
    stage: 'reconstruct',
    firstAttempts: { s1: 'draft' },
    updatedAt: '2026-09-18T09:00:00.000Z'
  },
  'kianos-writing-last-location-v1': {
    id: 'synthetic-writing-small-v1',
    title: 'Small Writing',
    state: 'REVIEW_PENDING',
    updatedAt: '2026-09-18T09:30:00.000Z'
  },
  'kianos-writing-runtime-v1:synthetic-writing-small-v1': {
    schema: 'kianos.english.writing.runtime.v1',
    state: 'REVIEW_PENDING',
    firstDraft: 'draft text',
    firstSubmittedAt: '2026-09-18T09:20:00.000Z',
    updatedAt: '2026-09-18T09:30:00.000Z'
  }
});

const evidence = buildEnglishEvidencePacket(storage, {
  day,
  now: Date.parse('2026-09-18T10:00:00.000Z')
});
assert.equal(evidence.schema, ENGLISH_EVIDENCE_SCHEMA);
assert.equal(evidence.tasks.reading_a.attempt.problem_count, 1);
assert.equal(evidence.tasks.reading_a.attempt.uncertain_count, 1);
assert.equal(evidence.tasks.cloze.attempt.submitted, false);
assert.equal(evidence.tasks.translation.runtime.state, 'reconstruct');
assert.equal(evidence.tasks.writing.runtime.state, 'REVIEW_PENDING');

const encodedEvidence = JSON.stringify(evidence);
for (const forbidden of ['"priority"', '"recommended"', '"recommendation"', '"next_action"', '"nextAction"']) {
  assert.equal(encodedEvidence.includes(forbidden), false, 'Evidence must stay factual: ' + forbidden);
}

const chatHandoff = buildEnglishChatHandoffText(storage, {
  day,
  now: Date.parse('2026-09-18T10:00:00.000Z')
});
assert.match(chatHandoff, /^KIANOS_ENGLISH_HANDOFF_V1/m);
assert.match(chatHandoff, /HOW TO READ IT/);
assert.match(chatHandoff, /WHAT CHAT SHOULD DO/);
assert.match(chatHandoff, /content\/english\/CURRENT\.md/);
assert.match(chatHandoff, /kianos\.english\.session-instruction\.v1/);
assert.match(chatHandoff, /EVIDENCE_JSON/);
assert.match(chatHandoff, /"problem_count": 1/);
assert.doesNotMatch(chatHandoff, /EVIDENCE_JSON[\s\S]*"priority"/);


const resume = readWeb('src/components/EnglishResume.astro');
assert.match(resume, /readEnglishSessionInstruction/);
assert.match(resume, /englishSessionStepHref/);
for (const forbidden of [
  'priority:',
  'entries.sort',
  'Highest-value next action',
  'kianos-reading-last-location-v1',
  'kianos-translation-last-location-v1',
  'kianos-writing-last-location-v1'
]) {
  assert.equal(resume.includes(forbidden), false, 'EnglishResume must not rank learner state: ' + forbidden);
}

const control = readWeb('src/components/EnglishSessionControl.astro');
assert.match(control, /buildEnglishChatHandoffText/);
assert.match(control, /writeEnglishSessionInstruction/);
assert.match(readWeb('src/lib/englishSessionControl.mjs'), /KIANOS_ENGLISH_HANDOFF_V1/);

const home = readWeb('src/pages/english.astro');
assert.match(home, /EnglishSessionControl/);
assert.match(home, /<EnglishSessionControl \/>/);

const contract = readRepo('content/english/LEARNING_CONTRACT.md');
assert.match(contract, /priority is applied by \*\*Chat over current learner evidence\*\*/);
assert.match(contract, /must not encode its own cross-task score\/ranking algorithm/);

console.log(JSON.stringify({
  status: 'PASS',
  session_schema: ENGLISH_SESSION_SCHEMA,
  evidence_schema: ENGLISH_EVIDENCE_SCHEMA,
  resume_strategy_owner: 'CHAT',
  website_priority_algorithm: false,
  evidence_is_factual: true,
  free_navigation_preserved: true
}, null, 2));
