import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync, spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export function fixture() {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'codex-watcher-'));
  const repo = path.join(temp, 'repo'), bin = path.join(temp, 'bin'), stateDir = path.join(temp, 'state');
  const files = Object.fromEntries(['issues', 'prs', 'comments', 'calls', 'pid'].map((key) => [key, path.join(temp, key + '.json')]));
  fs.mkdirSync(repo); fs.mkdirSync(bin); fs.mkdirSync(stateDir);
  execFileSync('git', ['init', '-b', 'main'], { cwd: repo, stdio: 'ignore' });
  execFileSync('git', ['remote', 'add', 'origin', 'https://github.com/kianwang022-hash/kianos.git'], { cwd: repo });
  for (const key of ['issues', 'prs', 'comments', 'calls']) fs.writeFileSync(files[key], '[]');
  const gh = path.join(bin, 'gh');
  fs.writeFileSync(gh, '#!' + process.execPath + '\n' + `
const fs = require('fs');
const a = process.argv.slice(2);
const read = k => JSON.parse(fs.readFileSync(process.env['TEST_' + k]));
const out = v => process.stdout.write(JSON.stringify(v));
const mode = process.env.TEST_GH_MODE;
if (a[0] === 'issue' && a[1] === 'list') {
  if (mode === 'deny') process.exit(1);
  if (mode === 'hang') { setInterval(() => {}, 1000); return; }
  out(read('ISSUES')); return;
}
if (a[0] === 'issue' && a[1] === 'view') { out({...read('ISSUES').find(i => i.number === Number(a[2])), state:'OPEN'}); return; }
if (a[0] === 'pr' && a[1] === 'list') { out(read('PRS')); return; }
if (a[0] === 'pr' && a[1] === 'view') { out({state:'OPEN',headRefName:'codex/issue701-proof',headRefOid:'a'.repeat(40),baseRefName:'main'}); return; }
if (a[0] === 'api' && a.includes('POST')) {
  if (mode === 'write-denied') process.exit(1);
  const body = JSON.parse(fs.readFileSync(a[a.indexOf('--input') + 1])).body;
  const comments = read('COMMENTS'); const item = {id:comments.length + 1,body};
  comments.push(item); fs.writeFileSync(process.env.TEST_COMMENTS, JSON.stringify(comments));
  if (mode === 'lost-response') process.exit(1);
  out(item); return;
}
if (a[0] === 'api') {
  const item = read('COMMENTS').find(c => c.id === Number(a[1].split('/').pop()));
  out(mode === 'bad-readback' ? {...item, body:'changed'} : item); return;
}
process.exit(1);
`);
  fs.chmodSync(gh, 0o755);
  const codex = path.join(bin, 'codex');
  fs.writeFileSync(codex, '#!' + process.execPath + '\n' + `
const fs = require('fs'), cp = require('child_process');
const a = process.argv.slice(2);
const schema = JSON.parse(fs.readFileSync(a[a.indexOf('--output-schema') + 1]));
const p = schema.properties;
const state = JSON.parse(fs.readFileSync(process.env.TEST_STATE));
// CLAIMED and the task identity are durable before spawn. The child may run
// before the parent records its PID; requiring that later write here is a race.
const claim = state.issues[String(p.issue.const)];
if (claim.status !== 'CLAIMED' || claim.run_id !== p.run_id.const || claim.task_digest !== p.task_digest.const) process.exit(88);
const calls = JSON.parse(fs.readFileSync(process.env.TEST_CALLS)); calls.push(a); fs.writeFileSync(process.env.TEST_CALLS,JSON.stringify(calls));
const mode = process.env.TEST_EXEC_MODE;
process.stdout.write('synthetic-secret-token-private-path'); process.stderr.write('synthetic-secret-token-private-path');
if (mode === 'fail') process.exit(1);
if (mode === 'crash') {
  // This scenario targets recovery of a known PID, not unknown dispatch. Wait
  // for the parent's PID handoff before deliberately killing that parent.
  const deadline = Date.now() + 2000;
  while (JSON.parse(fs.readFileSync(process.env.TEST_STATE)).issues[String(p.issue.const)].executor_pid !== process.pid) {
    if (Date.now() >= deadline) process.exit(89);
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 5);
  }
  process.kill(process.ppid, 'SIGKILL'); process.exit(0);
}
if (mode === 'hang') {
  const child = cp.spawn(process.execPath, ['-e', 'process.on("SIGTERM",()=>{});setInterval(()=>{},1000)'], {stdio:'ignore'});
  fs.writeFileSync(process.env.TEST_PID,JSON.stringify({parent:process.pid,child:child.pid}));
  process.on('SIGTERM',()=>{}); setInterval(()=>{},1000); return;
}
if (mode === 'mutate') {
  const issues = JSON.parse(fs.readFileSync(process.env.TEST_ISSUES)); issues[0].body += '\\nChanged during execution';
  fs.writeFileSync(process.env.TEST_ISSUES, JSON.stringify(issues));
}
if (mode === 'missing') process.exit(0);
let result = {schema:p.schema.const,issue:p.issue.const,run_id:p.run_id.const,task_digest:p.task_digest.const,status:'BLOCKED',reason:'PROOF_FAILED',pr_url:null,head_sha:null,proof_urls:[]};
if (mode === 'pr') result = {...result,status:'PR_READY',reason:'NONE',pr_url:'https://github.com/kianwang022-hash/kianos/pull/900',head_sha:'a'.repeat(40)};
if (mode === 'wrong-run') result.run_id = 'other-task';
if (mode === 'raw-result') result.raw_log = 'synthetic-secret-token-private-path';
if (mode === 'bad-proof') result.proof_urls = ['https://evil.invalid/token'];
fs.writeFileSync(a[a.indexOf('--output-last-message') + 1], JSON.stringify(result));
`);
  fs.chmodSync(codex, 0o755);
  const watcher = fileURLToPath(new URL('./codex-issue-watcher.mjs', import.meta.url));
  const env = { ...process.env, KIANOS_CODEX_PROJECT_DIR: repo, KIANOS_CODEX_EXEC_REPO: repo, KIANOS_CODEX_WATCHER_STATE_DIR: stateDir, KIANOS_GH_BIN: gh, KIANOS_GIT_BIN: '/usr/bin/git', KIANOS_CODEX_BIN: codex, KIANOS_CODEX_WATCHER_COMMAND_TIMEOUT_MS: '3000', KIANOS_CODEX_WATCHER_EXECUTOR_TIMEOUT_MS: '3000', TEST_STATE: path.join(stateDir, 'state.json'), ...Object.fromEntries(Object.entries(files).map(([k,v]) => ['TEST_' + k.toUpperCase(), v])) };
  delete env.KIANOS_CODEX_WATCHER_RETRY_MS;
  function issue(number = 701, body = '<!-- kian-codex-task:v1 -->\n## Goal\nBounded repair') {
    return {number,title:'Codex execution: watcher proof',body,createdAt:'2026-09-21T00:00:00Z',updatedAt:'2026-09-21T00:00:00Z'};
  }
  function setIssues(items) { fs.writeFileSync(files.issues, JSON.stringify(items)); }
  function run(extra = {}, args = []) {
    const p = spawnSync(process.execPath, [watcher, '--json', ...args], { cwd: repo, env: {...env,...extra}, encoding: 'utf8', timeout: 15000 });
    return {...p, report:p.stdout?.trim() ? JSON.parse(p.stdout.trim()) : null};
  }
  function runAsync(extra = {}) {
    return new Promise((resolve) => {
      const p = spawn(process.execPath, [watcher, '--json'], {cwd:repo,env:{...env,...extra}});
      let stdout=''; p.stdout.on('data', c => {stdout+=c;});
      p.on('close', status => resolve({status,report:stdout.trim() ? JSON.parse(stdout.trim()) : null}));
    });
  }
  const read = key => JSON.parse(fs.readFileSync(files[key]));
  const state = () => JSON.parse(fs.readFileSync(env.TEST_STATE));
  const cleanup = () => fs.rmSync(temp, {recursive:true,force:true});
  return {temp,repo,stateDir,files,env,issue,setIssues,run,runAsync,read,state,cleanup};
}

async function test() {
  let count = 0;
  async function scenario(name, fn) {
    const f = fixture();
    try { await fn(f); count++; } catch (error) { error.message = name + ': ' + error.message; throw error; }
    finally { f.cleanup(); }
  }
  await scenario('empty and running queues invoke no model', f => {
    assert.equal(f.run().report.reason, 'no-actionable-issue');
    f.setIssues([f.issue(701,'<!-- kian-codex-task-running:v1 -->\nQuoted '+ '<!-- kian-codex-task:v1 -->')]);
    assert.equal(f.run().report.reason, 'no-actionable-issue'); assert.equal(f.read('calls').length,0);
  });
  await scenario('owner-aware locking and dry run', f => {
    f.setIssues([f.issue()]); const lock=path.join(f.stateDir,'lock'); fs.mkdirSync(lock);
    fs.writeFileSync(path.join(lock,'owner.json'), JSON.stringify({pid:process.pid}));
    assert.equal(f.run().report.reason,'already-running'); fs.writeFileSync(path.join(lock,'owner.json'),JSON.stringify({pid:2147483647}));
    assert.equal(f.run({},['--dry-run']).report.status,'would-launch'); assert.equal(f.read('calls').length,0);
    fs.mkdirSync(lock); const old=new Date(Date.now()-60000); fs.utimesSync(lock,old,old);
    assert.equal(f.run({},['--dry-run']).report.status,'would-launch');
  });
  await scenario('one attempt survives comments, cooldown and force', f => {
    f.setIssues([f.issue()]); assert.equal(f.run({TEST_EXEC_MODE:'fail'}).report.reason,'EXECUTION_FAILED');
    const comments=f.read('comments').length;
    const edited=f.issue(); edited.updatedAt='2099-01-01T00:00:00Z'; f.setIssues([edited]);
    for(let i=0;i<3;i++) assert.equal(f.run({KIANOS_CODEX_WATCHER_RETRY_MS:'1'}).report.status,'quiet');
    assert.equal(f.run({},['--force']).report.reason,'FORCE_REARM_NOT_SUPPORTED');
    assert.equal(f.read('calls').length,1); assert.equal(f.read('comments').length,comments);
    assert.ok(!JSON.stringify(f.read('comments')).includes('synthetic-secret'));
  });
  await scenario('exact PR receipt and proof readback', f => {
    f.setIssues([f.issue()]); const r=f.run({TEST_EXEC_MODE:'pr'}); assert.equal(r.status,0); assert.equal(r.report.status,'pr-ready');
    assert.equal(f.state().issues['701'].status,'PR_READY'); assert.equal(f.read('comments').length,2);
    assert.ok(f.read('comments')[1].body.includes('"status":"PR_READY"'));
  });
  await scenario('exit zero without a bound result is not success', f => {
    f.setIssues([f.issue()]); assert.equal(f.run({TEST_EXEC_MODE:'missing'}).report.reason,'RESULT_MISSING_OR_OVERSIZED');
    assert.equal(f.state().issues['701'].status,'BLOCKED');
  });
  await scenario('open PR dedupes without execution', f => {
    f.setIssues([f.issue()]); fs.writeFileSync(f.files.prs,JSON.stringify([{number:900,headRefName:'codex/issue701-existing'}]));
    assert.equal(f.run().report.status,'quiet'); assert.equal(f.read('calls').length,0);
  });
  for(const mode of ['wrong-run','raw-result','bad-proof']) await scenario('reject '+mode,f=>{
    f.setIssues([f.issue()]); assert.equal(f.run({TEST_EXEC_MODE:mode}).report.reason,'RESULT_INVALID');
    assert.ok(!JSON.stringify(f.read('comments')).includes('synthetic-secret'));
  });
  for(const value of ['0','-1','NaN','Infinity']) await scenario('invalid retry '+value,f=>{
    f.setIssues([f.issue()]); assert.equal(f.run({KIANOS_CODEX_WATCHER_RETRY_MS:value}).report.reason,'CONFIG_INVALID'); assert.equal(f.read('calls').length,0);
  });
  await scenario('unknown/corrupt durable state fails closed', f => {
    f.setIssues([f.issue()]); fs.writeFileSync(f.env.TEST_STATE,'{bad'); assert.equal(f.run().report.reason,'STATE_JSON_INVALID');
    fs.writeFileSync(f.env.TEST_STATE,JSON.stringify({schema:'future',issues:{}})); assert.equal(f.run().report.reason,'STATE_SCHEMA_UNSUPPORTED'); assert.equal(f.read('calls').length,0);
  });
  await scenario('legacy attempted task needs explicit reconciliation',f=>{
    f.setIssues([f.issue()]); fs.writeFileSync(f.env.TEST_STATE,JSON.stringify({schema:'kianos.codex-issue-watcher.state.v1',issues:{'701':{last_exit:1}}}));
    assert.equal(f.run().report.status,'quiet'); assert.equal(f.read('calls').length,0);
    f.setIssues([f.issue(701,f.issue().body+'\n<!-- kian-codex-rearm:approved-123 -->')]);
    assert.equal(f.run().report.reason,'PROOF_FAILED'); assert.equal(f.read('calls').length,1);
  });
  for(const mode of ['deny','write-denied','lost-response','bad-readback']) await scenario('source/claim '+mode,f=>{
    f.setIssues([f.issue()]); assert.equal(f.run({TEST_GH_MODE:mode}).status,2); assert.equal(f.read('calls').length,0);
    if(mode!=='deny') { f.run(); assert.equal(f.read('calls').length,0); }
  });
  await scenario('network timeout is bounded',f=>{
    f.setIssues([f.issue()]); const start=Date.now(); assert.equal(f.run({TEST_GH_MODE:'hang',KIANOS_CODEX_WATCHER_COMMAND_TIMEOUT_MS:'150'}).report.reason,'TIMEOUT');
    assert.ok(Date.now()-start<5000); assert.equal(f.read('calls').length,0);
  });
  await scenario('executor timeout kills the owned process tree',f=>{
    f.setIssues([f.issue()]); const r=f.run({TEST_EXEC_MODE:'hang',KIANOS_CODEX_WATCHER_EXECUTOR_TIMEOUT_MS:'300'}); assert.equal(r.report.reason,'TIMEOUT');
    const pids=JSON.parse(fs.readFileSync(f.files.pid));
    for(const pid of Object.values(pids)) {
      const p=spawnSync('ps',['-o','stat=','-p',String(pid)],{encoding:'utf8'});
      assert.ok(!p.stdout.trim() || p.stdout.trim().startsWith('Z'),'owned descendant survived timeout');
    }
    assert.equal(fs.existsSync(path.join(f.stateDir,'lock')),false); assert.equal(f.run().report.status,'quiet'); assert.equal(f.read('calls').length,1);
  });
  await scenario('orphaned process group terminalizes once without retrying',f=>{
    f.setIssues([f.issue()]); assert.equal(f.run({TEST_EXEC_MODE:'crash'}).signal,'SIGKILL');
    assert.equal(f.state().issues['701'].status,'CLAIMED'); assert.equal(f.run().report.status,'quiet');
    assert.equal(f.state().issues['701'].reason,'EXECUTOR_EXIT_UNOBSERVED'); assert.equal(f.read('calls').length,1);
    const comments=f.read('comments').length; f.run(); assert.equal(f.read('comments').length,comments);
    f.setIssues([f.issue(),f.issue(702)]); f.run(); assert.equal(f.read('calls').length,2,'dead claim must not starve another bounded task');
  });
  await scenario('unknown-dispatch claim stays with Chat and never repeats comments or models',f=>{
    f.setIssues([f.issue()]); fs.writeFileSync(f.env.TEST_STATE,JSON.stringify({schema:'kianos.codex-issue-watcher.state.v2',issues:{'701':{status:'CLAIMED',task_digest:'a'.repeat(64),run_id:'11111111-2222-3333-4444-555555555555',executor_pid:null}}}));
    for(let n=0;n<3;n++) assert.equal(f.run().report.reason,'CLAIM_REQUIRES_CHAT_RECONCILIATION');
    assert.equal(f.read('calls').length,0); assert.equal(f.read('comments').length,0);
  });
  await scenario('task mutation cannot rearm itself',f=>{
    f.setIssues([f.issue()]); assert.equal(f.run({TEST_EXEC_MODE:'mutate'}).report.reason,'TASK_CHANGED');
    assert.equal(f.state().issues['701'].status,'NEEDS_RECONCILIATION'); assert.equal(f.run().report.status,'quiet'); assert.equal(f.read('calls').length,1);
  });
  await scenario('overlapping triggers dispatch once',async f=>{
    f.setIssues([f.issue()]); const r=await Promise.all([f.runAsync({TEST_EXEC_MODE:'hang',KIANOS_CODEX_WATCHER_EXECUTOR_TIMEOUT_MS:'400'}),f.runAsync()]);
    assert.equal(f.read('calls').length,1); assert.ok(r.some(x=>x.report?.reason==='already-running'||x.report?.reason==='LOCK_RECOVERY_UNRESOLVED'));
  });
  console.log('PASS Codex watcher: '+count+' isolated execution, timeout/process-tree, claim, replay, corruption and privacy scenarios');
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await test();
