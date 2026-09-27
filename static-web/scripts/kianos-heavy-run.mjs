#!/usr/bin/env node
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { acquireWebsiteHeavyLease } from './websiteHeavyWork.mjs';
import { terminateProcessTree } from './currentRelease.mjs';

function parseArgs(argv) {
  const args = [...argv];
  let label = 'website-heavy-command';
  let waitMs = null;
  const commandIndex = args.indexOf('--');
  if (commandIndex < 0 || commandIndex === args.length - 1) {
    throw new Error('KIANOS_HEAVY_RUN_USAGE: [--label name] [--wait-ms ms] -- command [args...]');
  }
  const options = args.slice(0, commandIndex);
  for (let i = 0; i < options.length; i += 1) {
    if (options[i] === '--label') {
      label = String(options[++i] || '').trim();
      if (!label) throw new Error('KIANOS_HEAVY_RUN_LABEL_INVALID');
      continue;
    }
    if (options[i] === '--wait-ms') {
      waitMs = Number(options[++i]);
      if (!Number.isFinite(waitMs) || waitMs < 0) throw new Error('KIANOS_HEAVY_RUN_WAIT_INVALID');
      continue;
    }
    throw new Error('KIANOS_HEAVY_RUN_OPTION_INVALID:' + options[i]);
  }
  return { label, waitMs, command: args[commandIndex + 1], commandArgs: args.slice(commandIndex + 2) };
}

export async function runHeavyCommand(argv = process.argv.slice(2), env = process.env) {
  const plan = parseArgs(argv);
  const lease = await acquireWebsiteHeavyLease({
    label: plan.label,
    env,
    ...(plan.waitMs == null ? {} : { timeoutMs: plan.waitMs })
  });

  let child = null;
  let stopping = false;
  const stop = () => {
    if (stopping) return;
    stopping = true;
    if (child?.pid) {
      void terminateProcessTree(child.pid, { graceMs: 1000 }).catch(() => {});
    }
  };

  process.once('SIGINT', stop);
  process.once('SIGTERM', stop);

  try {
    child = spawn(plan.command, plan.commandArgs, {
      cwd: process.cwd(),
      env,
      stdio: 'inherit',
      shell: process.platform === 'win32',
      detached: process.platform !== 'win32'
    });
    lease.updateOwner({
      pid: child.pid,
      command: [plan.command, ...plan.commandArgs].join(' ')
    });

    const result = await new Promise((resolve, reject) => {
      child.once('error', reject);
      child.once('exit', (code, signal) => resolve({ code: code ?? 1, signal }));
    });
    return result.code;
  } finally {
    process.removeListener('SIGINT', stop);
    process.removeListener('SIGTERM', stop);
    if (child?.pid && child.exitCode == null) {
      try { await terminateProcessTree(child.pid, { graceMs: 1000 }); } catch {}
    }
    lease.release();
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = await runHeavyCommand();
}
