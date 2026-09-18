import { listReadingSets } from './englishReadingSourceTruth.mjs';
import { listClozeSets, listReadingBSets } from './englishObjectiveSourceTruth.mjs';
import { listTranslationSets } from './englishTranslationSourceTruth.mjs';
import { listWritingRuntimeTasks } from './englishWritingRuntimeSourceTruth.mjs';
import { listEnglishExamPapers } from './englishExamPaper.mjs';
let cache;
export function englishTaskCatalog() {
  if (!cache) cache = {
    reading_a:listReadingSets().map(x=>x.id),cloze:listClozeSets().map(x=>x.id),
    reading_b:listReadingBSets().map(x=>x.id),translation:listTranslationSets().map(x=>x.id),
    writing:listWritingRuntimeTasks().map(x=>x.id),
    full_paper:listEnglishExamPapers().map(x=>x.paperId)
  };
  return structuredClone(cache);
}
