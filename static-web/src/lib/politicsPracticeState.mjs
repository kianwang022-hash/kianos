import { findPoliticsFirstAttempt } from './politicsUnitReturn.mjs';
// Existing Politics storage identities. Shared by the native Workbench and its
// read-only Home/Review consumers; this module never writes learner state.
export const PRACTICE_KEYS = Object.freeze({
  attempts: 'kianos-politics-attempts-v1', meta: 'kianos-politics-practice-meta-v1',
  session: 'kianos-politics-practice-session-v1', last: 'kianos-politics-last-location-v1',
  evidence: 'kianos-politics-evidence-v1'
});
const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);

const stableHash = (text) => {
  let hash = 2166136261;
  for (const char of String(text || '')) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
};

function politicsReviewBatchId(catalog, review, { day = '', filter = 'all', subject = 'all' } = {}) {
  const basis = {
    catalog_revision: String(catalog?.revision || ''),
    study_day: String(day || ''),
    scope: { filter: String(filter || 'all'), subject: String(subject || 'all') },
    items: review.items.map((item) => ({
      question_id: item.id,
      current_unit_key: item.unitKey,
      current_unit_id: item.unitId,
      current_unit_href: item.unitHref,
      first_owner: item.firstAttemptOwnerKey,
      first_observed_at: item.firstAttempt?.observed_at || null,
      first_outcome: item.firstAttempt?.outcome || null,
      first_selected: item.firstAttempt?.selected || null,
      original_source_context: item.firstAttempt?.source_context || null,
      current_outcome: item.outcome,
      discussion: item.discussion,
      note: item.note,
      cause: item.cause
    }))
  };
  return 'politics-review-' + stableHash(JSON.stringify(basis));
}
export function isPoliticsStorageValue(key, value) {
  if (key === PRACTICE_KEYS.evidence) return Array.isArray(value) && value.every(record);
  if ([PRACTICE_KEYS.session, PRACTICE_KEYS.last].includes(key) && value === null) return true;
  if (!record(value)) return false;
  if (key === PRACTICE_KEYS.attempts) return record(value.units)
    && Object.values(value.units).every(unit => record(unit) && record(unit.attempts)
      && Object.values(unit.attempts).every(attempt => record(attempt) && typeof attempt.question_id === 'string' && ['WRONG','UNCERTAIN','STABLE'].includes(attempt.outcome)));
  if (key === PRACTICE_KEYS.meta) return ['favorites','discussion','causes','notes','latestOutcome'].every(field => {
    if (value[field] === undefined) return true;
    if (!record(value[field])) return false;
    return Object.values(value[field]).every(item => ['favorites','discussion'].includes(field)
      ? typeof item === 'boolean' : field === 'latestOutcome'
        ? ['WRONG','UNCERTAIN','STABLE'].includes(item) : typeof item === 'string');
  });
  return true;
}

export function politicsSessionMatchesCatalog(session, catalog) {
  if (!record(session) || session.runtimeVersion !== 2 || !session.id
    || !Array.isArray(session.ids) || !session.ids.length || new Set(session.ids).size !== session.ids.length
    || !Number.isInteger(session.index) || session.index < 0 || session.index >= session.ids.length
    || !['active','paused','completed'].includes(session.status)) return false;
  const questions = new Map((catalog.questions || []).map(q => [q.id,q]));
  if (session.ids.some(id => !questions.get(id)?.unitKey)) return false;
  // Legacy sessions have no per-task snapshot: keep their conservative old guard.
  if (!record(session.taskRevisions)) return session.revision === catalog.revision;
  return session.ids.every(id => typeof questions.get(id).taskRevision === 'string'
    && session.taskRevisions[id] === questions.get(id).taskRevision);
}

export function readPoliticsSnapshot(storage) {
  const errors = [];
  const read = (key, fallback, valid = v => v && typeof v === 'object' && !Array.isArray(v)) => {
    try {
      const raw = storage.getItem(key);
      if (raw === null) return fallback;
      const value = JSON.parse(raw);
      if (value === null && fallback === null) return null;
      if (!valid(value) || !isPoliticsStorageValue(key, value)) throw new Error('shape');
      return value;
    } catch { errors.push(key); return fallback; }
  };
  return {
    attempts: read(PRACTICE_KEYS.attempts, { units: {} }, v => v && typeof v === 'object' && !Array.isArray(v) && v.units && typeof v.units === 'object' && !Array.isArray(v.units)),
    meta: read(PRACTICE_KEYS.meta, {}), session: read(PRACTICE_KEYS.session, null),
    last: read(PRACTICE_KEYS.last, null), events: read(PRACTICE_KEYS.evidence, [], Array.isArray), errors
  };
}

export function selectPoliticsReview(catalog, snapshot, { day = '', filter = 'all', subject = 'all' } = {}) {
  const validOutcomes = new Set(['WRONG', 'UNCERTAIN', 'STABLE']);
  const events = Array.isArray(snapshot.events) ? snapshot.events : [];
  const items = [];
  for (const q of catalog.questions || []) {
    // Only an already attempted, currently admitted, exact owner may be revisited.
    if (!q.unitKey) continue;
    const observed = findPoliticsFirstAttempt(snapshot.attempts, q.id);
    const first = observed?.attempt;
    if (!first || !validOutcomes.has(first.outcome) || first.question_id !== q.id) continue;
    const outcome = validOutcomes.has(snapshot.meta?.latestOutcome?.[q.id])
      ? snapshot.meta.latestOutcome[q.id] : first.outcome;
    const discussion = snapshot.meta?.discussion?.[q.id] === true;
    const needsReview = ['WRONG', 'UNCERTAIN'].includes(outcome);
    if (!needsReview && !discussion) continue;
    const relevantEvents = events.filter(e => e?.question_id === q.id);
    const latest = [...relevantEvents].sort((a,b) => String(a.observed_at || '').localeCompare(String(b.observed_at || ''))).at(-1);
    const observedDay = latest?.study_day || first.study_day || '';
    if (subject !== 'all' && q.subject !== subject) continue;
    if (filter === 'today' && observedDay !== day) continue;
    if (filter === 'discussion' && !discussion) continue;
    if (filter === 'problems' && !needsReview) continue;
    items.push({ id: q.id, subject: q.subject, subjectLabel: q.subjectLabel,
      number: q.number, type: q.type, chapter: q.chapter, chapterTitle: q.chapterTitle,
      unitKey: q.unitKey, unitId: q.unitId, unitTitle: q.unitTitle, unitHref: q.unitHref,
      outcome, discussion, observedDay, needsReview, firstAttempt: first, firstAttemptOwnerKey: observed.unitKey,
      note: String(snapshot.meta?.notes?.[q.id] || ''),
      cause: String(snapshot.meta?.causes?.[q.id] || ''),
      events: relevantEvents });
  }
  // Stable canonical order; no invented due date, weak-area score or scheduler.
  const groups = [];
  for (const item of items) {
    let group = groups.find(g => g.key === item.unitKey);
    if (!group) { group = { key: item.unitKey, title: item.unitTitle,
      subject: item.subjectLabel, chapter: item.chapterTitle, href: item.unitHref, items: [] }; groups.push(group); }
    group.items.push(item);
  }
  return { items, groups, problemIds: items.filter(i => i.needsReview).map(i => i.id),
    discussionIds: items.filter(i => i.discussion).map(i => i.id),
    errors: snapshot.errors || [] };
}

export function resolvePoliticsContinue(catalog, snapshot, base = '/') {
  const prefix = `${base}politics/`;
  const session = snapshot.session;
  if (session && ['active', 'paused'].includes(session.status)) {
    const q = catalog.questions?.find(q => q.id === session.ids?.[session.index]);
    if (!politicsSessionMatchesCatalog(session, catalog) || !q || !q.unitKey) {
      return { href: `${prefix}practice/`, title: '核对上次题组', detail: '原题组已变化，记录保留；不会跳到其他题。', stale: true };
    }
    // Exact repair-source return keeps the native location instead of dragging
    // the learner out of the source companion just because a session exists.
    try {
      const url = new URL(snapshot.last?.href || '', 'https://kianos.invalid');
      if (url.origin === 'https://kianos.invalid' && url.pathname.startsWith(prefix)
        && url.searchParams.get('practiceSession') === session.id
        && url.searchParams.get('practiceQuestion') === q.id
        && url.pathname === new URL(q.unitHref, 'https://kianos.invalid').pathname
        && url.hash === new URL(q.unitHref, 'https://kianos.invalid').hash) {
        return { href: url.pathname + url.search + url.hash, title: snapshot.last?.title || q.unitTitle, detail: '回到这道题的原讲义定位' };
      }
    } catch {}
    return { href: `${prefix}practice/?session=${encodeURIComponent(session.id)}&question=${encodeURIComponent(q.id)}`,
      title: `${q.subjectLabel} · 第 ${q.number} 题`, detail: '继续上次题组，保留作答与备注' };
  }
  const last = snapshot.last;
  if (last?.href) {
    try {
      const url = new URL(last.href, 'https://kianos.invalid');
      const chapter = catalog.chapters?.find(c => c.subject === last.subject && (c.code === last.chapter || c.key === `${last.subject}/${last.chapter}`));
      const chapterPath = `${prefix}${last.subject}/${last.chapter}/`;
      if (url.origin === 'https://kianos.invalid' && chapter && url.pathname === chapterPath) {
        // A question anchor is valid only in its exact current chapter.
        if (url.hash.startsWith('#politics-question-') && !catalog.questions?.some(q => q.subject === last.subject && q.chapter === last.chapter && `#politics-question-${q.id.replace(/[^a-zA-Z0-9_-]/g, '-')}` === url.hash)) throw new Error('stale');
        if (url.hash && !url.hash.startsWith('#politics-question-') && !['#orientation','#chapter-close'].includes(url.hash) && !catalog.units?.some(u => u.subject === last.subject && u.chapter === last.chapter && [new URL(u.href, 'https://kianos.invalid').hash, '#source-' + (u.returnConfig?.runtime_unit_id || u.id), '#politics-unit-return-' + String(u.id).replace(/[^a-zA-Z0-9_-]/g, '-')].includes(url.hash))) throw new Error('stale');
        return { href: url.pathname + url.search + url.hash, title: last.title || chapter.title, detail: '回到上次学习位置' };
      }
    } catch {}
    return { href: prefix, title: '选择学习位置', detail: '旧位置暂不可用，原记录未被覆盖。', stale: true };
  }
  return null;
}

export function politicsReviewPacket(catalog, snapshot, options = {}) {
  const scope = {
    filter: String(options.filter || 'all'),
    subject: String(options.subject || 'all')
  };
  const review = selectPoliticsReview(catalog, snapshot, {
    day: options.day || '',
    filter: scope.filter,
    subject: scope.subject
  });
  if (review.errors.length) throw new Error('POLITICS_REVIEW_EVIDENCE_UNREADABLE');
  const batchId = politicsReviewBatchId(catalog, review, {
    day: options.day || '',
    filter: scope.filter,
    subject: scope.subject
  });
  return {
    schema: 'kianos.politics.return_packet.v1',
    direction: 'LEARNER_TO_CHAT',
    batch_id: batchId,
    catalog_revision: catalog.revision,
    study_day: options.day || '',
    scope,
    exported_at: new Date().toISOString(),
    last_location: snapshot.last,
    // Export is read-only transport. Chat may return one typed diagnosis bound
    // to this exact batch; the importer reconciles identity before any write.
    review_policy: {
      learner_triggered: true,
      group_by_underlying_failure: true,
      keep_unrelated_failures_separate: true,
      no_follow_up_is_valid: true,
      memory_requires_source_and_justification: true
    },
    chat_return_contract: {
      schema: 'kianos.politics.chat-return.v1',
      direction: 'CHAT_TO_LEARNER',
      required_identity: ['batch_id', 'catalog_revision', 'study_day', 'scope'],
      verdicts: ['NO_ACTION', 'FOLLOW_UP'],
      follow_up_actions: ['SOURCE_RETURN', 'RETEST', 'DISCUSS', 'MEMORY_CANDIDATE'],
      note: 'Use only question_ids from this packet. MEMORY_CANDIDATE requires source_basis. The website validates stale/replay/conflict before writing.'
    },
    first_attempts: review.items.map(i => ({
      question_id: i.id,
      recorded_unit_key: i.firstAttemptOwnerKey,
      attempt: i.firstAttempt,
      source_context_status: i.firstAttempt.source_context ? 'CAPTURED_AT_ATTEMPT' : 'LEGACY_SOURCE_CONTEXT_UNAVAILABLE'
    })),
    events: review.items.flatMap(i => i.events.length ? i.events : [{
      ...i.firstAttempt,
      source: 'xiao1000',
      recorded_unit_key: i.firstAttemptOwnerKey,
      source_context_status: i.firstAttempt.source_context ? 'CAPTURED_AT_ATTEMPT' : 'LEGACY_SOURCE_CONTEXT_UNAVAILABLE'
    }]),
    review_context: review.items.map(i => ({
      question_id: i.id,
      unit_key: i.unitKey,
      subject: i.subject,
      chapter: i.chapter,
      unit_id: i.unitId,
      current_outcome: i.outcome,
      discussion: i.discussion,
      note: i.note,
      cause: i.cause,
      recorded_unit_key: i.firstAttemptOwnerKey,
      source_context_status: i.firstAttempt.source_context ? 'CAPTURED_AT_ATTEMPT' : 'LEGACY_SOURCE_CONTEXT_UNAVAILABLE',
      source_href: i.unitHref,
      source_href_role: 'CURRENT_NAVIGATION_NOT_HISTORICAL_PROVENANCE',
      original_source_context: i.firstAttempt.source_context || null
    }))
  };
}

export function politicsDailyEvidencePacket(catalog, snapshot, {
  day,
  now = Date.now(),
  base = '/'
} = {}) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(day || ''))) {
    throw new Error('POLITICS_DAILY_EVIDENCE_DAY_INVALID');
  }
  if (snapshot?.errors?.length) throw new Error('POLITICS_DAILY_EVIDENCE_UNREADABLE');

  const todayAttempts = [];
  for (const [unitKey, unit] of Object.entries(snapshot?.attempts?.units || {})) {
    for (const attempt of Object.values(unit?.attempts || {})) {
      if (attempt?.study_day !== day || !attempt?.question_id) continue;
      const currentOutcome = snapshot?.meta?.latestOutcome?.[attempt.question_id] || attempt.outcome;
      todayAttempts.push({
        question_id: attempt.question_id,
        unit_key: unitKey,
        outcome: currentOutcome,
        first_outcome: attempt.outcome,
        uncertain: attempt.uncertain === true,
        observed_at: attempt.observed_at || null,
        source_context_status: attempt.source_context ? 'CAPTURED_AT_ATTEMPT' : 'LEGACY_SOURCE_CONTEXT_UNAVAILABLE',
        note: String(snapshot?.meta?.notes?.[attempt.question_id] || ''),
        cause: String(snapshot?.meta?.causes?.[attempt.question_id] || '')
      });
    }
  }
  todayAttempts.sort((a, b) => String(a.observed_at || '').localeCompare(String(b.observed_at || '')));

  const review = selectPoliticsReview(catalog, snapshot, { filter: 'all', subject: 'all' });
  const resume = resolvePoliticsContinue(catalog, snapshot, base);
  const count = (outcome) => todayAttempts.filter((row) => row.outcome === outcome).length;

  return {
    schema: 'kianos.politics.study_packet.v1',
    study_day: day,
    generated_at: new Date(now).toISOString(),
    catalog_revision: catalog?.revision || null,
    resume: resume ? {
      href: resume.href,
      title: resume.title,
      detail: resume.detail,
      stale: resume.stale === true
    } : null,
    today: {
      attempted_count: todayAttempts.length,
      stable_count: count('STABLE'),
      wrong_count: count('WRONG'),
      uncertain_count: count('UNCERTAIN'),
      attempts: todayAttempts
    },
    review: {
      open_problem_count: review.problemIds.length,
      discussion_count: review.discussionIds.length,
      unit_groups: review.groups.map((group) => ({
        unit_key: group.key,
        title: group.title,
        subject: group.subject,
        chapter: group.chapter,
        problem_count: group.items.filter((item) => item.needsReview).length,
        discussion_count: group.items.filter((item) => item.discussion).length
      }))
    },
    last_location: snapshot?.last || null
  };
}
