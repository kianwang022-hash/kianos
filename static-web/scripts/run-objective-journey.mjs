import { spawn } from 'node:child_process';

const child = spawn(process.execPath, ['scripts/test-objective-journey.mjs'], {
  cwd: process.cwd(),
  stdio: 'inherit'
});

let finished = false;
const timeout = setTimeout(() => {
  if (finished) return;
  console.error('OBJECTIVE_ACCEPTANCE_E2E_TIMEOUT: learner journey did not terminate after 120s; killing leaked browser/server process. Inspect the last emitted acceptance failure above.');
  child.kill('SIGKILL');
  process.exitCode = 1;
}, 120_000);

timeout.unref?.();

child.on('error', (error) => {
  finished = true;
  clearTimeout(timeout);
  console.error(error);
  process.exitCode = 1;
});

child.on('exit', (code, signal) => {
  finished = true;
  clearTimeout(timeout);
  if (signal) {
    console.error(`OBJECTIVE_ACCEPTANCE_E2E_CHILD_SIGNAL:${signal}`);
    process.exitCode = 1;
    return;
  }
  process.exitCode = Number(code || 0);
});
