#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const dryRun = process.argv.includes('--dry-run');
const json = process.argv.includes('--json');
const force = process.argv.includes('--force');
const repoFullName = process.env.KIANOS_CODEX_REPO || 'kianwang022-hash/kianos';
const scriptProjectDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const projectDir = path.resolve(process.env.KIANOS_CODEX_PROJECT_DIR || scriptProjectDir);
const stateDir = path.resolve(
  process.env.KIANOS_CODEX_WATCHER_STATE_DIR ||
  path.join(os.homedir(), 'Library/Application Support/KianOS/codex-issue-watcher')
);
const statePath = path.join(stateDir, 'state.json');
const lockDir = path.join(stateDir, 'lock');
const lockOwnerPath = path.join(lockDir, 'owner.json');
const prefix = 'Codex execution:';
const marker = '<!-- kian-codex-task:v1 -->';
const retryMs = Number(process.env.KIANOS_CODEX_WATCHER_RETRY_MS || 60 * 60 * 1000);

function run(file, args, { cwd = projectDir, allowFail = false, env = process.env, stdio = 'pipe' } = {}) {
  const result = spawnSync(file, args, { cwd, encoding: 'utf8', env, stdio });
  if (!allowFail && result.status !== 0) {
    const error = new Error('COMMAND_FAILED:' + path.basename(file));
    error.status = result.status;
    throw error;
  }
  return {
    status: result.status ?? 1,
    stdout: typeof result.stdout === 'string' ? result.stdout.trim() : '',
    stderr: typeof result.stderr === 'string' ? result.stderr.trim() : ''
  };
}

function resolveBin(envName, fallback) {
  const override = process.env[envName];
  if (override) return override;
  const probe = run('/usr/bin/env', ['which', fallback], { allowFail: true });
  return probe.status === 0 ? probe.stdout : null;
}

function parseJson(raw, code) {
  try { return JSON.parse(raw); } catch { throw new Error(code); }
}

function hasActiveMarker(body) {
  return String(body || '').split(/\r?\n/).some((line) => line.trim() === marker);
}

function loadState() {
  try {
    const value = parseJson(fs.readFileSync(statePath, 'utf8'), 'STATE_JSON_INVALID');
    return value && value.schema === 'kianos.codex-issue-watcher.state.v1' ? value : { schema: 'kianos.codex-issue-watcher.state.v1', issues: {} };
  } catch (error) {
    if (error?.code === 'ENOENT') return { schema: 'kianos.codex-issue-watcher.state.v1', issues: {} };
    throw error;
  }
}

function saveState(state) {
  const tmp = statePath + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(state, null, 2) + '\n', { mode: 0o600 });
  fs.renameSync(tmp, statePath);
}

function emit(report, code = 0) {
  if (json) process.stdout.write(JSON.stringify(report) + '\n');
  else {
    console.log('Codex Issue Watcher:', report.status);
    if (report.issue) console.log('issue:', '#' + report.issue);
    if (report.reason) console.log('reason:', report.reason);
  }
  process.exit(code);
}

fs.mkdirSync(stateDir, { recursive: true, mode: 0o700 });
try { fs.chmodSync(stateDir, 0o700); } catch {}

function processIsAlive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    if (error?.code === 'EPERM') return true;
    if (error?.code === 'ESRCH') return false;
    return true;
  }
}

function writeLockOwner() {
  fs.writeFileSync(lockOwnerPath, JSON.stringify({
    pid: process.pid,
    started_at: new Date().toISOString()
  }) + '\n', { mode: 0o600 });
}

function lockIsActive() {
  try {
    const owner = parseJson(fs.readFileSync(lockOwnerPath, 'utf8'), 'LOCK_OWNER_INVALID');
    const pid = Number(owner?.pid);
    if (Number.isInteger(pid) && pid > 0) return processIsAlive(pid);
  } catch (error) {
    if (error?.code !== 'ENOENT' && error?.message !== 'LOCK_OWNER_INVALID') return true;
  }

  try {
    return Date.now() - fs.statSync(lockDir).mtimeMs < 30 * 1000;
  } catch {
    return false;
  }
}

let lockHeld = false;
try {
  fs.mkdirSync(lockDir);
  writeLockOwner();
  lockHeld = true;
} catch (error) {
  if (error?.code !== 'EEXIST') throw error;
  if (lockIsActive()) {
    emit({ schema: 'kianos.codex-issue-watcher.v1', status: 'quiet', reason: 'already-running' });
  }
  fs.rmSync(lockDir, { recursive: true, force: true });
  fs.mkdirSync(lockDir);
  writeLockOwner();
  lockHeld = true;
}

const release = () => {
  if (!lockHeld) return;
  try { fs.rmSync(lockDir, { recursive: true, force: true }); } catch {}
  lockHeld = false;
};
process.on('exit', release);
process.on('SIGINT', () => { release(); process.exit(130); });
process.on('SIGTERM', () => { release(); process.exit(143); });

try {
  const git = resolveBin('KIANOS_GIT_BIN', 'git');
  const gh = resolveBin('KIANOS_GH_BIN', 'gh');
  const codex = resolveBin('KIANOS_CODEX_BIN', 'codex');
  if (!git || !gh) throw new Error('GIT_OR_GH_REQUIRED');

  const root = run(git, ['rev-parse', '--show-toplevel']).stdout;
  if (path.resolve(root) !== projectDir) throw new Error('PROJECT_DIR_MUST_BE_REPO_ROOT');

  const origin = run(git, ['remote', 'get-url', 'origin']).stdout;
  if (!origin.includes('kianwang022-hash/kianos')) throw new Error('KIANOS_ORIGIN_REQUIRED');

  const issuesResult = run(gh, [
    'issue', 'list', '--repo', repoFullName, '--state', 'open', '--limit', '100',
    '--json', 'number,title,body,createdAt,updatedAt'
  ]);
  const issues = parseJson(issuesResult.stdout || '[]', 'ISSUE_LIST_INVALID')
    .filter((issue) => issue?.title?.startsWith(prefix) && hasActiveMarker(issue?.body))
    .sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)));

  if (issues.length === 0) {
    emit({ schema: 'kianos.codex-issue-watcher.v1', status: 'quiet', reason: 'no-actionable-issue' });
  }

  const prsResult = run(gh, [
    'pr', 'list', '--repo', repoFullName, '--state', 'open', '--limit', '100',
    '--json', 'number,headRefName'
  ]);
  const openPrHeads = new Set(
    parseJson(prsResult.stdout || '[]', 'PR_LIST_INVALID').map((pr) => String(pr?.headRefName || ''))
  );

  const state = loadState();
  let selected = null;
  let selectedBranches = [];

  for (const issue of issues) {
    const branchPrefix = 'codex/issue' + issue.number + '-';
    if ([...openPrHeads].some((head) => head.startsWith(branchPrefix))) continue;

    const prior = state.issues[String(issue.number)];
    const cooling = Number(prior?.retry_after || 0) > Date.now();
    const priorUpdated = Date.parse(String(prior?.issue_updated_at || ''));
    const currentUpdated = Date.parse(String(issue.updatedAt || ''));
    const materiallyNewer = Number.isFinite(currentUpdated) &&
      (!Number.isFinite(priorUpdated) || currentUpdated > priorUpdated);
    if (!force && cooling && !materiallyNewer) continue;

    const remote = run(git, ['ls-remote', '--heads', 'origin', 'refs/heads/' + branchPrefix + '*'], { allowFail: true });
    selectedBranches = remote.stdout
      ? remote.stdout.split('\n').map((line) => line.trim().split(/\s+/)[1]).filter(Boolean)
      : [];
    selected = issue;
    break;
  }

  if (!selected) {
    emit({ schema: 'kianos.codex-issue-watcher.v1', status: 'quiet', reason: 'active-or-cooling-only' });
  }

  if (dryRun) {
    emit({
      schema: 'kianos.codex-issue-watcher.v1',
      status: 'would-launch',
      issue: selected.number,
      remote_branches: selectedBranches.length
    });
  }

  if (!codex) throw new Error('CODEX_REQUIRED_FOR_ACTIONABLE_ISSUE');

  const prompt = [
    'Execute GitHub Issue #' + selected.number + ' in ' + repoFullName + '.',
    'Current-first: fetch origin/main, read AGENTS.md, static-web/CURRENT.md, then the Issue and exact owner.',
    'Follow the existing Chat → GitHub → Codex execution envelope exactly.',
    'If a codex/issue' + selected.number + '-* branch already exists, inspect and resume only the branch belonging to this Issue; do not create a duplicate.',
    'Do at most this one Issue. Respect its STOP/Human-Gate boundaries.',
    'Use GitHub as the durable receipt. Do not rely on this launcher prompt as semantic authority.',
    'Before exit, leave the Issue/PR state truthful: accepted work through PR/merge when allowed, otherwise one compact BLOCKED comment.'
  ].join('\n');

  const codexArgs = [
    'exec', '--ephemeral', '--sandbox', 'workspace-write',
    '--model', process.env.KIANOS_CODEX_WATCHER_MODEL || 'gpt-5.6-terra',
    '-c', 'model_reasoning_effort="' + (process.env.KIANOS_CODEX_WATCHER_EFFORT || 'medium') + '"',
    '-c', 'sandbox_workspace_write.network_access=true',
    prompt
  ];

  const execution = run(codex, codexArgs, { allowFail: true, stdio: 'ignore' });

  let finalIssue = selected;
  const refresh = run(gh, [
    'issue', 'view', String(selected.number), '--repo', repoFullName,
    '--json', 'number,state,updatedAt'
  ], { allowFail: true });
  if (refresh.status === 0 && refresh.stdout) {
    try { finalIssue = { ...selected, ...parseJson(refresh.stdout, 'ISSUE_REFRESH_INVALID') }; } catch {}
  }

  state.issues[String(selected.number)] = {
    issue_updated_at: finalIssue.updatedAt || selected.updatedAt,
    last_attempt_at: new Date().toISOString(),
    last_exit: execution.status,
    retry_after: Date.now() + retryMs
  };
  saveState(state);

  emit({
    schema: 'kianos.codex-issue-watcher.v1',
    status: execution.status === 0 ? 'launched' : 'launch-failed',
    issue: selected.number,
    exit_code: execution.status,
    model: process.env.KIANOS_CODEX_WATCHER_MODEL || 'gpt-5.6-terra',
    effort: process.env.KIANOS_CODEX_WATCHER_EFFORT || 'medium'
  }, execution.status === 0 ? 0 : 2);
} finally {
  release();
}
