#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

function runTaskWorkspace(args) {
  const values = flag => args.flatMap((a, i) => a === flag ? [args[i + 1]] : []);
  const value = (flag, fallback) => values(flag)[0] ?? fallback;
  for (const flag of ['--branch', '--path', '--base', '--sparse', '--min-free-gib', '--max-worktrees']) {
    if (values(flag).some(v => !v || v.startsWith('--'))) throw new Error('MISSING_VALUE:' + flag);
  }
  const branch = value('--branch');
  if (!branch) throw new Error('BRANCH_REQUIRED');
  const run = argv => {
    const r = spawnSync('git', argv, { encoding: 'utf8', timeout: 60000, maxBuffer: 16 * 1024 * 1024,
      env: { ...process.env, GIT_OPTIONAL_LOCKS: '0' } });
    if (r.status !== 0) throw new Error('GIT_FAILED:' + argv.join(' '));
    return r.stdout.trim();
  };
  run(['check-ref-format', '--branch', branch]);
  if (['main', 'master'].includes(branch)) throw new Error('TASK_BRANCH_REQUIRED');
  const common = fs.realpathSync(run(['rev-parse', '--path-format=absolute', '--git-common-dir']));
  const inventory = () => run(['worktree', 'list', '--porcelain']).split('\n\n').filter(Boolean).map(block => ({
    path: block.split('\n').find(l => l.startsWith('worktree '))?.slice(9),
    branch: block.split('\n').find(l => l.startsWith('branch refs/heads/'))?.slice(18),
    locked: block.split('\n').some(l => l.startsWith('locked'))
  }));
  function reused(trees) {
    const existing = trees.find(t => t.branch === branch);
    if (!existing) return false;
    if (existing.locked || !fs.existsSync(existing.path)) throw new Error('EXISTING_WORKTREE_UNAVAILABLE');
    // Return the existing directory without resetting, checking out or changing its sparse scope.
    console.log(JSON.stringify({ status: 'REUSE', branch, path: existing.path, working_tree_preserved: true }));
    return true;
  }
  if (!reused(inventory())) {
    const targetArg = value('--path');
    if (!targetArg) throw new Error('NEW_WORKTREE_PATH_REQUIRED');
    const target = path.resolve(targetArg);
    const sparse = values('--sparse');
    if ((!sparse.length && !args.includes('--full')) || (sparse.length && args.includes('--full'))) throw new Error('CHOOSE_SPARSE_OR_FULL');
    if (sparse.some(p => p.startsWith('/') || p.startsWith('-') || p.split('/').some(c => !c || c === '.' || c === '..'))) throw new Error('INVALID_SPARSE_DIRECTORY');
    const minimumGiB = Number(value('--min-free-gib', '15'));
    const maximum = Number(value('--max-worktrees', '16'));
    if (!Number.isFinite(minimumGiB) || minimumGiB < 1 || !Number.isSafeInteger(maximum) || maximum < 2) throw new Error('INVALID_WORKSPACE_LIMIT');
    const lock = path.join(common, 'kianos-task-workspace.lock');
    const fd = fs.openSync(lock, 'wx');
    fs.writeFileSync(fd, JSON.stringify({ pid: process.pid, branch, path: target }));
    try {
      const trees = inventory();
      if (!reused(trees)) {
        if (trees.length >= maximum) throw new Error('WORKTREE_LIMIT: review completed tasks before allocating another checkout');
        if (fs.existsSync(target)) throw new Error('TARGET_ALREADY_EXISTS');
        // Require an existing parent; do not silently build a new directory hierarchy.
        const parent = fs.realpathSync(path.dirname(target));
        if (path.join(parent, path.basename(target)) !== target) throw new Error('SYMLINKED_TARGET_PARENT');
        if (trees.some(t => target === t.path || target.startsWith(t.path + path.sep))) throw new Error('TARGET_INSIDE_WORKTREE');
        const refs = run(['for-each-ref', '--format=%(refname:short)', 'refs/heads/']).split('\n');
        const exists = refs.includes(branch);
        const base = exists ? branch : value('--base', 'origin/main');
        const sha = run(['rev-parse', '--verify', base + '^{commit}']);
        for (const directory of sparse) if (run(['cat-file', '-t', sha + ':' + directory]) !== 'tree') throw new Error('SPARSE_DIRECTORY_REQUIRED');
        const include = file => !sparse.length || !file.includes('/') || sparse.some(dir => {
          const parentDir = path.posix.dirname(file);
          return file.startsWith(dir + '/') || parentDir === dir || dir.startsWith(parentDir + '/');
        });
        const estimatedBytes = run(['ls-tree', '-r', '-l', '-z', sha]).split('\0').filter(Boolean).reduce((sum, row) => {
          const tab = row.indexOf('\t'); const fields = row.slice(0, tab).trim().split(/\s+/); const file = row.slice(tab + 1);
          return sum + (include(file) && fields[1] === 'blob' ? Number(fields[3]) : 0);
        }, 0);
        const st = fs.statfsSync(parent); const freeBytes = st.bavail * st.bsize;
        if (freeBytes - estimatedBytes < minimumGiB * 1024 ** 3) throw new Error('LOW_DISK_SPACE: preserve headroom after checkout');
        const add = ['worktree', 'add', '--lock', '--reason', 'task initialization incomplete', '--no-checkout'];
        run(exists ? [...add, target, branch] : [...add, '-b', branch, target, sha]);
        // Failed initialization stays locked for inspection; never force-delete a partially initialized task.
        if (sparse.length) run(['-C', target, 'sparse-checkout', 'set', '--cone', '--', ...sparse]);
        run(['-C', target, 'read-tree', '-mu', 'HEAD']);
        run(['worktree', 'unlock', target]);
        console.log(JSON.stringify({ status: 'CREATED', branch, path: target, head: sha, sparse,
          estimated_checkout_bytes: estimatedBytes, free_bytes_before: freeBytes, min_free_gib: minimumGiB, max_worktrees: maximum }));
      }
    } finally { fs.closeSync(fd); fs.unlinkSync(lock); }
  }
}

const args = process.argv.slice(2);
if (args.includes('--workspace')) {
  runTaskWorkspace(args.filter(a => a !== '--workspace'));
  process.exit(0);
}
const apply = args.includes('--apply');
const json = args.includes('--json');
const noFetch = args.includes('--no-fetch');
const values = (flag) => args.flatMap((arg, i) => arg === flag ? [args[i + 1]] : []);
for (const flag of ['--branch', '--protect']) {
  if (values(flag).some(value => !value || value.startsWith('--'))) throw new Error('MISSING_VALUE:' + flag);
}
const selected = new Set(values('--branch'));
const protectedPaths = values('--protect').map(p => fs.realpathSync(p));
function run(file, argv, cwd = process.cwd()) {
  const result = spawnSync(file, argv, { cwd, encoding: 'utf8', timeout: 60000, maxBuffer: 16 * 1024 * 1024,
    env: { ...process.env, GIT_OPTIONAL_LOCKS: '0' } });
  return { status: result.status, stdout: String(result.stdout || '').trim(), stderr: String(result.stderr || '').trim() };
}
function git(argv, cwd) {
  const result = run('git', argv, cwd);
  if (result.status !== 0) throw new Error('GIT_FAILED:' + argv.join(' '));
  return result.stdout;
}
function ghJson(argv) {
  const result = run('gh', argv);
  if (result.status !== 0) return null;
  try { return JSON.parse(result.stdout); } catch { return null; }
}
const repoRoot = fs.realpathSync(git(['rev-parse', '--show-toplevel']));
if (!noFetch) git(['fetch', '--prune', 'origin', '+refs/heads/*:refs/remotes/origin/*']);
git(['rev-parse', '--verify', 'refs/remotes/origin/main']);
const repoFullName = ghJson(['repo', 'view', '--json', 'nameWithOwner'])?.nameWithOwner;
const worktrees = git(['worktree', 'list', '--porcelain']).split('\n\n').filter(Boolean).map(block => {
  const lines = block.split('\n');
  return { path: lines.find(l => l.startsWith('worktree '))?.slice(9),
    branch: lines.find(l => l.startsWith('branch refs/heads/'))?.slice(18),
    locked: lines.some(l => l.startsWith('locked')), prunable: lines.some(l => l.startsWith('prunable')) };
});
const primary = fs.realpathSync(worktrees[0].path);
const callerBranch = run('git', ['symbolic-ref', '--quiet', '--short', 'HEAD']).stdout;
const managedRoots = [path.join(process.env.CODEX_HOME || path.join(os.homedir(), '.codex'), 'worktrees'),
  process.env.CODEX_WORKTREE_ROOT, path.join(os.homedir(), '.kianos-current-releases')].filter(Boolean).map(p => path.resolve(p));
const under = (p, root) => p === root || p.startsWith(root + path.sep);
function rebuildableIgnored(worktree, name) {
  const entry = name.replace(/\/$/, '');
  if (['node_modules', 'static-web/node_modules', 'static-web/.astro', 'static-web/dist'].includes(entry)) return true;
  if (entry === 'tools/__pycache__') return true;
  if (entry === 'static-web/.cache') {
    // Only the known content compiler cache; never blanket-delete arbitrary ignored state.
    try { return fs.readdirSync(path.join(worktree, entry)).every(child => child === 'lexical-projection'); } catch { return false; }
  }
  return false;
}
function inspectWorktree(wt) {
  let resolved;
  try { resolved = fs.realpathSync(wt.path); } catch { return 'missing-worktree'; }
  if (resolved === primary || resolved === repoRoot || resolved !== path.resolve(wt.path)
    || protectedPaths.some(p => under(resolved, p)) || managedRoots.some(p => under(resolved, p))) return 'protected-worktree';
  if (wt.locked || wt.prunable) return 'locked-or-prunable-worktree';
  const dirty = run('git', ['status', '--porcelain=v1', '--untracked-files=all'], wt.path);
  if (dirty.status !== 0 || dirty.stdout) return 'dirty-worktree';
  const ignored = run('git', ['ls-files', '--others', '--ignored', '--exclude-standard', '--directory', '-z'], wt.path);
  if (ignored.status !== 0) return 'ignored-scan-failed';
  if (ignored.stdout.split('\0').filter(Boolean).some(name => !rebuildableIgnored(wt.path, name))) return 'unreviewed-ignored-files';
  // Inspect cwd as well as open files. An unavailable process inventory is not proof of inactivity.
  const handles = run('lsof', ['-nP', '-u', String(process.getuid()), '-F', 'pn']);
  if (handles.status !== 0) return 'open-file-scan-unavailable';
  if (handles.stdout.split('\n').some(line => line.startsWith('n') && under(line.slice(1), resolved))) return 'worktree-in-use';
  return null;
}
const candidates = git(['for-each-ref', '--format=%(refname:short)', 'refs/heads/']).split('\n')
  .filter(name => name && name !== 'main' && (!selected.size || selected.has(name)));
const rows = [];
const free = () => { const st = fs.statfsSync(repoRoot); return st.bavail * st.bsize; };
const beforeFree = free();
for (const branch of candidates) {
  const issueNumber = Number(branch.match(/^codex\/issue-?(\d+)-/)?.[1] || 0);
  const wt = worktrees.find(w => w.branch === branch);
  const row = { branch, issue: issueNumber || null, worktree: wt?.path || null, action: 'skip', reason: null };
  rows.push(row);
  const skip = reason => { row.reason = reason; };
  if (branch === callerBranch) { skip('checked-out-in-root'); continue; }
  if (wt && (wt.path === worktrees[0].path || wt.locked)) { skip('protected-worktree'); continue; }
  // Query origin directly even with --no-fetch; stale remote-tracking refs cannot authorize deletion.
  const remote = run('git', ['ls-remote', '--heads', 'origin', 'refs/heads/' + branch]);
  if (remote.status !== 0) { skip('remote-read-failed'); continue; }
  if (remote.stdout) { skip('remote-still-active'); continue; }
  if (!repoFullName) { skip('github-cli-unavailable'); continue; }
  const open = ghJson(['pr', 'list', '--repo', repoFullName, '--head', branch, '--state', 'open', '--json', 'number', '--limit', '100']);
  if (!Array.isArray(open) || open.length) { skip(Array.isArray(open) ? 'open-pr' : 'open-pr-read-failed'); continue; }
  if (issueNumber) {
    const issue = ghJson(['issue', 'view', String(issueNumber), '--repo', repoFullName, '--json', 'state,stateReason']);
    if (!issue || issue.state !== 'CLOSED' || issue.stateReason !== 'COMPLETED') { skip(issue ? 'issue-not-completed' : 'issue-read-failed'); continue; }
  }
  const tip = git(['rev-parse', 'refs/heads/' + branch]);
  const prs = ghJson(['pr', 'list', '--repo', repoFullName, '--head', branch, '--base', 'main', '--state', 'merged',
    '--json', 'number,headRefName,headRefOid,baseRefName,mergedAt', '--limit', '100']);
  const pr = Array.isArray(prs) && prs.find(p => p.headRefName === branch && p.baseRefName === 'main' && p.mergedAt && p.headRefOid === tip);
  if (!pr) { skip('exact-merged-main-pr-not-found'); continue; }
  if (wt) {
    const reason = inspectWorktree(wt);
    if (reason) { skip(reason); continue; }
  }
  row.pr = pr.number;
  row.head = tip;
  if (apply) {
    // Re-read tip/state immediately before mutation; Git also refuses dirty or locked removals.
    if (git(['rev-parse', 'refs/heads/' + branch]) !== tip) { skip('local-tip-changed'); continue; }
    if (wt) {
      const reason = inspectWorktree(wt);
      if (reason) { skip(reason); continue; }
      const removal = run('git', ['worktree', 'remove', wt.path]);
      if (removal.status !== 0) { skip('worktree-remove-failed'); continue; }
      row.worktree_removed = true;
    }
    if (git(['rev-parse', 'refs/heads/' + branch]) !== tip) { skip('local-tip-changed'); continue; }
    const contained = run('git', ['merge-base', '--is-ancestor', tip, 'refs/remotes/origin/main']).status === 0;
    const deletion = run('git', ['branch', contained ? '-d' : '-D', branch]);
    if (deletion.status !== 0) { skip('branch-delete-failed'); continue; }
    row.action = 'deleted';
  } else row.action = 'would-delete';
  row.reason = issueNumber ? 'completed-issue-exact-merged-main' : 'exact-merged-main';
}
const report = { schema: 'kianos.codex-local-hygiene.v1', mode: apply ? 'apply' : 'dry-run', repo: repoRoot,
  github_cli: Boolean(repoFullName), candidates: rows.length, free_bytes_before: beforeFree, free_bytes_after: free(),
  deleted: rows.filter(r => r.action === 'deleted').map(r => r.branch),
  would_delete: rows.filter(r => r.action === 'would-delete').map(r => r.branch),
  skipped: rows.filter(r => r.action === 'skip').map(({ branch, reason }) => ({ branch, reason })), rows };
if (json) process.stdout.write(JSON.stringify(report) + '\n');
else {
  console.log(apply ? 'Local task hygiene — APPLY' : 'Local task hygiene — DRY RUN');
  for (const row of rows) console.log(row.action.padEnd(12), row.branch, '—', row.reason);
  console.log('deleted:', report.deleted.length, 'would-delete:', report.would_delete.length, 'skipped:', report.skipped.length);
}
