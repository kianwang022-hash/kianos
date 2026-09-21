import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'codex-hygiene-'));
const remote = path.join(temp, 'remote.git');
const repo = path.join(temp, 'repo');
const bin = path.join(temp, 'bin');
const dirtyWt = path.join(temp, 'dirty-wt');
const script = path.resolve('scripts/codex-local-hygiene.mjs');

function git(args, cwd = repo) {
  return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}
function existsBranch(name) {
  try { git(['show-ref', '--verify', '--quiet', 'refs/heads/' + name]); return true; } catch { return false; }
}
function head(name) { return git(['rev-parse', 'refs/heads/' + name]); }

try {
  execFileSync('git', ['init', '--bare', remote]);
  fs.mkdirSync(repo, { recursive: true });
  execFileSync('git', ['init', '-b', 'main'], { cwd: repo });
  git(['config', 'user.name', 'Codex Hygiene Test']);
  git(['config', 'user.email', 'codex-hygiene@example.invalid']);
  fs.writeFileSync(path.join(repo, 'base.txt'), 'base\n');
  git(['add', '.']); git(['commit', '-m', 'base']);
  git(['remote', 'add', 'origin', remote]); git(['push', '-u', 'origin', 'main']);

  git(['checkout', '-b', 'codex/issue101-done']);
  fs.writeFileSync(path.join(repo, 'done.txt'), 'done\n');
  git(['add', '.']); git(['commit', '-m', 'done']);
  git(['push', '-u', 'origin', 'codex/issue101-done']);
  git(['checkout', 'main']); git(['merge', '--no-ff', 'codex/issue101-done', '-m', 'merge done']); git(['push', 'origin', 'main']);
  git(['push', 'origin', '--delete', 'codex/issue101-done']);

  git(['checkout', '-b', 'codex/issue102-dirty']);
  fs.writeFileSync(path.join(repo, 'dirty.txt'), 'committed\n');
  git(['add', '.']); git(['commit', '-m', 'dirty branch']);
  git(['push', '-u', 'origin', 'codex/issue102-dirty']);
  git(['checkout', 'main']); git(['merge', '--no-ff', 'codex/issue102-dirty', '-m', 'merge dirty']); git(['push', 'origin', 'main']);
  git(['push', 'origin', '--delete', 'codex/issue102-dirty']);
  git(['worktree', 'add', dirtyWt, 'codex/issue102-dirty']);
  fs.appendFileSync(path.join(dirtyWt, 'dirty.txt'), 'uncommitted\n');

  git(['checkout', '-b', 'codex/issue103-active']);
  fs.writeFileSync(path.join(repo, 'active.txt'), 'active\n');
  git(['add', '.']); git(['commit', '-m', 'active']);
  git(['push', '-u', 'origin', 'codex/issue103-active']);
  git(['checkout', 'main']);

  git(['checkout', '-b', 'codex/issue104-squash']);
  fs.writeFileSync(path.join(repo, 'squash.txt'), 'squash\n');
  git(['add', '.']); git(['commit', '-m', 'squash branch']);
  git(['push', '-u', 'origin', 'codex/issue104-squash']);
  git(['checkout', 'main']); git(['merge', '--squash', 'codex/issue104-squash']); git(['commit', '-m', 'squash merge']); git(['push', 'origin', 'main']);
  git(['push', 'origin', '--delete', 'codex/issue104-squash']);

  git(['checkout', '-b', 'codex/issue105-open']);
  fs.writeFileSync(path.join(repo, 'open.txt'), 'open\n');
  git(['add', '.']); git(['commit', '-m', 'open branch']);
  git(['push', '-u', 'origin', 'codex/issue105-open']);
  git(['checkout', 'main']); git(['merge', '--no-ff', 'codex/issue105-open', '-m', 'merge open']); git(['push', 'origin', 'main']);
  git(['push', 'origin', '--delete', 'codex/issue105-open']);

  git(['branch', 'work/manual-keep']);

  fs.mkdirSync(bin);
  const fakeGh = path.join(bin, 'gh');
  fs.writeFileSync(fakeGh, `#!/bin/sh
set -eu
if [ "$1" = "--version" ]; then echo "gh version fake"; exit 0; fi
if [ "$1" = "repo" ] && [ "$2" = "view" ]; then echo '{"nameWithOwner":"test/kianos"}'; exit 0; fi
if [ "$1" = "issue" ] && [ "$2" = "view" ]; then
  n="$3"
  if [ "$n" = "105" ]; then echo '{"state":"OPEN","stateReason":null}'; else echo '{"state":"CLOSED","stateReason":"COMPLETED"}'; fi
  exit 0
fi
if [ "$1" = "pr" ] && [ "$2" = "list" ]; then
  branch=""
  while [ "$#" -gt 0 ]; do
    if [ "$1" = "--head" ]; then shift; branch="$1"; fi
    shift || true
  done
  case "$branch" in
    codex/issue101-done) oid="$GH_FAKE_101_HEAD" ;;
    codex/issue102-dirty) oid="$GH_FAKE_102_HEAD" ;;
    codex/issue104-squash) oid="$GH_FAKE_104_HEAD" ;;
    codex/issue105-open) oid="$GH_FAKE_105_HEAD" ;;
    *) echo '[]'; exit 0 ;;
  esac
  printf '[{"number":900,"headRefName":"%s","headRefOid":"%s","mergedAt":"2026-09-21T00:00:00Z"}]\n' "$branch" "$oid"
  exit 0
fi
exit 1
`);
  fs.chmodSync(fakeGh, 0o755);

  const env = {
    ...process.env,
    PATH: bin + path.delimiter + process.env.PATH,
    GH_FAKE_101_HEAD: head('codex/issue101-done'),
    GH_FAKE_102_HEAD: head('codex/issue102-dirty'),
    GH_FAKE_104_HEAD: head('codex/issue104-squash'),
    GH_FAKE_105_HEAD: head('codex/issue105-open')
  };

  const dry = JSON.parse(execFileSync(process.execPath, [script, '--json'], { cwd: repo, encoding: 'utf8', env }));
  assert.ok(dry.would_delete.includes('codex/issue101-done'));
  assert.ok(dry.would_delete.includes('codex/issue104-squash'));
  assert.ok(dry.skipped.some((row) => row.branch === 'codex/issue102-dirty' && row.reason === 'dirty-worktree'));
  assert.ok(dry.skipped.some((row) => row.branch === 'codex/issue103-active' && row.reason === 'remote-still-active'));
  assert.ok(dry.skipped.some((row) => row.branch === 'codex/issue105-open' && row.reason === 'issue-not-completed'));
  assert.equal(existsBranch('codex/issue101-done'), true, 'dry-run must not mutate');

  const applied = JSON.parse(execFileSync(process.execPath, [script, '--apply', '--json'], { cwd: repo, encoding: 'utf8', env }));
  assert.ok(applied.deleted.includes('codex/issue101-done'));
  assert.ok(applied.deleted.includes('codex/issue104-squash'));
  assert.equal(existsBranch('codex/issue101-done'), false);
  assert.equal(existsBranch('codex/issue104-squash'), false);
  assert.equal(existsBranch('codex/issue102-dirty'), true);
  assert.equal(fs.existsSync(dirtyWt), true);
  assert.equal(existsBranch('codex/issue103-active'), true);
  assert.equal(existsBranch('codex/issue105-open'), true);
  assert.equal(existsBranch('work/manual-keep'), true);

  console.log('PASS Codex local hygiene: completed Issue + merged PR + remote-retired + clean only');
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}
