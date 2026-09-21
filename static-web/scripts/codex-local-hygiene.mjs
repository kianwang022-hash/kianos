#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import process from 'node:process';

const apply = process.argv.includes('--apply');
const json = process.argv.includes('--json');
const noFetch = process.argv.includes('--no-fetch');

function run(file, args, { cwd = process.cwd(), allowFail = false, env = process.env } = {}) {
  const result = spawnSync(file, args, { cwd, encoding: 'utf8', env });
  if (!allowFail && result.status !== 0) {
    const error = new Error((file === 'git' ? 'GIT' : 'COMMAND') + '_FAILED:' + args.join(' '));
    error.status = result.status;
    throw error;
  }
  return {
    status: result.status,
    stdout: String(result.stdout || '').trim(),
    stderr: String(result.stderr || '').trim()
  };
}
const git = (args, options) => run('git', args, options).stdout;

const repoRoot = git(['rev-parse', '--show-toplevel']);
if (!git(['remote', 'get-url', 'origin'])) throw new Error('ORIGIN_REQUIRED');
if (!noFetch) git(['fetch', '--prune', 'origin', '+refs/heads/*:refs/remotes/origin/*']);
if (run('git', ['show-ref', '--verify', '--quiet', 'refs/remotes/origin/main'], { allowFail: true }).status !== 0) {
  throw new Error('ORIGIN_MAIN_REQUIRED');
}

const ghProbe = run('gh', ['--version'], { allowFail: true });
const ghAvailable = ghProbe.status === 0;
let repoFullName = null;
if (ghAvailable) {
  const repoView = run('gh', ['repo', 'view', '--json', 'nameWithOwner'], { allowFail: true });
  if (repoView.status === 0) {
    try { repoFullName = JSON.parse(repoView.stdout).nameWithOwner || null; } catch {}
  }
}

function ghJson(args) {
  if (!ghAvailable || !repoFullName) return null;
  const result = run('gh', args, { allowFail: true });
  if (result.status !== 0) return null;
  try { return JSON.parse(result.stdout || 'null'); } catch { return null; }
}

const branchLines = git(['for-each-ref', '--format=%(refname:short)', 'refs/heads/'])
  .split('\n').filter(Boolean);
const candidates = branchLines.filter((name) => /^codex\/issue-?\d+-[A-Za-z0-9._-]+$/.test(name));

const worktreeRaw = git(['worktree', 'list', '--porcelain']);
const worktrees = new Map();
let current = null;
for (const line of worktreeRaw.split('\n')) {
  if (line.startsWith('worktree ')) {
    current = { path: line.slice('worktree '.length), branch: null };
  } else if (line.startsWith('branch refs/heads/') && current) {
    current.branch = line.slice('branch refs/heads/'.length);
    worktrees.set(current.branch, current.path);
  } else if (line === '') {
    current = null;
  }
}

const rootBranch = run('git', ['symbolic-ref', '--quiet', '--short', 'HEAD'], { allowFail: true }).stdout || null;
const resolvedRoot = fs.realpathSync(repoRoot);
const rows = [];

for (const branchName of candidates) {
  const issueMatch = branchName.match(/^codex\/issue-?(\d+)-/);
  const issueNumber = Number(issueMatch?.[1] || 0);
  const row = { branch: branchName, issue: issueNumber || null, action: 'skip', reason: null, worktree: worktrees.get(branchName) || null };

  if (branchName === rootBranch) {
    row.reason = 'checked-out-in-root';
    rows.push(row);
    continue;
  }

  if (run('git', ['show-ref', '--verify', '--quiet', 'refs/remotes/origin/' + branchName], { allowFail: true }).status === 0) {
    row.reason = 'remote-still-active';
    rows.push(row);
    continue;
  }

  if (!ghAvailable || !repoFullName) {
    row.reason = 'github-cli-unavailable';
    rows.push(row);
    continue;
  }

  const issue = ghJson(['issue', 'view', String(issueNumber), '--repo', repoFullName, '--json', 'state,stateReason']);
  if (!issue || issue.state !== 'CLOSED' || issue.stateReason !== 'COMPLETED') {
    row.reason = issue ? 'issue-not-completed' : 'issue-read-failed';
    rows.push(row);
    continue;
  }

  const prs = ghJson(['pr', 'list', '--repo', repoFullName, '--head', branchName, '--state', 'merged',
    '--json', 'number,headRefName,headRefOid,mergedAt', '--limit', '20']);
  const mergedPr = Array.isArray(prs)
    ? prs.find((pr) => pr?.headRefName === branchName && pr?.mergedAt && /^[0-9a-f]{40}$/.test(String(pr?.headRefOid || '')))
    : null;
  if (!mergedPr) {
    row.reason = 'merged-pr-not-found';
    rows.push(row);
    continue;
  }

  const tip = git(['rev-parse', 'refs/heads/' + branchName]);
  const contained = run('git', ['merge-base', '--is-ancestor', tip, 'refs/remotes/origin/main'], { allowFail: true }).status === 0;
  const exactMergedHead = tip === mergedPr.headRefOid;
  if (!contained && !exactMergedHead) {
    row.reason = 'local-tip-not-accepted';
    rows.push(row);
    continue;
  }

  if (row.worktree) {
    let resolvedWorktree = null;
    try { resolvedWorktree = fs.realpathSync(row.worktree); } catch {}
    if (!resolvedWorktree || resolvedWorktree === resolvedRoot) {
      row.reason = 'protected-root-or-missing-worktree';
      rows.push(row);
      continue;
    }
    const dirty = git(['status', '--porcelain=v1', '--untracked-files=all'], { cwd: row.worktree });
    if (dirty) {
      row.reason = 'dirty-worktree';
      rows.push(row);
      continue;
    }
    if (apply) {
      const removed = run('git', ['worktree', 'remove', row.worktree], { allowFail: true });
      if (removed.status !== 0) {
        row.reason = 'worktree-remove-failed';
        rows.push(row);
        continue;
      }
    }
  }

  if (apply) {
    const deletionArgs = contained ? ['branch', '-d', branchName] : ['branch', '-D', branchName];
    const deleted = run('git', deletionArgs, { allowFail: true });
    if (deleted.status !== 0) {
      row.reason = 'branch-delete-failed';
      rows.push(row);
      continue;
    }
    row.action = 'deleted';
  } else {
    row.action = 'would-delete';
  }
  row.reason = contained ? 'completed-merged-contained-clean' : 'completed-squash-head-clean';
  row.pr = mergedPr.number;
  rows.push(row);
}

const report = {
  schema: 'kianos.codex-local-hygiene.v1',
  mode: apply ? 'apply' : 'dry-run',
  repo: repoRoot,
  github_cli: ghAvailable && Boolean(repoFullName),
  candidates: rows.length,
  deleted: rows.filter((row) => row.action === 'deleted').map((row) => row.branch),
  would_delete: rows.filter((row) => row.action === 'would-delete').map((row) => row.branch),
  skipped: rows.filter((row) => row.action === 'skip').map((row) => ({ branch: row.branch, reason: row.reason })),
  rows
};

if (json) {
  process.stdout.write(JSON.stringify(report) + '\n');
} else {
  console.log(apply ? 'Codex local hygiene — APPLY' : 'Codex local hygiene — DRY RUN');
  for (const row of rows) console.log(row.action.padEnd(12), row.branch, '—', row.reason);
  console.log('deleted:', report.deleted.length, 'would-delete:', report.would_delete.length, 'skipped:', report.skipped.length);
}
