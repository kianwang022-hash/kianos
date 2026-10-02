import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// Existing one-context release fixtures inspect the native receipt rather than
// assuming a SHA-only directory. Multiple contexts must be named explicitly by
// their caller; never silently choose the most recent artifact.
export function fixtureReleaseRoot(releasesRoot, sha) {
  const candidates = fs.existsSync(releasesRoot) ? fs.readdirSync(releasesRoot)
    .filter(name => name === sha || name.startsWith(sha + '-'))
    .map(name => path.join(releasesRoot, name)) : [];
  assert.ok(candidates.length <= 1, 'fixture must select its context explicitly when a SHA has multiple releases');
  // Do not hide incomplete leftovers: cleanup assertions must still see them.
  if (candidates[0]) {
    const receipt = path.join(candidates[0], 'static-web/dist/__kianos-current.json');
    if (fs.existsSync(receipt)) assert.equal(JSON.parse(fs.readFileSync(receipt)).sha, sha);
  }
  return candidates[0] || path.join(releasesRoot, sha);
}
