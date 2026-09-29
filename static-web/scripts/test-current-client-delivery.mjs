#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

// Exercise the real Current supervisor, not a substitute incremental dispatcher.
// Only the served fixture is synthetic; production private state is unreachable.
const scripts = path.dirname(fileURLToPath(import.meta.url));
const sourceWeb = path.resolve(scripts, '..');
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'kianos-client-current-'));
const upstream = path.join(temp, 'upstream'), mirror = path.join(temp, 'mirror');
const remote = path.join(temp, 'remote.git'), releases = path.join(temp, 'releases');
const calls = path.join(temp, 'full-build-calls'), renders = path.join(temp, 'render-calls');
let checks = 0;
const check = (value, label) => { assert(value, label); checks++; };
const git = (cwd, ...args) => execFileSync('git', args, {cwd, encoding:'utf8',stdio:['ignore','pipe','pipe'], timeout:15000}).trim();
const write = (relative, bytes) => { const file=path.join(upstream,relative);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,bytes); };
try {
  fs.mkdirSync(upstream);git(upstream,'init','-b','main');git(upstream,'config','user.name','Delivery fixture');git(upstream,'config','user.email','fixture@example.invalid');
  for (const name of ['kianos-current-sync.mjs','currentRelease.mjs','currentStaticImpact.mjs','currentStaticSlots.mjs','currentDependencies.mjs','currentClientArtifacts.mjs','kianos-safe-astro-build.mjs']) write('static-web/scripts/'+name,fs.readFileSync(path.join(scripts,name)));
  write('.gitignore','static-web/node_modules\nstatic-web/.astro\nstatic-web/dist\nstatic-web/.current-*\nstatic-web/public/\n');
  write('static-web/package.json',JSON.stringify({type:'module',scripts:{'build:astro':'node scripts/kianos-safe-astro-build.mjs'}}));
  write('static-web/astro.config.mjs',`import {defineConfig} from 'astro/config';import {currentClientArtifactsIntegration} from './scripts/currentClientArtifacts.mjs';export default defineConfig({output:'static',integrations:[currentClientArtifactsIntegration()]});`);
  write('static-web/src/lib/client.mjs',`import {key} from './shared.mjs';export function run(){document.body.dataset.proof=key+':before';}`);
  write('static-web/src/lib/shared.mjs',`export const key='current-client';`);
  write('static-web/src/pages/index.astro',`---\nimport fs from 'node:fs';fs.appendFileSync(${JSON.stringify(renders)},'index\\n');\n---\n<html data-kianos-release-sha={process.env.KIANOS_RELEASE_SHA}><body>Current fixture<script>import {run} from '../lib/client.mjs';run();</script></body></html>`);
  write('static-web/src/pages/sibling.astro',`---\nimport fs from 'node:fs';fs.appendFileSync(${JSON.stringify(renders)},'sibling\\n');\n---\n<html data-kianos-release-sha={process.env.KIANOS_RELEASE_SHA}><body>Sibling<script>import {key} from '../lib/shared.mjs';document.body.dataset.key=key;</script></body></html>`);
  write('static-web/scripts/kianos-static-server.mjs',`import fs from 'node:fs';import path from 'node:path';import http from 'node:http';const args=process.argv.slice(2),root=args[args.indexOf('--root')+1];http.createServer((req,res)=>{if(req.url.startsWith('/__kianos-release.json'))return res.end(fs.readFileSync(path.join(root,'__kianos-current.json')));res.end('fixture');}).listen(+process.env.KIANOS_PORT,'127.0.0.1');`);
  const commit = label => { git(upstream,'add','.');git(upstream,'commit','-m',label);return git(upstream,'rev-parse','HEAD'); };
  const baseSha=commit('full baseline');git(temp,'clone','--bare',upstream,remote);git(upstream,'remote','add','origin',remote);git(temp,'clone',remote,mirror);fs.writeFileSync(path.join(mirror,'.git/kianos-current-mirror'),'');
  const npm=path.join(temp,'npm-fixture.mjs');
  fs.writeFileSync(npm,`#!${process.execPath}\nimport fs from 'node:fs';import {spawnSync} from 'node:child_process';import {cloneDependencies} from ${JSON.stringify(path.join(scripts,'currentDependencies.mjs'))};if(process.argv[2]==='install'){cloneDependencies(${JSON.stringify(sourceWeb)},process.cwd());process.exit(0);}fs.appendFileSync(${JSON.stringify(calls)},'full\\n');const i=process.argv.indexOf('--outDir');const p=spawnSync(process.execPath,['scripts/kianos-safe-astro-build.mjs','--outDir',process.argv[i+1]],{stdio:'inherit',env:process.env});process.exit(p.status??1);\n`);fs.chmodSync(npm,0o755);
  // A second Node on PATH must not split the supervisor/compiler identity.
  const decoyDir=path.join(temp,'wrong-node'),decoyCalls=path.join(temp,'wrong-node-calls');
  fs.mkdirSync(decoyDir);fs.writeFileSync(path.join(decoyDir,'node'),'#!/bin/sh\necho wrong >> '+JSON.stringify(decoyCalls)+'\nexit 94\n');fs.chmodSync(path.join(decoyDir,'node'),0o755);
  const env={...process.env,PATH:decoyDir+path.delimiter+process.env.PATH,KIANOS_SYNC_ONCE:'1',KIANOS_NPM_BIN:npm,KIANOS_BUILD_NICE:'0',KIANOS_RELEASES_DIR:releases,KIANOS_SUBPROCESS_TIMEOUT_MS:'90000',KIANOS_CONTROL_ENABLED:'0',KIANOS_PACKET_RELAY_ENABLED:'0'};
  const run = () => { const t=performance.now();const out=execFileSync(process.execPath,['static-web/scripts/kianos-current-sync.mjs'],{cwd:mirror,env,encoding:'utf8',timeout:100000,maxBuffer:8*1024*1024}); console.log(out.split('\n').filter(x=>/client-only|complete build required|synced .*static Current/.test(x)).join('\n'));return Math.round(performance.now()-t); };
  const status=()=>JSON.parse(fs.readFileSync(path.join(mirror,'static-web/public/__kianos-current.json'),'utf8'));
  console.log('Current fixture: bootstrap');const fullMs=run();
  check(status().state==='synced'&&status().sha===baseSha,'baseline really activated');
  const baseHtml=fs.readFileSync(path.join(releases,'releases',baseSha,'static-web/dist/index.html'));
  const renderBefore=fs.readFileSync(renders,'utf8');
  write('static-web/src/lib/client.mjs',`import {key} from './shared.mjs';export function run(){document.body.dataset.proof=key+':after';}`);
  const targetSha=commit('client-only delta');git(upstream,'push','origin','main');
  console.log('Current fixture: automatic client delivery');const incrementalMs=run();
  const receipt=status();
  check(receipt.state==='synced'&&receipt.sha===targetSha,'target really activated');
  check(receipt.static_build==='client-artifacts','native supervisor chose fast lane');
  check(receipt.artifact_base_sha===baseSha,'reuse provenance retained');
  check(fs.readFileSync(calls,'utf8').trim().split('\n').length===1,'only bootstrap invoked Astro');
  check(fs.readFileSync(renders,'utf8')===renderBefore,'no sibling or primary prerender on client update');
  check(fs.readFileSync(path.join(releases,'releases',baseSha,'static-web/dist/index.html')).equals(baseHtml),'old release bytes preserved');
  check(fs.realpathSync(path.join(releases,'active'))===fs.realpathSync(path.join(releases,'releases',targetSha)),'atomic active pointer correct');
  check(fs.realpathSync(path.join(releases,'previous'))===fs.realpathSync(path.join(releases,'releases',baseSha)),'last known good preserved');
  fs.appendFileSync(path.join(releases,'releases',targetSha,'static-web/dist/index.html'),'corrupt-base');
  write('static-web/src/lib/client.mjs',`import {key} from './shared.mjs';export function run(){document.body.dataset.proof=key+':recovered';}`);
  const recovered=commit('next client delta');git(upstream,'push','origin','main');
  console.log('Current fixture: corrupt base must fall back');run();
  check(status().sha===recovered&&status().static_build==='rebuilt','corrupt proof falls back and promotes complete build');
  check(fs.readFileSync(calls,'utf8').trim().split('\n').length===2,'one bounded full fallback');
  check(!fs.existsSync(decoyCalls),'compiler consistently used supervisor Node, not ambient PATH Node');
  console.log(JSON.stringify({status:'PASS',checks,bootstrap_ms:fullMs,client_delivery_ms:incrementalMs,client_update_prerenders:0}));
} finally { if(process.env.KIANOS_KEEP_CLIENT_FIXTURE==='1')console.log('CURRENT_FIXTURE_RETAINED',temp);else fs.rmSync(temp,{recursive:true,force:true}); }
