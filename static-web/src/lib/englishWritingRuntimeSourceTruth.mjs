import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {
  WRITING_TRUE_EXAM_ENTRY_POLICY,
  listWritingRuntimeTasks as baseListWritingRuntimeTasks,
  getFirstProtectedTrueExamTask as baseGetFirstProtectedTrueExamTask,
  inspectWritingTrueExamEntry as baseInspectWritingTrueExamEntry,
  loadWritingRuntimeTask as baseLoadWritingRuntimeTask,
  listWritingExamRuntimeTasks as baseListWritingExamRuntimeTasks,
  loadWritingExamRuntimeTask as baseLoadWritingExamRuntimeTask
} from './englishWritingRuntimeTask.mjs';
import { projectWritingRuntimeSourceTruth } from './englishSourceTruth.mjs';

export { WRITING_TRUE_EXAM_ENTRY_POLICY };
// Executability is stronger than text/manifest presence. No alternate visual is invented.
export function writingRuntimeSourceStatus(task) {
  if(task.sourceKind!=='exam'||task.kind!=='big')return {ready:true,issues:[]};
  const root=process.env.KIANOS_REPO_ROOT||path.resolve(process.cwd(),'..');
  const images=task.learnerTask?.images||[];
  const issues=[];
  if(!images.length)issues.push('WRITING_ORIGINAL_VISUAL_MISSING');
  for(const image of images){
    const relative=String(image.asset_path||'');
    if(!relative.startsWith('english-assets/')||relative.includes('..')){issues.push('WRITING_VISUAL_PATH_INVALID');continue;}
    const file=path.join(root,'static-web/public',relative);
    if(!fs.existsSync(file)){issues.push('WRITING_VISUAL_BYTES_MISSING:'+relative);continue;}
    if(crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')!==image.asset_sha256)issues.push('WRITING_VISUAL_HASH_MISMATCH:'+relative);
  }
  return {ready:issues.length===0,issues};
}
function acceptedRuntime(task) {
  const projected=projectWritingRuntimeSourceTruth(task),status=writingRuntimeSourceStatus(projected);
  if(!status.ready)throw new Error('WRITING_SOURCE_NOT_EXECUTABLE:'+task.id+':'+status.issues.join('|'));
  return projected;
}

export function listWritingRuntimeTasks() {
  return baseListWritingRuntimeTasks().map(projectWritingRuntimeSourceTruth).filter(task=>writingRuntimeSourceStatus(task).ready);
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
  return acceptedRuntime(baseLoadWritingRuntimeTask(id));
}

export function listWritingExamRuntimeTasks() {
  return baseListWritingExamRuntimeTasks().map(projectWritingRuntimeSourceTruth).filter(task=>writingRuntimeSourceStatus(task).ready);
}

export function loadWritingExamRuntimeTask(id) {
  return acceptedRuntime(baseLoadWritingExamRuntimeTask(id));
}
