import assert from 'node:assert/strict';
import fs from 'node:fs';

const native=fs.readFileSync(new URL('../src/components/ClozeWorkspace.astro',import.meta.url),'utf8');
const generated=fs.readFileSync(new URL('../src/components/GeneratedClozeWorkspace.astro',import.meta.url),'utf8');
const runtime=fs.readFileSync(new URL('../src/lib/clozeRuntime.mjs',import.meta.url),'utf8');
assert.match(native,/initClozeRuntime/,'native Cloze must consume the shared runtime');
assert.match(generated,/initClozeRuntime/,'generated Cloze must consume the shared runtime');
assert.doesNotMatch(generated,/saveEnglishAttempt|inspectEnglishAttempt|taskMetadata/,'generated adapter must not own a second evidence/state controller');
assert.doesNotMatch(generated,/state\.results\s*=|state\.submitted\s*=/,'generated adapter must not own scoring/submission state');
assert.match(runtime,/saveEnglishAttempt/,'shared Cloze runtime must remain the evidence writer');
assert.match(runtime,/prepareAnswers/,'shared runtime must support protected generated answer loading');
console.log('PASS generated Cloze reuses native interaction/evidence runtime');
