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

export function canReuseDependencies(sourceWebRoot, targetWebRoot, runtime = {}) {
  if (!sourceWebRoot || !targetWebRoot) return false;
  const sourceNodeModules = path.join(sourceWebRoot, 'node_modules');
  if (!fs.existsSync(sourceNodeModules)) return false;
  if (!fs.existsSync(path.join(sourceNodeModules, '.bin', process.platform === 'win32' ? 'astro.cmd' : 'astro'))) return false;
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
    mode: fs.constants.COPYFILE_FICLONE
  });

  if (!fs.existsSync(path.join(targetNodeModules, '.bin', process.platform === 'win32' ? 'astro.cmd' : 'astro'))) {
    fs.rmSync(targetNodeModules, { recursive: true, force: true });
    throw new Error('CURRENT_DEPENDENCY_REUSE_INVALID');
  }
  if (proofIdentity) writeDependencyProof(targetWebRoot, proofIdentity);
  if (!readDependencyProof(targetWebRoot)) {
    fs.rmSync(targetNodeModules, { recursive: true, force: true });
    throw new Error('CURRENT_DEPENDENCY_REUSE_PROOF_MISSING');
  }
  return { duration_ms: Date.now() - startedAt };
}
