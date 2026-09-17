import {
  listReadingSets as baseListReadingSets,
  loadReadingById as baseLoadReadingById,
  loadReadingAnswersById,
  loadReadingReviewById
} from './englishReading.mjs';
import { projectReadingSourceTruth } from './englishSourceTruth.mjs';

export const listReadingSets = baseListReadingSets;
export { loadReadingAnswersById, loadReadingReviewById };
export { inspectReadingSources } from './current.mjs';

export function loadReadingById(id) {
  const base = baseLoadReadingById(id);
  const projected = projectReadingSourceTruth(base);
  // Reading A already has paragraph-level structure in reading_corpus.v1.json.
  // Source Truth corrects learner-facing prompt/options, but must not flatten the
  // verified paragraph geometry back into one source_text block.
  return {
    ...projected,
    paragraphs: base.paragraphs
  };
}

export function loadDefaultReading() {
  const items = listReadingSets();
  if (!items.length) throw new Error('CURRENT_READING_SOURCE_NOT_READY:empty');
  const preferred = process.env.KIANOS_READING_SET_ID;
  const selected = preferred && items.some((item) => item.id === preferred) ? preferred : items[0].id;
  return loadReadingById(selected);
}
