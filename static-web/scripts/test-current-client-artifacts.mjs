#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { planClientArtifactBuild, buildClientArtifacts, CLIENT_PROOF_FILE, clientBuildContextHash, clientProofDigest } from './currentClientArtifacts.mjs';
const here = path.dirname(fileURLToPath(import.meta.url));
const realWeb = path.resolve(here, '..');
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'kianos-client-proof-test-'));
let checks = 0;
const check = (value, label) => { assert(value, label); checks++; };
function cmd(args, cwd = root, env = {}) { return execFileSync(args[0], args.slice(1), { cwd, env: { ...process.env, ...env }, encoding: 'utf8', timeout: 90000, maxBuffer: 10 * 1024 * 1024 }); }
function write(p, text) { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, text); }
function commit(cwd, message) { cmd(['git','add','.'],cwd);cmd(['git','commit','-qm',message],cwd);return cmd(['git','rev-parse','HEAD'],cwd).trim(); }
try {
 const baseRoot = path.join(root,'base'), baseWeb = path.join(baseRoot,'static-web');
 fs.mkdirSync(baseWeb,{recursive:true});
 cmd(['git','init','-q'],baseRoot);cmd(['git','config','user.name','Artifact test'],baseRoot);cmd(['git','config','user.email','fixture@example.invalid'],baseRoot);
 write(path.join(baseRoot,'.gitignore'),'static-web/node_modules\nstatic-web/dist*\nstatic-web/.astro\nstatic-web/.current*\n');
 write(path.join(root,'external-input.txt'),'immutable external input');
 write(path.join(root,'invalid-utf8.bin'),Buffer.from([0x61,0xff,0x62]));
 write(path.join(baseRoot,'content/input.json'),'{"fixture":true}');
 write(path.join(baseWeb,'package.json'),'{"type":"module"}\n');
 write(path.join(baseWeb,'astro.config.mjs'),`import { defineConfig } from 'astro/config';\nimport { currentClientArtifactsIntegration } from ${JSON.stringify(path.join(here,'currentClientArtifacts.mjs'))};\nexport default defineConfig({output:'static', integrations:[currentClientArtifactsIntegration()], vite:{define:{__KIANOS_RELEASE_SHA__:JSON.stringify(process.env.KIANOS_RELEASE_SHA||'')}}});\n`);
 write(path.join(baseWeb,'src/lib/client.mjs'),"import { key } from './shared.mjs';\nexport function setup() { document.body.dataset.sample = key + ':before'; }\n");
 write(path.join(baseWeb,'src/lib/shared.mjs'),"export const key='client-test';\n");
 write(path.join(baseWeb,'src/lib/server.mjs'),"export const title='Stable fixture';\n");
 write(path.join(baseWeb,'src/pages/index.astro'),`---\nimport { title } from '../lib/server.mjs';\nimport fs from 'node:fs'; fs.appendFileSync(${JSON.stringify(path.join(root,'render-count'))},'render\\n');
fs.readFileSync(${JSON.stringify(path.join(root,'external-input.txt'))}, 'utf8');
fs.readFileSync(${JSON.stringify(path.join(root,'invalid-utf8.bin'))}, 'utf8');
fs.existsSync(${JSON.stringify(path.join(root,'optional-input.txt'))});\n---\n<html data-kianos-release-sha={process.env.KIANOS_RELEASE_SHA}><body><h1>{title}</h1><script>import { setup } from '../lib/client.mjs';setup();</script></body></html>\n`);
 write(path.join(baseWeb,'src/pages/other.astro'),`---\nimport fs from 'node:fs'; fs.appendFileSync(${JSON.stringify(path.join(root,'render-count'))},'render\\n');
fs.readFileSync(${JSON.stringify(path.join(root,'external-input.txt'))}, 'utf8');
fs.readFileSync(${JSON.stringify(path.join(root,'invalid-utf8.bin'))}, 'utf8');
fs.existsSync(${JSON.stringify(path.join(root,'optional-input.txt'))});\n---\n<html data-kianos-release-sha={process.env.KIANOS_RELEASE_SHA}><body>Unchanged<script>import { key } from '../lib/shared.mjs';document.body.dataset.key=key;</script></body></html>\n`);
 fs.symlinkSync(path.join(realWeb,'node_modules'),path.join(baseWeb,'node_modules'),'dir');
 write(path.join(baseWeb,'src/lib/raw.mjs'),'original raw source');
 const pageFile=path.join(baseWeb,'src/pages/index.astro');
 write(pageFile,fs.readFileSync(pageFile,'utf8').replace('<script>',"<script>import rawText from '../lib/raw.mjs?raw';document.body.dataset.raw=rawText;"));
 const baseSha=commit(baseRoot,'base');
 console.log('fixture: full-build baseline');
 console.log(cmd([process.execPath,path.join(realWeb,'node_modules/astro/astro.js'),'build'],baseWeb,{KIANOS_RELEASE_SHA:baseSha,KIANOS_BUILD_CONTEXT_HASH:clientBuildContextHash(process.env,fs.realpathSync(baseRoot))}).slice(-1400));
 const proof=JSON.parse(fs.readFileSync(path.join(baseWeb,CLIENT_PROOF_FILE),'utf8'));
 check(proof.clientSources.includes('static-web/src/lib/client.mjs'),'client graph records actual source');
 check(!proof.serverSources.includes('static-web/src/lib/client.mjs'),'pure-client source excluded from server graph');
 check(proof.serverSources.includes('static-web/src/lib/server.mjs'),'server graph records actual source');
 write(path.join(baseWeb,'dist/__kianos-current.json'),JSON.stringify({state:'synced',sha:baseSha,client_proof_sha256:clientProofDigest(baseWeb)}));
 const targetRoot=path.join(root,'target'),webRoot=path.join(targetRoot,'static-web');
 cmd(['git','clone','-q',baseRoot,targetRoot]);
 cmd(['git','config','user.name','Artifact test'],targetRoot);cmd(['git','config','user.email','fixture@example.invalid'],targetRoot);
 fs.symlinkSync(path.join(realWeb,'node_modules'),path.join(webRoot,'node_modules'),'dir');
 const client=path.join(webRoot,'src/lib/client.mjs');write(client,fs.readFileSync(client,'utf8').replace(':before',':after'));
 const targetSha=commit(targetRoot,'real client-only edit');
 const opts={baseWebRoot:baseWeb,webRoot,targetSha,outDir:path.join(webRoot,'dist-incremental')};
 let p=planClientArtifactBuild(opts);console.log('fixture: admission',p.eligible,p.reason);
 check(p.eligible,'client-only admitted');
 const rendersBefore=fs.readFileSync(path.join(root,'render-count'),'utf8');
 const result=await buildClientArtifacts(opts);
 check(fs.readFileSync(path.join(root,'render-count'),'utf8')===rendersBefore,'render execution counter unchanged');
 console.log('fixture: incremental result',JSON.stringify(result));
 check(result.prerendered===false,'no server routes executed');
 check(fs.readFileSync(path.join(opts.outDir,'index.html'),'utf8').includes(targetSha),'identity updated');
 console.log('fixture: equivalent full-build oracle');
 cmd([process.execPath,path.join(realWeb,'node_modules/astro/astro.js'),'build'],webRoot,{KIANOS_RELEASE_SHA:targetSha,KIANOS_BUILD_CONTEXT_HASH:clientBuildContextHash(process.env,fs.realpathSync(targetRoot))});
 function list(dir,prefix=''){return fs.readdirSync(path.join(dir,prefix),{withFileTypes:true}).flatMap(e=>e.isDirectory()?list(dir,prefix+e.name+'/'):[prefix+e.name]).sort().filter(p=>p!=='__kianos-current.json');}
 const names=list(path.join(webRoot,'dist'));
 check(JSON.stringify(list(opts.outDir))===JSON.stringify(names),'exact file inventory equals full build');
 for(const name of names)check(fs.readFileSync(path.join(opts.outDir,name)).equals(fs.readFileSync(path.join(webRoot,'dist',name))),'full-build byte parity: '+name);

 const deny = (expected, overrides={}) => { const got=planClientArtifactBuild({...opts,...overrides});check(!got.eligible && got.reason.includes(expected),'fallback reason '+expected+': '+got.reason); };
 write(path.join(root,'external-input.txt'),'changed input');deny('render-input-changed');write(path.join(root,'external-input.txt'),'immutable external input');
 write(path.join(root,'optional-input.txt'),'now present');deny('render-input-existence-changed');fs.unlinkSync(path.join(root,'optional-input.txt'));
 process.env.KIANOS_TEST_CONTEXT_DRIFT='1';deny('build-context-changed');delete process.env.KIANOS_TEST_CONTEXT_DRIFT;
 const receiptPath=path.join(baseWeb,CLIENT_PROOF_FILE), receiptBytes=fs.readFileSync(receiptPath);
 fs.appendFileSync(receiptPath,' ');deny('base-proof-integrity');fs.writeFileSync(receiptPath,receiptBytes);
 fs.renameSync(receiptPath,receiptPath+'.held');deny('ENOENT');fs.renameSync(receiptPath+'.held',receiptPath);
 deny('target-not-clean',{targetSha:baseSha});

 const original=fs.readFileSync(path.join(baseWeb,'dist/index.html'));
 fs.appendFileSync(path.join(baseWeb,'dist/index.html'),'corrupt');deny('base-artifact-drift');fs.writeFileSync(path.join(baseWeb,'dist/index.html'),original);
 const server=path.join(webRoot,'src/lib/server.mjs');fs.appendFileSync(server,'\n// dirty');deny('target-not-clean');cmd(['git','checkout','--','static-web/src/lib/server.mjs'],targetRoot);
 write(server,"export const title='changed server';\n");const mixedSha=commit(targetRoot,'mixed server edit');deny('not-proven-client-only',{targetSha:mixedSha});
 cmd(['git','checkout','--detach',targetSha],targetRoot);
 write(path.join(webRoot,'src/lib/raw.mjs'),'changed raw source');
 const rawSha=commit(targetRoot,'change file compiled through a cached raw wrapper');
 deny('frozen-virtual-source',{targetSha:rawSha});
 console.log(JSON.stringify({status:'PASS',checks,artifact_ms:result.durationMs,unrelated_prerenders:0}));
} finally { delete process.env.FORBID_PRERENDER; if (process.env.KIANOS_KEEP_CLIENT_FIXTURE==='1') console.log('FIXTURE_RETAINED',root); else fs.rmSync(root,{recursive:true,force:true}); }
