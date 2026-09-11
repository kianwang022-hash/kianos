import {
  SOURCE,
  inspectWritingSources,
  listWritingTasks,
  loadWritingById
} from './englishWriting.mjs';

function clone(value) {
  if (typeof structuredClone === 'function') return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

function runtimeTaskFromSource(source) {
  return {
    id: source.objectId,
    kind: source.kind,
    sourceKind: 'exam',
    title: source.title,
    year: source.year,
    section: source.section,
    paperId: source.paperId,
    targetWords: null,
    learnerTask: {
      mode: 'exam',
      context: clone(source.context || {}),
      material: clone(source.material || []),
      prompts: clone(source.prompts || [])
    },
    planningPrompt: source.kind === 'small'
      ? 'Before drafting, recover the actual communicative task: audience/purpose/required moves, then generate only the content you need. If a separate plan would be fake work, use direct mode.'
      : 'Before drafting, separate what the supplied material shows from what you infer, form one developable core message, and generate 2–4 supporting content atoms. If a separate plan would be fake work, use direct mode.',
    draftPrompt: 'Write one complete clean first draft from the supplied exam task. Do not reveal or consult formal answers, analysis, model/reference essays, or remembered solution notes before locking first evidence.',
    sourcePath: SOURCE.questionBank,
    sourceHash: source.sourceHashes?.questionOwner || '',
    renderedObjectHash: source.sourceHashes?.renderedObject || '',
    sourcePaths: clone(source.sourcePaths || {}),
    manifestStatus: source.manifestStatus || ''
  };
}

export function inspectWritingExamRuntimeSources() {
  const source = inspectWritingSources();
  const tasks = listWritingTasks();
  return {
    status: source.status,
    issues: [...(source.issues || [])],
    sourceGate: source.sourceGate,
    sourceHash: source.sourceHash,
    taskCount: tasks.length,
    sourceReadyTaskCount: tasks.filter((task) => task.sourceReady).length,
    kindCounts: { ...(source.kindCounts || {}) },
    yearsBySection: clone(source.yearsBySection || {})
  };
}

export function listWritingExamRuntimeTasks() {
  const source = inspectWritingSources();
  if (source.status !== 'ready') return [];
  return listWritingTasks()
    .filter((task) => task.sourceReady)
    .map((task) => ({
      id: task.id,
      kind: task.kind,
      sourceKind: 'exam',
      title: task.title,
      year: task.year,
      section: task.section,
      position: task.position,
      total: task.total
    }));
}

export function loadWritingExamRuntimeTask(id) {
  const source = loadWritingById(id);
  const task = runtimeTaskFromSource(source);
  const catalog = listWritingExamRuntimeTasks();
  const index = catalog.findIndex((item) => item.id === task.id);
  if (index < 0) throw new Error(`WRITING_EXAM_RUNTIME_TASK_NOT_IN_READY_CATALOG:${id}`);
  return {
    ...task,
    navigation: {
      previousId: index > 0 ? catalog[index - 1].id : null,
      nextId: index < catalog.length - 1 ? catalog[index + 1].id : null,
      position: index + 1,
      total: catalog.length
    }
  };
}
