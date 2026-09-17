import {
  inspectObjectiveTask,
  listClozeSets as baseListClozeSets,
  loadClozeById as baseLoadClozeById,
  loadClozeAnswersById,
  listReadingBSets as baseListReadingBSets,
  loadReadingBById as baseLoadReadingBById,
  loadReadingBAnswersById
} from './englishObjective.mjs';
import { projectObjectiveSourceTruth } from './englishSourceTruth.mjs';

export { inspectObjectiveTask, loadClozeAnswersById, loadReadingBAnswersById };
export const listClozeSets = baseListClozeSets;
export const listReadingBSets = baseListReadingBSets;

export function loadClozeById(id) {
  return projectObjectiveSourceTruth(baseLoadClozeById(id));
}

export function loadDefaultCloze() {
  const items = listClozeSets();
  if (!items.length) throw new Error('CURRENT_OBJECTIVE_SOURCE_NOT_READY:cloze:empty');
  const preferred = process.env.KIANOS_CLOZE_SET_ID;
  const selected = preferred && items.some((item) => item.id === preferred) ? preferred : items[0].id;
  return loadClozeById(selected);
}

export function loadReadingBById(id) {
  return projectObjectiveSourceTruth(baseLoadReadingBById(id));
}

export function loadDefaultReadingB() {
  const items = listReadingBSets();
  if (!items.length) throw new Error('CURRENT_OBJECTIVE_SOURCE_NOT_READY:reading_b:empty');
  const preferred = process.env.KIANOS_READING_B_SET_ID;
  const selected = preferred && items.some((item) => item.id === preferred) ? preferred : items[0].id;
  return loadReadingBById(selected);
}
