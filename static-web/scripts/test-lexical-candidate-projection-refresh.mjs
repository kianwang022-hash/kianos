#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'kianos-lexical-candidate-refresh-'));
const writeJson = (relative, value) => {
  const file = path.join(root, relative);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value) + '\n');
};

const shardPath = 'content/lexical/learner/final/shards/o0001-0001.json';
const object = (summary) => ({
  schema: 'kianos.lexical.final_learner_object.v1',
  ordinal: 1,
  word_id: 'word:w1',
  word: 'w1',
  word_feel: { summary_cn: summary },
  senses: [],
  secondary_senses: [],
  constructions: [],
  reference: {},
  sense_lineage: []
});

try {
  writeJson('content/lexical/manifest.json', {
    status: 'CURRENT_NATURAL_OWNER',
    semantic_authority: true,
    word_manifest: 'content/lexical/words/manifest.json',
    relation_manifest: 'content/lexical/relations/manifest.json',
    final_learner_object: {
      materialized_manifest: 'content/lexical/learner/final/manifest.json'
    }
  });
  writeJson('content/lexical/words/manifest.json', {
    status: 'CURRENT_NATURAL_OWNER',
    semantic_authority: true,
    word_count: 1
  });
  writeJson('content/lexical/relations/manifest.json', {
    status: 'CURRENT_NATURAL_OWNER',
    semantic_authority: true,
    relation_count: 0
  });
  writeJson('content/lexical/learner/final/manifest.json', {
    schema: 'kianos.lexical.final_learner_manifest.v1',
    status: 'CURRENT_DERIVED_LEARNER_OBJECT',
    semantic_authority: false,
    object_count: 1,
    shards: [{ start: 1, end: 1, path: shardPath, sha256: 'fixture' }]
  });
  writeJson(shardPath, [object('before')]);

  process.env.KIANOS_REPO_ROOT = root;
  process.env.KIANOS_CANDIDATE_RUNTIME = '1';
  const candidate = await import('../src/lib/lexical.mjs?candidate-projection-refresh=1');
  assert.equal(candidate.loadLexicalWordByOrdinal(1).record.word_feel.summary_cn, 'before');
  writeJson(shardPath, [object('after')]);
  assert.equal(
    candidate.loadLexicalWordByOrdinal(1).record.word_feel.summary_cn,
    'after',
    'Candidate must re-read a newly materialized lexical shard without Astro restart'
  );

  writeJson(shardPath, [object('cached-before')]);
  process.env.KIANOS_CANDIDATE_RUNTIME = '0';
  const cached = await import('../src/lib/lexical.mjs?stable-projection-cache=1');
  assert.equal(cached.loadLexicalWordByOrdinal(1).record.word_feel.summary_cn, 'cached-before');
  writeJson(shardPath, [object('cached-after')]);
  assert.equal(
    cached.loadLexicalWordByOrdinal(1).record.word_feel.summary_cn,
    'cached-before',
    'non-Candidate runtime keeps the established process-local projection cache'
  );

  console.log('LEXICAL_CANDIDATE_PROJECTION_REFRESH PASS: Candidate sees materialized shard changes without weakening Stable cache');
} finally {
  delete process.env.KIANOS_REPO_ROOT;
  delete process.env.KIANOS_CANDIDATE_RUNTIME;
  fs.rmSync(root, { recursive: true, force: true });
}
