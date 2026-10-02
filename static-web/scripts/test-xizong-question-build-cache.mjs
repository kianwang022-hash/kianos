import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const self = fileURLToPath(import.meta.url);
const repo = path.resolve(path.dirname(self), '../..');
const qid = 'xizong-official-2026-n001';
const relative = 'content/xizong/questions/shards/2026/q001-025.json';
const [mode, fixture] = process.argv.slice(2);

if (mode) {
  assert(['dev', 'build', 'fresh', 'malformed'].includes(mode));
  process.env.KIANOS_REPO_ROOT = fixture;
  if (mode === 'dev') delete process.env.KIANOS_XIZONG_BUILD_CACHE;
  else process.env.KIANOS_XIZONG_BUILD_CACHE = '1';
  const { loadXizongQuestionsByIds: load } = await import(pathToFileURL(path.join(fixture, 'xizongQuestions.mjs')));
  const shard = path.join(fixture, relative);
  if (mode === 'malformed') {
    fs.writeFileSync(shard, 'invalid JSON');
    assert.throws(() => load([qid]), SyntaxError);
  } else if (mode === 'fresh') {
    assert.equal(load([qid])[0].stem, 'source-v2');
  } else {
    const first = load([qid])[0];
    assert.equal(first.stem, 'source-v1');
    first.stem = 'consumer mutation';
    first.options[0].text = 'consumer mutation';
    first.explanation.reasoningChain.push('consumer mutation');
    const second = load([qid])[0];
    assert.equal(second.stem, 'source-v1');
    assert.equal(second.options[0].text, 'option A');
    assert.deepEqual(second.explanation.reasoningChain, ['reason']);
    const raw = JSON.parse(fs.readFileSync(shard, 'utf8'));
    raw[qid].content.stem = 'source-v2';
    fs.writeFileSync(shard, JSON.stringify(raw));
    assert.equal(load([qid])[0].stem, mode === 'dev' ? 'source-v2' : 'source-v1');
    if (mode === 'dev') {
      fs.writeFileSync(shard, 'invalid JSON');
      assert.throws(() => load([qid]), SyntaxError);
    }
  }
  console.log(mode + ': PASS');
} else {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'kianos-question-build-cache-'));
  try {
    const write = (name, value) => {
      const target = path.join(root, name);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, typeof value === 'string' ? value : JSON.stringify(value));
    };
    const modulePath = path.join(repo, 'static-web/src/lib/xizongQuestions.mjs');
    const original = fs.readFileSync(modulePath, 'utf8');
    const importLiteral = "'./xizongQuestionCrosswalk.mjs'";
    assert.equal(original.split(importLiteral).length, 2, 'one exact native Crosswalk dependency');
    write('xizongQuestions.mjs', original.replace(importLiteral, JSON.stringify(pathToFileURL(path.join(repo, 'static-web/src/lib/xizongQuestionCrosswalk.mjs')).href)));
    const seed = () => write(relative, { [qid]: {
      question_id: qid, question_type: 'single_choice',
      source_identity: { official_exam_year: 2026, official_exam_number: 1 },
      content: { stem: 'source-v1', option_set: { options: { A: 'option A', B: 'option B' } }, correct_answer: 'A' }
    } });
    write('content/xizong/explanations/shards/2026/q001-025.json', [{ question_id: qid, reasoning_chain: ['reason'] }]);
    write('content/xizong/question-relations/manifest.json', { canonical_storage: { record_shape: 'reviewed_question_to_knowledge_relation_array', shards: [], reviewed_relation_count: 0 } });
    write('content/xizong/questions/exam-format.json', fs.readFileSync(path.join(repo, 'content/xizong/questions/exam-format.json'), 'utf8'));
    for (const current of ['dev', 'build', 'fresh', 'malformed']) {
      if (current !== 'fresh') seed();
      process.stdout.write(execFileSync(process.execPath, [self, current, root], { encoding: 'utf8' }));
    }
    console.log('PASS: default-live reads, immutable build reuse, projection isolation, fresh-process revision, malformed-source rejection');
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}
