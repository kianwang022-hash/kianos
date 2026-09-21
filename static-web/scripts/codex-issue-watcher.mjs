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
const execRepo = path.resolve(
  process.env.KIANOS_CODEX_EXEC_REPO ||
  path.join(os.homedir(), 'Library/Application Support/KianOS/codex-executor/kianos')
);
const execModel = process.env.KIANOS_CODEX_EXEC_MODEL || 'gpt-6-astra';
const execEffort = process.env.KIANOS_CODEX_EXEC_EFFORT || 'high';
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

function ensureExecRepo(git, origin) {
  if (path.resolve(execRepo) === projectDir) return;
  const gitDir = path.join(execRepo, '.git');
  if (!fs.existsSync(gitDir)) {
    fs.mkdirSync(path.dirname(execRepo), { recursive: true, mode: 0o700 });
    const cloned = run(git, ['clone', '--no-tags', origin, execRepo], {
      cwd: path.dirname(execRepo),
      allowFail: true
    });
    if (cloned.status !== 0) throw new Error('EXEC_REPO_CLONE_FAILED');
  }
  const root = run(git, ['rev-parse', '--show-toplevel'], { cwd: execRepo }).stdout;
  if (path.resolve(root) !== execRepo) throw new Error('EXEC_REPO_ROOT_INVALID');
  const execOrigin = run(git, ['remote', 'get-url', 'origin'], { cwd: execRepo }).stdout;
  if (!execOrigin.includes('kianwang022-hash/kianos')) throw new Error('EXEC_REPO_ORIGIN_INVALID');
  const dirty = run(git, ['status', '--porcelain'], { cwd: execRepo }).stdout;
  if (dirty) throw new Error('EXEC_REPO_DIRTY');
  run(git, ['fetch', 'origin', 'main', '--prune'], { cwd: execRepo });
  run(git, ['checkout', '-B', 'main', 'origin/main'], { cwd: execRepo });
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

  ensureExecRepo(git, origin);

  const prompt = [
    'Execute this bounded KianOS engineering task.',
    'Repository: ' + repoFullName + '.',
    'GitHub Issue #' + selected.number + ': ' + selected.title,
    '',
    '--- ISSUE BODY (authoritative execution envelope, already fetched by the watcher) ---',
    String(selected.body || ''),
    '--- END ISSUE BODY ---',
    '',
    'You are running in a dedicated writable KianOS executor checkout, not the disposable/read-only Current mirror.',
    'Current-first: fetch origin/main if needed, read AGENTS.md, static-web/CURRENT.md, then the exact owner named by the Issue.',
    'Do not depend on GitHub CLI merely to discover the task; the full Issue body is embedded above.',
    'Follow the existing Chat → GitHub → Codex execution envelope exactly.',
    'If a codex/issue' + selected.number + '-* branch already exists, inspect and resume only the branch belonging to this Issue; do not create a duplicate.',
    'Do at most this one Issue. Respect its STOP/Human-Gate boundaries.',
    'Use GitHub as the durable receipt. Do not rely on this launcher prompt as semantic authority.',
    'Before exit, leave the Issue/PR state truthful: accepted work through PR/merge when allowed, otherwise one compact BLOCKED comment.',
    'Also print one compact final receipt to stdout matching the Issue Return receipt, so the watcher can persist it if the GitHub mutation path fails.'
  ].join('\n');

  const codexArgs = [
    'exec', '--ephemeral', '--sandbox', 'workspace-write',
    '--model', execModel,
    '-c', 'model_reasoning_effort="' + execEffort + '"',
    '-c', 'sandbox_workspace_write.network_access=true',
    prompt
  ];

  const ghToken = run(gh, ['auth', 'token'], { allowFail: true }).stdout;
  const executionEnv = ghToken
    ? { ...process.env, GH_TOKEN: ghToken, GITHUB_TOKEN: ghToken }
    : process.env;
  if (ghToken) {
    run(git, ['config', '--local', '--unset-all', 'credential.https://github.com.helper'], {
      cwd: execRepo,
      allowFail: true
    });
    run(git, ['config', '--local', '--add', 'credential.https://github.com.helper', '!' + gh + ' auth git-credential'], {
      cwd: execRepo,
      allowFail: true
    });
  }
  const execution = run(codex, codexArgs, { allowFail: true, cwd: execRepo, env: executionEnv });

  let finalIssue = selected;
  const refreshIssue = () => {
    const result = run(gh, [
      'issue', 'view', String(selected.number), '--repo', repoFullName,
      '--json', 'number,state,updatedAt'
    ], { allowFail: true });
    if (result.status === 0 && result.stdout) {
      try { return { ...selected, ...parseJson(result.stdout, 'ISSUE_REFRESH_INVALID') }; } catch {}
    }
    return selected;
  };
  finalIssue = refreshIssue();

  const postRemote = run(git, [
    'ls-remote', '--heads', 'origin', 'refs/heads/' + 'codex/issue' + selected.number + '-*'
  ], { allowFail: true });
  const postBranches = postRemote.stdout
    ? postRemote.stdout.split('\n').map((line) => line.trim().split(/\s+/)[1]).filter(Boolean)
    : [];
  const postPrResult = run(gh, [
    'pr', 'list', '--repo', repoFullName, '--state', 'open', '--limit', '100',
    '--json', 'number,headRefName'
  ], { allowFail: true });
  let postPrHeads = [];
  if (postPrResult.status === 0 && postPrResult.stdout) {
    try {
      postPrHeads = parseJson(postPrResult.stdout, 'POST_PR_LIST_INVALID')
        .map((pr) => String(pr?.headRefName || ''));
    } catch {}
  }

  const selectedUpdated = Date.parse(String(selected.updatedAt || ''));
  const finalUpdated = Date.parse(String(finalIssue.updatedAt || ''));
  const issueChanged = Number.isFinite(finalUpdated) &&
    (!Number.isFinite(selectedUpdated) || finalUpdated > selectedUpdated);
  const issueClosed = String(finalIssue.state || '').toUpperCase() === 'CLOSED';
  const branchExists = postBranches.length > 0;
  const prExists = postPrHeads.some((head) => head.startsWith('codex/issue' + selected.number + '-'));
  let durableReceipt = issueChanged || issueClosed || branchExists || prExists;
  let receiptFallback = false;

  if (execution.status !== 0 && !durableReceipt) {
    const failureStdout = String(execution.stdout || '').trim().slice(-8000);
    const failureStderr = String(execution.stderr || '').trim().slice(-8000);
    const failureBody = [
      'BLOCKED — AUTO_EXECUTION_FAILED',
      '',
      'The local zero-model watcher automatically selected this Issue, but Codex exited non-zero.',
      'No Issue update/close, codex branch, or PR was observed from the executor.',
      '',
      'exit_code: ' + execution.status,
      'watcher_model: ' + (execModel),
      'watcher_effort: ' + (execEffort),
      failureStdout ? '\n--- executor stdout (tail) ---\n' + failureStdout : '',
      failureStderr ? '\n--- executor stderr (tail) ---\n' + failureStderr : ''
    ].filter(Boolean).join('\n');
    const failureReceipt = run(gh, [
      'issue', 'comment', String(selected.number), '--repo', repoFullName,
      '--body', failureBody
    ], { allowFail: true });
    if (failureReceipt.status === 0) {
      durableReceipt = true;
      finalIssue = refreshIssue();
    }
  }

  if (execution.status === 0 && !durableReceipt) {
    const executorOutput = String(execution.stdout || '').trim().slice(-12000);
    const fallbackBody = executorOutput
      ? [
          'AUTO EXECUTOR RECEIPT — persisted by watcher',
          '',
          executorOutput,
          '',
          'watcher_model: ' + (execModel),
          'watcher_effort: ' + (execEffort)
        ].join('\n')
      : [
          'BLOCKED — AUTO_EXECUTION_NO_DURABLE_RECEIPT',
          '',
          'The local zero-model watcher automatically selected this Issue and the Codex executor exited 0,',
          'but no durable Issue update, codex/issue branch, PR, or stdout receipt was observed afterward.',
          'Task success is therefore not accepted. Re-run only after Chat/owner updates this Issue or after cooldown.',
          '',
          'watcher_model: ' + (execModel),
          'watcher_effort: ' + (execEffort)
        ].join('\n');
    const fallback = run(gh, [
      'issue', 'comment', String(selected.number), '--repo', repoFullName,
      '--body', fallbackBody
    ], { allowFail: true });
    receiptFallback = fallback.status === 0;
    durableReceipt = receiptFallback;
    if (receiptFallback) finalIssue = refreshIssue();
  }

  const finalExit = execution.status !== 0 ? execution.status : (receiptFallback ? 3 : (durableReceipt ? 0 : 4));
  state.issues[String(selected.number)] = {
    issue_updated_at: finalIssue.updatedAt || selected.updatedAt,
    last_attempt_at: new Date().toISOString(),
    last_exit: finalExit,
    retry_after: Date.now() + retryMs
  };
  saveState(state);

  const finalStatus = execution.status !== 0
    ? 'launch-failed'
    : receiptFallback
      ? 'receipt-missing'
      : durableReceipt
        ? 'launched'
        : 'receipt-write-failed';
  emit({
    schema: 'kianos.codex-issue-watcher.v1',
    status: finalStatus,
    issue: selected.number,
    exit_code: finalExit,
    model: execModel,
    effort: execEffort
  }, finalExit === 0 ? 0 : 2);
} finally {
  release();
}
