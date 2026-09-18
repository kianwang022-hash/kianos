import { listLexicalOrdinals, loadLexicalWordByOrdinal } from '../../../lib/lexical.mjs';
export function getStaticPaths(){return listLexicalOrdinals().map(ordinal=>({params:{ordinal:String(ordinal)}}));}
export function GET({params}){
  const owner=loadLexicalWordByOrdinal(Number(params.ordinal));const targets=[];
  const visit=value=>{if(!value||typeof value!=='object')return;if(value.repair?.target_kind)targets.push(value.repair);for(const [k,v]of Object.entries(value))if(k!=='repair')visit(v);};
  visit(owner.record);
  return new Response(JSON.stringify({word_id:owner.objectId,ordinal:owner.ordinal,source_revision:owner.sourceHash,targets}),{headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
}
