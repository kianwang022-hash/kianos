import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(process.cwd(), '..');

const OVERRIDES = 'content/politics/source/nodes/fidelity-overrides.v1.json';

function absolute(relativePath) {
  return path.join(repoRoot, relativePath);
}

function normalize(value) {
  return String(value || '').trim();
}

export function loadPoliticsSourceFidelityOverrides() {
  if (!fs.existsSync(absolute(OVERRIDES))) {
    throw new Error('POLITICS_SOURCE_FIDELITY_OVERRIDES_MISSING');
  }
  const value = JSON.parse(fs.readFileSync(absolute(OVERRIDES), 'utf8'));
  if (value?.schema !== 'kianos.politics.source-node-fidelity-overrides.v1'
    || value?.status !== 'CURRENT'
    || value?.authority !== 'SOURCE_FIDELITY_CLASSIFICATION_ONLY'
    || !value?.nodes
    || typeof value.nodes !== 'object'
    || Array.isArray(value.nodes)) {
    throw new Error('POLITICS_SOURCE_FIDELITY_OVERRIDES_INVALID');
  }
  return value;
}

export function classifyPoliticsSourceNodeFidelity(id, row, overrides = null) {
  const nodeId = normalize(id);
  const rawStatus = normalize(row?.verification_status);
  const config = overrides || loadPoliticsSourceFidelityOverrides();
  const override = config.nodes?.[nodeId] || null;

  if (override) {
    if (normalize(override.raw_verification_status)
      && normalize(override.raw_verification_status) !== rawStatus) {
      return {
        nodeId,
        admitted: false,
        status: 'BLOCKED_FIDELITY',
        rawStatus,
        effectiveStatus: rawStatus || 'MISSING',
        reason: 'FIDELITY_OVERRIDE_RAW_STATUS_MISMATCH'
      };
    }
    const effectiveStatus = normalize(override.effective_verification_status) || rawStatus || 'MISSING';
    const blocked = normalize(override.learner_admission).toUpperCase() !== 'ADMIT';
    return {
      nodeId,
      admitted: !blocked,
      status: blocked ? 'BLOCKED_FIDELITY' : 'ADMITTED',
      rawStatus,
      effectiveStatus,
      reason: normalize(override.reason) || (blocked ? 'SOURCE_FIDELITY_OVERRIDE_BLOCK' : 'SOURCE_FIDELITY_OVERRIDE_ADMIT')
    };
  }

  if (!rawStatus) {
    return {
      nodeId,
      admitted: false,
      status: 'BLOCKED_FIDELITY',
      rawStatus: '',
      effectiveStatus: 'MISSING',
      reason: 'VERIFICATION_STATUS_MISSING'
    };
  }

  if (/needs[_-]?review|blocked|unverified|unknown|pending|invalid/i.test(rawStatus)) {
    return {
      nodeId,
      admitted: false,
      status: 'BLOCKED_FIDELITY',
      rawStatus,
      effectiveStatus: rawStatus,
      reason: 'RAW_VERIFICATION_STATUS_NOT_LEARNER_ADMISSIBLE'
    };
  }

  if (!/^source_bound_/i.test(rawStatus)) {
    return {
      nodeId,
      admitted: false,
      status: 'BLOCKED_FIDELITY',
      rawStatus,
      effectiveStatus: rawStatus,
      reason: 'VERIFICATION_STATUS_NOT_SOURCE_BOUND'
    };
  }

  return {
    nodeId,
    admitted: true,
    status: 'ADMITTED',
    rawStatus,
    effectiveStatus: rawStatus,
    reason: 'SOURCE_BOUND_FIDELITY_STATUS_ADMITTED'
  };
}

export function splitPoliticsSourceRowsByFidelity(entries, overrides = null) {
  const config = overrides || loadPoliticsSourceFidelityOverrides();
  const admitted = [];
  const blocked = [];

  for (const entry of entries || []) {
    const fidelity = classifyPoliticsSourceNodeFidelity(entry?.id, entry?.row, config);
    const enriched = { ...entry, fidelity };
    if (fidelity.admitted) admitted.push(enriched);
    else blocked.push(enriched);
  }

  return { admitted, blocked };
}

export const politicsSourceFidelityPaths = Object.freeze({ overrides: OVERRIDES });
