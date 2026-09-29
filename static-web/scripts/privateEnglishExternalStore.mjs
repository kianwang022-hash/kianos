import {
  ensureExternalReadingPrivateBundle,
  externalReadingAnswers,
  externalReadingCatalog,
  externalReadingPassage
} from './privateExternalReadingStore.mjs';
import {
  generatedDrillCatalogRows,
  listEnglishGeneratedDrills,
  readEnglishGeneratedDrill,
  materializeEnglishGeneratedDrill,
  englishGeneratedDrillAnswers,
  resolveEnglishGeneratedDir
} from './privateEnglishGeneratedDrillStore.mjs';

const generatedCollection=(rows)=>({
  source_family:'CHAT_GENERATED',
  collection:'Chat Drills',
  passages:rows.map(row=>({
    object_id:row.object_id,
    passage_id:row.object_id,
    source_family:'CHAT_GENERATED',
    source_format:'CHAT_GENERATED',
    collection:'Chat Drills',
    test:null,
    passage_number:1,
    title:row.label,
    question_count:null,
    answer_key_status:'CHAT_GENERATED',
    warnings:[],
    source_hash:null,
    content_hash:row.content_hash,
    origin:row.origin,
    study_day:row.study_day
  }))
});

export function englishExternalCombinedCatalog({
  sourceState=ensureExternalReadingPrivateBundle(),
  generatedDir=resolveEnglishGeneratedDir(),
  studyDay=null
}={}){
  const generated=generatedDrillCatalogRows({privateDir:generatedDir,studyDay});
  const generatedExternal=generated.filter(row=>row.task==='external_reading');
  let sourceCatalog;
  try{sourceCatalog=externalReadingCatalog(sourceState);}
  catch(error){sourceCatalog={status:'invalid',error:error instanceof Error?error.message:String(error),collections:[],counts:null};}
  const sourceReady=sourceCatalog.status==='ready';
  const collections=[
    ...(sourceReady?(sourceCatalog.collections||[]):[]),
    ...(generatedExternal.length?[generatedCollection(generatedExternal)]:[])
  ];
  if(sourceReady||generatedExternal.length){
    return{
      status:'ready',
      source_status:sourceCatalog.status,
      source_error:sourceCatalog.error||null,
      counts:{
        ...(sourceCatalog.counts||{}),
        generated:{objects:generatedExternal.length}
      },
      source_quality:sourceCatalog.source_quality||null,
      cognition_boundary:sourceCatalog.cognition_boundary||null,
      collections
    };
  }
  return{...sourceCatalog,source_status:sourceCatalog.status,collections:[]};
}

const isGenerated=id=>String(id||'').startsWith('external-chat-');

export function englishExternalCombinedPassage(objectId,{
  sourceState=ensureExternalReadingPrivateBundle(),
  generatedDir=resolveEnglishGeneratedDir()
}={}){
  if(!isGenerated(objectId))return externalReadingPassage(objectId,sourceState);
  const drill=readEnglishGeneratedDrill(objectId,{privateDir:generatedDir});
  return materializeEnglishGeneratedDrill(drill,{
    loadExternalSource:(sourceId)=>externalReadingPassage(sourceId,sourceState)
  });
}

export function englishExternalCombinedAnswers(objectId,{
  sourceState=ensureExternalReadingPrivateBundle(),
  generatedDir=resolveEnglishGeneratedDir()
}={}){
  if(!isGenerated(objectId))return externalReadingAnswers(objectId,sourceState);
  return englishGeneratedDrillAnswers(readEnglishGeneratedDrill(objectId,{privateDir:generatedDir}));
}
