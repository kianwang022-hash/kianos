import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';

export const ROUTER_VERSION = '1.0.0';
const FLAGS = {
  PRODUCTION_UPGRADE:'production_upgrade', MULTI_ACTIVE_SENSE:'semantic_complexity', MULTI_POS:'semantic_complexity',
  HAS_CONSTRUCTION:'construction_production', HAS_CONFUSABLE_OR_CONTRAST:'semantic_contrast',
  HAS_WORD_FAMILY_OR_RELATION:'relation_anchor', HAS_RELATION_REF:'relation_anchor',
  HAS_REFERENCE_OR_DEPRECATED_IDENTITY:'identity_lifecycle', CORE_ACTIVE_MISMATCH_SENTINEL:'core_sense_integrity',
  CORE_NONEMPTY_ACTIVE_EMPTY:'core_sense_integrity', ORDINARY_BRANCH_REFERENCE_ONLY_SENTINEL:'identity_lifecycle',
  FORM_CASE_SENTINEL:'form_identity', FORM_SPELLING_SENTINEL:'form_identity', FORM_PRONUNCIATION_SENTINEL:'form_identity',
  PRODUCTION_PATTERN_SENTINEL:'construction_production', OWNERSHIP_OR_IDENTITY_SENTINEL:'ownership_identity',
};
const FORM = new Set(['FORM_CASE_SENTINEL','FORM_SPELLING_SENTINEL','FORM_PRONUNCIATION_SENTINEL','OWNERSHIP_OR_IDENTITY_SENTINEL']);
const REL = new Set(['HAS_WORD_FAMILY_OR_RELATION','HAS_RELATION_REF','CORE_ACTIVE_MISMATCH_SENTINEL','CORE_NONEMPTY_ACTIVE_EMPTY','ORDINARY_BRANCH_REFERENCE_ONLY_SENTINEL']);
const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');
export const gitBlobSha = (s) => { const b=Buffer.from(s); return crypto.createHash('sha1').update(Buffer.from(`blob ${b.length}\0`)).update(b).digest('hex'); };
export const stable = (v) => Array.isArray(v) ? `[${v.map(stable).join(',')}]` : v&&typeof v==='object' ? `{${Object.keys(v).sort().map(k=>`${JSON.stringify(k)}:${stable(v[k])}`).join(',')}}` : JSON.stringify(v);
function walk(v, fn){ if(Array.isArray(v)) return v.forEach(x=>walk(x,fn)); if(v&&typeof v==='object') for(const [k,x] of Object.entries(v)){fn(k,x);walk(x,fn);} }
function strings(v){const a=[];walk(v,(_k,x)=>{if(typeof x==='string')a.push(x)});return a;}
function field(v,p){let yes=false;walk(v,(k,x)=>{if(!yes&&p(k,x))yes=true});return yes;}
function active(s){return !['deprecated','reference','reference_only','inactive','retired'].includes(String(s?.status??s?.lifecycle??'').toLowerCase());}
function coreNonempty(r){const c=r.core_concept??{};return Boolean(String(c.core_meaning_en??'').trim()||String(c.core_meaning_cn??'').trim()||(c.core_clusters??[]).length);}
function normOp(x){x=String(x??'').toUpperCase();if(!['NO_CHANGE','UPGRADE','BLOCKED'].includes(x))throw Error(`unsupported operation ${x}`);return x;}

export function parseHandoff(text, source='<handoff>'){
  const out=new Map(); let cur=null, inferredOp=null, inferredQuality=null;
  const explicit=/^(?:-\s+|###\s+)o(\d{4})\s+\*\*(.+?)\*\*\s+—\s+`?(NO_CHANGE|UPGRADE|BLOCKED)`?\s+—\s+`?([A-Z_]+)`?\.?$/;
  const table=/^\|\s*o(\d{4})\s*\|\s*([^|]+?)\s*\|\s*(?:(NO_CHANGE|UPGRADE|BLOCKED)\s*\|\s*)?([A-Z_]+)\s*\|\s*([^|]*?)\s*\|$/;
  const put=(n,word,operation,quality,detail=[])=>{if(out.has(n))throw Error(`${source}: duplicate o${String(n).padStart(4,'0')}`);cur={ordinal:n,word:word.trim(),operation:normOp(operation),quality:quality.trim(),detail,source};out.set(n,cur);};
  for(const line of text.split(/\r?\n/)){
    let m=line.match(explicit);
    if(m){put(+m[1],m[2],m[3],m[4]);continue;}
    if(/^##\s+UPGRADE decisions/i.test(line)){inferredOp='UPGRADE';inferredQuality=null;cur=null;continue;}
    m=line.match(/^###\s+NO_CHANGE\s+\+\s+(SAFE_SIMPLE|DEPTH_READY)/i);
    if(m){inferredOp='NO_CHANGE';inferredQuality=m[1].toUpperCase();cur=null;continue;}
    if(/^##\s+/.test(line)&&!/^##\s+UPGRADE decisions/i.test(line)){inferredOp=null;inferredQuality=null;cur=null;}
    m=line.match(table);
    if(m&&!/^Ordinal$/i.test(m[2].trim())){const op=m[3]||inferredOp;if(op)put(+m[1],m[2],op,m[4],[m[5].trim()].filter(Boolean));continue;}
    if(inferredOp==='NO_CHANGE'&&inferredQuality){
      const items=[...line.matchAll(/`o(\d{4})\s+([^`]+)`/g)];
      if(items.length){for(const x of items)put(+x[1],x[2],inferredOp,inferredQuality);cur=null;continue;}
    }
    if(cur&&/^\s*-\s+/.test(line))cur.detail.push(line.trim());
  }
  return out;
}
function mergeHandoffs(list){const out=new Map();for(const m of list)for(const [n,d] of m){if(out.has(n))throw Error(`duplicate handoff o${String(n).padStart(4,'0')}`);out.set(n,d);}return out;}
function indexes(owners){const word=new Map(),sense=new Map();for(const e of owners){if(e.record?.word_id)word.set(e.record.word_id,e);for(const s of e.record?.senses??[])if(s.sense_id)sense.set(s.sense_id,e);}return{word,sense};}
function externalRefs(r,idx){const own=new Set((r.senses??[]).map(s=>s.sense_id));const out=new Set();for(const v of strings(r)){if(v.startsWith('word:')&&v!==r.word_id&&idx.word.has(v))out.add(v);if(v.startsWith('sense:')&&!own.has(v)&&idx.sense.has(v))out.add(v);}return[...out].sort();}
function depInfo(r,idx){const refs=externalRefs(r,idx);const lines=refs.map(ref=>{const e=ref.startsWith('word:')?idx.word.get(ref):idx.sense.get(ref);return `${ref}\t${e?sha256(stable(e.record)):'MISSING'}`});return{refs,fingerprint:sha256(lines.join('\n'))};}
function malformed(r){const a=[];for(const s of r.senses??[]){if(s.governing_pattern)a.push(s.governing_pattern);for(const c of s.collocations??[])if(c.exam_value==='fixed_pattern'&&c.phrase)a.push(c.phrase);}for(const c of r.constructions??[])a.push(...strings(c));return a.some(x=>/\bto\s+do\s*\+\s*sth\b/i.test(x)||/\+\s*\+/.test(x));}
function relationDetail(t){return /word[- ]family|reciprocal|relation|re-anchor|reanchor|anchor(?:ing)?/i.test(t);}
function addFormFlags(f,r,detail){
  if(r.case_sensitive_identity===true||/[A-Z]/.test(String(r.word??''))||field(r,(k,x)=>/case_sensitive/i.test(k)&&x===true))f.add('FORM_CASE_SENTINEL');
  if(field(r,(k,x)=>/spell|orthograph|variant|alias/i.test(k)&&(Array.isArray(x)?x.length:Boolean(x))))f.add('FORM_SPELLING_SENTINEL');
  if(field(r,(k,x)=>/pronunc|phonetic|ipa|stress/i.test(k)&&(Array.isArray(x)?x.length:Boolean(x))))f.add('FORM_PRONUNCIATION_SENTINEL');
  if(/capitaliz|case-sensitive|proper[- ]name|proper noun/i.test(detail))f.add('FORM_CASE_SENTINEL');
  if(/spelling|orthograph|variant/i.test(detail))f.add('FORM_SPELLING_SENTINEL');
  if(/pronunciation|pronounced|phonetic|heteronym|stress boundary/i.test(detail))f.add('FORM_PRONUNCIATION_SENTINEL');
}
export function routeOwner(e,d,idx){
  const r=e.record,op=normOp(d.operation),detail=(d.detail??[]).join('\n'),f=new Set();
  if(op==='UPGRADE')f.add('PRODUCTION_UPGRADE'); if(op==='BLOCKED')f.add('OWNERSHIP_OR_IDENTITY_SENTINEL'); const headwordCaseVariant=d.word.split('/').map(x=>x.trim()).some(x=>x!==r.word&&x.toLowerCase()===String(r.word??'').toLowerCase()); if(headwordCaseVariant)f.add('FORM_CASE_SENTINEL');
  const senses=(r.senses??[]).filter(active),poses=new Set(senses.map(s=>s.pos).filter(Boolean));
  if(senses.length>1)f.add('MULTI_ACTIVE_SENSE'); if(poses.size>1)f.add('MULTI_POS');
  if((r.constructions??[]).length||senses.some(s=>String(s.governing_pattern??'').trim()||(s.collocations??[]).some(c=>c.exam_value==='fixed_pattern')))f.add('HAS_CONSTRUCTION');
  if(malformed(r))f.add('PRODUCTION_PATTERN_SENTINEL');
  if((r.confusables??[]).length||(r.semantic_neighbors??[]).length)f.add('HAS_CONFUSABLE_OR_CONTRAST');
  const vals=strings(r),relSig=vals.some(x=>x.startsWith('relation:'))||(r.review_signature??[]).some(x=>String(x).includes('relation:')),relMeta=relationDetail(detail);
  if((r.word_family??[]).length||relSig||relMeta)f.add('HAS_WORD_FAMILY_OR_RELATION');
  const dep=depInfo(r,idx); if(dep.refs.length||relSig||relMeta)f.add('HAS_RELATION_REF');
  const lifecycle=field(r,(k,x)=>(/deprecated|reference/i.test(k)&&(Array.isArray(x)?x.length:Boolean(x)))||(['status','lifecycle','state'].includes(k.toLowerCase())&&typeof x==='string'&&/deprecated|reference|retired|inactive/i.test(x)));
  if(lifecycle)f.add('HAS_REFERENCE_OR_DEPRECATED_IDENTITY');
  const cn=coreNonempty(r); if(cn&&!senses.length)f.add('CORE_NONEMPTY_ACTIVE_EMPTY');
  const activeIds=new Set(senses.map(s=>s.sense_id).filter(Boolean)),coreIds=new Set((r.core_concept?.core_clusters??[]).flatMap(c=>c.sense_ids??[]).filter(Boolean));
  if([...coreIds].some(x=>!activeIds.has(x))||(coreIds.size&&senses.filter(s=>s.level==='L1').some(s=>s.sense_id&&!coreIds.has(s.sense_id))))f.add('CORE_ACTIVE_MISMATCH_SENTINEL');
  if(!senses.length&&lifecycle&&cn)f.add('ORDINARY_BRANCH_REFERENCE_ONLY_SENTINEL');
  addFormFlags(f,r,detail);
  if(r.needs_delta_review===true||(r.processing_status&&r.processing_status!=='completed')||senses.some(s=>Number(s.needs_human_review??0)!==0))f.add('OWNERSHIP_OR_IDENTITY_SENTINEL');
  const flags=[...f].sort(),families=[...new Set(flags.map(x=>FLAGS[x]))].sort(),complex=flags.length>0,strata=[];
  if(op==='UPGRADE')strata.push('PRODUCTION_UPGRADE'); if(flags.some(x=>FORM.has(x)))strata.push('FORM_IDENTITY'); if(flags.some(x=>REL.has(x)))strata.push('RELATION_ANCHOR_CORE_SENSE');
  if(op==='NO_CHANGE')strata.push(complex?'COMPLEX_NO_CHANGE':'SIMPLE_NO_CHANGE_CANDIDATE');
  return{ordinal:e.ordinal,word_id:r.word_id,word:r.word,production_operation:op,production_quality:d.quality??null,risk_flags:flags,risk_families:families,machine_min_depth:complex?'AUDIT_COMPLEX':'AUDIT_SIMPLE_CANDIDATE',mandatory_strata:[...new Set(strata)].sort(),owner_hash:sha256(stable(r)),dependency_fingerprint:dep.fingerprint,dependency_refs:dep.refs};
}
export function simpleSample(rows){const a=rows.filter(r=>r.mandatory_strata.includes('SIMPLE_NO_CHANGE_CANDIDATE')).sort((x,y)=>x.ordinal-y.ordinal),n=a.length;if(!n)return[];const k=Math.min(n,Math.max(10,Math.ceil(n*.1)),40);if(k>=n)return a.map(x=>x.ordinal);const ix=[];for(let i=0;i<k;i++)ix.push(Math.round(i*(n-1)/(k-1)));const u=[...new Set(ix)];for(let i=0;u.length<k&&i<n;i++)if(!u.includes(i))u.push(i);return u.sort((x,y)=>x-y).slice(0,k).map(i=>a[i].ordinal);}
function count(rows,fn){const o={};for(const r of rows)for(const k of fn(r))o[k]=(o[k]??0)+1;return Object.fromEntries(Object.entries(o).sort(([a],[b])=>a.localeCompare(b)));}
export function buildManifest({owners,decisions,start,end,sourceHead,handoffs,contracts}){
  const idx=indexes(owners),scope=owners.filter(e=>e.ordinal>=start&&e.ordinal<=end).sort((a,b)=>a.ordinal-b.ordinal),want=end-start+1;
  if(scope.length!==want||new Set(scope.map(e=>e.ordinal)).size!==want)throw Error(`scope coverage mismatch: expected ${want}, found ${scope.length}`);
  const rows=scope.map(e=>{const d=decisions.get(e.ordinal);if(!d)throw Error(`missing handoff o${String(e.ordinal).padStart(4,'0')}`);const handoffNames=d.word.split('/').map(x=>x.trim()),headwordMatched=handoffNames.includes(e.record.word)||handoffNames.some(x=>x.toLowerCase()===e.record.word.toLowerCase());if(!headwordMatched)throw Error(`word mismatch o${String(e.ordinal).padStart(4,'0')}: ${d.word} != ${e.record.word}`);return routeOwner(e,d,idx)});
  const ss=simpleSample(rows),set=new Set(ss);for(const r of rows)r.simple_deep_sample=set.has(r.ordinal);
  const mandatory=rows.filter(r=>r.mandatory_strata.some(s=>s!=='SIMPLE_NO_CHANGE_CANDIDATE'));
  return{schema:'kianos.lexical.semantic_audit_risk_manifest.v1',router_version:ROUTER_VERSION,scope_start:start,scope_end:end,owner_count:rows.length,unique_mandatory_owner_count:mandatory.length,simple_candidate_count:rows.length-mandatory.length,simple_deep_sample_count:ss.length,simple_deep_sample_ordinals:ss,flag_counts:count(rows,r=>r.risk_flags),risk_family_counts:count(rows,r=>r.risk_families),mandatory_strata_counts:count(rows,r=>r.mandatory_strata),source_head:sourceHead,content_contract_blob_sha:gitBlobSha(contracts.content),audit_contract_blob_sha:gitBlobSha(contracts.audit),router_spec_blob_sha:gitBlobSha(contracts.router),production_handoff_blob_shas:handoffs.map(h=>({path:h.path,blob_sha:gitBlobSha(h.text)})),rows};
}
function depSummary(row,idx){return row.dependency_refs.map(ref=>{const e=ref.startsWith('word:')?idx.word.get(ref):idx.sense.get(ref);if(!e)return{ref,missing:true};return{ref,ordinal:e.ordinal,word_id:e.record.word_id,word:e.record.word,referenced_sense:ref.startsWith('sense:')?(e.record.senses??[]).find(s=>s.sense_id===ref)??null:null,core_concept:e.record.core_concept??null};});}
export function buildAuditView(manifest,owners){const idx=indexes(owners),by=new Map(owners.map(e=>[e.ordinal,e]));const meta={type:'meta',schema:'kianos.lexical.semantic_audit_blind_view.v1',router_version:manifest.router_version,scope_start:manifest.scope_start,scope_end:manifest.scope_end,owner_count:manifest.owner_count,source_head:manifest.source_head,content_contract_blob_sha:manifest.content_contract_blob_sha,audit_contract_blob_sha:manifest.audit_contract_blob_sha,router_spec_blob_sha:manifest.router_spec_blob_sha,production_handoff_blob_shas:manifest.production_handoff_blob_shas,note:'Owner-first audit view; production detailed rationale is withheld until Pass B.'};return[meta,...manifest.rows.map(row=>{const e=by.get(row.ordinal);const {verification_summary:_v,content_hash:_h,...owner}=e.record;return{type:'owner',ordinal:row.ordinal,word_id:row.word_id,word:row.word,production_operation:row.production_operation,production_quality:row.production_quality,machine_min_depth:row.machine_min_depth,mandatory_strata:row.mandatory_strata,risk_flags:row.risk_flags,simple_deep_sample:row.simple_deep_sample,owner_hash:row.owner_hash,dependency_fingerprint:row.dependency_fingerprint,owner,dependencies:depSummary(row,idx)}})];}
export const renderManifest=m=>`${JSON.stringify(m,null,2)}\n`;
export const renderAuditView=v=>`${v.map(x=>JSON.stringify(x)).join('\n')}\n`;
function loadOwners(dir){const out=[];for(const name of fs.readdirSync(dir).filter(x=>/^o\d{4}-\d{4}\.json$/.test(x)).sort()){const a=JSON.parse(fs.readFileSync(path.join(dir,name),'utf8'));if(!Array.isArray(a))throw Error(`${name}: expected array`);out.push(...a);}return out;}
function args(argv){const o={handoff:[]};for(let i=0;i<argv.length;i++){const k=argv[i];if(k==='--check'){o.check=true;continue}if(k==='--self-test'){o.selfTest=true;continue}if(!k.startsWith('--'))throw Error(`bad arg ${k}`);const v=argv[++i];if(v==null)throw Error(`missing value ${k}`);if(k==='--handoff')o.handoff.push(v);else o[k.slice(2)]=v;}return o;}
function selfTest(){
  const h='## Decisions\n| Ordinal | Word | Operation | Final quality | Semantic decision |\n|---|---|---|---|---|\n| o0001 | simple | NO_CHANGE | SAFE_SIMPLE | sufficient |\n\n### NO_CHANGE + DEPTH_READY (1)\n`o0002 capacity`.\n\n## UPGRADE decisions\n| Ordinal | Word | Final quality | Semantic decision |\n|---|---|---|---|\n| o0003 | China | DEPTH_READY | Proper-name capitalization identity. |\n';
  const d=mergeHandoffs([parseHandoff(h)]);if(d.size!==3||d.get(2).operation!=='NO_CHANGE'||d.get(3).operation!=='UPGRADE')throw Error('handoff parser self-test failed');
  const base=w=>({processing_status:'completed',core_concept:{core_meaning_en:w,core_clusters:[]},constructions:[],confusables:[],semantic_neighbors:[],word_family:[],review_signature:[]});
  const owners=[{ordinal:1,record:{...base('simple'),word:'simple',word_id:'word:simple',senses:[{sense_id:'sense:simple:1',pos:'noun',level:'L1',collocations:[],governing_pattern:'',needs_human_review:0}]}},{ordinal:2,record:{...base('capacity'),word:'capacity',word_id:'word:capacity',core_concept:{core_meaning_en:'ability',core_clusters:[{sense_ids:['sense:capacity:1']}]},senses:[{sense_id:'sense:capacity:1',pos:'noun',level:'L1',collocations:[{exam_value:'fixed_pattern',phrase:'capacity to do + sth'}],governing_pattern:'',needs_human_review:0}]}},{ordinal:3,record:{...base('country'),word:'China',word_id:'word:china',case_sensitive_identity:true,core_concept:{core_meaning_en:'country',core_clusters:[{sense_ids:['sense:China:1']}]},senses:[{sense_id:'sense:China:1',pos:'proper_noun',level:'L1',collocations:[],governing_pattern:'',needs_human_review:0}]}}];
  const m=buildManifest({owners,decisions:d,start:1,end:3,sourceHead:'x',handoffs:[{path:'h.md',text:h}],contracts:{content:'c',audit:'a',router:'r'}});
  if(m.rows[0].machine_min_depth!=='AUDIT_SIMPLE_CANDIDATE'||!m.rows[1].risk_flags.includes('PRODUCTION_PATTERN_SENTINEL')||!m.rows[2].mandatory_strata.includes('FORM_IDENTITY'))throw Error('routing self-test assertion failed');
  const v=renderAuditView(buildAuditView(m,owners));if(v.includes('Proper-name capitalization identity'))throw Error('blind view leaked production rationale');console.log('PASS semantic-audit-risk-router self-test');
}
function main(){const a=args(process.argv.slice(2));if(a.selfTest)return selfTest();const start=+a.start,end=+a.end;if(!Number.isInteger(start)||!Number.isInteger(end)||start<1||end<start)throw Error('invalid --start/--end');if(!a.handoff.length||!a.output||!a['source-head'])throw Error('require --start --end --source-head --handoff... --output');const root=path.resolve(a['repo-root']??process.cwd()),handoffs=a.handoff.map(p=>({path:p,text:fs.readFileSync(path.resolve(root,p),'utf8')})),decisions=mergeHandoffs(handoffs.map(h=>parseHandoff(h.text,h.path))),owners=loadOwners(path.resolve(root,a['shards-dir']??'content/lexical/canonical/words/shards')),contracts={content:fs.readFileSync(path.resolve(root,'content/lexical/CONTENT_ASSET_CONTRACT.md'),'utf8'),audit:fs.readFileSync(path.resolve(root,'content/lexical/INDEPENDENT_SEMANTIC_AUDIT_CONTRACT.md'),'utf8'),router:fs.readFileSync(path.resolve(root,'content/lexical/SEMANTIC_AUDIT_RISK_ROUTER_SPEC.md'),'utf8')},m=buildManifest({owners,decisions,start,end,sourceHead:a['source-head'],handoffs,contracts}),out=path.resolve(root,a.output),view=a['audit-view-output']?path.resolve(root,a['audit-view-output']):null,mt=renderManifest(m),vt=view?renderAuditView(buildAuditView(m,owners)):null;
  if(a.check){if(!fs.existsSync(out)||fs.readFileSync(out,'utf8')!==mt)throw Error(`stale manifest ${out}`);if(view&&(!fs.existsSync(view)||fs.readFileSync(view,'utf8')!==vt))throw Error(`stale audit view ${view}`);return console.log(`PASS ${path.relative(root,out)} (${m.owner_count} owners)`)}
  fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,mt);if(view){fs.mkdirSync(path.dirname(view),{recursive:true});fs.writeFileSync(view,vt)}console.log(`WROTE ${path.relative(root,out)} (${m.owner_count} owners; ${m.unique_mandatory_owner_count} mandatory; ${m.simple_candidate_count} simple)`);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){try{main()}catch(e){console.error(`semantic-audit-risk-router: ${e.message}`);process.exitCode=1}}
