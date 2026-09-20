import crypto from 'node:crypto';
import { englishSemanticSourceHash } from './englishSemanticSourceIdentity.mjs';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(process.cwd(), '..');

export const WRITING_SYNTHETIC_SOURCE = 'content/english/modules/writing/synthetic-tasks.v1.json';

const FORBIDDEN_KEYS = new Set([
  'answer',
  'answers',
  'analysis',
  'explanation',
  'solution',
  'reference',
  'reference_answer',
  'sample_answer',
  'model_answer',
  'template_answer'
]);

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function collectForbidden(value, prefix = '') {
  if (!value || typeof value !== 'object') return [];
  if (Array.isArray(value)) return value.flatMap((child, index) => collectForbidden(child, `${prefix}[${index}]`));
  const hits = [];
  for (const [key, child] of Object.entries(value)) {
    const next = prefix ? `${prefix}.${key}` : key;
    if (FORBIDDEN_KEYS.has(String(key).toLowerCase())) hits.push(next);
    hits.push(...collectForbidden(child, next));
  }
  return hits;
}

function loadOwner() {
  const fullPath = path.join(repoRoot, WRITING_SYNTHETIC_SOURCE);
  if (!fs.existsSync(fullPath)) {
    return { status: 'missing', issues: [`MISSING:${WRITING_SYNTHETIC_SOURCE}`], tasks: [], sourceHash: '' };
  }
  try {
    const raw = fs.readFileSync(fullPath, 'utf8');
    const owner = JSON.parse(raw);
    const issues = [];
    if (owner?.schema !== 'kianos.english.writing.synthetic_tasks.v1') issues.push(`SCHEMA:${owner?.schema || 'missing'}`);
    if (owner?.status !== 'CURRENT') issues.push(`STATUS:${owner?.status || 'missing'}`);
    if (owner?.rules?.learner_unit !== 'one complete essay') issues.push('LEARNER_UNIT');
    if (owner?.rules?.model_answer_present !== false) issues.push('MODEL_ANSWER_POLICY');
    if (owner?.rules?.true_exam_consumption !== false) issues.push('TRUE_EXAM_POLICY');
    if (!Array.isArray(owner?.tasks) || owner.tasks.length < 2) issues.push(`TASK_COUNT:${owner?.tasks?.length || 0}`);

    const ids = new Set();
    const kinds = new Set();
    for (const task of owner?.tasks || []) {
      if (!task?.id || ids.has(task.id)) issues.push(`TASK_ID:${task?.id || 'missing'}`);
      ids.add(task?.id);
      if (!['small', 'big'].includes(task?.kind)) issues.push(`TASK_KIND:${task?.id || 'missing'}:${task?.kind || 'missing'}`);
      kinds.add(task?.kind);
      if (task?.source_kind !== 'synthetic') issues.push(`TASK_SOURCE_KIND:${task?.id || 'missing'}`);
      if (!task?.task?.directions) issues.push(`TASK_DIRECTIONS:${task?.id || 'missing'}`);
      if (!task?.planning_prompt) issues.push(`PLANNING_PROMPT:${task?.id || 'missing'}`);
      if (!task?.draft_prompt) issues.push(`DRAFT_PROMPT:${task?.id || 'missing'}`);
      const forbidden = collectForbidden(task);
      if (forbidden.length) issues.push(`LEARNER_LEAK:${task?.id || 'missing'}:${forbidden.join('|')}`);
    }
    if (!kinds.has('small') || !kinds.has('big')) issues.push(`KIND_COVERAGE:${[...kinds].join('|')}`);

    const tasks = issues.length ? [] : owner.tasks.map((task, index) => ({
      id: task.id,
      kind: task.kind,
      sourceKind: task.source_kind,
      evidenceRole: task.evidence_role || null,
      title: task.title,
      targetWords: task.target_words,
      learnerTask: task.task,
      planningPrompt: task.planning_prompt,
      draftPrompt: task.draft_prompt,
      sourcePath: WRITING_SYNTHETIC_SOURCE,
      sourceHash: sha256(JSON.stringify(task)),
      sourceOwnerHash: sha256(raw),
      semanticSourceHash: englishSemanticSourceHash({
        kind: task.kind,
        targetWords: task.target_words,
        learnerTask: task.task
      }),
      position: index + 1,
      total: owner.tasks.length
    }));

    return {
      status: issues.length ? 'invalid' : 'ready',
      issues,
      owner,
      tasks,
      sourceHash: sha256(raw)
    };
  } catch (error) {
    return {
      status: 'invalid',
      issues: [error instanceof Error ? error.message : String(error)],
      tasks: [],
      sourceHash: ''
    };
  }
}

let cache;

function snapshot() {
  if (!cache) cache = loadOwner();
  return cache;
}

export function inspectWritingSyntheticTasks() {
  const data = snapshot();
  return {
    status: data.status,
    issues: [...(data.issues || [])],
    sourcePath: WRITING_SYNTHETIC_SOURCE,
    sourceHash: data.sourceHash || '',
    taskCount: data.tasks?.length || 0,
    kinds: (data.tasks || []).map((task) => task.kind)
  };
}

export function listWritingSyntheticTasks() {
  return (snapshot().tasks || []).map((task) => ({ ...task, learnerTask: { ...task.learnerTask } }));
}

export function loadWritingSyntheticTask(id) {
  const data = snapshot();
  if (data.status !== 'ready') throw new Error(`WRITING_SYNTHETIC_SOURCE_NOT_READY:${data.issues.join(',')}`);
  const task = data.tasks.find((item) => item.id === id);
  if (!task) throw new Error(`WRITING_SYNTHETIC_TASK_NOT_FOUND:${id}`);
  const index = data.tasks.findIndex((item) => item.id === id);
  return {
    ...task,
    learnerTask: { ...task.learnerTask },
    navigation: {
      previousId: index > 0 ? data.tasks[index - 1].id : null,
      nextId: index < data.tasks.length - 1 ? data.tasks[index + 1].id : null
    }
  };
}
