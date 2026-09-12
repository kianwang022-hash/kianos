function asList(value) {
  return Array.isArray(value) ? value : (value == null ? [] : [value]);
}

function representedUnitIds(unit) {
  return new Set([
    String(unit?.unitId || ''),
    ...asList(unit?.representedNaturalUnitIds).map(String)
  ].filter(Boolean));
}

function mappedNodeIds(edge) {
  return asList(edge?.current_unit_hits)
    .map((hit) => String(hit?.node_id || ''))
    .filter(Boolean);
}

function questionIdSet(unit) {
  return new Set(asList(unit?.questions).map((question) => String(question?.id || '')).filter(Boolean));
}

export function buildPoliticsUnitReturnConfigs(chapter) {
  const repairProjection = chapter?.repairProjection || {};
  const evidenceBlocks = Object.values(repairProjection)
    .filter((value) => value && typeof value === 'object')
    .filter((value) => value?.unit_return_gate?.coverage_state === 'QUESTION_NODE_MAPPING_READY')
    .filter((value) => value?.unit_return_gate?.learner_state === 'PENDING_ATTEMPT_EVIDENCE');

  const configs = [];
  for (const evidence of evidenceBlocks) {
    const naturalUnitId = String(evidence?.natural_unit_id || '');
    if (!naturalUnitId) continue;
    const unit = asList(chapter?.units).find((candidate) => representedUnitIds(candidate).has(naturalUnitId));
    if (!unit) continue;

    const renderedQuestionIds = questionIdSet(unit);
    const edgeByQuestion = new Map(
      asList(evidence?.question_edges)
        .map((edge) => [String(edge?.question_id || ''), edge])
        .filter(([questionId]) => questionId)
    );
    const expectedQuestionIds = asList(unit?.questions)
      .map((question) => String(question?.id || ''))
      .filter((questionId) => renderedQuestionIds.has(questionId) && edgeByQuestion.has(questionId));
    if (!expectedQuestionIds.length) continue;

    const expectedSet = new Set(expectedQuestionIds);
    const nodes = asList(evidence?.node_projection).map((node) => {
      const nodeId = String(node?.node_id || '');
      const currentQuestionIds = expectedQuestionIds.filter((questionId) => {
        const edge = edgeByQuestion.get(questionId);
        return mappedNodeIds(edge).includes(nodeId);
      });
      const ownerQuestionIds = asList(node?.question_ids).map(String).filter(Boolean);
      return {
        node_id: nodeId,
        label: String(node?.label || nodeId),
        question_ids: currentQuestionIds,
        current_question_count: currentQuestionIds.length,
        owner_question_count: ownerQuestionIds.length,
        deferred_question_count: Math.max(0, ownerQuestionIds.filter((id) => !expectedSet.has(id)).length)
      };
    }).filter((node) => node.node_id && node.current_question_count > 0);

    const edgeCount = expectedQuestionIds.reduce((sum, questionId) => {
      return sum + mappedNodeIds(edgeByQuestion.get(questionId)).length;
    }, 0);

    configs.push({
      schema: 'kianos.politics.unit_return_projection.v1',
      unit_key: `${String(chapter?.subject || '')}/${String(chapter?.code || chapter?.chapter || '')}/${naturalUnitId}`,
      subject: String(chapter?.subject || ''),
      chapter: String(chapter?.code || chapter?.chapter || ''),
      natural_unit_id: naturalUnitId,
      runtime_unit_id: String(unit?.unitId || naturalUnitId),
      title: String(unit?.title || naturalUnitId),
      source_anchor: `source-${String(unit?.unitId || naturalUnitId)}`,
      expected_question_ids: expectedQuestionIds,
      expected_question_count: expectedQuestionIds.length,
      current_node_edge_count: edgeCount,
      nodes,
      learner_state: 'PENDING_ATTEMPT_EVIDENCE',
      mastery_claim: 'NONE',
      interpretation: 'STABLE means clean first-attempt evidence in this pass only; it is not long-term mastery.'
    });
  }
  return configs;
}

function normalizedSnapshot(snapshot) {
  const units = snapshot?.units && typeof snapshot.units === 'object' ? snapshot.units : {};
  return {
    schema: 'kianos.politics.attempt_snapshot.v1',
    units
  };
}

function normalizedOutcome(value) {
  const outcome = String(value || '').toUpperCase();
  return ['STABLE', 'UNCERTAIN', 'WRONG'].includes(outcome) ? outcome : '';
}

export function recordPoliticsFirstAttempt(snapshot, config, attempt) {
  const base = normalizedSnapshot(snapshot);
  const unitKey = String(config?.unit_key || '');
  const questionId = String(attempt?.question_id || '');
  const expected = new Set(asList(config?.expected_question_ids).map(String));
  const outcome = normalizedOutcome(attempt?.outcome);
  if (!unitKey || !questionId || !expected.has(questionId) || !outcome) {
    return { store: base, recorded: false, reason: 'INVALID_OR_OUT_OF_SCOPE' };
  }

  const previousUnit = base.units?.[unitKey] && typeof base.units[unitKey] === 'object'
    ? base.units[unitKey]
    : {};
  const previousAttempts = previousUnit?.attempts && typeof previousUnit.attempts === 'object'
    ? previousUnit.attempts
    : {};
  if (previousAttempts[questionId]) {
    return { store: base, recorded: false, reason: 'FIRST_ATTEMPT_ALREADY_RECORDED', attempt: previousAttempts[questionId] };
  }

  const observedAt = String(attempt?.observed_at || new Date().toISOString());
  const nextAttempt = {
    question_id: questionId,
    outcome,
    selected: String(attempt?.selected || ''),
    correct_answer: String(attempt?.correct_answer || ''),
    study_day: String(attempt?.study_day || ''),
    observed_at: observedAt
  };
  const nextUnit = {
    unit_key: unitKey,
    natural_unit_id: String(config?.natural_unit_id || ''),
    first_observed_at: String(previousUnit?.first_observed_at || observedAt),
    last_observed_at: observedAt,
    attempts: { ...previousAttempts, [questionId]: nextAttempt }
  };
  const nextStore = {
    schema: 'kianos.politics.attempt_snapshot.v1',
    units: { ...base.units, [unitKey]: nextUnit }
  };
  return { store: nextStore, recorded: true, reason: 'RECORDED', attempt: nextAttempt };
}

function severity(state) {
  return state === 'REPAIR' ? 3 : state === 'UNCERTAIN' ? 2 : state === 'STABLE' ? 1 : 0;
}

export function evaluatePoliticsUnitReturn(config, snapshot) {
  const store = normalizedSnapshot(snapshot);
  const expectedQuestionIds = asList(config?.expected_question_ids).map(String).filter(Boolean);
  const attempts = store.units?.[String(config?.unit_key || '')]?.attempts || {};
  const completedQuestionIds = expectedQuestionIds.filter((questionId) => normalizedOutcome(attempts?.[questionId]?.outcome));
  const pendingQuestionIds = expectedQuestionIds.filter((questionId) => !completedQuestionIds.includes(questionId));
  const ready = expectedQuestionIds.length > 0 && pendingQuestionIds.length === 0;

  const nodes = asList(config?.nodes).map((node) => {
    const questionIds = asList(node?.question_ids).map(String).filter(Boolean);
    const nodeOutcomes = questionIds.map((questionId) => normalizedOutcome(attempts?.[questionId]?.outcome)).filter(Boolean);
    let state = 'PENDING';
    if (ready) {
      state = nodeOutcomes.includes('WRONG')
        ? 'REPAIR'
        : nodeOutcomes.includes('UNCERTAIN')
          ? 'UNCERTAIN'
          : nodeOutcomes.length === questionIds.length && questionIds.length > 0
            ? 'STABLE'
            : 'PENDING';
    }
    return {
      node_id: String(node?.node_id || ''),
      label: String(node?.label || ''),
      state,
      question_ids: questionIds,
      current_question_count: questionIds.length,
      owner_question_count: Number(node?.owner_question_count || questionIds.length),
      deferred_question_count: Number(node?.deferred_question_count || 0)
    };
  });

  const readyStates = nodes.map((node) => node.state).filter((state) => state !== 'PENDING');
  const unitState = ready && readyStates.length
    ? readyStates.sort((a, b) => severity(b) - severity(a))[0]
    : 'PENDING';

  return {
    schema: 'kianos.politics.unit_return.v1',
    ready,
    unit_state: unitState,
    expected_question_count: expectedQuestionIds.length,
    completed_question_count: completedQuestionIds.length,
    completed_question_ids: completedQuestionIds,
    pending_question_ids: pendingQuestionIds,
    nodes,
    mastery_claim: 'NONE',
    interpretation: String(config?.interpretation || 'This-pass evidence only; not long-term mastery.')
  };
}
