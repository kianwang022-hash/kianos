import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {publishPrivateControlCommand,readPrivateControlCurrent} from './privateControlStore.mjs';
const root=fs.mkdtempSync(path.join(os.tmpdir(),'control-identities-'));
const make=(id,minute)=>({schema:'kianos.control-command.v1',command_id:id,study_day:'2026-09-30',generated_at:`2026-09-30T00:${String(minute).padStart(2,'0')}:00Z`,expires_at:null,operations:[{kind:'exam.chat_plan',payload:{schema:'kianos.exam.chat-plan.v1',study_day:'2026-09-30',generated_at:`2026-09-30T00:${String(minute).padStart(2,'0')}:00Z`,subjects:{xizong:null,english:null,politics:null},next_subject:null,attention:null}}]});
const opts={privateDir:path.join(root,'control'),generatedDir:path.join(root,'generated')};
try{
 const a=make('identity-source-A',1),b=make('identity-source-B',2),reused=make('identity-source-A',3);
 assert.equal(publishPrivateControlCommand(a,opts).status,'published');
 assert.equal(publishPrivateControlCommand(a,opts).status,'idempotent');
 assert.equal(publishPrivateControlCommand(b,opts).status,'published');
 const before=readPrivateControlCurrent(opts.privateDir);
 assert.throws(()=>publishPrivateControlCommand(reused,opts),/COMMAND_ID_CONFLICT/);
 assert.deepEqual(readPrivateControlCurrent(opts.privateDir),before);
 const source=JSON.parse(fs.readFileSync(path.join(opts.privateDir,'source.json'),'utf8'));
 assert.equal(Object.keys(source.issued_command_hashes).length,2);
 assert.throws(()=>publishPrivateControlCommand(a,opts),/OLDER_COMMAND/);
 // A legacy source knows only its current identity; next use preserves that
 // known identity without pretending earlier unseen history was reconstructed.
 delete source.issued_command_hashes;fs.writeFileSync(path.join(opts.privateDir,'source.json'),JSON.stringify(source));
 publishPrivateControlCommand(make('identity-source-C',4),opts);
 assert.throws(()=>publishPrivateControlCommand(make('identity-source-B',5),opts),/COMMAND_ID_CONFLICT/);
 const broken=JSON.parse(fs.readFileSync(path.join(opts.privateDir,'source.json'),'utf8'));broken.issued_command_hashes=[];
 fs.writeFileSync(path.join(opts.privateDir,'source.json'),JSON.stringify(broken));
 assert.throws(()=>publishPrivateControlCommand(make('identity-source-D',6),opts),/IDENTITY_WITNESS_INVALID/);
 console.log('PASS source identity: A-B-A conflict, exact retry, restart witness, legacy seeding, corrupted witness fail-closed');
}finally{fs.rmSync(root,{recursive:true,force:true});}
