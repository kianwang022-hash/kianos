#!/usr/bin/env node
import assert from 'node:assert/strict';
import { fixtureReleaseRoot } from './test-support/release-fixture.mjs';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const scripts=path.dirname(fileURLToPath(import.meta.url)),root=fs.mkdtempSync(path.join(os.tmpdir(),'kianos-retention-')),u=path.join(root,'u'),r=path.join(root,'r.git'),m=path.join(root,'m');
const git=(c,...a)=>execFileSync('git',a,{cwd:c,encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim(), run=(npm)=>spawnSync(process.execPath,['static-web/scripts/kianos-current-sync.mjs'],{cwd:m,env:{...process.env,KIANOS_SYNC_ONCE:'1',KIANOS_NPM_BIN:npm,KIANOS_BUILD_NICE:'0'},encoding:'utf8'});
try { fs.mkdirSync(u);git(u,'init','-b','main');git(u,'config','user.email','x@y');git(u,'config','user.name','x');const w=(f,x)=>{fs.mkdirSync(path.dirname(path.join(u,f)),{recursive:true});fs.writeFileSync(path.join(u,f),x)};for(const n of ['kianos-current-sync.mjs','currentRelease.mjs','currentStaticImpact.mjs','currentStaticSlots.mjs','currentDependencies.mjs', 'currentClientArtifacts.mjs'])w('static-web/scripts/'+n,fs.readFileSync(path.join(scripts,n)));w('static-web/package.json','{}');w('.gitignore','static-web/public/\nstatic-web/dist\nstatic-web/.current-*\n');w('static-web/scripts/kianos-static-server.mjs',`import fs from 'node:fs';import http from 'node:http';import path from 'node:path';const args=process.argv.slice(2),root=args[args.indexOf('--root')+1];http.createServer((req,res)=>{if(req.url.startsWith('/__kianos-release.json'))return res.end(fs.readFileSync(path.join(root,'__kianos-current.json')));res.end('fixture');}).listen(+process.env.KIANOS_PORT,'127.0.0.1');`);w('v','A');git(u,'add','.');git(u,'commit','-m','A');const a=git(u,'rev-parse','HEAD');git(root,'clone','--bare',u,r);git(u,'remote','add','origin',r);git(root,'clone',r,m);fs.writeFileSync(path.join(m,'.git/kianos-current-mirror'),'');const npm=path.join(root,'npm');fs.writeFileSync(npm,'#!/bin/sh\nif [ "$1" = install ]; then mkdir -p "$PWD/node_modules/.bin"; : > "$PWD/node_modules/.bin/astro"; exit 0; fi\nwhile [ "$#" != 0 ];do [ "$1" = --outDir ]&&{ shift;mkdir -p "$1";echo ok>"$1/index.html";exit;};shift;done\n');fs.chmodSync(npm,493);
  const rel=path.join(root,'.kianos-current-releases/releases');const unknown=path.join(rel,'unknown-private-fixture');fs.mkdirSync(unknown,{recursive:true});fs.writeFileSync(path.join(unknown,'partial'),'unique');assert.equal(run(npm).status,0,'partial release must be rebuilt');assert.equal(fs.existsSync(path.join(fixtureReleaseRoot(rel,a),'static-web/dist/__kianos-current.json')),true,'partial release was incorrectly accepted'); for(const v of ['B','C']){w('v',v);git(u,'add','v');git(u,'commit','-m',v);git(u,'push','origin','main');assert.equal(run(npm).status,0)} const c=git(u,'rev-parse','HEAD'), b=git(u,'rev-parse','HEAD~1');assert.equal(fs.realpathSync(path.join(root,'.kianos-current-releases/active')),fs.realpathSync(fixtureReleaseRoot(rel,c)));assert.equal(fs.realpathSync(path.join(root,'.kianos-current-releases/previous')),fs.realpathSync(fixtureReleaseRoot(rel,b)));assert.equal(git(m,'worktree','list','--porcelain').includes(path.join(rel,a)),false);assert.equal(fs.readFileSync(path.join(unknown,'partial'),'utf8'),'unique','unregistered bytes must be preserved');console.log('CURRENT_RELEASE_RETENTION PASS: invalid candidates rejected and only active/previous worktrees retained');
} finally {fs.rmSync(root,{recursive:true,force:true});}

{
// Isolated failing-probe chain: never uses Current/learner state.
const root=fs.mkdtempSync(path.join(os.tmpdir(),'kianos-failed-retention-'));
const u=path.join(root,'u'),r=path.join(root,'r.git'),m=path.join(root,'m'),health=path.join(root,'healthy');
const git=(cwd,...a)=>execFileSync('git',a,{cwd,encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();

try {
 fs.mkdirSync(u);git(u,'init','-b','main');git(u,'config','user.email','fixture@example.invalid');git(u,'config','user.name','Fixture');
 const w=(f,x)=>{fs.mkdirSync(path.dirname(path.join(u,f)),{recursive:true});fs.writeFileSync(path.join(u,f),x)};
 for(const n of ['kianos-current-sync.mjs','currentRelease.mjs','currentStaticImpact.mjs','currentStaticSlots.mjs','currentDependencies.mjs','currentClientArtifacts.mjs'])w('static-web/scripts/'+n,fs.readFileSync(path.join(scripts,n)));
 w('static-web/package.json','{}');w('.gitignore','static-web/public/\nstatic-web/dist\nstatic-web/node_modules/\nstatic-web/.current-*\n');
 w('static-web/scripts/kianos-static-server.mjs',`import fs from 'node:fs';import http from 'node:http';import path from 'node:path';const args=process.argv.slice(2),root=args[args.indexOf('--root')+1];http.createServer((req,res)=>res.end(fs.existsSync(process.env.KIANOS_FIXTURE_HEALTH)?fs.readFileSync(path.join(root,'__kianos-current.json')):'{"sha":"wrong"}')).listen(+process.env.KIANOS_PORT,'127.0.0.1');`);
 w('v','A');git(u,'add','.');git(u,'commit','-m','A');const a=git(u,'rev-parse','HEAD');git(root,'clone','--bare',u,r);git(u,'remote','add','origin',r);git(root,'clone',r,m);fs.writeFileSync(path.join(m,'.git/kianos-current-mirror'),'');
 const npm=path.join(root,'npm');fs.writeFileSync(npm,'#!/bin/sh\nif [ "$1" = install ]; then mkdir -p "$PWD/node_modules/.bin"; : > "$PWD/node_modules/.bin/astro"; exit 0; fi\nwhile [ "$#" != 0 ];do [ "$1" = --outDir ]&&{ shift;mkdir -p "$1";echo ok>"$1/index.html";exit;};shift;done\n');fs.chmodSync(npm,0o755);
 const run=(extra={})=>spawnSync(process.execPath,['static-web/scripts/kianos-current-sync.mjs'],{cwd:m,env:{...process.env,KIANOS_SYNC_ONCE:'1',KIANOS_NPM_BIN:npm,KIANOS_BUILD_NICE:'0',KIANOS_FIXTURE_HEALTH:health,...extra},encoding:'utf8',timeout:30000});
 fs.writeFileSync(health,'ready');let result=run();assert.equal(result.status,0,result.stderr);fs.unlinkSync(health);
 const releases=path.join(root,'.kianos-current-releases/releases');
 const active=path.join(root,'.kianos-current-releases/active');
 const buildCount=()=>fs.readFileSync(path.join(root,'build-count'),'utf8').trim().split('\n').length;
 // Count actual builds separately from install, without changing build context.
 const originalNpm=fs.readFileSync(npm,'utf8');
 fs.writeFileSync(npm,originalNpm.replace('while [', 'echo build >> "'+path.join(root,'build-count')+'"\nwhile ['));
 const commit=(v)=>{w('v',v);git(u,'add','v');git(u,'commit','-m',v);git(u,'push','origin','main');return git(u,'rev-parse','HEAD')};
 const b=commit('B');result=run();assert.notEqual(result.status,0);assert.match(result.stderr,/CURRENT_RELEASE_RUNTIME_NOT_READY:sha-mismatch/);
 // A safe sibling path can result from preserving an occupied/locked base.
 const generatedB=fixtureReleaseRoot(releases,b),pending=generatedB+'-00000000-0000-0000-0000-000000000001';
 git(m,'worktree','move',generatedB,pending);
 const sentinel=path.join(pending,'static-web/dist/user-note.txt');
 fs.writeFileSync(sentinel,'unique synthetic user bytes');
 const receipt=path.join(pending,'static-web/dist/__kianos-current.json'),receiptTime=fs.statSync(receipt).mtimeMs;
 const c=commit('C');result=run();assert.notEqual(result.status,0);
 assert.equal(fs.readdirSync(releases).filter(name=>!name.startsWith(a+'-')).length,1,'different-SHA failures must not accumulate a second verified candidate');
 assert.match(result.stderr,/CURRENT_PENDING_RELEASE_BLOCKED/);
 const d=commit('D');result=run();
 assert.notEqual(result.status,0);
 const inactive=()=>fs.readdirSync(releases).filter(name=>!name.startsWith(a+'-'));
 assert.equal(inactive().length,1,'different-SHA failures must not accumulate a second verified candidate');
 assert.match(result.stderr,/CURRENT_PENDING_RELEASE_BLOCKED/);
 assert.equal(buildCount(),1,'guard must run before checkout/install/build');
 assert.equal(fs.readFileSync(sentinel,'utf8'),'unique synthetic user bytes');
 assert.equal(fs.realpathSync(active),fs.realpathSync(fixtureReleaseRoot(releases,a)));
 assert.equal(git(m,'rev-parse','HEAD'),a,'blocked target must preserve the control checkout');
 const status=JSON.parse(fs.readFileSync(path.join(m,'static-web/public/__kianos-current.json')));
 assert.equal(status.target_sha,d);assert.match(status.error,/CURRENT_PENDING_RELEASE_BLOCKED/);
 // Same SHA under another context cannot borrow the pending artifact or build another.
 git(u,'push','--force','origin',b+':main');
 result=run({KIANOS_FIXTURE_DIFFERENT_CONTEXT:'1'});assert.notEqual(result.status,0);assert.match(result.stderr,/CURRENT_PENDING_RELEASE_BLOCKED/);
 assert.equal(buildCount(),1);assert.equal(inactive().length,1);
 // Existing multiple pending candidates are not cleaned or incremented. Use real
 // registered worktrees/receipts, then retain their exact ignored sentinel bytes.
 const existing=[];
 for(const sha of [c,d]) {
   const bReceipt=JSON.parse(fs.readFileSync(receipt));const dir=path.join(releases,sha+'-'+bReceipt.contextHash);
   git(m,'worktree','add','--detach',dir,sha);fs.mkdirSync(path.join(dir,'static-web/dist'),{recursive:true});
   fs.writeFileSync(path.join(dir,'static-web/dist/index.html'),'fixture');
   fs.writeFileSync(path.join(dir,'static-web/dist/__kianos-current.json'),JSON.stringify({...bReceipt,sha}));
   fs.writeFileSync(path.join(dir,'static-web/dist/user-note.txt'),'preserve '+sha);existing.push(dir);
 }
 git(u,'push','--force','origin',d+':main');
 result=run({KIANOS_FIXTURE_DIFFERENT_CONTEXT:'2'});assert.notEqual(result.status,0);assert.match(result.stderr,/CURRENT_PENDING_RELEASE_BLOCKED/);
 assert.equal(inactive().length,3);assert.equal(buildCount(),1);
 for(const dir of existing)assert.ok(fs.readFileSync(path.join(dir,'static-web/dist/user-note.txt'),'utf8').startsWith('preserve '));
 // Recovery must also preserve pre-existing accumulated candidates; reusing an
 // exact artifact is not permission to prune their ignored user bytes.
 git(u,'push','--force','origin',b+':main');fs.writeFileSync(health,'ready');
 result=run();assert.equal(result.status,0,result.stderr);assert.equal(buildCount(),1,'same-SHA/context recovery must reuse the single build');
 assert.equal(fs.statSync(receipt).mtimeMs,receiptTime);assert.equal(fs.readFileSync(sentinel,'utf8'),'unique synthetic user bytes');
 assert.equal(fs.realpathSync(active),fs.realpathSync(pending));
 assert.equal(inactive().length,3);
 for(const dir of existing)assert.ok(fs.readFileSync(path.join(dir,'static-web/dist/user-note.txt'),'utf8').startsWith('preserve '));
 console.log('CURRENT_FAILED_CANDIDATE_GUARD PASS: no new different-SHA/context candidate; ignored bytes/LKG preserved; legacy accumulation frozen; same artifact recovers without rebuild');
} finally {fs.rmSync(root,{recursive:true,force:true});}

}
