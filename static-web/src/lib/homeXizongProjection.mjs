import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createHash } from 'node:crypto';
import { execFile, execFileSync } from 'node:child_process';
import { promisify } from 'node:util';

// Derived Home transport only. Canonical Xizong truth remains with content/xizong
// and the existing Xizong runtime owners. This projection exists so a Home UI
// render never has to reconstruct all Xizong blocks before first paint.
import {
  buildXizongForecastCanonicalScope,
  listCurrentXizongSystemIdentities,
  listProjectableXizongSystems,
  loadXizongBlock
} from './xizong.mjs';
import { buildXizongForecastQuestionScope } from './xizongQuestions.mjs';
import { resolveXizongLearnerProjection } from './xizongLearnerProjection.mjs';

export const HOME_XIZONG_PROJECTION_SCHEMA = 'kianos.home.xizong_projection.v1';

export function buildHomeXizongProjection() {
  const systems = listProjectableXizongSystems();
  const xizongForecastQuestionScope = buildXizongForecastQuestionScope(
    listCurrentXizongSystemIdentities()
  );
  const xizongPacketIndex = systems.flatMap((system) => system.blocks.map((blockRef) => {
    const canonical = loadXizongBlock(system.systemId, blockRef.slug);
    const resolved = resolveXizongLearnerProjection(canonical);
    const production = resolved.block;
    return {
      systemId: system.systemId,
      slug: blockRef.slug,
      routeKey: `${system.systemId}/${blockRef.slug}`,
      blockId: canonical.blockId,
      blockLabel: canonical.label,
      packetMeta: {
        objectId: canonical.objectId,
        systemId: system.systemId,
        canonicalId: system.canonicalId,
        blockId: canonical.blockId,
        blockLabel: canonical.label,
        blockTitle: canonical.title,
        sourcePath: canonical.sourcePath,
        sourceHash: canonical.sourceHash,
        revisionWitness: resolved.learnerObject.revisionWitness,
        sourceContactMode: String(production?.sourceContact?.mode || ''),
        sourcePerGroup: production?.sourceContact?.logicGroupIsAutomaticSourceChunk === true,
        reserveItems: []
      },
      kpRows: production.kpRecords.map((kp) => ({
        kpId: kp.kpId,
        displayId: kp.displayId,
        title: kp.title,
        groupId: kp.groupId,
        groupLabel: kp.groupLabel,
        sourceLocator: kp.sourceLocator || '',
        prompt: kp.prompt || ''
      }))
    };
  }));
  const xizongForecastCanonicalScope = buildXizongForecastCanonicalScope(xizongPacketIndex);
  return {
    schema: HOME_XIZONG_PROJECTION_SCHEMA,
    xizongPacketIndex,
    xizongForecastQuestionScope,
    xizongForecastCanonicalScope
  };
}

// Only public canonical transport is reused. Private evidence is still composed
// by Home from the current browser storage on every export. Hash bytes, paths
// and directory membership (not mtimes), including unknown files conservatively.
const transportRoot = path.resolve(process.env.KIANOS_REPO_ROOT || path.resolve(process.cwd(), '..'));
const dependencyRoots = ['content/xizong', 'static-web/src/assets/xizong', 'static-web/src/lib', 'static-web/package.json', 'static-web/package-lock.json', 'static-web/node_modules/marked'];
const runFile = promisify(execFile);
let completedTransport = null;
const pendingTransports = new Map();

function transportRevision(snapshotRoot = null) {
  const hash = createHash('sha256').update(process.version);
  const candidate = process.env.KIANOS_CANDIDATE_RUNTIME === '1';
  hash.update(JSON.stringify({ candidate, head: candidate ? execFileSync('git',['rev-parse','HEAD'],{cwd:transportRoot,encoding:'utf8'}).trim() : null }));
  function visit(relative) {
    const absolute = path.join(transportRoot, relative);
    if (!fs.existsSync(absolute)) { hash.update(JSON.stringify(['missing', relative])); return; }
    const stat = fs.lstatSync(absolute);
    // An unclassified external dependency must not gain a cache certificate.
    if (stat.isSymbolicLink()) throw new Error('HOME_XIZONG_DEPENDENCY_SYMLINK:' + relative);
    hash.update(JSON.stringify([stat.isDirectory() ? 'directory' : 'file', relative]));
    if (stat.isDirectory()) {
      if (snapshotRoot) fs.mkdirSync(path.join(snapshotRoot,relative),{recursive:true});
      for (const name of fs.readdirSync(absolute).sort()) visit(path.join(relative, name));
    } else if (stat.isFile()) {
      const bytes = fs.readFileSync(absolute);
      hash.update(createHash('sha256').update(bytes).digest('hex'));
      if (snapshotRoot) {
        const target = path.join(snapshotRoot,relative);
        fs.mkdirSync(path.dirname(target),{recursive:true});
        fs.writeFileSync(target,bytes);
      }
    }
    else throw new Error('HOME_XIZONG_DEPENDENCY_TYPE:' + relative);
  }
  dependencyRoots.forEach(visit);
  return hash.digest('hex');
}

export async function loadHomeXizongProjectionTransport() {
  const revision = transportRevision();
  if (completedTransport?.revision === revision) return completedTransport;
  if (pendingTransports.has(revision)) return await pendingTransports.get(revision);
  const pending = (async () => {
    const snapshotRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'home-xizong-canonical-'));
    try {
      // Capture exactly the bytes whose digest certifies this result. The child
      // never reads a live Content tree, even if an editor changes and restores
      // an owner during construction. No private state is copied.
      if (transportRevision(snapshotRoot) !== revision) throw new Error('HOME_XIZONG_DEPENDENCIES_CHANGED_DURING_SNAPSHOT');
      if (process.env.KIANOS_CANDIDATE_RUNTIME === '1') {
        fs.symlinkSync(path.join(transportRoot,'.git'),path.join(snapshotRoot,'.git'));
      }
      // Existing build caches require an immutable module graph. A fresh bounded
      // child per revision prevents old module-level Source/support caches from
      // surviving Content changes; no learner/private input is passed to it.
      const { stdout } = await runFile(process.execPath, ['--input-type=module', '-e',
        `import fs from 'node:fs';
         import { fileURLToPath, pathToFileURL } from 'node:url';
         import path from 'node:path';
         const root = process.env.KIANOS_REPO_ROOT;
         const allowed = ['content/xizong', 'static-web/src/assets/xizong', 'static-web/src/lib']
           .map(p => path.join(root, p) + path.sep);
         const read = fs.readFileSync;
         fs.readFileSync = function(file, ...args) {
           const p = path.resolve(file instanceof URL ? fileURLToPath(file) : String(file));
           if (!allowed.some(prefix => p.startsWith(prefix))) {
             throw new Error('HOME_XIZONG_UNCLASSIFIED_DEPENDENCY:' + p);
           }
           return read.call(this, file, ...args);
         };
         const { buildHomeXizongProjection } = await import(pathToFileURL(
           path.join(root, 'static-web/src/lib/homeXizongProjection.mjs')));
         process.stdout.write(JSON.stringify(buildHomeXizongProjection()));`
      ], {
        cwd: path.join(snapshotRoot, 'static-web'),
        env: { KIANOS_REPO_ROOT: snapshotRoot, KIANOS_XIZONG_BUILD_CACHE: '1', KIANOS_CANDIDATE_RUNTIME: process.env.KIANOS_CANDIDATE_RUNTIME === '1' ? '1' : '0' },
        maxBuffer: 32 * 1024 * 1024,
        timeout: 120000
      });
      // Fail closed if files changed during the build; never publish a mixed
      // revision or serve the previous result on a failed rebuild.
      if (transportRevision() !== revision) throw new Error('HOME_XIZONG_DEPENDENCIES_CHANGED_DURING_BUILD');
      const packet = JSON.parse(stdout);
      if (packet.schema !== HOME_XIZONG_PROJECTION_SCHEMA) throw new Error('HOME_XIZONG_PROJECTION_SCHEMA');
      completedTransport = Object.freeze({ revision, body: stdout });
      return completedTransport;
    } finally { fs.rmSync(snapshotRoot,{recursive:true,force:true}); }
  })();
  pendingTransports.set(revision, pending);
  try { return await pending; }
  finally { pendingTransports.delete(revision); }
}
