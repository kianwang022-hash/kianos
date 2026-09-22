import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = fs.readFileSync(path.join(webRoot, 'src/lib/examOrchestratorClient.mjs'), 'utf8');

assert.match(source, /buildChatControlledExamReadModel/,
  'Exam Orchestrator client must build the stable read model from the typed Chat-controlled plan boundary.');
assert.doesNotMatch(source, /buildExamPlan\s*\(/,
  'Production Exam Orchestrator client must not restore autonomous cross-subject scheduling.');
assert.match(source, /__kianosExamPlanReadModel/,
  'Latest read model must remain directly readable by downstream Home clients.');
assert.match(source, /kianos:exam-plan-read-model/,
  'Exam Orchestrator client must publish read-model updates without DOM scraping.');
assert.match(source, /new CustomEvent\('kianos:exam-plan-read-model',[\s\S]*bubbles:\s*true/,
  'Read-model event must bubble from the orchestrator surface.');
assert.match(source, /strategyOwner\s*=\s*'chat'|dataset\.strategyOwner\s*=\s*'chat'/,
  'Production surface must declare Chat as strategy owner.');
assert.match(source, /renderTodayTasks\(readModel\.presentation\)/,
  'Home presentation projection must remain downstream of the validated Chat Plan read model.');
assert.match(source, /renderWeek\(readModel\.presentation\)/,
  'Home week visibility must consume the validated Chat-owned projection.');
assert.match(source, /renderSchedule\(readModel\.presentation\)/,
  'Home schedule strip must consume the same current-day Chat projection, not an autonomous scheduler.');

console.log('PASS Chat-controlled exam plan read model publish bridge');
