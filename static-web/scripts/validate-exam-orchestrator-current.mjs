import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '../..');
const contract = fs.readFileSync(path.join(repoRoot, 'EXAM_ORCHESTRATOR_CONTRACT.md'), 'utf8');
const current = JSON.parse(fs.readFileSync(path.join(repoRoot, 'EXAM_ORCHESTRATOR_CURRENT.json'), 'utf8'));
const errors = [];

const fail = message => errors.push(message);
const validDay = day => typeof day === 'string'
  && /^\d{4}-\d{2}-\d{2}$/.test(day)
  && !Number.isNaN(Date.parse(`${day}T00:00:00Z`));

if (current.schema !== 'kianos.exam-orchestrator.current.v1') fail('schema mismatch');
if (current.authority !== 'DERIVED_PROJECTION') fail('projection must declare DERIVED_PROJECTION');
if (current.source !== 'EXAM_ORCHESTRATOR_CONTRACT.md') fail('source binding mismatch');
if (current.timezone !== 'Asia/Shanghai') fail('timezone mismatch');

const targetBlock = contract.match(/Cross-subject operational target:\s*\n\s*```text\s*\n([\s\S]*?)```/);
if (!targetBlock) {
  fail('contract target block missing');
} else {
  const expected = {};
  for (const line of targetBlock[1].split('\n')) {
    const match = line.trim().match(/^(Total|Xizong|English|Politics)\s+(\d+)\+/);
    if (match) expected[match[1].toLowerCase()] = Number(match[2]);
  }
  for (const [key, value] of Object.entries({
    total: current.targets?.total,
    xizong: current.targets?.xizong,
    english: current.targets?.english,
    politics: current.targets?.politics
  })) {
    if (expected[key] !== value) fail(`target ${key}: projection=${value} contract=${expected[key]}`);
  }
}

if ((current.targets?.xizong || 0) + (current.targets?.english || 0) + (current.targets?.politics || 0) !== current.targets?.total) {
  fail('component targets do not sum to total');
}

const phaseMatches = [...contract.matchAll(/^## Phase ([A-E])｜(\d{4}-\d{2}-\d{2}) → (\d{4}-\d{2}-\d{2})$/gm)];
const contractPhases = new Map(phaseMatches.map(match => [match[1], { start: match[2], end: match[3] }]));
for (const phase of current.phases || []) {
  const expected = contractPhases.get(phase.id);
  if (!expected) fail(`phase ${phase.id} missing from contract`);
  else if (expected.start !== phase.start || expected.end !== phase.end) fail(`phase ${phase.id} date mismatch`);
  if (!validDay(phase.start) || !validDay(phase.end) || phase.start > phase.end) fail(`phase ${phase.id} has invalid dates`);
  if (!Array.isArray(phase.roles) || phase.roles.length !== 3) fail(`phase ${phase.id} roles invalid`);
}
if ((current.phases || []).length !== 5) fail('expected five phases');

for (const gate of current.gates || []) {
  if (!validDay(gate.date)) fail(`gate ${gate.label} has invalid date`);
  if (!contract.includes(gate.date)) fail(`gate date ${gate.date} is not present in contract`);
}
for (let i = 1; i < (current.gates || []).length; i += 1) {
  if (current.gates[i - 1].date >= current.gates[i].date) fail('gates must be strictly increasing');
}

const ids = new Set();
for (const window of current.refresh_windows || []) {
  if (!window.id || ids.has(window.id)) fail(`refresh id duplicated/missing: ${window.id}`);
  ids.add(window.id);
  if (!validDay(window.start) || !validDay(window.end) || window.start > window.end) fail(`refresh ${window.id} has invalid dates`);
  if (!String(window.label || '').trim()) fail(`refresh ${window.id} label missing`);
}

let runtime;
try {
  runtime = await import('../src/lib/examOrchestrator.mjs');
} catch (error) {
  fail(`runtime import failed: ${error?.message || error}`);
}
if (runtime) {
  if (JSON.stringify(runtime.TARGETS) !== JSON.stringify(current.targets)) fail('runtime TARGETS diverge from projection');
  if (JSON.stringify(runtime.GATES) !== JSON.stringify(current.gates)) fail('runtime GATES diverge from projection');
  if (JSON.stringify(runtime.REFRESH_WINDOWS) !== JSON.stringify(current.refresh_windows)) fail('runtime REFRESH_WINDOWS diverge from projection');
}

if (errors.length) {
  console.error(JSON.stringify({ pass: false, errors }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({
  pass: true,
  source: current.source,
  targets: current.targets,
  phases: current.phases.map(({ id, start, end }) => ({ id, start, end })),
  gates: current.gates,
  refresh_windows: current.refresh_windows.map(({ id, start, end }) => ({ id, start, end }))
}, null, 2));
