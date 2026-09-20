import {
  inspectObjectiveTask,
  listClozeSets as baseListClozeSets,
  loadClozeById as baseLoadClozeById,
  loadClozeAnswersById as baseLoadClozeAnswersById,
  listReadingBSets as baseListReadingBSets,
  loadReadingBById as baseLoadReadingBById,
  loadReadingBAnswersById as baseLoadReadingBAnswersById
} from './englishObjective.mjs';
import { projectObjectiveSourceTruth } from './englishSourceTruth.mjs';
import {
  listSyntheticClozeSets,
  loadSyntheticClozeById,
  loadSyntheticClozeAnswersById,
  listSyntheticReadingBSets,
  loadSyntheticReadingBById,
  loadSyntheticReadingBAnswersById
} from './englishSyntheticBaseline.mjs';

export { inspectObjectiveTask };
export const listClozeSets = baseListClozeSets;
export const listReadingBSets = baseListReadingBSets;
export const listExecutableClozeSets = () => [...baseListClozeSets(), ...listSyntheticClozeSets()];
export const listExecutableReadingBSets = () => [...baseListReadingBSets(), ...listSyntheticReadingBSets()];

export function loadClozeById(id) {
  if (listSyntheticClozeSets().some((row) => row.id === id)) return loadSyntheticClozeById(id);
  return projectObjectiveSourceTruth(baseLoadClozeById(id));
}

export function loadClozeAnswersById(id) {
  if (listSyntheticClozeSets().some((row) => row.id === id)) return loadSyntheticClozeAnswersById(id);
  return baseLoadClozeAnswersById(id);
}

export function loadDefaultCloze() {
  const items = listClozeSets();
  if (!items.length) throw new Error('CURRENT_OBJECTIVE_SOURCE_NOT_READY:cloze:empty');
  const preferred = process.env.KIANOS_CLOZE_SET_ID;
  const selected = preferred && items.some((item) => item.id === preferred) ? preferred : items[0].id;
  return loadClozeById(selected);
}

export function loadReadingBById(id) {
  if (listSyntheticReadingBSets().some((row) => row.id === id)) return loadSyntheticReadingBById(id);
  return projectObjectiveSourceTruth(baseLoadReadingBById(id));
}

export function loadReadingBAnswersById(id) {
  if (listSyntheticReadingBSets().some((row) => row.id === id)) return loadSyntheticReadingBAnswersById(id);
  return baseLoadReadingBAnswersById(id);
}

export function loadDefaultReadingB() {
  const items = listReadingBSets();
  if (!items.length) throw new Error('CURRENT_OBJECTIVE_SOURCE_NOT_READY:reading_b:empty');
  const preferred = process.env.KIANOS_READING_B_SET_ID;
  const selected = preferred && items.some((item) => item.id === preferred) ? preferred : items[0].id;
  return loadReadingBById(selected);
}
