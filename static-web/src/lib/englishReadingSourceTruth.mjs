import {
  listReadingSets as baseListReadingSets,
  loadReadingById as baseLoadReadingById,
  loadReadingAnswersById as baseLoadReadingAnswersById,
  loadReadingReviewById as baseLoadReadingReviewById
} from './englishReading.mjs';
import { projectReadingSourceTruth, rebindRenderedEnglishSourceIdentity } from './englishSourceTruth.mjs';
import {
  listSyntheticReadingSets,
  loadSyntheticReadingById,
  loadSyntheticReadingAnswersById,
  loadSyntheticReadingReviewById
} from './englishSyntheticBaseline.mjs';

export const listReadingSets = baseListReadingSets;
export const listExecutableReadingSets = () => [...baseListReadingSets(), ...listSyntheticReadingSets()];
export { inspectReadingSources } from './current.mjs';

export function loadReadingById(id) {
  if (listSyntheticReadingSets().some((row) => row.id === id)) return loadSyntheticReadingById(id);
  const base = baseLoadReadingById(id);
  const projected = projectReadingSourceTruth(base);
  return rebindRenderedEnglishSourceIdentity({
    ...projected,
    paragraphs: base.paragraphs
  });
}

export function loadReadingAnswersById(id) {
  if (listSyntheticReadingSets().some((row) => row.id === id)) return loadSyntheticReadingAnswersById(id);
  return baseLoadReadingAnswersById(id);
}

export function loadReadingReviewById(id) {
  if (listSyntheticReadingSets().some((row) => row.id === id)) return loadSyntheticReadingReviewById(id);
  return baseLoadReadingReviewById(id);
}

export function loadDefaultReading() {
  const items = listReadingSets();
  if (!items.length) throw new Error('CURRENT_READING_SOURCE_NOT_READY:empty');
  const preferred = process.env.KIANOS_READING_SET_ID;
  const selected = preferred && items.some((item) => item.id === preferred) ? preferred : items[0].id;
  return loadReadingById(selected);
}
