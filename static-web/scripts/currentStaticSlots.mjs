import fs from 'node:fs';
import path from 'node:path';

const safeSha = (value) => String(value || 'unknown')
  .replace(/[^a-zA-Z0-9._-]+/g, '-')
  .slice(0, 64) || 'unknown';

const lstatMaybe = (file) => {
  try { return fs.lstatSync(file); } catch { return null; }
};

export function resolveServedRoot(linkPath) {
  try {
    const resolved = fs.realpathSync(linkPath);
    const stat = fs.statSync(path.join(resolved, 'index.html'));
    return stat.isFile() ? resolved : null;
  } catch {
    return null;
  }
}

export function isAtomicServingLink(linkPath) {
  return Boolean(lstatMaybe(linkPath)?.isSymbolicLink());
}

function nextSlotPath(buildsRoot, sha, label = 'build') {
  fs.mkdirSync(buildsRoot, { recursive: true });
  const prefix = [
    label,
    safeSha(sha),
    Date.now(),
    process.pid
  ].join('-');
  let candidate = path.join(buildsRoot, prefix);
  let suffix = 0;
  while (lstatMaybe(candidate)) {
    suffix += 1;
    candidate = path.join(buildsRoot, prefix + '-' + suffix);
  }
  return candidate;
}

export function atomicReplaceSymlink(target, linkPath) {
  const existing = lstatMaybe(linkPath);
  if (existing && !existing.isSymbolicLink()) {
    throw new Error('STATIC_SLOT_LINK_PATH_OCCUPIED:' + linkPath);
  }

  fs.mkdirSync(path.dirname(linkPath), { recursive: true });
  const temp = linkPath + '.swap-' + process.pid + '-' + Date.now();
  try { fs.rmSync(temp, { force: true, recursive: true }); } catch {}
  const linkDir = fs.realpathSync(path.dirname(linkPath));
  const targetRoot = fs.realpathSync(target);
  const relativeTarget = path.relative(linkDir, targetRoot) || '.';
  fs.symlinkSync(relativeTarget, temp, 'dir');
  try {
    fs.renameSync(temp, linkPath);
  } catch (error) {
    try { fs.rmSync(temp, { force: true, recursive: true }); } catch {}
    throw error;
  }
}

export function adoptLegacyDist({
  distPath,
  previousPath,
  buildsRoot,
  sha = 'legacy'
}) {
  const distStat = lstatMaybe(distPath);
  if (!distStat) return null;
  if (distStat.isSymbolicLink()) return resolveServedRoot(distPath);
  if (!distStat.isDirectory()) throw new Error('STATIC_DIST_INVALID:' + distPath);

  const previousStat = lstatMaybe(previousPath);
  if (previousStat) {
    fs.rmSync(previousPath, { recursive: true, force: true });
  }

  const target = nextSlotPath(buildsRoot, sha, 'adopted');
  fs.renameSync(distPath, target);
  try {
    atomicReplaceSymlink(target, distPath);
  } catch (error) {
    if (!lstatMaybe(distPath) && lstatMaybe(target)) fs.renameSync(target, distPath);
    throw error;
  }
  return target;
}

function pruneBuildSlots(buildsRoot, keepRoots) {
  if (!fs.existsSync(buildsRoot)) return;
  const keep = new Set(
    keepRoots
      .filter(Boolean)
      .map((entry) => {
        try { return fs.realpathSync(entry); } catch { return path.resolve(entry); }
      })
  );

  for (const name of fs.readdirSync(buildsRoot)) {
    const candidate = path.join(buildsRoot, name);
    let real = path.resolve(candidate);
    try { real = fs.realpathSync(candidate); } catch {}
    if (keep.has(real)) continue;
    try { fs.rmSync(candidate, { recursive: true, force: true }); } catch {}
  }
}

export function promoteStagedBuild({
  distPath,
  previousPath,
  stagePath,
  buildsRoot,
  sha
}) {
  if (!fs.existsSync(path.join(stagePath, 'index.html'))) {
    throw new Error('STATIC_BUILD_STAGE_INVALID:' + stagePath);
  }

  const distStat = lstatMaybe(distPath);
  if (distStat && !distStat.isSymbolicLink()) {
    throw new Error('STATIC_ATOMIC_LAYOUT_REQUIRED:' + distPath);
  }

  const oldActive = resolveServedRoot(distPath);
  const target = nextSlotPath(buildsRoot, sha);
  fs.renameSync(stagePath, target);

  try {
    if (oldActive) atomicReplaceSymlink(oldActive, previousPath);
    else if (lstatMaybe(previousPath)?.isSymbolicLink()) fs.rmSync(previousPath, { force: true });

    atomicReplaceSymlink(target, distPath);
  } catch (error) {
    try { fs.rmSync(target, { recursive: true, force: true }); } catch {}
    throw error;
  }

  pruneBuildSlots(buildsRoot, [target, oldActive]);
  return {
    activeRoot: target,
    previousRoot: oldActive
  };
}
