const NO_BUILD_ROOT_FILES = new Set([
  '.gitignore',
  'AGENTS.md',
  'ARCHITECTURE.md',
  'AUTHORITY_INHERITANCE_CONTRACT.md',
  'AUTHORITY_OWNERSHIP.json',
  'BRANCH_LIFECYCLE.md',
  'CURRENT.md',
  'DEFERRED.md',
  'PROJECT_DEFINITION.md',
  'PROJECT_MANAGEMENT_CONTRACT.md',
  'README.md',
  'SEMANTIC_BASE_VALIDITY.md',
  'SYSTEM_CONTRACT.md',
  'static-web/CURRENT.md'
]);

const LEXICAL_PROJECTION_FILES = new Set([
  'content/lexical/final-learner-object-decisions.json',
  'tools/lexical_build_final_learner_objects.py'
]);

const LEXICAL_PROJECTION_PREFIXES = [
  'content/lexical/words/',
  'content/lexical/relations/'
];

function normalizePath(value) {
  return String(value || '').trim().replace(/^\.\//, '');
}

function isTestOnlyStaticScript(file) {
  return /^static-web\/scripts\/test-[^/]+\.mjs$/.test(file);
}

const CURRENT_SUPERVISOR_SCRIPTS = new Set([
  'static-web/scripts/kianos-current-sync.mjs',
  'static-web/scripts/currentRelease.mjs',
  'static-web/scripts/currentStaticImpact.mjs',
  'static-web/scripts/currentStaticSlots.mjs',
  'static-web/scripts/currentDependencies.mjs'
]);

const NON_SERVING_STATIC_RUNTIME_SCRIPTS = new Set([
  'static-web/scripts/kianos-candidate-runtime.mjs'
]);

function isContentWorkCursor(file) {
  return /^content\/.+\/CURRENT\.md$/.test(file);
}

function isContentOrientationDoc(file) {
  return /^content\/[^/]+\/README\.md$/.test(file);
}

function isColdHistoricalEvidence(file) {
  if (file.startsWith('content/english/audit/')) return true;
  if (file.startsWith('content/lexical/semantic-audit/')) return true;
  if (file.startsWith('content/lexical/semantic-reconciliation/')) return true;
  if (file.startsWith('content/lexical/semantic-review/')) return true;
  if (file.startsWith('content/lexical/execution/')) return true;
  if (file.startsWith('content/lexical/audit/history/')) return true;
  if (file.startsWith('content/politics/projection/history/')) return true;
  if (file === 'content/politics/MATURITY_FRESH_INDEPENDENT_AUDIT.md') return true;
  return /^content\/xizong\/knowledge\/learner\/[^/]*(?:PHASE|AUDIT|EXECUTION|CALIBRATION|REACCEPTANCE|CLOSURE)[^/]*\.md$/i.test(file);
}

// The server retains imported modules in memory. Shared browser/server helpers
// must move with the published site, even when no bridge entrypoint changed.
// Test-only scripts never run in the learner runtime and must not force a
// production reload merely because engineering proof changed.
export function requiresStaticRuntimeReload(changedPaths = []) {
  return changedPaths.some((value) => {
    const file = normalizePath(value);
    return file.startsWith('static-web/src/lib/')
      || (
        file.startsWith('static-web/scripts/')
        && file.endsWith('.mjs')
        && !isTestOnlyStaticScript(file)
        && !CURRENT_SUPERVISOR_SCRIPTS.has(file)
        && !NON_SERVING_STATIC_RUNTIME_SCRIPTS.has(file)
      );
  });
}

function requiresLexicalProjection(file) {
  return LEXICAL_PROJECTION_FILES.has(file)
    || LEXICAL_PROJECTION_PREFIXES.some((prefix) => file.startsWith(prefix));
}

export function staticBuildPathImpact(value) {
  const file = normalizePath(value);
  if (!file) {
    return { file, requires_build: false, requires_lexical_projection: false, reason: 'empty' };
  }

  const lexicalProjection = requiresLexicalProjection(file);
  if (file === 'tools/lexical_build_final_learner_objects.py') {
    return {
      file,
      requires_build: true,
      requires_lexical_projection: true,
      reason: 'lexical-projection-builder'
    };
  }
  if (file.startsWith('.github/')) {
    return { file, requires_build: false, requires_lexical_projection: false, reason: 'github-control-only' };
  }
  if (file.startsWith('tools/')) {
    return { file, requires_build: false, requires_lexical_projection: false, reason: 'repository-tool-only' };
  }
  if (file.startsWith('static-web/scripts/')) {
    return { file, requires_build: false, requires_lexical_projection: false, reason: 'local-runtime-script-only' };
  }
  if (/^static-web\/[^/]+\.md$/.test(file)) {
    return { file, requires_build: false, requires_lexical_projection: false, reason: 'website-engineering-doc-only' };
  }
  if (isContentWorkCursor(file)) {
    return { file, requires_build: false, requires_lexical_projection: false, reason: 'content-work-cursor-only' };
  }
  if (isContentOrientationDoc(file)) {
    return { file, requires_build: false, requires_lexical_projection: false, reason: 'content-orientation-doc-only' };
  }
  if (isColdHistoricalEvidence(file)) {
    return { file, requires_build: false, requires_lexical_projection: false, reason: 'cold-historical-evidence-only' };
  }
  if (NO_BUILD_ROOT_FILES.has(file)) {
    return { file, requires_build: false, requires_lexical_projection: false, reason: 'engineering-doc-or-control-only' };
  }

  return {
    file,
    requires_build: true,
    requires_lexical_projection: lexicalProjection,
    reason: lexicalProjection ? 'lexical-static-input' : 'unknown-or-static-input'
  };
}

export function staticBuildCanReuseFromBase(priorStatus, baseSha) {
  const expected = String(baseSha || '').trim();
  return Boolean(
    expected
    && priorStatus?.state === 'synced'
    && String(priorStatus?.sha || '').trim() === expected
  );
}

export function staticBuildNpmScript(decision = {}) {
  return decision?.lexical_projection_required ? 'build' : 'build:astro';
}

export function classifyStaticBuild(changedPaths = []) {
  const rows = [...new Set(
    (Array.isArray(changedPaths) ? changedPaths : [])
      .map(normalizePath)
      .filter(Boolean)
  )].map(staticBuildPathImpact);

  const buildPaths = rows.filter((row) => row.requires_build).map((row) => row.file);
  const reusablePaths = rows.filter((row) => !row.requires_build).map((row) => row.file);
  const lexicalProjectionPaths = rows
    .filter((row) => row.requires_lexical_projection)
    .map((row) => row.file);

  return {
    required: buildPaths.length > 0,
    changed_paths: rows.length,
    build_paths: buildPaths,
    reusable_paths: reusablePaths,
    lexical_projection_required: lexicalProjectionPaths.length > 0,
    lexical_projection_paths: lexicalProjectionPaths
  };
}
