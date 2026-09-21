import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';

const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'codex-policy-'));
const repo = path.join(temp, 'repo');
const bin = path.join(temp, 'bin');
const stateDir = path.join(temp, 'state');
const issueFile = path.join(temp, 'issue.json');
const calls = path.join(temp, 'calls.log');
const comments = path.join(temp, 'comments.log');
const watcher = path.resolve('scripts/codex-issue-watcher.mjs');

try {
  fs.mkdirSync(repo, { recursive: true });
  execFileSync('git', ['init', '-b', 'main'], { cwd: repo, stdio: 'ignore' });
  execFileSync('git', ['config', 'user.name', 'Policy Test'], { cwd: repo });
  execFileSync('git', ['config', 'user.email', 'policy@example.invalid'], { cwd: repo });
  fs.writeFileSync(path.join(repo, 'README.md'), 'test\n');
  execFileSync('git', ['add', '.'], { cwd: repo });
  execFileSync('git', ['commit', '-m', 'base'], { cwd: repo, stdio: 'ignore' });
  execFileSync('git', ['remote', 'add', 'origin', 'https://github.com/kianwang022-hash/kianos.git'], { cwd: repo });

  fs.mkdirSync(bin);
  const gh = path.join(bin, 'gh');
  fs.writeFileSync(gh, `#!/usr/bin/env node
const fs = require('fs');
const a = process.argv.slice(2);
if (a[0] === 'issue' && a[1] === 'list') { process.stdout.write(fs.readFileSync(process.env.ISSUE_FILE)); process.exit(0); }
if (a[0] === 'pr' && a[1] === 'list') { process.stdout.write('[]\\n'); process.exit(0); }
if (a[0] === 'issue' && a[1] === 'view') { process.stdout.write(JSON.stringify({number:Number(a[2]),state:'OPEN',updatedAt:'2026-09-21T09:00:00Z'})+'\\n'); process.exit(0); }
if (a[0] === 'issue' && a[1] === 'comment') { fs.appendFileSync(process.env.COMMENTS, a.join(' ')+'\\n'); process.exit(0); }
if (a[0] === 'auth' && a[1] === 'token') { process.stdout.write('token-for-test\\n'); process.exit(0); }
process.exit(1);
`);
  fs.chmodSync(gh, 0o755);

  const codex = path.join(bin, 'codex');
  fs.writeFileSync(codex, `#!/usr/bin/env node
const fs = require('fs');
fs.appendFileSync(process.env.CALLS, process.argv.slice(2).join(' ')+'\\n');
if (process.argv[2] === 'cloud') process.stdout.write('https://chatgpt.com/codex/tasks/task_test\\n');
process.exit(0);
`);
  fs.chmodSync(codex, 0o755);

  const baseEnv = {
    ...process.env,
    KIANOS_CODEX_PROJECT_DIR: repo,
    KIANOS_CODEX_EXEC_REPO: repo,
    KIANOS_CODEX_WATCHER_STATE_DIR: stateDir,
    KIANOS_GH_BIN: gh,
    KIANOS_GIT_BIN: '/usr/bin/git',
    KIANOS_CODEX_BIN: codex,
    KIANOS_CODEX_WATCHER_RETRY_MS: '1',
    ISSUE_FILE: issueFile,
    CALLS: calls,
    COMMENTS: comments
  };

  function setIssue(number, body) {
    fs.rmSync(stateDir, { recursive: true, force: true });
    fs.rmSync(calls, { force: true });
    fs.rmSync(comments, { force: true });
    fs.writeFileSync(issueFile, JSON.stringify([{
      number,
      title: 'Codex execution: policy test',
      body,
      createdAt: '2026-09-21T06:00:00Z',
      updatedAt: '2026-09-21T06:00:00Z'
    }]) + '\n');
  }

  setIssue(801, '<!-- kian-codex-task:v1 -->\n## Goal\nDefault');
  execFileSync(process.execPath, [watcher, '--json'], { cwd: repo, env: baseEnv, encoding: 'utf8' });
  assert.match(fs.readFileSync(calls, 'utf8'), /--model gpt-5\.6-terra/);

  setIssue(802, '<!-- kian-codex-task:v1 -->\n<!-- kian-codex-model:sol -->\n## Goal\nSol');
  execFileSync(process.execPath, [watcher, '--json'], { cwd: repo, env: baseEnv, encoding: 'utf8' });
  assert.match(fs.readFileSync(calls, 'utf8'), /--model gpt-5\.6-sol/);

  setIssue(803, '<!-- kian-codex-task:v1 -->\n<!-- kian-codex-model:astra -->\n## Goal\nAstra');
  const blocked = spawnSync(process.execPath, [watcher, '--json'], { cwd: repo, env: baseEnv, encoding: 'utf8' });
  assert.equal(blocked.status, 2);
  assert.equal(JSON.parse(blocked.stdout).status, 'approval-required');
  assert.equal(fs.existsSync(calls), false);
  assert.match(fs.readFileSync(comments, 'utf8'), /ASTRA_REQUIRES_KIAN_APPROVAL/);

  setIssue(804, '<!-- kian-codex-task:v1 -->\n<!-- kian-codex-model:astra -->\n<!-- kian-codex-astra-approved-by-kian:v1 -->\n## Goal\nApproved Astra');
  execFileSync(process.execPath, [watcher, '--json'], { cwd: repo, env: baseEnv, encoding: 'utf8' });
  assert.match(fs.readFileSync(calls, 'utf8'), /--model gpt-6-astra/);

  setIssue(805, '<!-- kian-codex-task:v1 -->\n<!-- kian-codex-model:sol -->\n## Goal\nCloud');
  const cloudEnv = { ...baseEnv, KIANOS_CODEX_CLOUD_ENV_ID: 'env_test' };
  const cloud = JSON.parse(execFileSync(process.execPath, [watcher, '--json'], { cwd: repo, env: cloudEnv, encoding: 'utf8' }));
  assert.equal(cloud.status, 'cloud-dispatched');
  assert.match(fs.readFileSync(calls, 'utf8'), /cloud exec --env env_test/);
  assert.match(fs.readFileSync(comments, 'utf8'), /CODEX CLOUD TASK DISPATCHED/);

  setIssue(806, '<!-- kian-codex-task:v1 -->\n<!-- kian-codex-runtime:local -->\n<!-- kian-codex-model:sol -->\n## Goal\nLocal');
  execFileSync(process.execPath, [watcher, '--json'], { cwd: repo, env: cloudEnv, encoding: 'utf8' });
  const localCall = fs.readFileSync(calls, 'utf8');
  assert.match(localCall, /^exec /);
  assert.doesNotMatch(localCall, /cloud exec/);

  console.log('PASS Codex execution policy: Terra default, Sol escalation, Astra approval gate, Cloud-visible routing, local override');
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}
