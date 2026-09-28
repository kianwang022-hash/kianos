import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export const CURRENT_DEPENDENCY_SCHEMA = 'kianos.current.dependencies.v1';
export const CURRENT_DEPENDENCY_MARKER = '.kianos-current-dependencies.json';

const PACKAGE_INPUTS = [
  'package.json',
  'package-lock.json',
  'npm-shrinkwrap.json',
  '.npmrc'
];

function fileDigest(hash, root, relativePath) {
  const file = path.join(root, relativePath);
  hash.update(relativePath);
  hash.update('\0');
  if (!fs.existsSync(file)) {
    hash.update('<missing>');
    hash.update('\0');
    return;
  }
  hash.update(fs.readFileSync(file));
  hash.update('\0');
}

export function dependencyIdentity(webRoot, runtime = {}) {
  const hash = crypto.createHash('sha256');
  for (const relativePath of PACKAGE_INPUTS) fileDigest(hash, webRoot, relativePath);
  return {
    schema: CURRENT_DEPENDENCY_SCHEMA,
    fingerprint: hash.digest('hex'),
    node_version: String(runtime.nodeVersion || process.version),
    node_abi: String(runtime.nodeAbi || process.versions.modules || ''),
    platform: String(runtime.platform || process.platform),
    arch: String(runtime.arch || process.arch)
  };
}

function markerPath(webRoot) {
  return path.join(webRoot, 'node_modules', CURRENT_DEPENDENCY_MARKER);
}

export function readDependencyProof(webRoot) {
  try {
    const raw = JSON.parse(fs.readFileSync(markerPath(webRoot), 'utf8'));
    return raw?.schema === CURRENT_DEPENDENCY_SCHEMA ? raw : null;
  } catch {
    return null;
  }
}

export function writeDependencyProof(webRoot, identity = dependencyIdentity(webRoot)) {
  const nodeModules = path.join(webRoot, 'node_modules');
  if (!fs.existsSync(nodeModules)) throw new Error('CURRENT_DEPENDENCY_NODE_MODULES_MISSING');
  fs.writeFileSync(markerPath(webRoot), JSON.stringify(identity) + '\n', 'utf8');
  return identity;
}

function sameIdentity(left, right) {
  return Boolean(
    left && right
    && left.schema === CURRENT_DEPENDENCY_SCHEMA
    && right.schema === CURRENT_DEPENDENCY_SCHEMA
    && left.fingerprint === right.fingerprint
    && left.node_version === right.node_version
    && left.node_abi === right.node_abi
    && left.platform === right.platform
    && left.arch === right.arch
  );
}

function hasAstroPackage(nodeModules) {
  return fs.existsSync(path.join(nodeModules, 'astro', 'package.json'));
}

function rebaseAbsoluteBinLinks(nodeModules) {
  const binDir = path.join(nodeModules, '.bin');
  let entries = [];
  try { entries = fs.readdirSync(binDir); } catch { return 0; }

  let rebased = 0;
  const marker = `${path.sep}node_modules${path.sep}`;
  for (const name of entries) {
    const linkPath = path.join(binDir, name);
    let stat = null;
    try { stat = fs.lstatSync(linkPath); } catch { continue; }
    if (!stat.isSymbolicLink()) continue;

    const rawTarget = fs.readlinkSync(linkPath);
    if (!path.isAbsolute(rawTarget)) continue;

    const markerIndex = rawTarget.lastIndexOf(marker);
    if (markerIndex < 0) {
      throw new Error(`CURRENT_DEPENDENCY_BIN_LINK_OUTSIDE_TREE:${name}`);
    }
    const packageRelative = rawTarget.slice(markerIndex + marker.length);
    const localTarget = path.join(nodeModules, packageRelative);
    if (!fs.existsSync(localTarget)) {
      throw new Error(`CURRENT_DEPENDENCY_BIN_TARGET_MISSING:${name}:${packageRelative}`);
    }

    const localRelative = path.relative(path.dirname(linkPath), localTarget);
    fs.rmSync(linkPath, { force: true });
    fs.symlinkSync(localRelative, linkPath);
    rebased += 1;
  }
  return rebased;
}

export function canReuseDependencies(sourceWebRoot, targetWebRoot, runtime = {}) {
  if (!sourceWebRoot || !targetWebRoot) return false;
  const sourceNodeModules = path.join(sourceWebRoot, 'node_modules');
  if (!fs.existsSync(sourceNodeModules)) return false;
  // The package tree is canonical; .bin shims are derived and can be repaired
  // after copy. Older Current releases may contain absolute .bin symlinks that
  // point at an already-GC'd ancestor release.
  if (!hasAstroPackage(sourceNodeModules)) return false;
  const proof = readDependencyProof(sourceWebRoot);
  const targetIdentity = dependencyIdentity(targetWebRoot, runtime);
  return sameIdentity(proof, targetIdentity);
}

export function cloneDependencies(sourceWebRoot, targetWebRoot, { proofIdentity = null } = {}) {
  const sourceNodeModules = path.join(sourceWebRoot, 'node_modules');
  const targetNodeModules = path.join(targetWebRoot, 'node_modules');
  if (!fs.existsSync(sourceNodeModules)) throw new Error('CURRENT_DEPENDENCY_SOURCE_MISSING');
  fs.rmSync(targetNodeModules, { recursive: true, force: true });

  const startedAt = Date.now();
  fs.cpSync(sourceNodeModules, targetNodeModules, {
    recursive: true,
    dereference: false,
    verbatimSymlinks: true,
    mode: fs.constants.COPYFILE_FICLONE
  });
  const rebased_bin_links = rebaseAbsoluteBinLinks(targetNodeModules);

  if (!fs.existsSync(path.join(targetNodeModules, '.bin', process.platform === 'win32' ? 'astro.cmd' : 'astro'))) {
    fs.rmSync(targetNodeModules, { recursive: true, force: true });
    throw new Error('CURRENT_DEPENDENCY_REUSE_INVALID');
  }
  if (proofIdentity) writeDependencyProof(targetWebRoot, proofIdentity);
  if (!readDependencyProof(targetWebRoot)) {
    fs.rmSync(targetNodeModules, { recursive: true, force: true });
    throw new Error('CURRENT_DEPENDENCY_REUSE_PROOF_MISSING');
  }
  return { duration_ms: Date.now() - startedAt, rebased_bin_links };
}
