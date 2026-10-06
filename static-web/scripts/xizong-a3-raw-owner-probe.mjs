import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const root=process.argv[2],id=process.argv[3];process.env.KIANOS_REPO_ROOT=root;process.env.KIANOS_XIZONG_BUILD_CACHE='0';
const native=await import(pathToFileURL(`${root}/static-web/src/lib/xizong.mjs`));
const cues=await import(pathToFileURL(`${root}/static-web/src/lib/xizongLearningCues.mjs`));
const shared=JSON.parse(fs.readFileSync(`${root}/content/xizong/knowledge/learner/shared-fields.json`));
const byId=id=>{
 const system=id.startsWith('a3')?'urinary':id.startsWith('a2')?'respiratory':'circulation',canonical=system==='urinary'?'a3':system==='respiratory'?'a2':'a1';
 const index=JSON.parse(fs.readFileSync(`${root}/content/xizong/knowledge/learner/${canonical}-${system}-learning-cues.json`));
 const row=index.precision_index.find(x=>x.id===id);if(!row)throw Error('NO_ROW:'+id);
 const b=native.loadXizongBlock(system,row.anchor.block_id),item=shared.precision_fields?.[id];
 const core=Object.fromEntries((item?.retention_metadata?.required_core_refs||[]).map(d=>{const owner=native.loadXizongBlock(d.system_id,d.block_id),kp=owner.kpRecords.find(k=>k.kpId===d.kp_id);return [d.kp_id,cues.preparedMemoryDigest(kp.detailMarkdown)]}));
 let witness=null,witnessError=null;try{if(row.prepared_memory_ref.owner_mode==='NATIVE_CUE')witness=cues.preparedNativeCueWitness(row,b,item,shared)}catch(e){witnessError=e.message}
 let answer=null,error=null;try{answer=cues.resolvePreparedMemoryCue(row,b,shared).answer_html}catch(e){error=e.message}
 return {id,core,witness,witnessError,answer,error};
};
const firstA1=JSON.parse(fs.readFileSync(`${root}/content/xizong/knowledge/learner/a1-circulation-learning-cues.json`)).precision_index[0].id;
try{console.log(JSON.stringify({result:byId(id),unrelated:byId('a3-b01-kp14-precision'),a2:byId('a2-r01-kp01-precision'),a1:byId(firstA1)}))}catch(e){console.log(JSON.stringify({error:e.stack}));process.exitCode=1}
