import { buildMissionControlSnapshot } from '../src/lib/missionControl.mjs';

const snapshot = buildMissionControlSnapshot();
const expected = ['xizong', 'english', 'politics', 'lexical'];
const actual = snapshot.lanes.map(lane => lane.id);
const errors = [];

if (JSON.stringify(actual) !== JSON.stringify(expected)) {
  errors.push(`lanes=${actual.join(',')} expected=${expected.join(',')}`);
}

for (const key of ['active', 'stage', 'blocker', 'next']) {
  if (!String(snapshot.project?.[key] || '').trim()) errors.push(`project.${key} missing`);
}

for (const lane of snapshot.lanes) {
  for (const key of ['label', 'active', 'engineering', 'learner', 'blocker', 'next', 'source']) {
    if (!String(lane?.[key] || '').trim()) errors.push(`${lane.id}.${key} missing`);
  }
}

if (errors.length) {
  console.error(JSON.stringify({ pass: false, errors, snapshot }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({
  pass: true,
  project: snapshot.project,
  lanes: snapshot.lanes.map(({ id, label, active, blocker, next }) => ({ id, label, active, blocker, next }))
}, null, 2));
