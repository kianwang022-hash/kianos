import {
  listReadingSets as baseListReadingSets,
  loadReadingById as baseLoadReadingById,
  loadReadingAnswersById,
  loadReadingReviewById
} from './englishReading.mjs';
import { projectReadingSourceTruth } from './englishSourceTruth.mjs';

export const listReadingSets = baseListReadingSets;
export { loadReadingAnswersById, loadReadingReviewById };

export function loadReadingById(id) {
  return projectReadingSourceTruth(baseLoadReadingById(id));
}

export function loadDefaultReading() {
  const items = listReadingSets();
  if (!items.length) throw new Error('CURRENT_READING_SOURCE_NOT_READY:empty');
  const preferred = process.env.KIANOS_READING_SET_ID;
  const selected = preferred && items.some((item) => item.id === preferred) ? preferred : items[0].id;
  return loadReadingById(selected);
}
