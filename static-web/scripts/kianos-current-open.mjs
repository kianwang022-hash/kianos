#!/usr/bin/env node
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const port = String(process.env.KIANOS_PORT || '4321');
const label = 'com.kianos.current-mirror';
const base = `http://127.0.0.1:${port}/`;

if (process.platform !== 'darwin') {
  console.error('KianOS Current open currently targets macOS.');
  process.exit(2);
}

async function reachable() {
  try {
    const response = await fetch(`${base}?t=${Date.now()}`, { cache: 'no-store' });
    return response.ok;
  } catch {
    return false;
  }
}

if (!(await reachable())) {
  try {
    await execFileAsync('/bin/launchctl', ['kickstart', '-k', `gui/${process.getuid()}/${label}`]);
  } catch {
    console.error('KianOS Current is not installed or the LaunchAgent is unavailable.');
    console.error('Run: npm run current:install');
    process.exit(1);
  }

  let ready = false;
  for (let i = 0; i < 40; i += 1) {
    if (await reachable()) {
      ready = true;
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  if (!ready) {
    console.error(`KianOS Current did not become reachable at ${base}`);
    console.error('Run: npm run current:doctor');
    process.exit(1);
  }
}

await execFileAsync('/usr/bin/open', [base]);
console.log(`Opened KianOS Current: ${base}`);
