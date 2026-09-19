import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

const base = read('src/layouts/Base.astro');
const frame = read('src/layouts/BaseFrame.astro');
const component = read('src/components/StudyTimerDock.astro');
const client = read('src/lib/studyTimerDockClient.mjs');
const css = read('src/styles/study-timer.css');

assert.match(frame, /StudyTimerDock/, 'Shared Shell frame must mount the timer dock.');
assert.match(frame, /initStudyTimerDock/, 'Shared Shell frame must hydrate the timer dock.');
assert.match(base, /study-timer\.css/, 'Shared Shell entry must import the timer visual owner.');

for (const subject of ['xizong', 'politics', 'english']) {
  assert.match(component, new RegExp(`data-study-timer-switch="${subject}"`), `Dock must expose ${subject} switching.`);
  assert.match(component, new RegExp(`data-study-timer-total-${subject}`), `Dock must expose ${subject} daily total.`);
}
assert.match(component, /studyTimerDragGrip[^>]*data-study-timer-drag-handle/, 'Dock must retain a dedicated non-button drag grip.');
assert.match(component, /studyTimerStatus/, 'Passive status display must be separable from the drag hit target.');
assert.match(component, /data-study-timer-reset-position/, 'Dock must allow restoring the default bottom-right position.');
assert.match(component, /data-study-timer-pending/, 'Dock must surface isolated review gaps without forcing a modal.');

assert.match(client, /kianos-study-timer-dock-position-v1/, 'Dragged position must be browser-local and persistent.');
assert.match(client, /pointerdown/, 'Dock must support pointer dragging.');
assert.match(client, /setPointerCapture/, 'Dock dragging must survive pointer movement outside the handle.');
assert.match(client, /window\.innerWidth - rect\.width/, 'Dragged timer must be clamped to the viewport horizontally.');
assert.match(client, /window\.innerHeight - rect\.height/, 'Dragged timer must be clamped to the viewport vertically.');
assert.match(client, /storage\.removeItem\(POSITION_KEY\)/, 'Reset must remove the persisted custom position.');
assert.match(client, /setInterval\(render, 1000\)/, 'Visible elapsed time must refresh while running.');

assert.match(css, /position:\s*fixed/, 'Timer dock must stay viewport-fixed.');
assert.match(css, /right:\s*24px/, 'Desktop default must remain bottom-right.');
assert.match(css, /bottom:\s*22px/, 'Desktop default must remain bottom-right.');
assert.match(css, /width:\s*286px/, 'Compact desktop dock must stay bounded instead of consuming a large page corner.');
assert.match(css, /\.studyTimerDock[\s\S]*pointer-events:\s*none/, 'Compact dock background/status must not lock learner content underneath.');
assert.match(css, /\.studyTimerDock\[data-expanded="true"\][^{]*\{[^}]*pointer-events:\s*auto/, 'Expanded timer panel must remain an intentional interactive overlay.');
assert.match(css, /\.studyTimerDragGrip[\s\S]*pointer-events:\s*auto/, 'Dedicated drag grip must remain interactive.');
assert.match(css, /\.studyTimerStatus[\s\S]*pointer-events:\s*none/, 'Passive subject/time status must allow underlying learner interaction.');
assert.match(css, /touch-action:\s*none/, 'Drag grip must work with pointer/touch input.');
assert.match(css, /width:\s*min\(282px,\s*calc\(100vw - 20px\)\)/, 'Compact mobile dock must reduce its visual footprint.');

console.log('PASS shared study timer dock contract');
