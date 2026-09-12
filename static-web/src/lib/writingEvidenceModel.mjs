export const WRITING_EVIDENCE_VERSION = 1;
export const WRITING_EVIDENCE_LEDGER_SCHEMA = 'kianos.english.writing.evidence-ledger.v1';
export const WRITING_TRANSFER_PACKET_SCHEMA = 'kianos.english.writing.transfer-check-packet.v1';
export const WRITING_TRANSFER_RETURN_SCHEMA = 'kianos.english.writing.transfer-return.v1';

export const WRITING_TRANSFER_STATUS = Object.freeze({
  PENDING: 'PENDING',
  CLOSED: 'CLOSED'
});

export const WRITING_TRANSFER_VERDICTS = Object.freeze({
  IRRELEVANT: 'IRRELEVANT',
  SUPPORT: 'SUPPORT',
  KEEP_PENDING: 'KEEP_PENDING',
  CLOSE: 'CLOSE',
  REOPEN: 'REOPEN'
});

const WRITING_TERMINAL_STATES = new Set([
  'PASS_ACCEPTABLE',
  'REPAIR_COMPLETE',
  'TRANSFER_PENDING'
]);

function clean(value) {
  return String(value ?? '').trim();
}

function nonEmpty(value) {
  return clean(value).length > 0;
}

function clone(value) {
  if (typeof structuredClone === 'function') return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

function nowIso(now) {
  if (typeof now === 'string' && now) return now;
  if (now instanceof Date) return now.toISOString();
  return new Date().toISOString();
}

function sourceKindOf(task) {
  return clean(task?.sourceKind || task?.source_kind);
}

function learnerTaskOf(task) {
  return task?.learnerTask || task?.task || {};
}

function parseJsonInput(input) {
  if (input && typeof input === 'object') return input;
  if (!nonEmpty(input)) throw new Error('WRITING_TRANSFER_RETURN_EMPTY');
  const raw = String(input);
  try {
    return JSON.parse(raw);
  } catch {
    const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenced) {
      try { return JSON.parse(fenced[1]); } catch {}
    }
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start >= 0 && end > start) {
      try { return JSON.parse(raw.slice(start, end + 1)); } catch {}
    }
    throw new Error('WRITING_TRANSFER_RETURN_INVALID_JSON');
  }
}

function evidenceIdOf(record) {
  if (!nonEmpty(record?.taskId) || !nonEmpty(record?.firstSubmittedAt)) return '';
  return `${clean(record.taskId)}::${clean(record.firstSubmittedAt)}`;
}

function assertFreshRecord(task, record) {
  if (!task || !nonEmpty(task.id)) throw new Error('WRITING_TRANSFER_TASK_REQUIRED');
  if (!record || clean(record.taskId) !== clean(task.id)) throw new Error('WRITING_TRANSFER_RECORD_TASK_MISMATCH');
  if (!WRITING_TERMINAL_STATES.has(record.state)) throw new Error(`WRITING_TRANSFER_FRESH_TASK_NOT_COMPLETE:${record.state || 'missing'}`);
  if (!nonEmpty(record.firstDraft) || !nonEmpty(record.firstSubmittedAt)) throw new Error('WRITING_TRANSFER_FRESH_FIRST_EVIDENCE_REQUIRED');
}

function normalizeEvent(event) {
  if (!event || typeof event !== 'object') return null;
  const evidenceId = clean(event.evidenceId);
  const freshTaskId = clean(event.freshTaskId);
  const verdict = clean(event.verdict);
  if (!evidenceId || !freshTaskId || !Object.values(WRITING_TRANSFER_VERDICTS).includes(verdict)) return null;
  return {
    evidenceId,
    freshTaskId,
    verdict,
    reason: clean(event.reason),
    evidenceAnchor: clean(event.evidenceAnchor),
    at: clean(event.at)
  };
}

function normalizeTarget(target) {
  if (!target || typeof target !== 'object') return null;
  const targetId = clean(target.targetId);
  const label = clean(target.label);
  const underlyingDemand = clean(target.underlyingDemand);
  const originTaskId = clean(target.originTaskId);
  if (!targetId || !label || !underlyingDemand || !originTaskId) return null;
  const status = Object.values(WRITING_TRANSFER_STATUS).includes(target.status)
    ? target.status
    : WRITING_TRANSFER_STATUS.PENDING;
  const events = Array.isArray(target.events)
    ? target.events.map(normalizeEvent).filter(Boolean)
    : [];
  return {
    targetId,
    label,
    underlyingDemand,
    status,
    originTaskId,
    originTaskKind: clean(target.originTaskKind),
    originSourceKind: clean(target.originSourceKind),
    admittedAt: clean(target.admittedAt),
    originEvidence: target.originEvidence && typeof target.originEvidence === 'object'
      ? clone(target.originEvidence)
      : null,
    events,
    closedAt: clean(target.closedAt),
    reopenedAt: clean(target.reopenedAt),
    updatedAt: clean(target.updatedAt)
  };
}

export function createWritingEvidenceLedger(saved = null) {
  const targets = Array.isArray(saved?.targets)
    ? saved.targets.map(normalizeTarget).filter(Boolean)
    : [];
  return {
    version: WRITING_EVIDENCE_VERSION,
    schema: WRITING_EVIDENCE_LEDGER_SCHEMA,
    targets,
    updatedAt: clean(saved?.updatedAt)
  };
}

export function summarizeWritingEvidenceLedger(ledger) {
  const normalized = createWritingEvidenceLedger(ledger);
  return normalized.targets.reduce((summary, target) => {
    summary.total += 1;
    if (target.status === WRITING_TRANSFER_STATUS.CLOSED) summary.closed += 1;
    else summary.pending += 1;
    return summary;
  }, { total: 0, pending: 0, closed: 0 });
}

export function admitWritingTransferCandidate(ledger, task, record, now) {
  const next = createWritingEvidenceLedger(ledger);
  if (!record || record.state !== 'TRANSFER_PENDING' || !record.transferCandidate) return next;
  if (!task || clean(task.id) !== clean(record.taskId)) throw new Error('WRITING_TRANSFER_ADMISSION_TASK_MISMATCH');
  const candidate = record.transferCandidate;
  const targetId = clean(candidate.targetId);
  const label = clean(candidate.label);
  const underlyingDemand = clean(candidate.underlyingDemand);
  if (!targetId || !label || !underlyingDemand) throw new Error('WRITING_TRANSFER_ADMISSION_INCOMPLETE');

  const existing = next.targets.find((target) => target.targetId === targetId);
  if (existing) {
    if (existing.underlyingDemand !== underlyingDemand) throw new Error(`WRITING_TRANSFER_TARGET_SEMANTIC_COLLISION:${targetId}`);
    return next;
  }

  const at = clean(record.completedAt) || nowIso(now);
  next.targets.push({
    targetId,
    label,
    underlyingDemand,
    status: WRITING_TRANSFER_STATUS.PENDING,
    originTaskId: clean(task.id),
    originTaskKind: clean(task.kind),
    originSourceKind: sourceKindOf(task),
    admittedAt: at,
    originEvidence: {
      firstMeaningfulPlanning: {
        mode: clean(record.planMode) || 'planned',
        text: record.planMode === 'direct' ? null : clean(record.firstPlan)
      },
      firstDraft: clean(record.firstDraft),
      firstSubmittedAt: clean(record.firstSubmittedAt),
      repairHistory: Array.isArray(record.repairHistory) ? clone(record.repairHistory) : [],
      finalDiagnosis: record.reviewReturn ? clone(record.reviewReturn) : null,
      finalRegeneration: clean(record.regeneration),
      finalRepairReturn: record.repairReturn ? clone(record.repairReturn) : null
    },
    events: [],
    closedAt: '',
    reopenedAt: '',
    updatedAt: at
  });
  next.updatedAt = at;
  return next;
}

function hasEvidenceEvent(target, evidenceId) {
  return Array.isArray(target?.events) && target.events.some((event) => event.evidenceId === evidenceId);
}

function isLaterThanAdmission(record, target) {
  if (!nonEmpty(record?.firstSubmittedAt) || !nonEmpty(target?.admittedAt)) return false;
  const first = Date.parse(record.firstSubmittedAt);
  const admitted = Date.parse(target.admittedAt);
  if (Number.isNaN(first) || Number.isNaN(admitted)) return clean(record.firstSubmittedAt) > clean(target.admittedAt);
  return first > admitted;
}

export function listEligibleWritingTransferTargets(ledger, task, record) {
  const normalized = createWritingEvidenceLedger(ledger);
  try { assertFreshRecord(task, record); }
  catch { return []; }
  const evidenceId = evidenceIdOf(record);
  if (!evidenceId) return [];
  return normalized.targets.filter((target) => (
    target.originTaskId !== clean(task.id)
    && isLaterThanAdmission(record, target)
    && !hasEvidenceEvent(target, evidenceId)
  ));
}

export function buildWritingTransferCheckPacket(task, record, target) {
  assertFreshRecord(task, record);
  const normalizedTarget = normalizeTarget(target);
  if (!normalizedTarget) throw new Error('WRITING_TRANSFER_TARGET_INVALID');
  if (normalizedTarget.originTaskId === clean(task.id)) throw new Error('WRITING_TRANSFER_SAME_PROMPT_FORBIDDEN');
  if (!isLaterThanAdmission(record, normalizedTarget)) throw new Error('WRITING_TRANSFER_NOT_LATER_EVIDENCE');
  const evidenceId = evidenceIdOf(record);
  if (hasEvidenceEvent(normalizedTarget, evidenceId)) throw new Error('WRITING_TRANSFER_EVIDENCE_ALREADY_APPLIED');

  const allowedVerdicts = normalizedTarget.status === WRITING_TRANSFER_STATUS.CLOSED
    ? [WRITING_TRANSFER_VERDICTS.IRRELEVANT, WRITING_TRANSFER_VERDICTS.SUPPORT, WRITING_TRANSFER_VERDICTS.REOPEN]
    : [WRITING_TRANSFER_VERDICTS.IRRELEVANT, WRITING_TRANSFER_VERDICTS.SUPPORT, WRITING_TRANSFER_VERDICTS.KEEP_PENDING, WRITING_TRANSFER_VERDICTS.CLOSE];

  return {
    schema: WRITING_TRANSFER_PACKET_SCHEMA,
    target: {
      targetId: normalizedTarget.targetId,
      label: normalizedTarget.label,
      underlyingDemand: normalizedTarget.underlyingDemand,
      status: normalizedTarget.status,
      originTaskId: normalizedTarget.originTaskId,
      admittedAt: normalizedTarget.admittedAt,
      originEvidence: clone(normalizedTarget.originEvidence)
    },
    freshEvidence: {
      evidenceId,
      taskId: clean(task.id),
      taskKind: clean(task.kind),
      sourceKind: sourceKindOf(task),
      task: learnerTaskOf(task),
      firstMeaningfulPlanning: {
        mode: clean(record.planMode) || 'planned',
        text: record.planMode === 'direct' ? null : clean(record.firstPlan)
      },
      firstDraft: clean(record.firstDraft),
      firstSubmittedAt: clean(record.firstSubmittedAt),
      wholeEssayOutcome: clean(record.state),
      wholeEssayReview: record.reviewReturn ? clone(record.reviewReturn) : null,
      completedAt: clean(record.completedAt)
    },
    transferContract: {
      judgeOnlyNamedTarget: true,
      freshFirstDraftOutranksSamePromptRepair: true,
      irrelevantFreshMaterialMustNotConfirmOrRefute: true,
      closureUsesSemanticEvidenceNotCounters: true,
      reopenRequiresContradictoryFreshEvidence: true,
      allowedVerdicts,
      verdictMeaning: {
        IRRELEVANT: 'The fresh task does not meaningfully exercise this target. Record no mastery/failure implication.',
        SUPPORT: 'Relevant fresh first-draft evidence supports the target direction but is not strong enough to change its current state.',
        KEEP_PENDING: 'For a pending target, relevant fresh evidence does not justify closure and may show the weakness remains. Keep it pending.',
        CLOSE: 'For a pending target, strong relevant fresh first-draft evidence demonstrates the reusable demand without relying on same-prompt repair. Close the target.',
        REOPEN: 'For a closed target, relevant contradictory fresh first-draft evidence shows the same reusable weakness has recurred. Reopen the same target.'
      },
      returnSchema: {
        schema: WRITING_TRANSFER_RETURN_SCHEMA,
        targetId: normalizedTarget.targetId,
        freshTaskId: clean(task.id),
        evidenceId,
        judgedAgainst: 'FRESH_FIRST_DRAFT',
        verdict: allowedVerdicts.join(' | '),
        reason: 'brief semantic rationale tied to the named target',
        evidenceAnchor: 'required except IRRELEVANT; concise location/feature from the fresh first draft'
      }
    }
  };
}

export function validateWritingTransferReturn(input, packet) {
  if (!packet || packet.schema !== WRITING_TRANSFER_PACKET_SCHEMA) throw new Error('WRITING_TRANSFER_PACKET_REQUIRED');
  const value = parseJsonInput(input);
  if (value?.schema !== WRITING_TRANSFER_RETURN_SCHEMA) throw new Error(`WRITING_TRANSFER_RETURN_SCHEMA:${value?.schema || 'missing'}`);
  if (clean(value?.targetId) !== clean(packet.target?.targetId)) throw new Error('WRITING_TRANSFER_RETURN_TARGET_MISMATCH');
  if (clean(value?.freshTaskId) !== clean(packet.freshEvidence?.taskId)) throw new Error('WRITING_TRANSFER_RETURN_FRESH_TASK_MISMATCH');
  if (clean(value?.evidenceId) !== clean(packet.freshEvidence?.evidenceId)) throw new Error('WRITING_TRANSFER_RETURN_EVIDENCE_MISMATCH');
  if (value?.judgedAgainst !== 'FRESH_FIRST_DRAFT') throw new Error(`WRITING_TRANSFER_RETURN_JUDGED_AGAINST:${value?.judgedAgainst || 'missing'}`);
  const verdict = clean(value?.verdict);
  if (!packet.transferContract.allowedVerdicts.includes(verdict)) throw new Error(`WRITING_TRANSFER_RETURN_VERDICT:${verdict || 'missing'}`);
  if (!nonEmpty(value?.reason)) throw new Error('WRITING_TRANSFER_RETURN_REASON_REQUIRED');
  if (verdict !== WRITING_TRANSFER_VERDICTS.IRRELEVANT && !nonEmpty(value?.evidenceAnchor)) {
    throw new Error('WRITING_TRANSFER_RETURN_EVIDENCE_ANCHOR_REQUIRED');
  }
  return {
    schema: WRITING_TRANSFER_RETURN_SCHEMA,
    targetId: clean(value.targetId),
    freshTaskId: clean(value.freshTaskId),
    evidenceId: clean(value.evidenceId),
    judgedAgainst: 'FRESH_FIRST_DRAFT',
    verdict,
    reason: clean(value.reason),
    evidenceAnchor: verdict === WRITING_TRANSFER_VERDICTS.IRRELEVANT ? '' : clean(value.evidenceAnchor)
  };
}

export function applyWritingTransferReturn(ledger, targetId, transferReturn, now) {
  const next = createWritingEvidenceLedger(ledger);
  const target = next.targets.find((item) => item.targetId === clean(targetId));
  if (!target) throw new Error(`WRITING_TRANSFER_TARGET_NOT_FOUND:${targetId}`);
  if (!transferReturn || clean(transferReturn.targetId) !== target.targetId) throw new Error('WRITING_TRANSFER_APPLY_TARGET_MISMATCH');
  if (!Object.values(WRITING_TRANSFER_VERDICTS).includes(transferReturn.verdict)) throw new Error('WRITING_TRANSFER_APPLY_VERDICT_INVALID');

  const existing = target.events.find((event) => event.evidenceId === transferReturn.evidenceId);
  if (existing) {
    const same = existing.verdict === transferReturn.verdict
      && existing.reason === clean(transferReturn.reason)
      && existing.evidenceAnchor === clean(transferReturn.evidenceAnchor);
    if (!same) throw new Error(`WRITING_TRANSFER_EVIDENCE_CONFLICT:${transferReturn.evidenceId}`);
    return next;
  }

  if (transferReturn.verdict === WRITING_TRANSFER_VERDICTS.CLOSE && target.status !== WRITING_TRANSFER_STATUS.PENDING) {
    throw new Error('WRITING_TRANSFER_CLOSE_REQUIRES_PENDING');
  }
  if (transferReturn.verdict === WRITING_TRANSFER_VERDICTS.KEEP_PENDING && target.status !== WRITING_TRANSFER_STATUS.PENDING) {
    throw new Error('WRITING_TRANSFER_KEEP_PENDING_REQUIRES_PENDING');
  }
  if (transferReturn.verdict === WRITING_TRANSFER_VERDICTS.REOPEN && target.status !== WRITING_TRANSFER_STATUS.CLOSED) {
    throw new Error('WRITING_TRANSFER_REOPEN_REQUIRES_CLOSED');
  }

  const at = nowIso(now);
  target.events.push({
    evidenceId: clean(transferReturn.evidenceId),
    freshTaskId: clean(transferReturn.freshTaskId),
    verdict: transferReturn.verdict,
    reason: clean(transferReturn.reason),
    evidenceAnchor: clean(transferReturn.evidenceAnchor),
    at
  });

  if (transferReturn.verdict === WRITING_TRANSFER_VERDICTS.CLOSE) {
    target.status = WRITING_TRANSFER_STATUS.CLOSED;
    target.closedAt = at;
  } else if (transferReturn.verdict === WRITING_TRANSFER_VERDICTS.REOPEN) {
    target.status = WRITING_TRANSFER_STATUS.PENDING;
    target.reopenedAt = at;
  }
  target.updatedAt = at;
  next.updatedAt = at;
  return next;
}
