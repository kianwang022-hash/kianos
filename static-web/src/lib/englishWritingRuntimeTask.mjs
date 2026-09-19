import { listWritingSyntheticTasks, loadWritingSyntheticTask } from './englishWritingSynthetic.mjs';
import { listWritingTasks, loadWritingById } from './englishWriting.mjs';

export const WRITING_TRUE_EXAM_ENTRY_POLICY = Object.freeze({
  schema: 'kianos.english.writing.true-exam-entry.v1',
  selection: 'learner-or-Chat-selected-source-ready-current-writing-task',
  learnerExposure: 'explicit task opening; targeted synthetic calibration is recommended when ability is not established, never a completion prerequisite',
  protectedCatalogVisibleBeforeGate: true,
  protectedPromptVisibleBeforeOpen: false,
  engineeringAttemptConsumesTrueExam: false
});

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
  'template_answer',
  'taxonomy',
  'qa_state',
  'seal_state'
]);

function textOf(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string' || typeof value === 'number') return String(value).trim();
  if (Array.isArray(value)) return value.map(textOf).filter(Boolean).join('\n');
  if (typeof value !== 'object') return '';
  for (const key of ['text', 'content', 'raw_text', 'alt', 'caption', 'description', 'title']) {
    const text = textOf(value[key]);
    if (text) return text;
  }
  return '';
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

function targetWordsFor(source) {
  const promptText = (source?.prompts || [])
    .flatMap((prompt) => [prompt?.instruction, prompt?.promptText])
    .filter(Boolean)
    .join(' ');
  const range = promptText.match(/(\d{2,3})\s*[-–—]\s*(\d{2,3})\s*words?/i);
  if (range) return `${range[1]}–${range[2]}`;
  const about = promptText.match(/about\s+(\d{2,3})\s*words?/i);
  if (about) return `about ${about[1]}`;
  return source?.kind === 'small' ? 'about 100' : '160–200';
}

function promptTextFor(source) {
  const prompt = Array.isArray(source?.prompts) ? source.prompts[0] : null;
  return [prompt?.instruction, prompt?.promptText]
    .map((value) => String(value || '').trim())
    .filter(Boolean)
    .filter((value, index, rows) => rows.indexOf(value) === index)
    .join('\n\n');
}

function materialTexts(source) {
  return (Array.isArray(source?.material) ? source.material : [])
    .map((row) => textOf(row))
    .filter(Boolean);
}

function contextTexts(source) {
  const context = source?.context && typeof source.context === 'object' ? source.context : {};
  return ['title', 'subtitle', 'task_background', 'directions', 'instruction', 'directive']
    .map((key) => textOf(context[key]))
    .filter(Boolean);
}

function visualTexts(source) {
  const images = source?.context?.images;
  if (!Array.isArray(images)) return [];
  return images.map(textOf).filter(Boolean);
}

function normalizeExamTask(source) {
  if (!source?.sourceReady) throw new Error(`WRITING_TRUE_EXAM_SOURCE_NOT_READY:${source?.objectId || 'missing'}`);
  const officialPrompt = promptTextFor(source);
  if (!officialPrompt) throw new Error(`WRITING_TRUE_EXAM_PROMPT_EMPTY:${source?.objectId || 'missing'}`);

  const materials = materialTexts(source);
  const context = contextTexts(source);
  const visuals = visualTexts(source);
  const officialEvidence = {
    prompt: source.prompts,
    material: source.material,
    context: source.context,
    paperId: source.paperId,
    year: source.year,
    section: source.section
  };
  const forbidden = collectForbidden(officialEvidence);
  if (forbidden.length) throw new Error(`WRITING_TRUE_EXAM_PROJECTION_LEAK:${source.objectId}:${forbidden.join('|')}`);

  const common = {
    id: source.objectId,
    kind: source.kind,
    sourceKind: 'exam',
    title: source.title,
    targetWords: targetWordsFor(source),
    planningPrompt: source.kind === 'small'
      ? '用自己的话写 audience / purpose / required moves + 关键 details；若能直接稳定生成，可选 Direct mode。'
      : '写 Observation / Core Message / 2–3 个 support atoms；只依据当前官方题面，不提前调用主题模板。',
    draftPrompt: '在不看范文、解析或主题总结的情况下，独立完成这篇官方真题的 first draft。',
    sourcePath: source.sourcePaths?.questions || 'content/english/source/question_bank.v1.json',
    sourceHash: source.sourceHashes?.renderedObject || source.sourceHashes?.questionOwner || '',
    paperId: source.paperId,
    year: source.year,
    section: source.section,
    officialEvidence,
    navigation: { previousId: null, nextId: null }
  };

  if (source.kind === 'small') {
    return {
      ...common,
      learnerTask: {
        role: 'Official true-exam task',
        audience: 'As specified by the official prompt',
        background: [...context, ...materials].join('\n\n') || 'Read the official task constraints below.',
        directions: officialPrompt,
        facts: materials,
        register_hint: 'Infer register from the official audience / purpose; do not import a memorized whole-essay template.',
        official: officialEvidence
      }
    };
  }

  const visualScenario = [...visuals, ...context, ...materials].join('\n\n');
  return {
    ...common,
    learnerTask: {
      visual_scenario: visualScenario || 'Use the official visual / source material attached to this task.',
      directions: officialPrompt,
      observation_boundary: 'Describe only what the official source material supports before moving to interpretation and comment.',
      official: officialEvidence
    }
  };
}

export function listWritingRuntimeTasks() {
  const synthetic = listWritingSyntheticTasks();
  return [...synthetic, ...listWritingExamRuntimeTasks()];
}

export function getFirstProtectedTrueExamTask() {
  const first = listWritingTasks().find((task) => task?.sourceReady);
  if (!first) throw new Error('WRITING_TRUE_EXAM_ENTRY_NOT_AVAILABLE');
  return normalizeExamTask(loadWritingById(first.id));
}

export function inspectWritingTrueExamEntry() {
  const synthetic = listWritingSyntheticTasks();
  const exam = getFirstProtectedTrueExamTask();
  return {
    status: synthetic.length === 2 && exam?.sourceKind === 'exam' ? 'ready' : 'invalid',
    policy: WRITING_TRUE_EXAM_ENTRY_POLICY,
    syntheticGateIds: synthetic.map((task) => task.id),
    firstExam: {
      id: exam.id,
      kind: exam.kind,
      sourceKind: exam.sourceKind,
      sourcePath: exam.sourcePath,
      sourceHash: exam.sourceHash
    }
  };
}

export function listWritingExamRuntimeTasks() {
  return listWritingTasks()
    .filter((task) => task?.sourceReady)
    .map((task) => normalizeExamTask(loadWritingById(task.id)));
}

export function loadWritingExamRuntimeTask(id) {
  const summary = listWritingTasks().find((task) => task?.sourceReady && task.id === id);
  if (!summary) throw new Error(`WRITING_EXAM_SESSION_TASK_NOT_READY:${id}`);
  return normalizeExamTask(loadWritingById(summary.id));
}

export function loadWritingRuntimeTask(id) {
  const synthetic = listWritingSyntheticTasks();
  if (synthetic.some((task) => task.id === id)) return loadWritingSyntheticTask(id);
  return loadWritingExamRuntimeTask(id);
}
