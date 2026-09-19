import fs from 'node:fs';
import path from 'node:path';
import {spawn,execFileSync} from 'node:child_process';
import {transform} from '../../static-web/node_modules/@astrojs/compiler/dist/node/index.js';
const root=path.resolve(import.meta.dirname,'../..'),out=path.resolve(process.env.ENGLISH_AUDIT_DIR||path.join(root,'.qa/english-final'));
fs.mkdirSync(out,{recursive:true});
const env={...process.env,KIANOS_REPO_ROOT:root,ENGLISH_AUDIT_DIR:out,ENGLISH_AUDIT_OUTPUT:path.join(out,'core-repair-model-attacks.json'),ENGLISH_AUDIT_BASE:'http://127.0.0.1:4439'};
function run(file){return new Promise((resolve,reject)=>{const stream=fs.openSync(path.join(out,path.basename(file)+'.log'),'w');const child=spawn(process.execPath,[file],{cwd:root,env,stdio:['ignore',stream,stream]});child.once('error',reject);child.once('exit',code=>{fs.closeSync(stream);code===0?resolve():reject(new Error(file+' failed; see artifact log'));});});}
let server;
try{
 const compile=[];
 for(const file of fs.readdirSync(path.join(root,'static-web/src/components')).filter(f=>/^(Reading|Cloze|Translation|Writing|English|Objective|Vocabulary).*\.astro$/.test(f))){await transform(fs.readFileSync(path.join(root,'static-web/src/components',file),'utf8'),{filename:file});compile.push(file);}
 fs.writeFileSync(path.join(out,'astro-compile.json'),JSON.stringify({platform:process.platform,files:compile,status:'PASS'},null,2));
 for(const file of ['model-attacks.mjs','adversarial-attacks.mjs','delivery-recovery-attacks.mjs','prepare-browser-fixtures.mjs'])await run('tools/english-final/'+file);
 const fd=fs.openSync(path.join(out,'astro.log'),'w');server=spawn(process.execPath,['node_modules/astro/astro.js','dev','--host','127.0.0.1','--port','4439'],{cwd:root+'/static-web',env,stdio:['ignore',fd,fd]});
 let ready=false;for(let i=0;i<120;i++){try{const r=await fetch(env.ENGLISH_AUDIT_BASE+'/english/');if(r.ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,500));}if(!ready)throw new Error('Audit dev server unavailable');
 for(const file of ['browser-attacks.mjs','deep-browser-attacks.mjs','bridge-browser-attacks.mjs'])await run('tools/english-final/'+file);
 const resultFiles=['core-repair-model-attacks.json','adversarial-attacks.json','delivery-recovery-attacks.json','browser-attacks.json','deep-browser-attacks.json','bridge-browser-attacks.json'];
 const reports=resultFiles.map(f=>JSON.parse(fs.readFileSync(path.join(out,f),'utf8')));const checks=reports.flatMap(r=>{const rows=r.checks||r.results;if(!Array.isArray(rows))throw new Error('Missing executed checks in result');return rows;});
 fs.writeFileSync(path.join(out,'summary.json'),JSON.stringify({platform:process.platform,head:execFileSync('git',['rev-parse','HEAD'],{cwd:root}).toString().trim(),synthetic_learner_evidence_only:true,checks:checks.length,failed:checks.filter(c=>c.status!=='PASS'),known_shared_blockers:reports.flatMap(r=>r.known_shared_blockers||[]),inventory:reports.find(r=>r.inventory)?.inventory,mac_human_gate:'NOT_REPLACED_BY_RUNNER',learner_U:'UNTESTED'},null,2));
 console.log(`English independent audit: ${checks.length} checks on ${process.platform}; known shared/source/Human Gate limits remain explicit.`);
}finally{
 if(server)server.kill('SIGTERM');
 execFileSync(process.execPath,['tools/english-final/prepare-browser-fixtures.mjs','--clean'],{cwd:root,env});
}
