import {
  SOURCE,
  inspectWritingSources,
  listWritingTasks,
  loadWritingById
} from './englishWriting.mjs';
import {
  WRITING_VISUAL_SOURCE,
  inspectWritingVisualSource,
  learnerWritingVisualDescriptors
} from './englishWritingVisualSource.mjs';

function clone(value) {
  if (typeof structuredClone === 'function') return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

export function projectWritingExamRuntimeTask(source) {
  const context = clone(source.context || {});
  if (source.kind === 'big') {
    context.images = learnerWritingVisualDescriptors(source.objectId);
  }

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
      context,
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
    sourcePaths: {
      ...clone(source.sourcePaths || {}),
      visualTruth: WRITING_VISUAL_SOURCE
    },
    manifestStatus: source.manifestStatus || ''
  };
}

export function inspectWritingExamRuntimeSources() {
  const source = inspectWritingSources();
  const visual = inspectWritingVisualSource();
  const tasks = listWritingTasks();
  const ready = source.status === 'ready' && visual.status === 'ready';
  return {
    status: ready ? 'ready' : 'blocked',
    issues: [
      ...(source.issues || []),
      ...(visual.issue ? [visual.issue] : [])
    ],
    sourceGate: ready ? 'S_PASS' : 'S_BLOCKED',
    sourceHash: source.sourceHash,
    taskCount: ready ? tasks.length : 0,
    sourceReadyTaskCount: ready ? tasks.filter((task) => task.sourceReady).length : 0,
    kindCounts: { ...(source.kindCounts || {}) },
    yearsBySection: clone(source.yearsBySection || {}),
    visualClosure: {
      status: visual.status,
      mappingReady: visual.mappingReady,
      binaryReady: visual.binaryReady,
      recordCount: visual.recordCount,
      assetCount: visual.assetCount,
      exactAssetCount: visual.exactAssetCount,
      sourcePath: visual.sourcePath
    }
  };
}

export function listWritingExamRuntimeTasks() {
  const source = inspectWritingSources();
  const visual = inspectWritingVisualSource();
  if (source.status !== 'ready' || visual.status !== 'ready') return [];
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
  const sourceState = inspectWritingExamRuntimeSources();
  if (sourceState.status !== 'ready') {
    throw new Error(`WRITING_EXAM_RUNTIME_BLOCKED_BY_SOURCE:${sourceState.issues.join('|')}`);
  }
  const source = loadWritingById(id);
  const task = projectWritingExamRuntimeTask(source);
  const catalog = listWritingExamRuntimeTasks();
  const index = catalog.findIndex((item) => item.id === task.id);
  if (index < 0) throw new Error(`WRITING_EXAM_RUNTIME_TASK_NOT_IN_READY_CATALOG:${id}`);
  return {
    ...task,
    catalogPosition: index + 1,
    catalogTotal: catalog.length,
    navigation: {
      previousId: null,
      nextId: null,
      position: index + 1,
      total: catalog.length
    }
  };
}
