import crypto from 'node:crypto';

const OMIT_KEYS=new Set([
  'id','objectId','object_id','paperId','paper_id','year','code','section',
  'navigation','sourcePaths','sourcePath','sourceHashes','sourceHash',
  'sourceTruth','sourceTruthStatus','sourceKind','source_kind',
  'evidenceRole','evidence_role','target_mechanisms','targetMechanisms',
  'position','total','title','planningPrompt','draftPrompt',
  'asset_path','alt'
]);

function stableJson(value){
  if(value===null||typeof value!=='object')return JSON.stringify(value);
  if(Array.isArray(value))return '['+value.map(stableJson).join(',')+']';
  return '{'+Object.keys(value).sort().map((key)=>JSON.stringify(key)+':'+stableJson(value[key])).join(',')+'}';
}

function learnerSemanticClone(value){
  if(value===null||value===undefined)return null;
  if(Array.isArray(value))return value.map(learnerSemanticClone);
  if(typeof value!=='object')return value;
  const out={};
  for(const [key,child] of Object.entries(value)){
    if(OMIT_KEYS.has(key))continue;
    out[key]=learnerSemanticClone(child);
  }
  return out;
}

export function englishSemanticSourcePayload(object={}){
  const context=object?.context&&typeof object.context==='object'&&!Array.isArray(object.context)
    ? learnerSemanticClone(object.context)
    : null;
  return learnerSemanticClone({
    task:object?.task||null,
    kind:object?.kind||null,
    targetWords:object?.targetWords??null,
    material:object?.material??null,
    paragraphs:object?.paragraphs??null,
    prompts:object?.prompts??null,
    questions:object?.questions??null,
    candidates:object?.candidates??null,
    context,
    learnerTask:object?.learnerTask??null
  });
}

export function englishSemanticSourceHash(object={}){
  return crypto.createHash('sha256')
    .update(stableJson(englishSemanticSourcePayload(object)))
    .digest('hex');
}
