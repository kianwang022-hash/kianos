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

function normalizePath(value) {
  return String(value || '').trim().replace(/^\.\//, '');
}

export function staticBuildPathImpact(value) {
  const file = normalizePath(value);
  if (!file) return { file, requires_build: false, reason: 'empty' };

  if (file.startsWith('.github/')) {
    return { file, requires_build: false, reason: 'github-control-only' };
  }
  if (file.startsWith('tools/')) {
    return { file, requires_build: false, reason: 'repository-tool-only' };
  }
  if (file.startsWith('static-web/scripts/')) {
    return { file, requires_build: false, reason: 'local-runtime-script-only' };
  }
  if (NO_BUILD_ROOT_FILES.has(file)) {
    return { file, requires_build: false, reason: 'engineering-doc-or-control-only' };
  }

  return { file, requires_build: true, reason: 'unknown-or-static-input' };
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

  return {
    required: buildPaths.length > 0,
    changed_paths: rows.length,
    build_paths: buildPaths,
    reusable_paths: reusablePaths
  };
}
