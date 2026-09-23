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

// The server retains imported modules in memory. Shared browser/server helpers
// must move with the published site, even when no bridge entrypoint changed.
export function requiresStaticRuntimeReload(changedPaths = []) {
  return changedPaths.some((value) => {
    const file = normalizePath(value);
    return file.startsWith('static-web/src/lib/')
      || (file.startsWith('static-web/scripts/') && file.endsWith('.mjs'));
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
