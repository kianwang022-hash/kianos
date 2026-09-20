// Server-only mechanical identity projection. No questions/answers or learner strategy.
import {listExecutableReadingSets,loadReadingById} from './englishReadingSourceTruth.mjs';
import {listExecutableClozeSets,loadClozeById,listExecutableReadingBSets,loadReadingBById} from './englishObjectiveSourceTruth.mjs';
import {listExecutableTranslationSets,loadTranslationById} from './englishTranslationSourceTruth.mjs';
import {listWritingRuntimeTasks} from './englishWritingRuntimeSourceTruth.mjs';
import {listEnglishExamPapers,loadEnglishExamPaper} from './englishExamPaper.mjs';
let cached;
export function englishSessionCatalog(){
 if(cached)return cached;
 const rows=[];
 for(const [task,list,load] of [['reading_a',listExecutableReadingSets,loadReadingById],['cloze',listExecutableClozeSets,loadClozeById],['reading_b',listExecutableReadingBSets,loadReadingBById],['translation',listExecutableTranslationSets,loadTranslationById]]){
  for(const row of list()){
    const loaded=load(row.id);
    rows.push({task,object_id:row.id,source_hash:loaded.sourceHashes.renderedObject,semantic_source_hash:loaded.sourceHashes.semanticSource||loaded.sourceHashes.renderedObject});
  }
 }
 for(const row of listWritingRuntimeTasks())rows.push({task:'writing',object_id:row.id,source_hash:row.sourceHash,semantic_source_hash:row.semanticSourceHash||row.sourceHash});
 for(const row of listEnglishExamPapers()){
   const paper=loadEnglishExamPaper(row.paperId);
   rows.push({
    task:'full_paper',
    object_id:row.paperId,
    material_ids:paper.steps.map(s=>s.object_id),
    materials:paper.steps.map(s=>({object_id:s.object_id,source_hash:s.source_hash||null,semantic_source_hash:s.semantic_source_hash||s.source_hash||null})),
    source_hash:paper.source_hash
   });
 }
 cached=rows;return rows;
}
