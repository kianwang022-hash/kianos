import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';

const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'codex-watcher-'));
const repo = path.join(temp, 'repo');
const bin = path.join(temp, 'bin');
const stateDir = path.join(temp, 'state');
const codexCalls = path.join(temp, 'codex-calls.log');
const issueFile = path.join(temp, 'issues.json');
const prFile = path.join(temp, 'prs.json');
const commentFile = path.join(temp, 'comments.log');
const codexStdoutFile = path.join(temp, 'codex-stdout.txt');
const codexStderrFile = path.join(temp, 'codex-stderr.txt');
const watcher = path.resolve('scripts/codex-issue-watcher.mjs');

function git(args) {
  return execFileSync('git', args, { cwd: repo, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

try {
  fs.mkdirSync(repo, { recursive: true });
  execFileSync('git', ['init', '-b', 'main'], { cwd: repo });
  git(['config', 'user.name', 'Watcher Test']);
  git(['config', 'user.email', 'watcher@example.invalid']);
  fs.writeFileSync(path.join(repo, 'README.md'), 'test\n');
  git(['add', '.']); git(['commit', '-m', 'base']);
  git(['remote', 'add', 'origin', 'https://github.com/kianwang022-hash/kianos.git']);

  fs.mkdirSync(bin);
  const fakeGh = path.join(bin, 'gh');
  fs.writeFileSync(fakeGh, `#!/bin/sh
set -eu
if [ "$1" = "issue" ] && [ "$2" = "list" ]; then cat "$WATCHER_ISSUES"; exit 0; fi
if [ "$1" = "pr" ] && [ "$2" = "list" ]; then cat "$WATCHER_PRS"; exit 0; fi
if [ "$1" = "issue" ] && [ "$2" = "view" ]; then
  if [ "$3" = "702" ] || [ "$3" = "703" ]; then
    printf '{"number":%s,"state":"OPEN","updatedAt":"2026-09-21T06:00:00Z"}\n' "$3"
  else
    printf '{"number":%s,"state":"OPEN","updatedAt":"2026-09-21T06:30:00Z"}\n' "$3"
  fi
  exit 0
fi
if [ "$1" = "issue" ] && [ "$2" = "comment" ]; then
  printf '%s\n' "$*" >> "$WATCHER_COMMENTS"
  exit 0
fi
exit 1
`);
  fs.chmodSync(fakeGh, 0o755);

  const fakeGit = path.join(bin, 'git');
  fs.writeFileSync(fakeGit, `#!/bin/sh
set -eu
case "$1 $2" in
  "rev-parse --show-toplevel") printf '%s\n' "$WATCHER_REPO" ;;
  "remote get-url") echo "https://github.com/kianwang022-hash/kianos.git" ;;
  "ls-remote --heads") exit 0 ;;
  *) exec /usr/bin/git "$@" ;;
esac
`);
  fs.chmodSync(fakeGit, 0o755);

  const fakeCodex = path.join(bin, 'codex');
  fs.writeFileSync(fakeCodex, `#!/bin/sh
set -eu
printf '%s\n' "$*" >> "$WATCHER_CODEX_CALLS"
if [ -f "$WATCHER_CODEX_STDOUT_FILE" ]; then cat "$WATCHER_CODEX_STDOUT_FILE"; fi
if [ -n "\${WATCHER_CODEX_STDERR_FILE:-}" ] && [ -f "$WATCHER_CODEX_STDERR_FILE" ]; then cat "$WATCHER_CODEX_STDERR_FILE" >&2; fi
exit "\${WATCHER_CODEX_EXIT_CODE:-0}"
`);
  fs.chmodSync(fakeCodex, 0o755);

  const baseEnv = {
    ...process.env,
    KIANOS_CODEX_PROJECT_DIR: repo,
    KIANOS_CODEX_EXEC_REPO: repo,
    KIANOS_CODEX_EXEC_MODEL: 'gpt-6-astra',
    KIANOS_CODEX_EXEC_EFFORT: 'high',
    KIANOS_CODEX_WATCHER_STATE_DIR: stateDir,
    KIANOS_GH_BIN: fakeGh,
    KIANOS_GIT_BIN: fakeGit,
    KIANOS_CODEX_BIN: fakeCodex,
    WATCHER_REPO: repo,
    WATCHER_ISSUES: issueFile,
    WATCHER_PRS: prFile,
    WATCHER_CODEX_CALLS: codexCalls,
    WATCHER_COMMENTS: commentFile,
    WATCHER_CODEX_STDOUT_FILE: codexStdoutFile,
    WATCHER_CODEX_STDERR_FILE: codexStderrFile,
    KIANOS_CODEX_WATCHER_RETRY_MS: '3600000'
  };

  fs.writeFileSync(issueFile, JSON.stringify([{
    number: 700,
    title: 'Codex execution: running watcher migration',
    body: '<!-- kian-codex-task-running:v1 -->\nReplace `<!-- kian-codex-task:v1 -->` only after proof.',
    createdAt: '2026-09-21T05:00:00Z',
    updatedAt: '2026-09-21T05:00:00Z'
  }]) + '\n');
  fs.writeFileSync(prFile, '[]\n');
  let out = JSON.parse(execFileSync(process.execPath, [watcher, '--json'], { cwd: repo, env: baseEnv, encoding: 'utf8' }));
  assert.equal(out.status, 'quiet');
  assert.equal(out.reason, 'no-actionable-issue');
  assert.equal(fs.existsSync(codexCalls), false, 'empty queue must not invoke Codex');

  const lockDir = path.join(stateDir, 'lock');
  fs.mkdirSync(lockDir, { recursive: true });
  fs.writeFileSync(path.join(lockDir, 'owner.json'), JSON.stringify({ pid: process.pid }) + '\n');
  out = JSON.parse(execFileSync(process.execPath, [watcher, '--json'], { cwd: repo, env: baseEnv, encoding: 'utf8' }));
  assert.equal(out.status, 'quiet');
  assert.equal(out.reason, 'already-running', 'live lock owner must suppress duplicate watcher execution');
  fs.rmSync(lockDir, { recursive: true, force: true });

  fs.writeFileSync(issueFile, JSON.stringify([{
    number: 701,
    title: 'Codex execution: test watcher',
    body: '<!-- kian-codex-task:v1 -->\n## Goal\nTest',
    createdAt: '2026-09-21T06:00:00Z',
    updatedAt: '2026-09-21T06:00:00Z'
  }]) + '\n');

  fs.mkdirSync(lockDir, { recursive: true });
  fs.writeFileSync(path.join(lockDir, 'owner.json'), JSON.stringify({ pid: 2147483647 }) + '\n');
  out = JSON.parse(execFileSync(process.execPath, [watcher, '--dry-run', '--json'], { cwd: repo, env: baseEnv, encoding: 'utf8' }));
  assert.equal(out.status, 'would-launch');
  assert.equal(out.issue, 701);
  assert.equal(fs.existsSync(codexCalls), false, 'dead lock owner must be recovered without invoking Codex in dry-run');

  fs.mkdirSync(lockDir, { recursive: true });
  const old = new Date(Date.now() - 60 * 1000);
  fs.utimesSync(lockDir, old, old);
  out = JSON.parse(execFileSync(process.execPath, [watcher, '--dry-run', '--json'], { cwd: repo, env: baseEnv, encoding: 'utf8' }));
  assert.equal(out.status, 'would-launch');
  assert.equal(out.issue, 701, 'legacy ownerless stale lock must be recovered after the short race grace');

  out = JSON.parse(execFileSync(process.execPath, [watcher, '--json'], { cwd: repo, env: baseEnv, encoding: 'utf8' }));
  assert.equal(out.status, 'launched');
  assert.equal(out.issue, 701);
  const call = fs.readFileSync(codexCalls, 'utf8');
  assert.match(call, /exec --ephemeral --sandbox workspace-write/);
  assert.match(call, /--model gpt-6-astra/);
  assert.match(call, /model_reasoning_effort="high"/);
  assert.match(call, /ISSUE BODY/);
  assert.match(call, /Issue #701/);

  const before = fs.readFileSync(codexCalls, 'utf8');
  out = JSON.parse(execFileSync(process.execPath, [watcher, '--json'], { cwd: repo, env: baseEnv, encoding: 'utf8' }));
  assert.equal(out.status, 'quiet');
  assert.equal(out.reason, 'active-or-cooling-only');
  assert.equal(fs.readFileSync(codexCalls, 'utf8'), before, 'cooldown must not burn another Codex run');

  fs.rmSync(stateDir, { recursive: true, force: true });
  fs.writeFileSync(prFile, JSON.stringify([{ number: 900, headRefName: 'codex/issue701-test' }]) + '\n');
  out = JSON.parse(execFileSync(process.execPath, [watcher, '--json'], { cwd: repo, env: baseEnv, encoding: 'utf8' }));
  assert.equal(out.status, 'quiet');
  assert.equal(out.reason, 'active-or-cooling-only');
  assert.equal(fs.readFileSync(codexCalls, 'utf8'), before, 'open PR must suppress duplicate Codex run');

  fs.rmSync(stateDir, { recursive: true, force: true });
  fs.writeFileSync(prFile, '[]\n');
  fs.writeFileSync(codexStdoutFile, 'DIAGNOSED\nroot_cause: synthetic relay failure\nlearner_state_safe: yes\nrepair_owner: exact owner\nauto_repairable: yes\nneeds_kian: none\n');
  fs.writeFileSync(issueFile, JSON.stringify([{
    number: 702,
    title: 'Codex execution: missing durable receipt',
    body: '<!-- kian-codex-task:v1 -->\n## Goal\nExit without GitHub mutation',
    createdAt: '2026-09-21T06:00:00Z',
    updatedAt: '2026-09-21T06:00:00Z'
  }]) + '\n');
  const missingReceipt = spawnSync(process.execPath, [watcher, '--json'], {
    cwd: repo,
    env: baseEnv,
    encoding: 'utf8'
  });
  assert.equal(missingReceipt.status, 2, 'missing durable receipt must make the watcher run non-successful');
  out = JSON.parse(missingReceipt.stdout);
  assert.equal(out.status, 'receipt-missing');
  assert.equal(out.issue, 702);
  assert.equal(out.exit_code, 3);
  const persistedReceipt = fs.readFileSync(commentFile, 'utf8');
  assert.match(persistedReceipt, /AUTO EXECUTOR RECEIPT/);
  assert.match(persistedReceipt, /root_cause: synthetic relay failure/);

  fs.rmSync(stateDir, { recursive: true, force: true });
  fs.rmSync(commentFile, { force: true });
  fs.rmSync(codexStdoutFile, { force: true });
  fs.writeFileSync(codexStderrFile, 'synthetic codex failure: permission denied\n');
  fs.writeFileSync(issueFile, JSON.stringify([{
    number: 703,
    title: 'Codex execution: failed executor',
    body: '<!-- kian-codex-task:v1 -->\n## Goal\nFail and preserve error',
    createdAt: '2026-09-21T06:00:00Z',
    updatedAt: '2026-09-21T06:00:00Z'
  }]) + '\n');
  const failedEnv = { ...baseEnv, WATCHER_CODEX_EXIT_CODE: '1' };
  const failedExecution = spawnSync(process.execPath, [watcher, '--json'], {
    cwd: repo,
    env: failedEnv,
    encoding: 'utf8'
  });
  assert.equal(failedExecution.status, 2, 'non-zero Codex exit must keep watcher run non-successful');
  out = JSON.parse(failedExecution.stdout);
  assert.equal(out.status, 'launch-failed');
  assert.equal(out.issue, 703);
  assert.equal(out.exit_code, 1);
  const failedReceipt = fs.readFileSync(commentFile, 'utf8');
  assert.match(failedReceipt, /AUTO_EXECUTION_FAILED/);
  assert.match(failedReceipt, /exit_code: 1/);
  assert.match(failedReceipt, /synthetic codex failure: permission denied/);

  console.log('PASS Codex issue watcher: zero-model idle, owner-aware lock recovery, durable success/failure receipts, one-task one-run, cooldown and PR dedupe');
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}
