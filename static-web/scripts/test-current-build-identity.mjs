#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createCurrentRefreshPolicy } from '../src/lib/currentRefreshPolicy.mjs';

const web = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const out = fs.mkdtempSync(path.join(os.tmpdir(), 'kianos-build-identity-'));
try {
  const result = spawnSync('npm', ['run', 'build:astro', '--', '--outDir', out], {
    cwd: web, env: { ...process.env, KIANOS_RELEASE_SHA: 'fixture-known-sha' }, encoding: 'utf8', timeout: 120000
  });
  assert.equal(result.status, 0, result.stderr);
  const html = fs.readFileSync(path.join(out, 'index.html'), 'utf8');
  assert.match(html, /data-kianos-release-sha="fixture-known-sha"/);
  const unknown = fs.mkdtempSync(path.join(os.tmpdir(), 'kianos-build-identity-unknown-'));
  const withoutIdentity = spawnSync('npm', ['run', 'build:astro', '--', '--outDir', unknown], {
    cwd: web, env: { ...process.env }, encoding: 'utf8', timeout: 120000
  });
  assert.equal(withoutIdentity.status, 0, withoutIdentity.stderr);
  assert.doesNotMatch(fs.readFileSync(path.join(unknown, 'index.html'), 'utf8'), /data-kianos-release-sha="[^"]+"/);
  assert.equal(createCurrentRefreshPolicy(null).observe('first-server-sha').status, 'unknown-document');
  fs.rmSync(unknown, { recursive: true, force: true });
  console.log('CURRENT_BUILD_IDENTITY PASS: Astro stamps the immutable release SHA');
} finally {
  fs.rmSync(out, { recursive: true, force: true });
}
