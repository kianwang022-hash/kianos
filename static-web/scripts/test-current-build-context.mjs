#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync, spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { clientBuildContextHash } from './currentClientArtifacts.mjs';
import { isolatedTestEnv, reserveLoopbackPort, stopOwnedProcess, waitFor } from './test-support/isolated-runtime.mjs';

const scripts = path.dirname(fileURLToPath(import.meta.url));
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'kianos-context-proof-'));
const upstream = path.join(root, 'upstream'), mirror = path.join(root, 'mirror');
const remote = path.join(root, 'remote.git'), releases = path.join(root, 'releases');
const events = path.join(root, 'events.jsonl'), builds = path.join(root, 'builds.jsonl');
const offline = path.join(root, 'offline'), failPublic = path.join(root, 'fail-public');
const sourceA = path.join(root, 'source-a'), sourceB = path.join(root, 'source-b'), missingSource = path.join(root, 'missing-source');
const git = (cwd, ...args) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
const write = (name, text) => { const file = path.join(upstream, name); fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, text); };
const rows = file => fs.existsSync(file) ? fs.readFileSync(file, 'utf8').trim().split('\n').filter(Boolean).map(row => JSON.parse(row)) : [];
const active = () => fs.realpathSync(path.join(releases, 'active'));
const dist = release => path.join(release, 'static-web/dist');
const built = release => JSON.parse(fs.readFileSync(path.join(dist(release), '__kianos-current.json')));
const status = () => { try { return JSON.parse(fs.readFileSync(path.join(mirror, 'static-web/public/__kianos-current.json'))); } catch { return null; } };
const digest = release => createHash('sha256').update(fs.readFileSync(path.join(dist(release), 'index.html'))).digest('hex');
const checks = [];
let daemon, port, baseEnv, lastLogs = '';
function record(name, evidence = {}) { checks.push({ name, status: 'PASS', ...evidence }); console.log('CONTEXT PASS ' + name); }
async function request(route = '/') {
  try { const response = await fetch(`http://127.0.0.1:${port}${route}`, { signal: AbortSignal.timeout(300) }); return { status: response.status, text: await response.text() }; }
  catch { return null; }
}
const envFor = (mode, source = sourceA) => ({ ...baseEnv, KIANOS_STUDYHUB_MODE: mode, STUDYHUB_SOURCE_DIR: source });
async function stop() { if (daemon) await stopOwnedProcess(daemon, { processGroup: true }); daemon = null; }
async function start(mode, source = sourceA, expected = 'synced') {
  await stop();
  const env = envFor(mode, source), beforeEvents = rows(events).length;
  lastLogs = '';
  daemon = spawn(process.execPath, ['static-web/scripts/kianos-current-sync.mjs'], {
    cwd: mirror, env, detached: true, stdio: ['ignore', 'pipe', 'pipe']
  });
  daemon.stdout.on('data', chunk => { lastLogs += chunk; });
  daemon.stderr.on('data', chunk => { lastLogs += chunk; });
  await waitFor(() => {
    if (daemon.exitCode !== null || daemon.signalCode !== null) throw new Error(lastLogs);
    return lastLogs.includes('watching origin/main');
  }, { code: 'CONTEXT_SYNC_TIMEOUT', timeout: 20000, detail: () => lastLogs });
  assert.equal(status()?.state, expected, lastLogs);
  if (expected === 'synced') {
    const receipt = built(active());
    assert.equal(receipt.contextHash, clientBuildContextHash(env, mirror));
    const served = await request('/__kianos-release.json');
    assert.equal(served?.status, 200, lastLogs);
    assert.equal(JSON.parse(served.text).contextHash, receipt.contextHash);
    assert.equal(JSON.parse(served.text).sha, receipt.sha);
    assert.equal(fs.existsSync(path.join(active(), 'static-web/.current-client-proof.json')), false, 'compiler receipt is optional for full builds');
  }
  return { env, starts: rows(events).slice(beforeEvents).filter(row => !row.probe), logs: lastLogs };
}
function commit(name, value) {
  write(name, value); git(upstream, 'add', '.'); git(upstream, 'commit', '-m', 'synthetic context fixture');
  const sha = git(upstream, 'rev-parse', 'HEAD');
  if (fs.existsSync(remote)) git(upstream, 'push', 'origin', 'main');
  return sha;
}
function assertNoPrivateStarts(result) { assert.ok(result.starts.every(row => !row.text.includes('PRIVATE:')), JSON.stringify(result.starts)); }

try {
  port = await reserveLoopbackPort();
  for (const [dir, content] of [[sourceA, 'PRIVATE:synthetic-a'], [sourceB, 'PRIVATE:synthetic-b']]) {
    fs.mkdirSync(dir); fs.writeFileSync(path.join(dir, 'content.txt'), content);
  }
  fs.mkdirSync(upstream); git(upstream, 'init', '-b', 'main'); git(upstream, 'config', 'user.name', 'Synthetic Context'); git(upstream, 'config', 'user.email', 'fixture@example.invalid');
  for (const name of ['kianos-current-sync.mjs', 'currentRelease.mjs', 'currentStaticImpact.mjs', 'currentStaticSlots.mjs', 'currentDependencies.mjs', 'currentClientArtifacts.mjs']) write('static-web/scripts/' + name, fs.readFileSync(path.join(scripts, name)));
  write('static-web/scripts/native-static-server.mjs', fs.readFileSync(path.join(scripts, 'kianos-static-server.mjs')));
  for (const name of ['privateLearnerBridge', 'privateExternalReadingBridge', 'privateEnglishGeneratedBridge', 'privateControlBridge']) write('static-web/scripts/' + name + '.mjs', `export function ${name}(){ return {configureServer(){}}; }`);
  // Real static server, with synthetic private bridges; fault only its identity endpoint.
  write('static-web/scripts/kianos-static-server.mjs', `import fs from 'node:fs';import path from 'node:path';import http from 'node:http';
const args=process.argv, root=args[args.indexOf('--root')+1], probe=args.includes('--release-probe-only');
const mode=fs.readFileSync(new URL('../src/lib/runtime-mode.txt',import.meta.url),'utf8');
const receipt=JSON.parse(fs.readFileSync(path.join(root,'__kianos-current.json')));
fs.appendFileSync(process.env.SYNTHETIC_EVENTS,JSON.stringify({probe,pid:process.pid,root,text:fs.readFileSync(path.join(root,'index.html'),'utf8'),revision:fs.readFileSync(new URL('../src/lib/revision.txt',import.meta.url),'utf8'),contextHash:receipt.contextHash})+'\\n');
if((mode==='bad-probe'&&probe)||(mode==='bad-runtime'&&!probe)) {
 http.createServer((q,s)=>s.end(JSON.stringify({...receipt,contextHash:'wrong-context'}))).listen(Number(args[args.indexOf('--port')+1]),'127.0.0.1');
} else await import('./native-static-server.mjs');`);
  write('.gitignore', 'static-web/public/\nstatic-web/dist\nstatic-web/.current-*\n');
  write('static-web/src/lib/revision.txt', '1');
  const first = commit('static-web/src/lib/runtime-mode.txt', 'normal');
  git(root, 'clone', '--bare', upstream, remote); git(upstream, 'remote', 'add', 'origin', remote); git(root, 'clone', remote, mirror);
  fs.writeFileSync(path.join(mirror, '.git/kianos-current-mirror'), '');
  const npm = path.join(root, 'synthetic-npm');
  fs.writeFileSync(npm, `#!/usr/bin/env node
const fs=require('fs'),path=require('path');
if(process.argv[2]==='install')throw new Error('fixture must never install software');
const out=process.argv[process.argv.indexOf('--outDir')+1],mode=process.env.KIANOS_STUDYHUB_MODE;
fs.appendFileSync(process.env.SYNTHETIC_BUILDS,JSON.stringify({sha:process.env.KIANOS_RELEASE_SHA,contextHash:process.env.KIANOS_BUILD_CONTEXT_HASH,mode,out})+'\\n');
if(mode==='public'&&fs.existsSync(${JSON.stringify(failPublic)}))process.exit(42);
const text=mode==='private'?fs.readFileSync(path.join(process.env.STUDYHUB_SOURCE_DIR,'content.txt'),'utf8'):'PUBLIC:unconfigured';
fs.mkdirSync(path.join(out,'_astro'),{recursive:true});fs.writeFileSync(path.join(out,'index.html'),text);
if(mode==='private')fs.writeFileSync(path.join(out,'_astro/private-only.js'),text);
`); fs.chmodSync(npm, 0o755);
  const realGit = execFileSync('which', ['git'], { encoding: 'utf8' }).trim(), gitWrapper = path.join(root, 'synthetic-git');
  fs.writeFileSync(gitWrapper, `#!/usr/bin/env node
const fs=require('fs'),{spawnSync}=require('child_process'),args=process.argv.slice(2);
if(fs.existsSync(${JSON.stringify(offline)})&&['fetch','ls-remote'].includes(args[0])){setTimeout(()=>process.exit(1),250);}else{const p=spawnSync(${JSON.stringify(realGit)},args,{stdio:'inherit'});process.exit(p.status??1);}
`); fs.chmodSync(gitWrapper, 0o755);
  baseEnv = { ...isolatedTestEnv(path.join(root, 'private')), KIANOS_RELEASES_DIR: releases, KIANOS_NPM_BIN: npm, KIANOS_GIT_BIN: gitWrapper,
    KIANOS_PORT: String(port), KIANOS_SYNC_ONCE: '0', KIANOS_SYNC_RUNTIME_SHA: first, KIANOS_SYNC_INTERVAL_MS: '3000', SYNTHETIC_EVENTS: events, SYNTHETIC_BUILDS: builds };

  await start('public'); const publicRoot = active(), publicBytes = digest(publicRoot), publicHash = built(publicRoot).contextHash;
  assert.equal((await request()).text, 'PUBLIC:unconfigured');
  assert.match(path.basename(publicRoot), new RegExp('^' + first + '-' + publicHash + '$'));
  const count = rows(builds).length; await start('public'); assert.equal(rows(builds).length, count); assert.equal(active(), publicRoot);
  record('same-SHA same-context idle; optional compiler proof');

  await start('private'); const privateRoot = active(), privateBytes = digest(privateRoot), privateHash = built(privateRoot).contextHash;
  assert.equal((await request()).text, 'PRIVATE:synthetic-a'); assert.notEqual(active(), publicRoot); assert.equal(digest(publicRoot), publicBytes);
  const afterPrivate = rows(builds).length;
  const back = await start('public'); assertNoPrivateStarts(back); assert.equal(active(), publicRoot); assert.equal(rows(builds).length, afterPrivate);
  assert.equal(digest(privateRoot), privateBytes); assert.equal((await request('/_astro/private-only.js')).status, 404);
  record('same-SHA public-private-public; immutable siblings; cross-context chunk fallback denied');

  await start('private', sourceB); assert.equal((await request()).text, 'PRIVATE:synthetic-b');
  assert.notEqual(built(active()).contextHash, privateHash);
  record('source-path context changes rebuild');

  await stop(); const untrusted = active(), untrustedBytes = digest(untrusted), receipt = built(untrusted);
  delete receipt.contextHash; fs.writeFileSync(path.join(dist(untrusted), '__kianos-current.json'), JSON.stringify(receipt));
  const oldCount = rows(builds).length; await start('private', sourceB);
  assert.equal(rows(builds).length, oldCount + 1); assert.notEqual(active(), untrusted); assert.equal(digest(untrusted), untrustedBytes);
  assert.equal(built(untrusted).contextHash, undefined, 'active legacy artifact must not be overwritten');
  record('old receipt missing context rebuilds once in a sibling');

  const kept = active(), keptCount = rows(builds).length;
  const currentPid = rows(events).filter(row => !row.probe).at(-1).pid;
  const control = commit('CURRENT.md', 'synthetic control-only update');
  await waitFor(() => status()?.state === 'synced' && status()?.control_sha === control, { timeout: 15000, detail: () => lastLogs });
  assert.equal(active(), kept); assert.equal(rows(builds).length, keptCount); assert.equal(rows(events).filter(row => !row.probe).at(-1).pid, currentPid);
  await start('private', sourceB); assert.equal(active(), kept); assert.equal(rows(builds).length, keptCount);
  await start('public', sourceB); assert.equal(built(active()).sha, control); assert.equal(rows(builds).length, keptCount + 1);
  record('control-only reuse/idle require matching context; context change cannot reuse');

  await start('private', missingSource, 'degraded'); const failedCount = rows(builds).length;
  const failure = JSON.parse(fs.readFileSync(path.join(mirror, 'static-web/.current-build-failure.json')));
  assert.equal(failure.contextHash, clientBuildContextHash(envFor('private', missingSource), mirror));
  await start('private', missingSource, 'degraded'); assert.equal(rows(builds).length, failedCount);
  await start('public', missingSource); assert.equal(rows(builds).length, failedCount + 1); assert.equal((await request()).text, 'PUBLIC:unconfigured');
  record('same-SHA failure cache scoped to context; missing private source cannot block public');

  fs.writeFileSync(offline, 'synthetic network unavailable');
  await start('public', missingSource, 'degraded'); assert.equal((await request()).text, 'PUBLIC:unconfigured');
  fs.unlinkSync(offline);
  await start('private', sourceB); const beforeOffline = active(), offlineBytes = digest(beforeOffline);
  fs.writeFileSync(offline, 'synthetic network unavailable');
  const closed = await start('public', sourceB, 'degraded'); assertNoPrivateStarts(closed); assert.equal(await request(), null); assert.equal(active(), beforeOffline); assert.equal(digest(beforeOffline), offlineBytes);
  fs.unlinkSync(offline);
  record('cold offline startup: same-context LKG serves; mismatched private release stays unserved');

  await start('public', sourceB); const beforeProbe = active(), beforeProbeBytes = digest(beforeProbe);
  const badProbe = commit('static-web/src/lib/runtime-mode.txt', 'bad-probe');
  await start('public', sourceB, 'degraded'); assert.equal(active(), beforeProbe); assert.equal(digest(beforeProbe), beforeProbeBytes); assert.equal((await request()).text, 'PUBLIC:unconfigured');
  assert.ok(!fs.readdirSync(path.join(releases, 'releases')).some(name => name.startsWith(badProbe + '-')));
  record('same SHA with wrong served context fails probe; candidate-only cleanup');

  commit('static-web/src/lib/runtime-mode.txt', 'bad-runtime');
  await start('public', sourceB, 'degraded'); assert.equal(active(), beforeProbe); assert.equal(digest(beforeProbe), beforeProbeBytes); assert.equal((await request()).text, 'PUBLIC:unconfigured');
  record('post-promotion readiness mismatch rolls back same-context bytes');

  write('static-web/src/lib/revision.txt', '2');
  write('CURRENT.md', 'mixed runtime plus control');
  const repaired = commit('static-web/src/lib/runtime-mode.txt', 'normal');
  const runtimeChange = await start('public', sourceB);
  assert.equal(runtimeChange.starts.at(-1).revision, '2');
  assert.equal(built(active()).sha, repaired); assert.notEqual(active(), beforeProbe);
  record('real runtime change builds and promotes with context receipt');

  await start('private', sourceB); const privateBeforeRollback = active(), privateRollbackBytes = digest(privateBeforeRollback);
  commit('static-web/src/lib/runtime-mode.txt', 'bad-runtime');
  const rollback = await start('public', sourceB, 'degraded'); assertNoPrivateStarts(rollback); assert.equal(await request(), null); assert.equal(active(), privateBeforeRollback); assert.equal(digest(privateBeforeRollback), privateRollbackBytes);
  record('cross-context rollback preserves private artifact without restarting it');

  write('static-web/src/lib/revision.txt', '3');
  commit('static-web/src/lib/runtime-mode.txt', 'normal');
  await start('private', sourceB); const privateBeforeFailure = active(), privateFailureBytes = digest(privateBeforeFailure);
  fs.writeFileSync(failPublic, 'synthetic public build fault');
  const failedPublic = await start('public', sourceB, 'degraded'); assertNoPrivateStarts(failedPublic); assert.equal(await request(), null); assert.equal(active(), privateBeforeFailure); assert.equal(digest(privateBeforeFailure), privateFailureBytes);
  const failedBuild = rows(builds).at(-1); assert.ok(!failedBuild.out.startsWith(privateBeforeFailure + path.sep));
  record('failed same-SHA public build never overwrites or serves active private bytes');

  for (const row of rows(builds)) assert.match(row.contextHash, /^[a-f0-9]{64}$/);
  assert.ok(!JSON.stringify(built(active())).includes(sourceA) && !JSON.stringify(built(active())).includes(sourceB));
  console.log(JSON.stringify({ status: 'PASS', syntheticOnly: true, checks, root, port }, null, 2));
} finally {
  await stop(); fs.rmSync(root, { recursive: true, force: true }); assert.equal(fs.existsSync(root), false);
}
