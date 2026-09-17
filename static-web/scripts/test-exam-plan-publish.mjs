import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = fs.readFileSync(path.join(webRoot, 'src/lib/examOrchestratorClient.mjs'), 'utf8');

assert.match(source, /buildExamPlanReadModel/,
  'Exam Orchestrator client must build the stable read model after scheduling.');
assert.match(source, /__kianosExamPlanReadModel/,
  'Latest read model must remain directly readable by downstream Home clients.');
assert.match(source, /kianos:exam-plan-read-model/,
  'Exam Orchestrator client must publish read-model updates without DOM scraping.');
assert.match(source, /new CustomEvent\('kianos:exam-plan-read-model',[\s\S]*bubbles:\s*true/,
  'Read-model event must bubble from the orchestrator surface.');

console.log('PASS exam plan read model publish bridge');
