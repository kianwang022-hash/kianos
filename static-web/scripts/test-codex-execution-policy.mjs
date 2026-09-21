import assert from 'node:assert/strict';
import { fixture } from './test-codex-issue-watcher.mjs';

function scenario(fn) { const f=fixture(); try { fn(f); } finally { f.cleanup(); } }
for(const [marker,model] of [['','gpt-5.6-terra'],['<!-- kian-codex-model:sol -->','gpt-5.6-sol'],['<!-- kian-codex-model:astra -->\n<!-- kian-codex-astra-approved-by-kian:v1 -->','gpt-6-astra']]) scenario(f=>{
  f.setIssues([f.issue(701,f.issue().body+'\n'+marker)]); f.run();
  const args=f.read('calls')[0]; assert.equal(args[args.indexOf('--model')+1],model); assert.equal(args[0],'exec');
  assert.ok(args.includes('--output-schema')); assert.ok(args.includes('--output-last-message'));
  assert.ok(!JSON.stringify(f.read('comments')).includes('synthetic-secret'));
});
scenario(f=>{
  f.setIssues([f.issue(700,'<!-- kian-codex-task:v1 -->\n<!-- kian-codex-model:astra -->'),f.issue(701)]);
  f.run(); assert.equal(f.read('calls').length,1); assert.ok(f.read('calls')[0].includes('gpt-5.6-terra'));
  const count=f.read('comments').length; f.run(); assert.equal(f.read('calls').length,1); assert.equal(f.read('comments').length,count);
  assert.equal(f.state().issues['700'].reason,'ASTRA_REQUIRES_KIAN_APPROVAL');
});
for(const body of ['', '\n<!-- kian-codex-runtime:local -->']) scenario(f=>{
  f.setIssues([f.issue(701,f.issue().body+body)]); f.run({KIANOS_CODEX_CLOUD_ENV_ID:'env_unproved'});
  assert.equal(f.read('calls').length,1); assert.equal(f.read('calls')[0][0],'exec');
  assert.ok(!f.read('calls').some(a=>a.includes('cloud')));
});
scenario(f=>{
  f.setIssues([f.issue()]); f.run({TEST_EXEC_MODE:'fail'});
  for(let n=0;n<3;n++) f.run({KIANOS_CODEX_WATCHER_RETRY_MS:'1'});
  assert.equal(f.read('calls').length,1, 'failure never escalates or retries a model');
  f.setIssues([f.issue(701,f.issue().body+'\nNew explicit task scope')]); f.run();
  assert.equal(f.read('calls').length,2,'a new task body is a separate bounded attempt');
});
console.log('PASS Codex policy: fixed model choice, non-starving Astra approval, no Cloud dispatch/fallback, zero automatic model retries');
