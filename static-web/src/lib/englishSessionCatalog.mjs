import { listReadingSets } from './englishReadingSourceTruth.mjs';
import { listClozeSets, listReadingBSets } from './englishObjectiveSourceTruth.mjs';
import { listTranslationSets } from './englishTranslationSourceTruth.mjs';
import { listWritingRuntimeTasks } from './englishWritingRuntimeSourceTruth.mjs';
import { listEnglishExamPapers } from './englishExamPaper.mjs';

export function englishSessionCurrentCatalog() {
  const ids = rows => rows.map(row => String(row.id || row.objectId)).filter(id => id && id !== 'undefined');
  return {
    reading_a: ids(listReadingSets()),
    cloze: ids(listClozeSets()),
    reading_b: ids(listReadingBSets()),
    translation: ids(listTranslationSets()),
    writing: ids(listWritingRuntimeTasks()),
    full_paper: listEnglishExamPapers().map(row => row.paperId)
  };
}
