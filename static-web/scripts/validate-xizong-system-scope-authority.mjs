import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  AUTHORITY_CODES,
  SystemScopeAuthorityError,
  classifyCiExecution,
  defaultRepoRoot,
  expandScopeIds,
  inventoryHash,
  loadAcceptedSystemScopeOwner,
  loadSystemScopeAuthorityLock,
  sha256Buffer,
  verifyFingerprint
} from '../src/lib/xizongScopeAuthority.mjs';

function assert(condition, message, details = {}) {
  if (!condition) throw new SystemScopeAuthorityError(AUTHORITY_CODES.AUTHORITY_LOCK_INVALID, message, details);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function setDiff(left, right) {
  const rightSet = new Set(right);
  return [...new Set(left)].filter((id) => !rightSet.has(id)).sort();
}

function sameList(a, b) {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

function validateQuestionTruth(repoRoot, lock) {
  const manifestPath = path.join(repoRoot, 'content/xizong/questions/manifest.json');
  if (!fs.existsSync(manifestPath)) {
    throw new SystemScopeAuthorityError(AUTHORITY_CODES.AUTHORITY_SOURCE_MISSING, 'Current Question Truth manifest is missing', {
      artifact: 'current_question_truth_manifest',
      path: 'content/xizong/questions/manifest.json'
    });
  }
  const manifest = readJson(manifestPath);
  const expected = lock.current_question_truth_identity;
  assert(Number(manifest?.stable_identity?.question_count || 0) === expected.question_count, 'Current Question Truth count diverges from authority lock', {
    expected: expected.question_count,
    actual: manifest?.stable_identity?.question_count
  });
  assert(manifest?.stable_identity?.inventory_sha256 === expected.question_id_inventory_sha256, 'Current Question Truth inventory diverges from authority lock', {
    expected: expected.question_id_inventory_sha256,
    actual: manifest?.stable_identity?.inventory_sha256
  });
  assert(manifest?.stable_identity?.immutable_question_ids === true, 'Current Question Truth no longer guarantees immutable question IDs');
  return {
    status: 'PASS',
    question_count: expected.question_count,
    inventory_sha256: expected.question_id_inventory_sha256
  };
}

function validateAcceptedSystems(repoRoot, lock) {
  const results = {};
  for (const [systemId, authority] of Object.entries(lock.systems || {})) {
    const system = { systemId, canonicalId: authority.canonical_id };
    if (authority.status === 'CURRENT') {
      const owner = loadAcceptedSystemScopeOwner(system, { repoRoot, lock });
      results[systemId] = {
        status: 'PASS',
        authority_status: authority.status,
        owner_path: owner.scopePath,
        question_count: owner.ids.length,
        inventory_sha256: owner.inventoryHash
      };
    } else {
      const owner = loadAcceptedSystemScopeOwner(system, { repoRoot, lock });
      assert(owner === null, `Non-current system unexpectedly resolved an accepted owner: ${systemId}`);
      results[systemId] = {
        status: 'KNOWN_BLOCKED_OR_UNACCEPTED',
        authority_status: authority.status,
        historical_expected_count: authority.historical_expected_count ?? null,
        accepted_owner_path: null
      };
    }
  }
  return results;
}

function validateRecoveryEvidence(repoRoot, lock) {
  const evidence = lock.recovery_evidence;
  const evidencePath = path.join(repoRoot, evidence.membership_evidence_path);
  const bytes = fs.existsSync(evidencePath) ? fs.readFileSync(evidencePath) : null;
  if (!bytes) {
    throw new SystemScopeAuthorityError(AUTHORITY_CODES.AUTHORITY_SOURCE_MISSING, 'Frozen resolver replay evidence is missing', {
      artifact: 'hlk_first_pass_pool_evidence',
      path: evidence.membership_evidence_path
    });
  }
  const actualEvidenceHash = sha256Buffer(bytes);
  if (actualEvidenceHash !== evidence.membership_evidence_sha256) {
    throw new SystemScopeAuthorityError(AUTHORITY_CODES.INPUT_HASH_MISMATCH, 'Frozen resolver replay evidence hash mismatch', {
      expected: evidence.membership_evidence_sha256,
      actual: actualEvidenceHash
    });
  }

  const recovered = JSON.parse(bytes.toString('utf8'));
  assert(recovered?.schema === 'kianos.xizong.system_scope_recovery_evidence.v1', 'Unexpected recovery evidence schema');
  assert(recovered?.status === 'EVIDENCE_ONLY_NEVER_RUNTIME_AUTHORITY', 'Recovery evidence lost evidence-only boundary');
  assert(recovered?.total === 978, 'Recovery evidence total changed', { expected: 978, actual: recovered?.total });

  const results = {};
  for (const systemId of ['circulation', 'respiratory', 'urinary']) {
    const pool = recovered?.systems?.[systemId];
    const authority = lock?.systems?.[systemId];
    assert(pool && authority, `Recovery evidence system missing: ${systemId}`);
    const evidenceIds = expandScopeIds(pool);
    assert(evidenceIds.length === pool.count, `Recovery evidence count mismatch: ${systemId}`);
    assert(new Set(evidenceIds).size === evidenceIds.length, `Recovery evidence contains duplicate IDs: ${systemId}`);
    const runtimeHash = inventoryHash(evidenceIds);
    assert(runtimeHash === pool.runtime_sorted_inventory_sha256, `Normalized recovery evidence self-hash changed: ${systemId}`);
    assert(runtimeHash === authority.recovery_evidence.runtime_inventory_sha256, `Recovery evidence runtime hash changed: ${systemId}`, {
      expected: authority.recovery_evidence.runtime_inventory_sha256,
      actual: runtimeHash
    });
    results[systemId] = {
      status: authority.recovery_evidence.status,
      count: pool.count,
      runtime_inventory_sha256: runtimeHash
    };
  }

  const a1 = lock.systems.circulation;
  assert(results.circulation.runtime_inventory_sha256 === a1.accepted_inventory_sha256, 'A1 resolver replay no longer matches accepted owner');
  results.circulation.relationship_to_current = 'EXACT_MATCH';

  const a2Owner = loadAcceptedSystemScopeOwner({ systemId: 'respiratory', canonicalId: 'A2' }, { repoRoot, lock });
  const a2EvidenceIds = expandScopeIds(recovered.systems.respiratory);
  const acceptedMinusEvidence = setDiff(a2Owner.ids, a2EvidenceIds);
  const evidenceMinusAccepted = setDiff(a2EvidenceIds, a2Owner.ids);
  const expectedAcceptedMinus = [...lock.systems.respiratory.recovery_evidence.accepted_minus_evidence].sort();
  const expectedEvidenceMinus = [...lock.systems.respiratory.recovery_evidence.evidence_minus_accepted].sort();
  assert(results.respiratory.runtime_inventory_sha256 !== lock.systems.respiratory.accepted_inventory_sha256, 'A2 evidence unexpectedly equals Current owner; lock divergence sentinel must be reviewed');
  assert(sameList(acceptedMinusEvidence, expectedAcceptedMinus), 'A2 accepted-minus-evidence set changed', { expected: expectedAcceptedMinus, actual: acceptedMinusEvidence });
  assert(sameList(evidenceMinusAccepted, expectedEvidenceMinus), 'A2 evidence-minus-accepted set changed', { expected: expectedEvidenceMinus, actual: evidenceMinusAccepted });
  results.respiratory.relationship_to_current = 'EXPECTED_7_FOR_7_DIVERGENCE_CONFIRMED';

  assert(lock.systems.urinary.status !== 'CURRENT', 'A3 must remain fail-closed until exact historical HLK authority is reproduced');
  assert(lock.systems.urinary.accepted_owner_path == null, 'A3 must not carry an accepted owner while blocked');
  results.urinary.relationship_to_current = 'EVIDENCE_ONLY_NO_ACCEPTED_SCOPE';

  return {
    status: 'PASS_EVIDENCE_ONLY',
    file_sha256: actualEvidenceHash,
    systems: results
  };
}

function validateRebuildGate(lock) {
  const historical = lock.historical_authority_bundle;
  const unresolved = [];
  if (historical?.resolver?.source_bytes_status !== 'RECOVERED_EXACT') unresolved.push('resolver_bytes');
  if (historical?.hlk_output?.exact_output_status !== 'RECOVERED_EXACT') unresolved.push('exact_hlk_output');
  if (historical?.generator?.status !== 'LOCKED' || historical?.generator?.deterministic_rebuild_enabled !== true) unresolved.push('exact_hlk_generator');
  return {
    status: unresolved.length ? 'BLOCKED_FAIL_CLOSED' : 'READY',
    unresolved,
    expected_output: historical.hlk_output
  };
}

function runSelfTest() {
  const unavailable = classifyCiExecution({
    status: 'completed', conclusion: 'failure', runner_id: 0, runner_name: '', steps: []
  });
  assert(unavailable.code === AUTHORITY_CODES.CI_EXECUTION_UNAVAILABLE, 'runner_id=0 fixture was not classified as CI execution unavailable');
  assert(unavailable.authority_implication === 'NONE', 'CI execution failure must have no authority implication');

  const executed = classifyCiExecution({
    status: 'completed', conclusion: 'success', runner_id: 123, runner_name: 'runner', steps: [{ conclusion: 'success' }]
  });
  assert(executed.code === null, 'Normal execution fixture was misclassified');

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'kianos-scope-authority-'));
  const input = path.join(tmp, 'input.json');
  const resolver = path.join(tmp, 'resolver.json');
  const output = path.join(tmp, 'output.jsonl');
  fs.writeFileSync(input, 'input\n');
  fs.writeFileSync(resolver, 'resolver\n');
  fs.writeFileSync(output, 'a\nb\n');

  const expectCode = (fn, code) => {
    try {
      fn();
    } catch (error) {
      if (error?.code === code) return;
      throw error;
    }
    throw new Error(`Expected ${code}`);
  };

  expectCode(() => verifyFingerprint(path.join(tmp, 'missing'), { sha256: 'x' }, { role: 'input' }), AUTHORITY_CODES.AUTHORITY_SOURCE_MISSING);
  expectCode(() => verifyFingerprint(input, { sha256: 'deadbeef' }, { role: 'input' }), AUTHORITY_CODES.INPUT_HASH_MISMATCH);
  expectCode(() => verifyFingerprint(resolver, { sha256: 'deadbeef' }, { role: 'resolver' }), AUTHORITY_CODES.RESOLVER_HASH_MISMATCH);
  expectCode(() => verifyFingerprint(output, { sha256: 'deadbeef', rows: 2, bytes: 4 }, { role: 'output' }), AUTHORITY_CODES.OUTPUT_HASH_MISMATCH);
  const outputHash = sha256Buffer(fs.readFileSync(output));
  expectCode(() => verifyFingerprint(output, { sha256: outputHash, rows: 3, bytes: 4 }, { role: 'output' }), AUTHORITY_CODES.OUTPUT_ROW_COUNT_MISMATCH);

  return {
    status: 'PASS',
    required_codes_exercised: [
      AUTHORITY_CODES.AUTHORITY_SOURCE_MISSING,
      AUTHORITY_CODES.INPUT_HASH_MISMATCH,
      AUTHORITY_CODES.RESOLVER_HASH_MISMATCH,
      AUTHORITY_CODES.OUTPUT_HASH_MISMATCH,
      AUTHORITY_CODES.OUTPUT_ROW_COUNT_MISMATCH,
      AUTHORITY_CODES.CI_EXECUTION_UNAVAILABLE
    ]
  };
}

function parseArgs(argv) {
  const out = { selfTest: false, ciJobJson: null };
  for (let i = 2; i < argv.length; i += 1) {
    if (argv[i] === '--self-test') out.selfTest = true;
    else if (argv[i] === '--ci-job-json') out.ciJobJson = argv[++i];
    else throw new Error(`Unknown argument: ${argv[i]}`);
  }
  return out;
}

function main() {
  const args = parseArgs(process.argv);
  const repoRoot = defaultRepoRoot();
  const lock = loadSystemScopeAuthorityLock({ repoRoot });
  const result = {
    schema: 'kianos.xizong.system_scope_authority_validation.v1',
    authority: {
      lock_status: lock.status,
      question_truth: validateQuestionTruth(repoRoot, lock),
      systems: validateAcceptedSystems(repoRoot, lock),
      recovery_evidence: validateRecoveryEvidence(repoRoot, lock),
      rebuild_gate: validateRebuildGate(lock)
    },
    execution: {
      status: 'NOT_EVALUATED',
      code: null,
      authority_implication: 'NONE'
    },
    self_test: args.selfTest ? runSelfTest() : null
  };

  if (args.ciJobJson) {
    result.execution = classifyCiExecution(readJson(path.resolve(args.ciJobJson)));
  }

  console.log(JSON.stringify(result, null, 2));
}

try {
  main();
} catch (error) {
  const payload = {
    schema: 'kianos.xizong.system_scope_authority_validation_error.v1',
    code: error?.code || 'UNEXPECTED_VALIDATION_ERROR',
    message: error?.message || String(error),
    details: error?.details || {}
  };
  console.error(JSON.stringify(payload, null, 2));
  process.exitCode = 1;
}
