import {
  WRITING_TRUE_EXAM_ENTRY_POLICY,
  listWritingRuntimeTasks as baseListWritingRuntimeTasks,
  getFirstProtectedTrueExamTask as baseGetFirstProtectedTrueExamTask,
  inspectWritingTrueExamEntry as baseInspectWritingTrueExamEntry,
  loadWritingRuntimeTask as baseLoadWritingRuntimeTask
} from './englishWritingRuntimeTask.mjs';
import { projectWritingRuntimeSourceTruth } from './englishSourceTruth.mjs';

export { WRITING_TRUE_EXAM_ENTRY_POLICY };

export function listWritingRuntimeTasks() {
  return baseListWritingRuntimeTasks().map((task) => projectWritingRuntimeSourceTruth(task));
}

export function getFirstProtectedTrueExamTask() {
  return projectWritingRuntimeSourceTruth(baseGetFirstProtectedTrueExamTask());
}

export function inspectWritingTrueExamEntry() {
  const base = baseInspectWritingTrueExamEntry();
  const exam = getFirstProtectedTrueExamTask();
  return {
    ...base,
    firstExam: {
      ...(base.firstExam || {}),
      id: exam.id,
      kind: exam.kind,
      sourceKind: exam.sourceKind,
      sourcePath: exam.sourcePath,
      sourceHash: exam.sourceHash
    }
  };
}

export function loadWritingRuntimeTask(id) {
  return projectWritingRuntimeSourceTruth(baseLoadWritingRuntimeTask(id));
}
