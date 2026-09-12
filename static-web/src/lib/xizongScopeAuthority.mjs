import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export const SYSTEM_SCOPE_AUTHORITY_LOCK_PATH = 'content/xizong/system-scope-authority/system-scope-authority.lock.json';

export const AUTHORITY_CODES = Object.freeze({
  AUTHORITY_SOURCE_MISSING: 'AUTHORITY_SOURCE_MISSING',
  INPUT_HASH_MISMATCH: 'INPUT_HASH_MISMATCH',
  RESOLVER_HASH_MISMATCH: 'RESOLVER_HASH_MISMATCH',
  OUTPUT_HASH_MISMATCH: 'OUTPUT_HASH_MISMATCH',
  OUTPUT_ROW_COUNT_MISMATCH: 'OUTPUT_ROW_COUNT_MISMATCH',
  OUTPUT_BYTE_COUNT_MISMATCH: 'OUTPUT_BYTE_COUNT_MISMATCH',
  CI_EXECUTION_UNAVAILABLE: 'CI_EXECUTION_UNAVAILABLE',
  AUTHORITY_LOCK_INVALID: 'AUTHORITY_LOCK_INVALID',
  OWNER_SCOPE_MISMATCH: 'OWNER_SCOPE_MISMATCH'
});

export class SystemScopeAuthorityError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'SystemScopeAuthorityError';
    this.code = code;
    this.details = details;
  }
}

function fail(code, message, details = {}) {
  throw new SystemScopeAuthorityError(code, message, details);
}

export function defaultRepoRoot() {
  return process.env.KIANOS_REPO_ROOT
    ? path.resolve(process.env.KIANOS_REPO_ROOT)
    : path.resolve(process.cwd(), '..');
}

export function sha256Buffer(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

export function sha256Text(value) {
  return sha256Buffer(Buffer.from(String(value), 'utf8'));
}

export function inventoryHash(ids) {
  return sha256Text(`${[...ids].map(String).sort().join('\n')}\n`);
}

function pad3(value) {
  return String(value).padStart(3, '0');
}

export function expandNumberSpec(spec) {
  const values = [];
  for (const rawToken of String(spec || '').split(',')) {
    const token = rawToken.trim();
    if (!token) continue;
    const range = token.match(/^(\d+)-(\d+)$/);
    if (range) {
      const start = Number(range[1]);
      const end = Number(range[2]);
      if (!Number.isInteger(start) || !Number.isInteger(end) || start < 1 || end < start) {
        fail(AUTHORITY_CODES.OWNER_SCOPE_MISMATCH, `Invalid scope range: ${token}`, { token });
      }
      for (let value = start; value <= end; value += 1) values.push(value);
      continue;
    }
    if (!/^\d+$/.test(token)) {
      fail(AUTHORITY_CODES.OWNER_SCOPE_MISMATCH, `Invalid scope token: ${token}`, { token });
    }
    values.push(Number(token));
  }
  return values;
}

export function expandScopeIds(scope) {
  const specs = scope?.id_expansion?.question_number_spec_by_year;
  if (!specs || typeof specs !== 'object' || Array.isArray(specs)) {
    fail(AUTHORITY_CODES.OWNER_SCOPE_MISMATCH, 'Scope id expansion is missing', {});
  }
  const ids = [];
  for (const year of Object.keys(specs).sort()) {
    if (!/^\d{4}$/.test(year)) {
      fail(AUTHORITY_CODES.OWNER_SCOPE_MISMATCH, `Invalid scope year: ${year}`, { year });
    }
    for (const number of expandNumberSpec(specs[year])) {
      ids.push(`xizong-official-${year}-n${pad3(number)}`);
    }
  }
  return ids;
}

function readJsonAbsolute(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

export function loadSystemScopeAuthorityLock({ repoRoot = defaultRepoRoot() } = {}) {
  const absolutePath = path.join(repoRoot, SYSTEM_SCOPE_AUTHORITY_LOCK_PATH);
  if (!fs.existsSync(absolutePath)) {
    fail(AUTHORITY_CODES.AUTHORITY_SOURCE_MISSING, 'System-scope authority lock is missing', {
      artifact: 'system_scope_authority_lock',
      path: SYSTEM_SCOPE_AUTHORITY_LOCK_PATH
    });
  }
  const lock = readJsonAbsolute(absolutePath);
  if (lock?.schema !== 'kianos.xizong.system_scope_authority_lock.v1' || lock?.fail_closed !== true) {
    fail(AUTHORITY_CODES.AUTHORITY_LOCK_INVALID, 'System-scope authority lock schema/fail-closed contract is invalid', {
      path: SYSTEM_SCOPE_AUTHORITY_LOCK_PATH,
      schema: lock?.schema,
      fail_closed: lock?.fail_closed
    });
  }
  return lock;
}

export function getSystemScopeAuthority(systemId, { lock, repoRoot = defaultRepoRoot() } = {}) {
  const resolvedLock = lock || loadSystemScopeAuthorityLock({ repoRoot });
  return resolvedLock?.systems?.[String(systemId)] || null;
}

export function loadAcceptedSystemScopeOwner(system, { lock, repoRoot = defaultRepoRoot() } = {}) {
  const systemId = String(system?.systemId || system?.system_id || '');
  const canonicalId = String(system?.canonicalId || system?.canonical_id || '');
  const resolvedLock = lock || loadSystemScopeAuthorityLock({ repoRoot });
  const authority = resolvedLock?.systems?.[systemId];
  if (!authority) return null;

  if (authority.status !== 'CURRENT') {
    if (authority.accepted_owner_path != null || authority.accepted_inventory_sha256 != null || authority.accepted_question_count != null) {
      fail(AUTHORITY_CODES.AUTHORITY_LOCK_INVALID, `Blocked/unaccepted system carries accepted scope fields: ${systemId}`, {
        system_id: systemId,
        status: authority.status
      });
    }
    return null;
  }

  if (!authority.accepted_owner_path || !authority.accepted_inventory_sha256 || !Number.isInteger(authority.accepted_question_count)) {
    fail(AUTHORITY_CODES.AUTHORITY_LOCK_INVALID, `Current system authority is incomplete: ${systemId}`, { system_id: systemId });
  }
  if (authority.canonical_id !== canonicalId) {
    fail(AUTHORITY_CODES.OWNER_SCOPE_MISMATCH, `Authority canonical id mismatch: ${systemId}`, {
      expected: authority.canonical_id,
      actual: canonicalId
    });
  }

  const ownerPath = authority.accepted_owner_path;
  const ownerAbsolute = path.join(repoRoot, ownerPath);
  if (!fs.existsSync(ownerAbsolute)) {
    fail(AUTHORITY_CODES.AUTHORITY_SOURCE_MISSING, `Accepted scope owner is missing: ${systemId}`, {
      artifact: 'accepted_scope_owner',
      system_id: systemId,
      path: ownerPath
    });
  }

  const scopeText = fs.readFileSync(ownerAbsolute, 'utf8');
  const scope = JSON.parse(scopeText);
  if (scope?.status !== 'CURRENT' || !String(scope?.authority || '').startsWith('CHAT_APPROVED')) {
    fail(AUTHORITY_CODES.OWNER_SCOPE_MISMATCH, `Accepted scope owner status/authority invalid: ${systemId}`, {
      system_id: systemId,
      owner_status: scope?.status,
      owner_authority: scope?.authority
    });
  }
  if (scope?.system?.system_id !== systemId || scope?.system?.canonical_id !== canonicalId) {
    fail(AUTHORITY_CODES.OWNER_SCOPE_MISMATCH, `Accepted scope owner identity mismatch: ${systemId}`, {
      system_id: systemId,
      canonical_id: canonicalId,
      owner_system: scope?.system
    });
  }

  const ids = expandScopeIds(scope);
  const unique = new Set(ids);
  if (ids.length !== unique.size || ids.length !== Number(scope.question_count)) {
    fail(AUTHORITY_CODES.OWNER_SCOPE_MISMATCH, `Accepted scope owner count mismatch: ${systemId}`, {
      system_id: systemId,
      expanded_count: ids.length,
      unique_count: unique.size,
      owner_count: scope.question_count
    });
  }
  const actualInventoryHash = inventoryHash(ids);
  if (actualInventoryHash !== scope.question_id_inventory_sha256) {
    fail(AUTHORITY_CODES.OWNER_SCOPE_MISMATCH, `Accepted scope owner self-hash mismatch: ${systemId}`, {
      system_id: systemId,
      expected: scope.question_id_inventory_sha256,
      actual: actualInventoryHash
    });
  }
  if (ids.length !== authority.accepted_question_count || actualInventoryHash !== authority.accepted_inventory_sha256) {
    fail(AUTHORITY_CODES.OWNER_SCOPE_MISMATCH, `Accepted scope owner diverges from shared lock: ${systemId}`, {
      system_id: systemId,
      lock_count: authority.accepted_question_count,
      actual_count: ids.length,
      lock_inventory_sha256: authority.accepted_inventory_sha256,
      actual_inventory_sha256: actualInventoryHash
    });
  }

  return {
    authority,
    scope,
    scopeText,
    scopePath: ownerPath,
    ids,
    inventoryHash: actualInventoryHash
  };
}

function fingerprint(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const data = fs.readFileSync(filePath);
  return {
    sha256: sha256Buffer(data),
    bytes: data.length,
    rows: data.toString('utf8').split(/\r?\n/).filter((_, index, arr) => index < arr.length - 1 || arr[index] !== '').length
  };
}

export function verifyFingerprint(filePath, expected, { role = 'input', artifact = path.basename(filePath) } = {}) {
  const actual = fingerprint(filePath);
  if (!actual) {
    fail(AUTHORITY_CODES.AUTHORITY_SOURCE_MISSING, `Required authority source is missing: ${artifact}`, {
      artifact,
      path: filePath,
      role
    });
  }

  const hashCode = role === 'resolver'
    ? AUTHORITY_CODES.RESOLVER_HASH_MISMATCH
    : role === 'output'
      ? AUTHORITY_CODES.OUTPUT_HASH_MISMATCH
      : AUTHORITY_CODES.INPUT_HASH_MISMATCH;

  if (role === 'output' && Number.isInteger(expected?.rows) && actual.rows !== expected.rows) {
    fail(AUTHORITY_CODES.OUTPUT_ROW_COUNT_MISMATCH, `Output row count mismatch: ${artifact}`, {
      artifact,
      expected: expected.rows,
      actual: actual.rows
    });
  }
  if (role === 'output' && Number.isInteger(expected?.bytes) && actual.bytes !== expected.bytes) {
    fail(AUTHORITY_CODES.OUTPUT_BYTE_COUNT_MISMATCH, `Output byte count mismatch: ${artifact}`, {
      artifact,
      expected: expected.bytes,
      actual: actual.bytes
    });
  }
  if (expected?.sha256 && actual.sha256 !== expected.sha256) {
    fail(hashCode, `${role} hash mismatch: ${artifact}`, { artifact, expected: expected.sha256, actual: actual.sha256 });
  }
  if (role !== 'output' && Number.isInteger(expected?.bytes) && actual.bytes !== expected.bytes) {
    fail(AUTHORITY_CODES.INPUT_HASH_MISMATCH, `${role} byte count mismatch: ${artifact}`, {
      artifact,
      expected: expected.bytes,
      actual: actual.bytes
    });
  }
  return actual;
}

export function classifyCiExecution(job) {
  const steps = Array.isArray(job?.steps) ? job.steps : [];
  const completedFailure = job?.status === 'completed' && job?.conclusion === 'failure';
  const runnerMissing = Number(job?.runner_id || 0) === 0 && !String(job?.runner_name || '');
  if (completedFailure && runnerMissing && steps.length === 0) {
    return {
      status: 'UNAVAILABLE',
      code: AUTHORITY_CODES.CI_EXECUTION_UNAVAILABLE,
      authority_implication: 'NONE',
      details: {
        runner_id: Number(job?.runner_id || 0),
        runner_name: String(job?.runner_name || ''),
        step_count: steps.length,
        conclusion: job?.conclusion
      }
    };
  }
  return {
    status: job?.status === 'completed' ? 'EXECUTED_OR_COMPLETED' : 'PENDING_OR_UNKNOWN',
    code: null,
    authority_implication: 'NONE',
    details: {
      runner_id: Number(job?.runner_id || 0),
      runner_name: String(job?.runner_name || ''),
      step_count: steps.length,
      conclusion: job?.conclusion || null
    }
  };
}
