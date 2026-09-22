import assert from 'node:assert/strict';
import fs from 'node:fs';

const frame = fs.readFileSync(new URL('../src/layouts/BaseFrame.astro', import.meta.url), 'utf8');
const writer = fs.readFileSync(new URL('../src/lib/browserLearnerWriter.mjs', import.meta.url), 'utf8');

const bodyAt = frame.indexOf('<body id="kianos-workspace"');
const prepaintAt = frame.indexOf('Presentation state must be restored before shell markup can paint.');
const shellAt = frame.indexOf('<div class="kianosShellFrame" data-kianos-shell-frame>');
assert(bodyAt >= 0 && prepaintAt > bodyAt && shellAt > prepaintAt,
  'persisted rail state must be restored before shell markup');
assert(frame.includes("localStorage.getItem(key)"));
assert(frame.includes("body.dataset.kianosRail = expanded ? 'expanded' : 'compact'"));

assert(writer.includes('const WAITING_NOTICE_DELAY_MS = 600;'));
assert(writer.includes("document.documentElement.dataset.learnerWriter = state;"),
  'writer safety state must remain immediate');
const waitingAt = writer.indexOf("if (state === 'waiting')");
const timerAt = writer.indexOf('window.setTimeout', waitingAt);
const copyAt = writer.indexOf('正在接续最新学习记录…', waitingAt);
assert(waitingAt >= 0 && timerAt > waitingAt && copyAt > timerAt,
  'routine waiting notice must only appear from the delayed path');
assert(writer.includes("showState('unavailable')"),
  'real storage/lock failure must remain visible');

console.log('PASS shell first-paint: rail is prepaint-stable and routine writer handoff is quiet');