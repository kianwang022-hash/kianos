// Server-only mechanical identity projection. No questions/answers or learner strategy.
import {listReadingSets,loadReadingById} from './englishReadingSourceTruth.mjs';
import {listClozeSets,loadClozeById,listReadingBSets,loadReadingBById} from './englishObjectiveSourceTruth.mjs';
import {listTranslationSets,loadTranslationById} from './englishTranslationSourceTruth.mjs';
import {listWritingRuntimeTasks} from './englishWritingRuntimeSourceTruth.mjs';
import {listEnglishExamPapers,loadEnglishExamPaper} from './englishExamPaper.mjs';
let cached;
export function englishSessionCatalog(){
 if(cached)return cached;
 const rows=[];
 for(const [task,list,load] of [['reading_a',listReadingSets,loadReadingById],['cloze',listClozeSets,loadClozeById],['reading_b',listReadingBSets,loadReadingBById],['translation',listTranslationSets,loadTranslationById]]){
  for(const row of list())rows.push({task,object_id:row.id,source_hash:load(row.id).sourceHashes.renderedObject});
 }
 for(const row of listWritingRuntimeTasks())rows.push({task:'writing',object_id:row.id,source_hash:row.sourceHash});
 for(const row of listEnglishExamPapers())rows.push({task:'full_paper',object_id:row.paperId,material_ids:loadEnglishExamPaper(row.paperId).steps.map(s=>s.object_id),source_hash:loadEnglishExamPaper(row.paperId).source_hash});
 cached=rows;return rows;
}
