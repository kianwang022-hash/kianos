import fs from 'node:fs';
import path from 'node:path';
import {
  AUTHORITY_CODES,
  SystemScopeAuthorityError,
  defaultRepoRoot,
  loadSystemScopeAuthorityLock,
  verifyFingerprint
} from '../src/lib/xizongScopeAuthority.mjs';

function parseArgs(argv) {
  const args = { sourceDir: null, verifyOutput: null };
  for (let i = 2; i < argv.length; i += 1) {
    if (argv[i] === '--source-dir') args.sourceDir = argv[++i];
    else if (argv[i] === '--verify-output') args.verifyOutput = argv[++i];
    else throw new Error(`Unknown argument: ${argv[i]}`);
  }
  return args;
}

function requireSourceDir(value) {
  if (!value) {
    throw new SystemScopeAuthorityError(AUTHORITY_CODES.AUTHORITY_SOURCE_MISSING, 'Deterministic rebuild requires --source-dir containing the locked historical inputs', {
      artifact: 'historical_authority_source_directory'
    });
  }
  const resolved = path.resolve(value);
  if (!fs.existsSync(resolved) || !fs.statSync(resolved).isDirectory()) {
    throw new SystemScopeAuthorityError(AUTHORITY_CODES.AUTHORITY_SOURCE_MISSING, 'Deterministic rebuild source directory is missing', {
      artifact: 'historical_authority_source_directory',
      path: resolved
    });
  }
  return resolved;
}

function verifyLockedInputs(sourceDir, lock) {
  const verified = {};
  for (const [key, expected] of Object.entries(lock.historical_authority_bundle.verified_inputs || {})) {
    const filePath = path.join(sourceDir, expected.filename);
    verified[key] = verifyFingerprint(filePath, expected, { role: 'input', artifact: expected.filename });
  }

  const resolver = lock.historical_authority_bundle.resolver;
  const resolverPath = path.join(sourceDir, resolver.filename);
  verified.resolver = verifyFingerprint(resolverPath, resolver, { role: 'resolver', artifact: resolver.filename });
  return verified;
}

function main() {
  const args = parseArgs(process.argv);
  const repoRoot = defaultRepoRoot();
  const lock = loadSystemScopeAuthorityLock({ repoRoot });
  const sourceDir = requireSourceDir(args.sourceDir);
  const verifiedInputs = verifyLockedInputs(sourceDir, lock);

  let verifiedOutput = null;
  if (args.verifyOutput) {
    verifiedOutput = verifyFingerprint(
      path.resolve(args.verifyOutput),
      lock.historical_authority_bundle.hlk_output,
      { role: 'output', artifact: lock.historical_authority_bundle.hlk_output.filename }
    );
  }

  const generator = lock.historical_authority_bundle.generator;
  if (generator?.status !== 'LOCKED' || generator?.deterministic_rebuild_enabled !== true || !generator?.script_path || !generator?.sha256) {
    throw new SystemScopeAuthorityError(AUTHORITY_CODES.AUTHORITY_SOURCE_MISSING, 'Exact historical HLK generator authority is unresolved; generation is intentionally disabled', {
      artifact: 'exact_hlk_generator',
      generator_status: generator?.status || null,
      expected_output: lock.historical_authority_bundle.hlk_output,
      verified_inputs: Object.keys(verifiedInputs),
      supplied_exact_output_verified: Boolean(verifiedOutput)
    });
  }

  throw new SystemScopeAuthorityError(AUTHORITY_CODES.AUTHORITY_SOURCE_MISSING, 'Generator execution adapter has not been admitted into the authority protocol', {
    artifact: 'exact_hlk_generator_execution_adapter',
    generator
  });
}

try {
  main();
} catch (error) {
  const payload = {
    schema: 'kianos.xizong.system_scope_authority_rebuild_result.v1',
    status: 'BLOCKED_FAIL_CLOSED',
    code: error?.code || 'UNEXPECTED_REBUILD_ERROR',
    message: error?.message || String(error),
    details: error?.details || {}
  };
  console.error(JSON.stringify(payload, null, 2));
  process.exitCode = 1;
}
