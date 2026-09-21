#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { spawn } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const dryRun = process.argv.includes('--dry-run');
const json = process.argv.includes('--json');
const repoFullName = process.env.KIANOS_CODEX_REPO || 'kianwang022-hash/kianos';
const projectDir = fs.realpathSync(process.env.KIANOS_CODEX_PROJECT_DIR || path.join(path.dirname(fileURLToPath(import.meta.url)), '../..'));
const stateDir = path.resolve(process.env.KIANOS_CODEX_WATCHER_STATE_DIR || path.join(os.homedir(), 'Library/Application Support/KianOS/codex-issue-watcher'));
const execRepo = path.resolve(process.env.KIANOS_CODEX_EXEC_REPO || path.join(os.homedir(), 'Library/Application Support/KianOS/codex-executor/kianos'));
const statePath = path.join(stateDir, 'state.json');
const lockDir = path.join(stateDir, 'lock');
const ownerPath = path.join(lockDir, 'owner.json');
const marker = '<!-- kian-codex-task:v1 -->';
const statusMarkers = /^\s*<!-- kian-codex-task(?:-running|-paused)?:v1 -->\s*$/gm;
const stateSchema = 'kianos.codex-issue-watcher.state.v2';
const resultSchema = 'kianos.codex-execution-result.v1';
const reasons = ['NONE', 'AUTHORIZATION_REQUIRED', 'SOURCE_UNAVAILABLE', 'QUOTA_EXHAUSTED', 'TASK_CONFLICT', 'PROOF_FAILED', 'PLATFORM_LIMITATION', 'REVIEW_REQUIRED'];
const terminalStates = new Set(['BLOCKED', 'PR_READY', 'NEEDS_RECONCILIATION']);
let commandMs;
let executorMs;
let lockHeld = false;
let activeChild = null;
let ownedClaim = null;
let state;
let gh;
const temporaryFiles = new Set();

function fail(code) { throw new Error(code); }
function parse(raw, code) { try { return JSON.parse(raw); } catch { fail(code); } }
function positiveConfig(name, fallback, min, max) {
  const raw = process.env[name];
  if (raw === undefined) return fallback;
  if (!/^\d+$/.test(raw) || !Number.isSafeInteger(Number(raw)) || Number(raw) < min || Number(raw) > max) fail('CONFIG_INVALID');
  return Number(raw);
}
function report(value, exitCode = 0) {
  const result = { schema: 'kianos.codex-issue-watcher.v1', ...value };
  process.stdout.write(json ? JSON.stringify(result) + '\n' : 'Codex Issue Watcher: ' + result.status + (result.reason ? ' (' + result.reason + ')' : '') + '\n');
  process.exitCode = exitCode;
}
function alive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try { process.kill(pid, 0); return true; } catch (error) { return error.code !== 'ESRCH'; }
}
function groupAlive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return null;
  try { process.kill(-pid, 0); return true; } catch (error) { return error.code !== 'ESRCH'; }
}
function killGroup(pid, signal) {
  if (!pid) return;
  try { process.kill(-pid, signal); } catch (error) { if (error.code !== 'ESRCH') throw error; }
}
function release() {
  if (!lockHeld) return;
  try {
    const owner = parse(fs.readFileSync(ownerPath, 'utf8'), 'LOCK_INVALID');
    if (owner.pid === process.pid) fs.rmSync(lockDir, { recursive: true });
  } catch {}
  lockHeld = false;
}
function acquire() {
  // Serialize recovery too: a second stale-lock reclaimer must not remove a new owner.
  const gate = path.join(stateDir, 'lock-acquire');
  try { fs.mkdirSync(gate); } catch (error) { if (error.code === 'EEXIST') fail('LOCK_RECOVERY_UNRESOLVED'); throw error; }
  try { return acquireUnderGate(); } finally { fs.rmdirSync(gate); }
}
function acquireUnderGate() {
  try { fs.mkdirSync(lockDir); }
  catch (error) {
    if (error.code !== 'EEXIST') throw error;
    let owner;
    try { owner = JSON.parse(fs.readFileSync(ownerPath, 'utf8')); }
    catch (readError) {
      // Only an old, truly ownerless lock can be recovered. Corrupt ownership is ambiguous.
      if (readError.code !== 'ENOENT') fail('LOCK_INVALID');
      if (Date.now() - fs.statSync(lockDir).mtimeMs < 30000) return false;
    }
    if (owner && (!Number.isInteger(owner.pid) || owner.pid <= 0)) fail('LOCK_INVALID');
    if (owner && alive(owner.pid)) return false;
    fs.rmSync(lockDir, { recursive: true });
    try { fs.mkdirSync(lockDir); } catch (race) { if (race.code === 'EEXIST') return false; throw race; }
  }
  lockHeld = true;
  fs.writeFileSync(ownerPath, JSON.stringify({ pid: process.pid, started_at: new Date().toISOString() }), { mode: 0o600 });
  return true;
}

// Every child gets a private process group. A deadline also kills descendants that
// retain pipes after their immediate parent exits; no unrelated process is signalled.
async function run(file, args, { cwd = projectDir, timeout = commandMs, discard = false, onSpawn } = {}) {
  return new Promise((resolve) => {
    let stdout = '', stderr = '', reason = null, finished = false;
    const child = spawn(file, args, { cwd, env: process.env, detached: true, stdio: ['ignore', discard ? 'ignore' : 'pipe', discard ? 'ignore' : 'pipe'] });
    activeChild = child;
    let killer;
    const stop = (code) => {
      if (reason) return;
      reason = code;
      try { killGroup(child.pid, 'SIGTERM'); } catch {}
      killer = setTimeout(() => { try { killGroup(child.pid, 'SIGKILL'); } catch {} }, 150);
    };
    const deadline = setTimeout(() => stop('TIMEOUT'), timeout);
    const finish = (status) => {
      if (finished) return;
      finished = true;
      clearTimeout(deadline);
      clearTimeout(killer);
      // A child can exit before its descendants: terminate that owned group as well.
      try { killGroup(child.pid, 'SIGKILL'); } catch {}
      if (activeChild === child) activeChild = null;
      resolve({ status: status ?? 1, stdout: stdout.trim(), stderr: stderr.trim(), reason });
    };
    child.on('error', () => { reason = 'SPAWN_FAILED'; finish(1); });
    child.on('close', finish);
    child.stdout?.on('data', (chunk) => { if (reason) return; stdout += chunk; if (Buffer.byteLength(stdout) > 1048576) stop('OUTPUT_LIMIT'); });
    child.stderr?.on('data', (chunk) => { if (reason) return; stderr += chunk; if (Buffer.byteLength(stderr) > 1048576) stop('OUTPUT_LIMIT'); });
    if (child.pid && onSpawn) {
      try { onSpawn(child.pid); } catch { stop('CLAIM_WRITE_FAILED'); }
    }
  });
}
async function checked(file, args, options) {
  const result = await run(file, args, options);
  if (result.reason) fail(result.reason);
  if (result.status !== 0) fail('COMMAND_FAILED');
  return result.stdout;
}
async function resolveBin(envName, fallback) {
  if (process.env[envName]) return process.env[envName];
  const result = await run('/usr/bin/env', ['which', fallback]);
  return result.status === 0 ? result.stdout : null;
}
function loadState() {
  let value;
  try { value = parse(fs.readFileSync(statePath, 'utf8'), 'STATE_JSON_INVALID'); }
  catch (error) { if (error.code === 'ENOENT') return { schema: stateSchema, issues: {} }; throw error; }
  if (!value || !value.issues || Array.isArray(value.issues) || typeof value.issues !== 'object') fail('STATE_INVALID');
  if (value.schema === 'kianos.codex-issue-watcher.state.v1') {
    // Old timestamps cannot prove an unattempted task. Preserve every attempted ID.
    return { schema: stateSchema, issues: Object.fromEntries(Object.keys(value.issues).map((id) => [id, { status: 'NEEDS_RECONCILIATION', task_digest: null }])) };
  }
  if (value.schema !== stateSchema) fail('STATE_SCHEMA_UNSUPPORTED');
  for (const [id, entry] of Object.entries(value.issues)) {
    if (!/^\d+$/.test(id) || !entry || (!terminalStates.has(entry.status) && entry.status !== 'CLAIMED')) fail('STATE_INVALID');
    if (entry.status !== 'NEEDS_RECONCILIATION' && (!/^[a-f0-9]{64}$/.test(entry.task_digest) || !/^([a-f0-9]{8}-)([a-f0-9]{4}-){3}[a-f0-9]{12}$/.test(entry.run_id))) fail('STATE_INVALID');
  }
  return value;
}
function saveState() {
  const encoded = JSON.stringify(state, null, 2) + '\n';
  const tmp = statePath + '.' + process.pid + '.tmp';
  temporaryFiles.add(tmp);
  const fd = fs.openSync(tmp, 'wx', 0o600);
  try { fs.writeFileSync(fd, encoded); fs.fsyncSync(fd); } finally { fs.closeSync(fd); }
  fs.renameSync(tmp, statePath);
  temporaryFiles.delete(tmp);
  const dir = fs.openSync(stateDir, 'r');
  try { fs.fsyncSync(dir); } finally { fs.closeSync(dir); }
  if (fs.readFileSync(statePath, 'utf8') !== encoded) fail('STATE_READBACK_MISMATCH');
}
function taskDigest(issue) {
  return createHash('sha256').update(String(issue.title) + '\n' + String(issue.body).replace(statusMarkers, '').trim()).digest('hex');
}
function rearmToken(body) { return String(body).match(/^<!-- kian-codex-rearm:([A-Za-z0-9-]{8,64}) -->$/m)?.[1] || null; }
function actionable(issue) {
  return Number.isInteger(issue.number) && String(issue.title).startsWith('Codex execution:') && String(issue.body).split(/\r?\n/).some((line) => line.trim() === marker);
}
function profileFor(body) {
  const lines = new Set(String(body).split(/\r?\n/).map((line) => line.trim()));
  if (lines.has('<!-- kian-codex-model:astra -->')) {
    if (!lines.has('<!-- kian-codex-astra-approved-by-kian:v1 -->')) fail('ASTRA_REQUIRES_KIAN_APPROVAL');
    return { model: 'gpt-6-astra', effort: 'high' };
  }
  return { model: lines.has('<!-- kian-codex-model:sol -->') ? 'gpt-5.6-sol' : 'gpt-5.6-terra', effort: 'medium' };
}
async function issueNow(number) {
  return parse(await checked(gh, ['issue', 'view', String(number), '--repo', repoFullName, '--json', 'number,title,body,state']), 'ISSUE_READBACK_INVALID');
}
async function postAndVerify(number, body) {
  const file = path.join(stateDir, 'comment-' + randomUUID() + '.json');
  temporaryFiles.add(file);
  fs.writeFileSync(file, JSON.stringify({ body }), { mode: 0o600 });
  try {
    const posted = parse(await checked(gh, ['api', '--method', 'POST', 'repos/' + repoFullName + '/issues/' + number + '/comments', '--input', file]), 'RECEIPT_INVALID');
    if (!Number.isSafeInteger(posted.id)) fail('RECEIPT_INVALID');
    const saved = parse(await checked(gh, ['api', 'repos/' + repoFullName + '/issues/comments/' + posted.id]), 'RECEIPT_INVALID');
    if (saved.body !== body) fail('RECEIPT_READBACK_MISMATCH');
  } finally { fs.rmSync(file, { force: true }); temporaryFiles.delete(file); }
}
async function ensureExecRepo(git, origin) {
  if (fs.existsSync(execRepo) && fs.realpathSync(execRepo) === projectDir) return;
  if (!fs.existsSync(path.join(execRepo, '.git'))) {
    fs.mkdirSync(path.dirname(execRepo), { recursive: true, mode: 0o700 });
    await checked(git, ['clone', '--no-tags', origin, execRepo], { cwd: path.dirname(execRepo) });
  }
  if (fs.realpathSync(await checked(git, ['rev-parse', '--show-toplevel'], { cwd: execRepo })) !== fs.realpathSync(execRepo)) fail('EXEC_REPO_INVALID');
  const remote = await checked(git, ['remote', 'get-url', 'origin'], { cwd: execRepo });
  if (!remote.includes(repoFullName)) fail('EXEC_REPO_INVALID');
  if (await checked(git, ['status', '--porcelain'], { cwd: execRepo })) fail('EXEC_REPO_DIRTY');
}
function safeProofUrl(value) {
  if (typeof value !== 'string' || value.length > 400) return false;
  try {
    const u = new URL(value);
    const prefix = '/' + repoFullName + '/';
    return u.origin === 'https://github.com' && !u.username && !u.password && !u.search && u.pathname.startsWith(prefix) && /^(?:pull\/\d+|issues\/\d+|commit\/[a-f0-9]{40}|blob\/[a-f0-9]{40}\/[A-Za-z0-9_./-]+)$/.test(u.pathname.slice(prefix.length)) && (!u.hash || /^#issuecomment-\d+$/.test(u.hash));
  } catch { return false; }
}
async function validateResult(raw, issue, claim) {
  const result = parse(raw, 'RESULT_INVALID');
  const keys = ['schema', 'issue', 'run_id', 'task_digest', 'status', 'reason', 'pr_url', 'head_sha', 'proof_urls'];
  if (!result || Object.keys(result).sort().join() !== keys.sort().join() || result.schema !== resultSchema || result.issue !== issue.number || result.run_id !== claim.run_id || result.task_digest !== claim.task_digest || !['PR_READY', 'BLOCKED'].includes(result.status) || !reasons.includes(result.reason) || !Array.isArray(result.proof_urls) || result.proof_urls.length > 5 || !result.proof_urls.every(safeProofUrl)) fail('RESULT_INVALID');
  if (result.status === 'PR_READY') {
    if (result.reason !== 'NONE' || !safeProofUrl(result.pr_url) || !result.pr_url.startsWith('https://github.com/' + repoFullName + '/pull/') || !/^[a-f0-9]{40}$/.test(result.head_sha)) fail('RESULT_INVALID');
    const pr = parse(await checked(gh, ['pr', 'view', result.pr_url, '--repo', repoFullName, '--json', 'state,headRefName,headRefOid,baseRefName']), 'PR_READBACK_INVALID');
    if (pr.state !== 'OPEN' || !String(pr.headRefName).startsWith('codex/issue' + issue.number + '-') || pr.headRefOid !== result.head_sha || pr.baseRefName !== 'main') fail('PR_READBACK_MISMATCH');
  } else if (result.reason === 'NONE' || result.pr_url !== null || result.head_sha !== null) fail('RESULT_INVALID');
  return result;
}

async function main() {
  commandMs = positiveConfig('KIANOS_CODEX_WATCHER_COMMAND_TIMEOUT_MS', 30000, 100, 300000);
  executorMs = positiveConfig('KIANOS_CODEX_WATCHER_EXECUTOR_TIMEOUT_MS', 1800000, 100, 21600000);
  // Legacy configuration is validated, but there is deliberately no automatic retry.
  positiveConfig('KIANOS_CODEX_WATCHER_RETRY_MS', 3600000, 1, 86400000);
  if (process.argv.includes('--force')) fail('FORCE_REARM_NOT_SUPPORTED');
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repoFullName) || process.platform === 'win32') fail('CONFIG_INVALID');
  fs.mkdirSync(stateDir, { recursive: true, mode: 0o700 });
  fs.chmodSync(stateDir, 0o700);
  if (!acquire()) return report({ status: 'quiet', reason: 'already-running' });
  state = loadState();
  const git = await resolveBin('KIANOS_GIT_BIN', 'git');
  gh = await resolveBin('KIANOS_GH_BIN', 'gh');
  if (!git || !gh) fail('GIT_OR_GH_REQUIRED');
  if (fs.realpathSync(await checked(git, ['rev-parse', '--show-toplevel'])) !== projectDir) fail('PROJECT_DIR_INVALID');
  const origin = await checked(git, ['remote', 'get-url', 'origin']);
  if (!origin.includes(repoFullName)) fail('PROJECT_ORIGIN_INVALID');
  for (const [number, claim] of Object.entries(state.issues)) {
    if (claim.status !== 'CLAIMED') continue;
    const group = groupAlive(claim.executor_pid);
    if (group === true) return report({ status: 'quiet', reason: 'executor-still-running', issue: Number(number) });
    if (group === null) return report({ status: 'blocked', reason: 'CLAIM_REQUIRES_CHAT_RECONCILIATION', issue: Number(number) }, 2);
    // The owned process group is gone. A missing observed exit does not prove a
    // failed side effect; terminalize once, never retry, and unblock other tasks.
    Object.assign(claim, { status: 'BLOCKED', reason: 'EXECUTOR_EXIT_UNOBSERVED', executor_pid: null, finished_at: new Date().toISOString() });
    saveState();
    await postAndVerify(Number(number), '<!-- kian-codex-watcher-result:v1 -->\n' + JSON.stringify({ issue: Number(number), run_id: claim.run_id, task_digest: claim.task_digest, status: 'BLOCKED', reason: claim.reason }));
  }
  const issues = parse(await checked(gh, ['issue', 'list', '--repo', repoFullName, '--state', 'open', '--limit', '100', '--json', 'number,title,body,createdAt,updatedAt']), 'ISSUE_LIST_INVALID');
  if (!Array.isArray(issues)) fail('ISSUE_LIST_INVALID');
  const queue = issues.filter(actionable).sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)));
  if (!queue.length) return report({ status: 'quiet', reason: 'no-actionable-issue' });
  const prs = parse(await checked(gh, ['pr', 'list', '--repo', repoFullName, '--state', 'open', '--limit', '100', '--json', 'number,headRefName']), 'PR_LIST_INVALID');
  if (!Array.isArray(prs)) fail('PR_LIST_INVALID');
  for (const issue of queue) {
    const digest = taskDigest(issue);
    const prior = state.issues[String(issue.number)];
    if (prior && (prior.task_digest === digest || (prior.status === 'NEEDS_RECONCILIATION' && (!rearmToken(issue.body) || rearmToken(issue.body) === prior.rearm_token)))) continue;
    if (prs.some((pr) => String(pr.headRefName).startsWith('codex/issue' + issue.number + '-'))) continue;
    let profile;
    try { profile = profileFor(issue.body); }
    catch (error) {
      if (error.message !== 'ASTRA_REQUIRES_KIAN_APPROVAL') throw error;
      if (!dryRun) {
        const blocked = { status: 'BLOCKED', task_digest: digest, run_id: randomUUID(), reason: error.message };
        state.issues[String(issue.number)] = blocked;
        saveState();
        await postAndVerify(issue.number, '<!-- kian-codex-watcher-result:v1 -->\n' + JSON.stringify({ issue: issue.number, ...blocked }));
      }
      continue; // An unapproved expensive job must not starve ordinary work.
    }
    if (dryRun) return report({ status: 'would-launch', issue: issue.number, execution_surface: 'local' });
    const codex = await resolveBin('KIANOS_CODEX_BIN', 'codex');
    if (!codex) fail('CODEX_REQUIRED');
    const claim = { status: 'CLAIMED', task_digest: digest, rearm_token: rearmToken(issue.body), run_id: randomUUID(), started_at: new Date().toISOString(), executor_pid: null };
    state.issues[String(issue.number)] = claim;
    saveState(); // durable before clone, remote claim or model dispatch; ambiguity never retries
    ownedClaim = { issue: issue.number, claim };
    await postAndVerify(issue.number, '<!-- kian-codex-watcher-claim:v1 -->\n' + JSON.stringify({ issue: issue.number, ...claim }));
    const fresh = await issueNow(issue.number);
    if (!actionable(fresh) || String(fresh.state).toUpperCase() !== 'OPEN' || taskDigest(fresh) !== digest) fail('TASK_CHANGED');
    await ensureExecRepo(git, origin);
    const resultPath = path.join(stateDir, 'result-' + claim.run_id + '.json');
    const schemaPath = path.join(stateDir, 'schema-' + claim.run_id + '.json');
    temporaryFiles.add(resultPath); temporaryFiles.add(schemaPath);
    const schema = { type: 'object', additionalProperties: false, required: ['schema', 'issue', 'run_id', 'task_digest', 'status', 'reason', 'pr_url', 'head_sha', 'proof_urls'], properties: {
      schema: { type: 'string', const: resultSchema }, issue: { type: 'integer', const: issue.number }, run_id: { type: 'string', const: claim.run_id }, task_digest: { type: 'string', const: digest }, status: { type: 'string', enum: ['PR_READY', 'BLOCKED'] }, reason: { type: 'string', enum: reasons }, pr_url: { type: ['string', 'null'] }, head_sha: { type: ['string', 'null'] }, proof_urls: { type: 'array', items: { type: 'string' }, maxItems: 5 }
    } };
    fs.writeFileSync(schemaPath, JSON.stringify(schema), { mode: 0o600 });
    const prompt = [
      'Execute only this already-decided bounded KianOS task; create no new task, subagent, model call or automation.',
      'Repository: ' + repoFullName + '. Issue #' + issue.number + ': ' + issue.title,
      '--- ISSUE BODY ---', issue.body, '--- END ISSUE BODY ---',
      'This is the dedicated executor checkout. Re-read current main, AGENTS.md, static-web/CURRENT.md and the exact issue owner before writes; do not overwrite concurrent work.',
      'Use an isolated codex/issue' + issue.number + '-* task worktree. Preserve any existing unique work. Respect STOP and Human-Gate boundaries.',
      'Do not auto-merge, deploy, mutate learner state, rearm a task or escalate models. At most this one task; stop on quota, source, permission, timeout or conflict.',
      'Return PR_READY only for your exact open PR head against main; this is not accepted completion. Otherwise return BLOCKED with an allowed reason.',
      'Final response must match the supplied JSON schema: schema=' + resultSchema + ', issue=' + issue.number + ', run_id=' + claim.run_id + ', task_digest=' + digest + '.',
      'Use only exact same-repository GitHub proof URLs (maximum five), never raw stdout, logs, credentials, local paths or private source contents.',
      'The launcher publishes and reads back this bounded result. Do not treat exit 0, any branch or timestamp change as success.'
    ].join('\n');
    const execution = await run(codex, ['exec', '--ephemeral', '--sandbox', 'workspace-write', '--model', profile.model, '-c', 'model_reasoning_effort="' + profile.effort + '"', '-c', 'sandbox_workspace_write.network_access=true', '--output-schema', schemaPath, '--output-last-message', resultPath, prompt], {
      cwd: execRepo, timeout: executorMs, discard: true,
      onSpawn(pid) { claim.executor_pid = pid; saveState(); }
    });
    if (execution.reason) fail(execution.reason);
    if (execution.status !== 0) fail('EXECUTION_FAILED');
    const finalIssue = await issueNow(issue.number);
    if (String(finalIssue.state).toUpperCase() !== 'OPEN' || taskDigest(finalIssue) !== digest) fail('TASK_CHANGED');
    if (!fs.existsSync(resultPath) || fs.statSync(resultPath).size > 8192) fail('RESULT_MISSING_OR_OVERSIZED');
    const result = await validateResult(fs.readFileSync(resultPath, 'utf8'), issue, claim);
    await postAndVerify(issue.number, '<!-- kian-codex-watcher-result:v1 -->\n' + JSON.stringify(result));
    Object.assign(claim, { status: result.status, reason: result.reason, executor_pid: null, finished_at: new Date().toISOString() });
    saveState();
    ownedClaim = null;
    return report({ status: result.status === 'PR_READY' ? 'pr-ready' : 'blocked', issue: issue.number, reason: result.reason, execution_surface: 'local' }, result.status === 'PR_READY' ? 0 : 2);
  }
  report({ status: 'quiet', reason: 'already-attempted-or-awaiting-review' });
}

for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => {
  try { if (activeChild) killGroup(activeChild.pid, 'SIGKILL'); } catch {}
  // Leave a claimed run unresolved; a supervisor interruption cannot prove no side effect.
  release();
  process.exit(signal === 'SIGINT' ? 130 : 143);
});
process.on('exit', release);
try { await main(); }
catch (error) {
  const safeCodes = new Set(['CONFIG_INVALID', 'FORCE_REARM_NOT_SUPPORTED', 'LOCK_RECOVERY_UNRESOLVED', 'LOCK_INVALID', 'STATE_JSON_INVALID', 'STATE_INVALID', 'STATE_SCHEMA_UNSUPPORTED', 'STATE_READBACK_MISMATCH', 'TIMEOUT', 'OUTPUT_LIMIT', 'SPAWN_FAILED', 'CLAIM_WRITE_FAILED', 'COMMAND_FAILED', 'GIT_OR_GH_REQUIRED', 'PROJECT_DIR_INVALID', 'PROJECT_ORIGIN_INVALID', 'ISSUE_LIST_INVALID', 'PR_LIST_INVALID', 'CODEX_REQUIRED', 'RECEIPT_INVALID', 'RECEIPT_READBACK_MISMATCH', 'ISSUE_READBACK_INVALID', 'TASK_CHANGED', 'EXEC_REPO_INVALID', 'EXEC_REPO_DIRTY', 'EXECUTION_FAILED', 'RESULT_INVALID', 'RESULT_MISSING_OR_OVERSIZED', 'PR_READBACK_INVALID', 'PR_READBACK_MISMATCH']);
  const reason = safeCodes.has(error.message) ? error.message : 'LOCAL_IO_FAILED';
  if (ownedClaim) {
    const { issue, claim } = ownedClaim;
    try {
      Object.assign(claim, { status: reason === 'TASK_CHANGED' ? 'NEEDS_RECONCILIATION' : 'BLOCKED', reason, executor_pid: null, finished_at: new Date().toISOString() });
      saveState();
      // No automatic retry of a failed write: local terminal state preserves ambiguity.
      await postAndVerify(issue, '<!-- kian-codex-watcher-result:v1 -->\n' + JSON.stringify({ issue, run_id: claim.run_id, task_digest: claim.task_digest, status: 'BLOCKED', reason }));
    } catch {}
  }
  report({ status: 'blocked', reason, ...(ownedClaim ? { issue: ownedClaim.issue } : {}) }, 2);
} finally {
  for (const file of temporaryFiles) { try { fs.rmSync(file, { force: true }); } catch {} }
  release();
}
