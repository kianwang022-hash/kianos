import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';

function hygieneTests() {
  const temp = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'codex-hygiene-')));
  const repo = path.join(temp, 'repo');
  const remote = path.join(temp, 'remote.git');
  const bin = path.join(temp, 'bin');
  const script = path.resolve('scripts/codex-local-hygiene.mjs');
  const statePath = path.join(temp, 'state.json');
  let state = { prs: {}, issues: {}, handles: [], lsofFailure: false, openFailure: false };
  const git = (args, cwd = repo) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  const exists = b => { try { git(['show-ref', '--verify', '--quiet', 'refs/heads/' + b]); return true; } catch { return false; } };
  const env = { ...process.env, PATH: bin + path.delimiter + process.env.PATH, TEST_HYGIENE_STATE: statePath, CODEX_HOME: path.join(temp, 'codex') };
  function run(args = [], cwd = repo) {
    fs.writeFileSync(statePath, JSON.stringify(state));
    return JSON.parse(execFileSync(process.execPath, [script, '--json', ...args], { cwd, env, encoding: 'utf8' }));
  }
  function make(branch, { wt = true, merged = true, remoteActive = false, base = 'main', open = false } = {}) {
    git(['checkout', '-b', branch]);
    fs.appendFileSync(path.join(repo, 'history.txt'), branch + '\n');
    git(['add', '.']); git(['commit', '-m', branch]);
    const sha = git(['rev-parse', 'HEAD']);
    git(['push', 'origin', branch]); git(['checkout', 'main']);
    if (merged) { git(['merge', '--squash', branch]); git(['commit', '-m', 'accept ' + branch]); git(['push', 'origin', 'main']); }
    if (!remoteActive) git(['push', 'origin', '--delete', branch]);
    state.prs[branch] = { number: 100, headRefName: branch, headRefOid: sha, baseRefName: base, mergedAt: merged ? '2026-10-07T00:00:00Z' : null, open };
    const dir = path.join(temp, branch.replaceAll('/', '-'));
    if (wt) git(['worktree', 'add', dir, branch]);
    return dir;
  }
  try {
    fs.mkdirSync(repo); fs.mkdirSync(bin);
    git(['init', '--bare', remote]); git(['init', '-b', 'main']);
    git(['config', 'user.name', 'Hygiene Test']); git(['config', 'user.email', 'test@example.invalid']);
    fs.writeFileSync(path.join(repo, 'history.txt'), 'base\n');
    fs.mkdirSync(path.join(repo, 'static-web'));
    fs.writeFileSync(path.join(repo, 'static-web/tracked.txt'), 'tracked build root\n');
    fs.writeFileSync(path.join(repo, '.gitignore'), 'static-web/.cache/\nstatic-web/.qa/\n');
    git(['add', '.']); git(['commit', '-m', 'base']); git(['remote', 'add', 'origin', remote]); git(['push', '-u', 'origin', 'main']);
    const fakeGh = `#!${process.execPath}
  const fs=require('node:fs');const s=JSON.parse(fs.readFileSync(process.env.TEST_HYGIENE_STATE));const a=process.argv.slice(2);const v=k=>a[a.indexOf(k)+1];
  if(a[0]==='repo'){console.log(JSON.stringify({nameWithOwner:'test/kianos'}));}
  else if(a[0]==='issue'){console.log(JSON.stringify(s.issues[a[2]]||{state:'CLOSED',stateReason:'COMPLETED'}));}
  else if(a[0]==='pr'){
   const p=s.prs[v('--head')];
   if(v('--state')==='open'){if(s.openFailure)process.exit(1);console.log(JSON.stringify(p?.open?[{number:p.number}]:[]));}
   else console.log(JSON.stringify(p?.mergedAt?[{...p,headRefOid:'0'.repeat(40)},p]:[]));
  }else process.exit(1);
  `;
    const fakeLsof = `#!${process.execPath}
  const fs=require('node:fs');const s=JSON.parse(fs.readFileSync(process.env.TEST_HYGIENE_STATE));if(s.lsofFailure)process.exit(1);console.log('p123\\n'+s.handles.map(p=>'n'+p).join('\\n'));
  `;
    for (const [name, body] of [['gh', fakeGh], ['lsof', fakeLsof]]) { fs.writeFileSync(path.join(bin, name), body); fs.chmodSync(path.join(bin, name), 0o755); }
    const done = make('codex/issue101-done');
    make('codex/issue-106-legacy', { wt: false });
    const dirty = make('codex/issue102-dirty'); fs.appendFileSync(path.join(dirty, 'history.txt'), 'private change\n');
    make('codex/issue103-active', { remoteActive: true });
    make('codex/issue105-open'); state.issues['105'] = { state: 'OPEN', stateReason: null };
    const lexical = make('lexical/b001-accepted');
    fs.mkdirSync(path.join(lexical, 'static-web/.cache/lexical-projection'), { recursive: true });
    fs.writeFileSync(path.join(lexical, 'static-web/.cache/lexical-projection/build.json'), '{}');
    const candidate = make('candidate/unique-evidence'); fs.mkdirSync(path.join(candidate, 'static-web/.qa'), { recursive: true });
    fs.writeFileSync(path.join(candidate, 'static-web/.qa/proof.json'), '{"unique":true}');
    const busy = make('audit/busy'); state.handles = [path.join(busy, 'history.txt')];
    make('fix/still-open', { open: true });
    make('lexical/wrong-base', { base: 'candidate' });
    const locked = make('work/locked'); git(['worktree', 'lock', locked]);
    const protectedWt = make('work/protected');
    const managed = make('work/managed');
    const managedTarget = path.join(env.CODEX_HOME, 'worktrees', 'managed');
    fs.mkdirSync(path.dirname(managedTarget), { recursive: true });
    git(['worktree', 'move', managed, managedTarget]);
    make('fix/local-advanced', { wt: false });
    git(['checkout', 'fix/local-advanced']); fs.appendFileSync(path.join(repo, 'history.txt'), 'not merged\n'); git(['add', '.']); git(['commit', '-m', 'unique later commit']); git(['checkout', 'main']);
    git(['branch', 'work/manual-keep']);
    const dry = run(['--protect', protectedWt]);
    assert.ok(dry.would_delete.includes('codex/issue101-done'));
    assert.ok(dry.would_delete.includes('codex/issue-106-legacy'));
    assert.ok(dry.would_delete.includes('lexical/b001-accepted'), JSON.stringify(dry.rows.find(r => r.branch === 'lexical/b001-accepted')));
    const skipped = Object.fromEntries(dry.skipped.map(r => [r.branch, r.reason]));
    assert.equal(skipped['codex/issue102-dirty'], 'dirty-worktree');
    assert.equal(skipped['codex/issue103-active'], 'remote-still-active');
    assert.equal(skipped['codex/issue105-open'], 'issue-not-completed');
    assert.equal(skipped['candidate/unique-evidence'], 'unreviewed-ignored-files');
    assert.equal(skipped['audit/busy'], 'worktree-in-use');
    assert.equal(skipped['fix/still-open'], 'open-pr');
    assert.equal(skipped['work/locked'], 'protected-worktree');
    assert.equal(skipped['work/protected'], 'protected-worktree');
    assert.equal(skipped['work/managed'], 'protected-worktree');
    for (const b of ['fix/local-advanced', 'lexical/wrong-base', 'work/manual-keep']) assert.equal(skipped[b], 'exact-merged-main-pr-not-found');
    assert.ok(exists('lexical/b001-accepted')); assert.ok(fs.existsSync(done));
    state.lsofFailure = true;
    assert.equal(run(['--branch', 'lexical/b001-accepted']).rows[0].reason, 'open-file-scan-unavailable');
    state.lsofFailure = false; state.openFailure = true;
    assert.equal(run(['--branch', 'lexical/b001-accepted']).rows[0].reason, 'open-pr-read-failed');
    state.openFailure = false;
    assert.equal(run(['--branch', 'lexical/b001-accepted'], lexical).rows[0].reason, 'checked-out-in-root');
    const selected = run(['--branch', 'codex/issue101-done']); assert.equal(selected.rows.length, 1);
    const apply = run(['--apply', '--protect', protectedWt]);
    assert.deepEqual(new Set(apply.deleted), new Set(['codex/issue101-done', 'codex/issue-106-legacy', 'lexical/b001-accepted']));
    assert.equal(fs.existsSync(lexical), false); assert.equal(exists('lexical/b001-accepted'), false);
    for (const dir of [dirty, candidate, busy, locked, protectedWt, managedTarget]) assert.equal(fs.existsSync(dir), true);
    assert.equal(fs.readFileSync(path.join(candidate, 'static-web/.qa/proof.json'), 'utf8'), '{"unique":true}');
    // A stale local remote-tracking view must not authorize deleting a live remote branch.
    git(['update-ref', '-d', 'refs/remotes/origin/codex/issue103-active']);
    assert.equal(run(['--no-fetch', '--branch', 'codex/issue103-active']).rows[0].reason, 'remote-still-active');
    git(['remote', 'set-url', 'origin', path.join(temp, 'missing-origin')]);
    assert.equal(run(['--no-fetch', '--branch', 'work/protected']).rows[0].reason, 'remote-read-failed');
    console.log('PASS local hygiene: generic exact merged heads, strict Issue closure, remote/open PR protection, dirty/ignored/active/locked/protected worktrees, scope and fail-closed reads');
  } finally { fs.rmSync(temp, { recursive: true, force: true }); }
}

function workspaceTests() {
  const temp = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'task-workspace-')));
  const repo = path.join(temp, 'repo');
  const script = path.resolve('scripts/codex-local-hygiene.mjs');
  const git = (args, cwd = repo) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore','pipe','pipe'] }).trim();
  const run = args => spawnSync(process.execPath, [script, '--workspace', ...args], { cwd: repo, encoding: 'utf8' });
  try {
    fs.mkdirSync(repo); git(['init','-b','main']); git(['config','user.name','Test']); git(['config','user.email','test@example.invalid']);
    for (const dir of ['static-web/scripts','static-web/src','content/lexical']) fs.mkdirSync(path.join(repo,dir),{recursive:true});
    fs.writeFileSync(path.join(repo,'AGENTS.md'),'rules\n');
    fs.writeFileSync(path.join(repo,'static-web/package.json'),'{}');
    fs.writeFileSync(path.join(repo,'static-web/scripts/task.mjs'),'export {};');
    fs.writeFileSync(path.join(repo,'static-web/src/page.html'),'page');
    fs.writeFileSync(path.join(repo,'content/lexical/words.json'),'x'.repeat(128*1024));
    git(['add','.']);git(['commit','-m','base']);
    const target = path.join(temp,'task');
    const flags = ['--branch','fix/example','--base','main','--path',target,'--sparse','static-web/scripts','--min-free-gib','1'];
    let r=run(flags.slice(0,-2).concat(['--min-free-gib','1000000']));
    assert.notEqual(r.status,0);assert.match(r.stderr,/LOW_DISK_SPACE/);assert.equal(fs.existsSync(target),false);
    assert.equal(git(['branch','--list','fix/example']),'');
    r=run(flags);assert.equal(r.status,0,r.stderr);assert.equal(JSON.parse(r.stdout).status,'CREATED');
    assert.equal(fs.existsSync(path.join(target,'static-web/scripts/task.mjs')),true);
    assert.equal(fs.existsSync(path.join(target,'AGENTS.md')),true);
    assert.equal(fs.existsSync(path.join(target,'static-web/package.json')),true);
    assert.equal(fs.existsSync(path.join(target,'content')),false);
    assert.equal(fs.existsSync(path.join(target,'static-web/src')),false);
    assert.equal(git(['status','--porcelain'],target),'');
    fs.appendFileSync(path.join(target,'AGENTS.md'),'private work\n');
    r=run(['--branch','fix/example','--max-worktrees','2','--min-free-gib','1000000']);
    assert.equal(r.status,0,r.stderr);assert.equal(JSON.parse(r.stdout).status,'REUSE');
    assert.match(fs.readFileSync(path.join(target,'AGENTS.md'),'utf8'),/private work/);
    const other=path.join(temp,'other');
    r=run(['--branch','fix/other','--base','main','--path',other,'--full','--max-worktrees','2']);
    assert.notEqual(r.status,0);assert.match(r.stderr,/WORKTREE_LIMIT/);assert.equal(fs.existsSync(other),false);
    git(['worktree','lock',target]);r=run(['--branch','fix/example']);assert.notEqual(r.status,0);assert.match(r.stderr,/EXISTING_WORKTREE_UNAVAILABLE/);
    git(['worktree','unlock',target]);
    fs.writeFileSync(path.join(repo,'.git/kianos-task-workspace.lock'),'another allocator');
    r=run(['--branch','fix/other','--base','main','--path',other,'--full']);
    assert.notEqual(r.status,0);assert.equal(fs.readFileSync(path.join(repo,'.git/kianos-task-workspace.lock'),'utf8'),'another allocator');
    fs.unlinkSync(path.join(repo,'.git/kianos-task-workspace.lock'));
    r=run(['--branch','fix/other','--base','main','--path',path.join(repo,'nested'),'--full']);
    assert.notEqual(r.status,0);assert.match(r.stderr,/TARGET_INSIDE_WORKTREE/);
    assert.equal(fs.existsSync(other),false);
    r=run(['--branch','fix/other','--base','main','--path',other,'--full','--min-free-gib','1']);
    assert.equal(r.status,0,r.stderr);assert.equal(fs.existsSync(path.join(other,'content/lexical/words.json')),true);
    assert.equal(git(['status','--porcelain'],other),'');
    console.log('PASS task workspace: no whole-content checkout, clean sparse index, dirty reuse, disk/count limits, locked worktree and allocation lock protection');
  } finally {fs.rmSync(temp,{recursive:true,force:true});}
}

if (!process.argv.includes('--workspace-only')) hygieneTests();
workspaceTests();
