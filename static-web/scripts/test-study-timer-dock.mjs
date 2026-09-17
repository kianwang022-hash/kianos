import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

const base = read('src/layouts/Base.astro');
const component = read('src/components/StudyTimerDock.astro');
const client = read('src/lib/studyTimerDockClient.mjs');
const css = read('src/styles/study-timer.css');

assert.match(base, /StudyTimerDock/, 'Shared Shell must mount the timer dock.');
assert.match(base, /initStudyTimerDock/, 'Shared Shell must hydrate the timer dock.');
assert.match(base, /study-timer\.css/, 'Shared Shell must import the timer visual owner.');

for (const subject of ['xizong', 'politics', 'english']) {
  assert.match(component, new RegExp(`data-study-timer-switch="${subject}"`), `Dock must expose ${subject} switching.`);
  assert.match(component, new RegExp(`data-study-timer-total-${subject}`), `Dock must expose ${subject} daily total.`);
}
assert.match(component, /data-study-timer-drag-handle/, 'Dock must retain an explicit drag surface.');
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
assert.match(css, /touch-action:\s*none/, 'Drag surface must work with pointer/touch input.');

console.log('PASS shared study timer dock contract');
