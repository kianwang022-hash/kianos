import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { syncBuiltinESMExports } from 'node:module';

// Disposable compiler evidence, never a content/semantic owner. Any uncertainty
// leaves Current on its existing complete-build path.
export const CLIENT_PROOF_FILE = '.current-client-proof.json';
export const CLIENT_PROOF_SCHEMA = 'kianos.current.client-artifacts.v1';
const ROOT = '@@KIANOS_REPO@@';
const hex40 = value => /^[a-f0-9]{40}$/.test(String(value || ''));
const digest = value => crypto.createHash('sha256').update(value).digest('hex');
const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const git = (root, args) => execFileSync('git', ['-C', root, ...args], {
  encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 15000, maxBuffer: 16 * 1024 * 1024
}).trim();
const pack = (value, root) => JSON.parse(JSON.stringify(value, (_, v) =>
  v instanceof RegExp ? { __regexp: v.source, flags: v.flags } : v
).split(root).join(ROOT));
const unpack = (value, root) => JSON.parse(JSON.stringify(value).split(ROOT).join(root), (_, v) =>
  v && typeof v === 'object' && '__regexp' in v ? new RegExp(v.__regexp, v.flags) : v
);
function isSerializableConfig(value, seen = new Set()) {
  if (['function', 'symbol', 'bigint'].includes(typeof value)) return false;
  if (!value || typeof value !== 'object' || value instanceof RegExp) return true;
  if (seen.has(value)) return false;
  seen.add(value);
  const okay = Object.values(value).every(v => isSerializableConfig(v, seen));
  seen.delete(value); return okay;
}
const physical = id => String(id).split('?')[0];
const relativeSource = (id, root) => {
  const p = physical(id);
  return path.isAbsolute(p) && p.startsWith(root + path.sep) && !p.includes('/node_modules/')
    ? path.relative(root, p).split(path.sep).join('/') : null;
};
function safeFile(root, relative) {
  if (typeof relative !== 'string' || relative.includes('\\') || relative.includes('\0') || path.isAbsolute(relative)) throw new Error('CLIENT_ARTIFACT_UNSAFE_PATH');
  const result = path.resolve(root, relative);
  if (!result.startsWith(path.resolve(root) + path.sep)) throw new Error('CLIENT_ARTIFACT_UNSAFE_PATH');
  return result;
}
function filesIn(root, prefix = '') {
  const result = [];
  for (const entry of fs.readdirSync(path.join(root, prefix), { withFileTypes: true })) {
    const key = prefix ? prefix + '/' + entry.name : entry.name;
    if (entry.isSymbolicLink()) throw new Error('CLIENT_ARTIFACT_SYMLINK:' + key);
    if (entry.isDirectory()) result.push(...filesIn(root, key));
    else if (entry.isFile()) result.push(key);
    else throw new Error('CLIENT_ARTIFACT_NOT_REGULAR:' + key);
  }
  return result.sort();
}
function artifactIndex(root) {
  return Object.fromEntries(filesIn(root).filter(p => p !== '__kianos-current.json')
    .map(p => [p, digest(fs.readFileSync(safeFile(root, p)))]));
}
function toolchain(webRoot) {
  const result = { node: process.version, platform: process.platform, arch: process.arch };
  for (const p of ['astro', 'vite', 'rollup', 'esbuild']) result[p] = readJson(path.join(webRoot, 'node_modules', p, 'package.json')).version;
  return result;
}
function cleanSource(root) { return !git(root, ['status', '--porcelain', '--untracked-files=no']); }

export function clientBuildContextHash(env = process.env, repoRoot = process.cwd()) {
  const ignored = new Set(['_', 'SHLVL', 'PWD', 'OLDPWD', 'INIT_CWD', 'PATH', 'NODE',
    'KIANOS_BUILD_CONTEXT_HASH', 'KIANOS_RELEASE_SHA', 'KIANOS_SYNC_RUNTIME_SHA', 'KIANOS_XIZONG_BUILD_CACHE']);
  const entries = Object.entries({ ...env, NODE_ENV: env.NODE_ENV || 'production' }).filter(([k]) => !ignored.has(k) && !/^npm_/i.test(k))
    .map(([k,v]) => [k, String(v).split(repoRoot).join(ROOT)]).sort(([a],[b]) => a.localeCompare(b));
  return digest(JSON.stringify(entries));
}
export function clientProofDigest(webRoot) {
  try { return digest(fs.readFileSync(path.join(webRoot, CLIENT_PROOF_FILE))); } catch { return null; }
}
function observeRenderReads(repoRoot, webRoot, outDir) {
  const reads = {};
  const existence = {}, directories = {};
  const originalSync = fs.readFileSync, originalAsync = fs.promises.readFile;
  const originalExists = fs.existsSync, originalDirectory = fs.readdirSync, originalAsyncDirectory = fs.promises.readdir;
  const normalized = file => {
    if (typeof file === 'number') return null;
    try { const p = file instanceof URL ? fileURLToPath(file) : path.resolve(String(file));
      if (p.includes('/node_modules/') || p.includes('/.git/') || (p === outDir || p.startsWith(outDir + path.sep)) || p.startsWith(path.join(webRoot, '.astro'))) return null;
      return pack(p, repoRoot); } catch { return null; }
  };
  const record = (file, bytes, options) => {
    if (typeof file === 'number') return;
    let p;
    try { p = file instanceof URL ? fileURLToPath(file) : path.resolve(String(file)); } catch { return; }
    if (p.includes('/node_modules/') || p.includes('/.git/') || (p === outDir || p.startsWith(outDir + path.sep)) || p.startsWith(path.join(webRoot, '.astro'))) return;
    // This receipt stores digests only; private source bytes never leave their owner.
    const key = pack(p, repoRoot);
    let raw = bytes;
    if (typeof bytes === 'string') {
      const encoding = typeof options === 'string' ? options : options?.encoding || 'utf8';
      raw = originalSync.call(fs, file);
      if (raw.toString(encoding) !== bytes) { reads[key] = 'CHANGED_DURING_RENDER'; return; }
    }
    const value = digest(raw);
    if (reads[key] && reads[key] !== value) reads[key] = 'CHANGED_DURING_RENDER';
    else reads[key] = value;
  };
  fs.readFileSync = function(file, ...args) { const bytes = originalSync.call(this, file, ...args); record(file, bytes, args[0]); return bytes; };
  fs.promises.readFile = async function(file, ...args) { const bytes = await originalAsync.call(this, file, ...args); record(file, bytes, args[0]); return bytes; };
  fs.existsSync = function(file) { const value=originalExists.call(this,file), key=normalized(file); if(key) existence[key]=value; return value; };
  const names = rows => rows.map(r => typeof r === 'string' || Buffer.isBuffer(r) ? String(r) : r.name).sort();
  fs.readdirSync = function(file,...args) { const rows=originalDirectory.call(this,file,...args),key=normalized(file);if(key)directories[key]=names(rows);return rows; };
  fs.promises.readdir = async function(file,...args) { const rows=await originalAsyncDirectory.call(this,file,...args),key=normalized(file);if(key)directories[key]=names(rows);return rows; };
  syncBuiltinESMExports();
  return { reads, existence, directories, restore() { fs.readFileSync = originalSync; fs.promises.readFile = originalAsync; fs.existsSync=originalExists;fs.readdirSync=originalDirectory;fs.promises.readdir=originalAsyncDirectory;syncBuiltinESMExports(); } };
}

function moduleSignature(chunk, root) {
  // Membership changes fall back rather than guessing at shared chunk identity.
  return JSON.stringify({
    facade: chunk.facadeModuleId ? pack(chunk.facadeModuleId, root) : null,
    name: chunk.name,
    modules: Object.keys(chunk.modules || {}).map(id => pack(id, root)).sort(),
    exports: [...(chunk.exports || [])].sort(), entry: chunk.isEntry, dynamic: chunk.isDynamicEntry
  });
}
function chunkSnapshot(chunk, root) {
  return { file: chunk.fileName, signature: moduleSignature(chunk, root), imports: chunk.imports,
    dynamicImports: chunk.dynamicImports, facade: chunk.facadeModuleId ? pack(chunk.facadeModuleId, root) : null, code: chunk.code };
}
function atomicJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temp = file + '.tmp-' + process.pid;
  fs.writeFileSync(temp, JSON.stringify(value) + '\n'); fs.renameSync(temp, file);
}

export function currentClientArtifactsIntegration() {
  let webRoot, repoRoot, outDir, snapshot, io;
  return {
    name: 'kianos-current-client-artifacts',
    hooks: {
      'astro:config:done': ({ config }) => {
        webRoot = fs.realpathSync(fileURLToPath(config.root)); repoRoot = path.resolve(webRoot, '..'); outDir = path.resolve(fileURLToPath(config.outDir));
        snapshot = { serverSources: [], clientSources: [], virtualModules: {}, clientInputs: [], chunks: [], inlineChunks: [], clientAssets: {}, dependencyInputs: {} };
      },
      'astro:build:setup': ({ vite, target }) => {
        vite.plugins ||= []; let before = [];
        vite.plugins.push({
          name: 'kianos-client-receipt-' + target, enforce: 'post',
          configResolved(config) {
            if (target !== 'client') return;
            snapshot.pluginNames = config.plugins.map(p => p.name);
            const codeHooks = ['resolveId','load','transform','renderChunk','generateBundle','writeBundle','buildStart'];
            const unsupportedPlugins = config.plugins.filter(p => codeHooks.some(h => p[h])
              && !/^(?:vite:|astro:|@astro\/|kianos-client-receipt-)/.test(p.name)
              && !['astro-manifest-plugin', 'astro-env-plugin', 'astro-content-virtual-mod-plugin', '@astrojs/vite-plugin-astro-ssr-manifest', 'alias', 'commonjs', 'commonjs--resolver', 'rollup-plugin-dynamic-import-variables'].includes(p.name));
            if (unsupportedPlugins.length) snapshot.unsupported = 'unsupported-client-plugin:' + unsupportedPlugins.map(p=>p.name).join(',');
            if (![config.resolve.alias, config.esbuild, config.css, config.build.modulePreload].every(v => isSerializableConfig(v))) snapshot.unsupported = 'nonserializable-client-config';
            snapshot.config = pack({ base: config.base, define: config.define,
              resolve: { alias: config.resolve.alias, conditions: config.resolve.conditions, mainFields: config.resolve.mainFields, dedupe: config.resolve.dedupe, preserveSymlinks: config.resolve.preserveSymlinks },
              esbuild: config.esbuild, css: config.css,
              build: { target: config.build.target, minify: config.build.minify, assetsInlineLimit: config.build.assetsInlineLimit, cssCodeSplit: config.build.cssCodeSplit, cssTarget: config.build.cssTarget, cssMinify: config.build.cssMinify, sourcemap: config.build.sourcemap, modulePreload: config.build.modulePreload },
              assetsDir: config.build.assetsDir }, repoRoot);
            if (config.build.sourcemap || typeof config.build.assetsInlineLimit !== 'number' || config.build.rollupOptions?.output?.manualChunks) snapshot.unsupported = 'custom-output-or-sourcemap';
          },
          options(options) {
            if (target === 'client') snapshot.clientInputs = pack(Array.isArray(options.input) ? options.input : typeof options.input === 'string' ? [options.input] : Object.values(options.input || {}), repoRoot);
          },
          generateBundle: { order: 'pre', handler(_options, bundle) {
            const sources = new Set();
            for (const id of this.getModuleIds()) {
              const source = relativeSource(id, repoRoot); if (source) sources.add(source);
              const disk = physical(id);
              if (path.isAbsolute(disk) && disk.includes('/node_modules/') && fs.existsSync(disk) && fs.statSync(disk).isFile()) snapshot.dependencyInputs[pack(disk,repoRoot)] = digest(fs.readFileSync(disk));
              if (target === 'client') {
                const info = this.getModuleInfo(id);
                if (info?.isExternal) snapshot.unsupported = 'external-client-module';
                if (!fs.existsSync(id) && info?.code != null) snapshot.virtualModules[pack(id, repoRoot)] = pack(info.code, repoRoot);
              }
            }
            if (target === 'server') snapshot.serverSources = [...sources].sort();
            else { snapshot.clientSources = [...sources].sort(); before = Object.values(bundle).filter(o => o.type === 'chunk').map(o => chunkSnapshot(o, repoRoot)); }
          } },
          writeBundle(_options, bundle) {
            if (target !== 'client') return;
            snapshot.chunks = Object.values(bundle).filter(o => o.type === 'chunk').map(o => chunkSnapshot(o, repoRoot));
            snapshot.inlineChunks = before.filter(o => !bundle[o.file]);
            snapshot.clientAssets = Object.fromEntries(Object.values(bundle).filter(o => o.type === 'asset').map(o => [o.fileName, digest(o.source)]));
          }
        });
      },
      'astro:build:ssr': () => { io = observeRenderReads(repoRoot, webRoot, outDir); },
      'astro:build:done': () => {
        io?.restore();
        try {
          const sourceSha = git(repoRoot, ['rev-parse', 'HEAD']);
          const releaseSha = process.env.KIANOS_RELEASE_SHA || sourceSha;
          const installed = toolchain(webRoot);
          if (installed.astro !== '5.18.2' || installed.vite !== '6.4.3') throw new Error('unsupported-compiler-profile');
          if (!hex40(releaseSha) || releaseSha !== sourceSha || !cleanSource(repoRoot)) throw new Error('dirty-or-unidentified-source');
          if (snapshot.unsupported || !snapshot.serverSources.length || !snapshot.clientInputs.length || !snapshot.chunks.length) throw new Error(snapshot.unsupported || 'incomplete-compiler-graph');
          const inputs = {};
          for (const key of new Set([...snapshot.serverSources, ...snapshot.clientSources])) {
            const p = safeFile(repoRoot, key); if (fs.existsSync(p)) inputs[key] = digest(fs.readFileSync(p));
          }
          const proof = { schema: CLIENT_PROOF_SCHEMA, contextHash: process.env.KIANOS_BUILD_CONTEXT_HASH || null, renderReads: io?.reads || {}, renderExistence: io?.existence || {}, renderDirectories: io?.directories || {}, sourceSha, sourceTree: git(repoRoot, ['rev-parse', 'HEAD^{tree}']),
            toolchain: toolchain(webRoot), ...snapshot, inputs, artifacts: artifactIndex(outDir), delivery: { kind: 'full', baseSha: null, prerendered: true } };
          atomicJson(path.join(webRoot, CLIENT_PROOF_FILE), proof);
          console.log('[Current artifacts] recorded compiler client/server boundary for ' + sourceSha.slice(0, 12));
        } catch (error) {
          fs.rmSync(path.join(webRoot, CLIENT_PROOF_FILE), { force: true });
          console.warn('[Current artifacts] no reusable receipt: ' + error.message);
        }
      }
    }
  };
}

export function planClientArtifactBuild({ baseWebRoot, webRoot, targetSha }) {
  try {
    if (!baseWebRoot || !hex40(targetSha)) throw new Error('base-or-target-missing');
    webRoot = fs.realpathSync(webRoot); baseWebRoot = fs.realpathSync(baseWebRoot);
    const proof = readJson(path.join(baseWebRoot, CLIENT_PROOF_FILE));
    const repoRoot = path.resolve(webRoot, '..'), baseDist = path.join(baseWebRoot, 'dist');
    const status = readJson(path.join(baseDist, '__kianos-current.json'));
    if (status.client_proof_sha256 !== clientProofDigest(baseWebRoot)) throw new Error('base-proof-integrity');
    if (!proof.contextHash || proof.contextHash !== clientBuildContextHash(process.env,repoRoot)) throw new Error('build-context-changed');
    if (proof.schema !== CLIENT_PROOF_SCHEMA || !hex40(proof.sourceSha) || status.sha !== proof.sourceSha || status.state !== 'synced') throw new Error('base-receipt-identity');
    if (git(repoRoot, ['rev-parse', 'HEAD']) !== targetSha || !cleanSource(repoRoot)) throw new Error('target-not-clean');
    if (git(repoRoot, ['rev-parse', proof.sourceSha + '^{tree}']) !== proof.sourceTree) throw new Error('base-tree-mismatch');
    if (JSON.stringify(toolchain(webRoot)) !== JSON.stringify(proof.toolchain)) throw new Error('toolchain-changed');
    const raw = git(repoRoot, ['diff', '--no-renames', '--name-status', proof.sourceSha, targetSha]);
    const changed = [];
    // Recorded virtual modules contain compiler output, not a live read of the
    // underlying file. A ?raw/?url wrapper must never conceal a source edit.
    const frozenSources = new Set(Object.keys(proof.virtualModules || {})
      .map(id => relativeSource(unpack(id, repoRoot), repoRoot)).filter(Boolean));
    for (const line of raw.split('\n').filter(Boolean)) {
      const [statusCode, name] = line.split('\t');
      if (/^static-web\/scripts\/test-[^/]+\.mjs$/.test(name)
        && !proof.clientSources.includes(name) && !proof.serverSources.includes(name)) continue;
      if (statusCode !== 'M' || !/\.(?:m?js)$/.test(name) || !proof.clientSources.includes(name) || proof.serverSources.includes(name)) throw new Error('not-proven-client-only:' + name);
      if (frozenSources.has(name)) throw new Error('frozen-virtual-source:' + name);
      changed.push(name);
    }
    if (!changed.length) throw new Error('no-client-change');
    const changedSet = new Set(changed);
    for (const [key, sha] of Object.entries(proof.dependencyInputs || {})) if (digest(fs.readFileSync(unpack(key,repoRoot))) !== sha) throw new Error('dependency-bytes-changed:' + key);
    for (const [key, expected] of Object.entries(proof.renderExistence || {})) if (fs.existsSync(unpack(key,repoRoot)) !== expected) throw new Error('render-input-existence-changed:' + key);
    for (const [key, expected] of Object.entries(proof.renderDirectories || {})) if (JSON.stringify(fs.readdirSync(unpack(key,repoRoot)).sort()) !== JSON.stringify(expected)) throw new Error('render-input-directory-changed:' + key);
    for (const [key, sha] of Object.entries(proof.renderReads || {})) {
      const file = unpack(key, repoRoot);
      if (digest(fs.readFileSync(file)) !== sha) throw new Error('render-input-changed:' + key);
    }
    for (const [p, sha] of Object.entries(proof.inputs)) {
      if (!changedSet.has(p) && digest(fs.readFileSync(safeFile(repoRoot, p))) !== sha) throw new Error('input-drift:' + p);
    }
    const actual = artifactIndex(baseDist);
    if (JSON.stringify(actual) !== JSON.stringify(proof.artifacts)) throw new Error('base-artifact-drift');
    return { eligible: true, reason: 'compiler-proven-client-only', changed, proof, baseDist };
  } catch (error) { return { eligible: false, reason: error.message }; }
}

export async function buildClientArtifacts({ baseWebRoot, webRoot, targetSha, outDir }) {
  webRoot = fs.realpathSync(webRoot); baseWebRoot = fs.realpathSync(baseWebRoot);
  const started = performance.now();
  const plan = planClientArtifactBuild({ baseWebRoot, webRoot, targetSha });
  if (!plan.eligible) throw new Error('CLIENT_ARTIFACT_FALLBACK:' + plan.reason);
  const { proof, baseDist } = plan, repoRoot = path.resolve(webRoot, '..'), output = path.join(fs.realpathSync(path.dirname(path.resolve(outDir))), path.basename(outDir));
  if (!output.startsWith(path.resolve(webRoot) + path.sep) || output === path.resolve(baseDist) || output.startsWith(path.resolve(baseDist) + path.sep) || path.resolve(baseDist).startsWith(output + path.sep)) throw new Error('CLIENT_ARTIFACT_LIVE_OUTPUT_FORBIDDEN');
  if (fs.existsSync(output)) throw new Error('CLIENT_ARTIFACT_OUTPUT_EXISTS');
  const temp = fs.mkdtempSync(path.join(webRoot, '.current-client-next-'));
  try {
    const cfg = unpack(proof.config, repoRoot), virtual = unpack(proof.virtualModules, repoRoot), input = unpack(proof.clientInputs, repoRoot);
    const { build } = await import('vite');
    const oldInline = new Map(proof.inlineChunks.map(c => [c.signature, c.code]));
    let nextChunks = [], clientSources = [], nextVirtual = {};
    await build({ logLevel: 'warn', configFile: false, root: webRoot, base: cfg.base, mode: 'production', publicDir: false,
      define: { ...cfg.define, __KIANOS_RELEASE_SHA__: JSON.stringify(targetSha) }, resolve: cfg.resolve, esbuild: cfg.esbuild, css: cfg.css,
      build: { ...cfg.build, outDir: temp, emptyOutDir: true, reportCompressedSize: false, copyPublicDir: false,
        rollupOptions: { input, preserveEntrySignatures: 'exports-only', output: { format: 'esm', entryFileNames: '_astro/[name].[hash].js', chunkFileNames: '_astro/[name].[hash].js', assetFileNames: '_astro/[name].[hash][extname]' } } },
      plugins: [{ name: 'kianos-recorded-astro-client-scripts', enforce: 'pre',
        resolveId(id) { if (Object.hasOwn(virtual, id)) return id; }, load(id) { if (Object.hasOwn(virtual, id)) return virtual[id]; }
      }, { name: 'kianos-client-artifact-closure', enforce: 'post',
        generateBundle(_options, bundle) {
          const seenInline = new Set();
          for (const [file, item] of Object.entries(bundle)) {
            if (item.type === 'asset') {
              if (proof.clientAssets[file] !== digest(item.source)) throw new Error('CLIENT_ARTIFACT_ASSET_CHANGED:' + file);
            } else {
              const signature = moduleSignature(item, repoRoot);
              if (oldInline.has(signature)) {
                if (oldInline.get(signature) !== item.code) throw new Error('CLIENT_ARTIFACT_INLINE_CHANGED');
                seenInline.add(signature); delete bundle[file];
              }
            }
          }
          if (seenInline.size !== oldInline.size) throw new Error('CLIENT_ARTIFACT_INLINE_MEMBERSHIP_CHANGED');
          const sources = new Set();
          for (const id of this.getModuleIds()) {
            const src = relativeSource(id, repoRoot); if (src) sources.add(src);
            const info = this.getModuleInfo(id);
            if (info?.isExternal) throw new Error('CLIENT_ARTIFACT_NEW_EXTERNAL');
            if (!fs.existsSync(id) && info?.code != null) nextVirtual[pack(id, repoRoot)] = pack(info.code, repoRoot);
          }
          clientSources = [...sources].sort();
          if (JSON.stringify(clientSources) !== JSON.stringify(proof.clientSources)) throw new Error('CLIENT_ARTIFACT_SOURCE_GRAPH_CHANGED:'+JSON.stringify({before:proof.clientSources,after:clientSources}));
          nextChunks = Object.values(bundle).filter(o => o.type === 'chunk').map(o => chunkSnapshot(o, repoRoot));
        }
      }] });
    const bySignature = new Map(nextChunks.map(c => [c.signature, c]));
    if (bySignature.size !== nextChunks.length || nextChunks.length !== proof.chunks.length) throw new Error('CLIENT_ARTIFACT_CHUNK_MEMBERSHIP_CHANGED');
    const substitutions = new Map();
    for (const old of proof.chunks) {
      const next = bySignature.get(old.signature);
      if (!next) throw new Error('CLIENT_ARTIFACT_CHUNK_BOUNDARY_CHANGED:' + old.file);
      if (old.file !== next.file) substitutions.set('/' + old.file, '/' + next.file);
    }
    const available = new Set([...Object.keys(proof.artifacts).filter(f => !proof.chunks.some(c => c.file === f)), ...nextChunks.map(c => c.file)]);
    for (const c of nextChunks) for (const imported of [...c.imports, ...c.dynamicImports]) if (!available.has(imported)) throw new Error('CLIENT_ARTIFACT_MISSING_IMPORT:' + imported);
    const finalPlan = planClientArtifactBuild({ baseWebRoot, webRoot, targetSha });
    if (!finalPlan.eligible) throw new Error('CLIENT_ARTIFACT_INPUT_CHANGED_DURING_BUILD:' + finalPlan.reason);
    fs.cpSync(baseDist, output, { recursive: true, mode: fs.constants.COPYFILE_FICLONE });
    for (const old of proof.chunks) fs.rmSync(safeFile(output, old.file));
    for (const c of nextChunks) {
      const dest = safeFile(output, c.file); fs.mkdirSync(path.dirname(dest), { recursive: true }); fs.copyFileSync(safeFile(temp, c.file), dest);
    }
    const baseSha = proof.sourceSha; let reusedHtml = 0, referenceUpdatedHtml = 0;
    const oldStamp = 'data-kianos-release-sha="' + baseSha + '"', newStamp = 'data-kianos-release-sha="' + targetSha + '"';
    const keys = [...substitutions.keys()], escape = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const replacementPattern = keys.length ? new RegExp(keys.map(escape).join('|'), 'g') : null;
    for (const f of Object.keys(proof.artifacts)) {
      if (!f.endsWith('.html')) continue;
      const dest = safeFile(output, f), original = fs.readFileSync(dest, 'utf8'); let next = original;
      if (replacementPattern) next = next.replace(replacementPattern, match => substitutions.get(match));
      if (next !== original) referenceUpdatedHtml++;
      next = next.split(oldStamp).join(newStamp);
      if (next.includes(baseSha)) throw new Error('CLIENT_ARTIFACT_UNSUPPORTED_RELEASE_EMBEDDING:' + f);
      if (next !== original) fs.writeFileSync(dest, next); reusedHtml++;
    }
    for (const f of Object.keys(proof.artifacts)) {
      if (f.endsWith('.html') || f === '__kianos-current.json' || proof.chunks.some(c => c.file === f)) continue;
      if (/\.(?:js|mjs|css|json|xml|webmanifest)$/.test(f)) {
        const bytes = fs.readFileSync(safeFile(output, f));
        if (keys.some(k => bytes.includes(Buffer.from(k)))) throw new Error('CLIENT_ARTIFACT_NON_HTML_REFERENCE:' + f);
      }
    }
    const inputs = { ...proof.inputs }; for (const p of plan.changed) inputs[p] = digest(fs.readFileSync(safeFile(repoRoot, p)));
    const nextProof = { ...proof, sourceSha: targetSha, sourceTree: git(repoRoot, ['rev-parse', 'HEAD^{tree}']), inputs, chunks: nextChunks, virtualModules: nextVirtual,
      artifacts: artifactIndex(output), delivery: { kind: 'client-artifacts', baseSha, prerendered: false, reusedHtml, referenceUpdatedHtml, changedClientFiles: plan.changed, durationMs: Math.round(performance.now() - started) } };
    atomicJson(path.join(webRoot, CLIENT_PROOF_FILE), nextProof);
    atomicJson(path.join(output, '__kianos-current.json'), { state: 'synced', sha: targetSha, static_build: 'client-artifacts', artifact_base_sha: baseSha, client_proof_sha256: clientProofDigest(webRoot) }); return nextProof.delivery;
  } catch (error) { fs.rmSync(output, { recursive: true, force: true }); throw error; }
  finally { fs.rmSync(temp, { recursive: true, force: true }); }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const value = name => { const i=process.argv.indexOf(name); if(i<0 || !process.argv[i+1]) throw new Error('MISSING_ARGUMENT:'+name); return process.argv[i+1]; };
  try { console.log('[Current artifacts] ' + JSON.stringify(await buildClientArtifacts({ baseWebRoot: value('--base-web-root'), webRoot: process.cwd(), targetSha: value('--target-sha'), outDir: value('--out-dir') }))); }
  catch (error) { console.error(error.stack || error); process.exitCode = 1; }
}
