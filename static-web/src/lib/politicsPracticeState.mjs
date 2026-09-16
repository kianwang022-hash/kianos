// Existing Politics storage identities. Shared by the native Workbench and its
// read-only Home/Review consumers; this module never writes learner state.
export const PRACTICE_KEYS = Object.freeze({
  attempts: 'kianos-politics-attempts-v1', meta: 'kianos-politics-practice-meta-v1',
  session: 'kianos-politics-practice-session-v1', last: 'kianos-politics-last-location-v1',
  evidence: 'kianos-politics-evidence-v1'
});
export function readPoliticsSnapshot(storage) {
  const errors = [];
  const read = (key, fallback, valid = v => v && typeof v === 'object' && !Array.isArray(v)) => {
    try {
      const raw = storage.getItem(key);
      if (raw === null) return fallback;
      const value = JSON.parse(raw);
      if (value === null && fallback === null) return null;
      if (!valid(value)) throw new Error('shape');
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
    const first = snapshot.attempts?.units?.[q.unitKey]?.attempts?.[q.id];
    if (!first || !validOutcomes.has(first.outcome) || first.question_id !== q.id) continue;
    const outcome = validOutcomes.has(snapshot.meta?.latestOutcome?.[q.id])
      ? snapshot.meta.latestOutcome[q.id] : first.outcome;
    const discussion = snapshot.meta?.discussion?.[q.id] === true;
    const needsReview = ['WRONG', 'UNCERTAIN'].includes(outcome);
    if (!needsReview && !discussion) continue;
    const relevantEvents = events.filter(e => e?.question_id === q.id && e?.unit_id === q.unitId);
    const latest = [...relevantEvents].sort((a,b) => String(a.observed_at || '').localeCompare(String(b.observed_at || ''))).at(-1);
    const observedDay = latest?.study_day || first.study_day || '';
    if (subject !== 'all' && q.subject !== subject) continue;
    if (filter === 'today' && observedDay !== day) continue;
    if (filter === 'discussion' && !discussion) continue;
    if (filter === 'problems' && !needsReview) continue;
    items.push({ id: q.id, subject: q.subject, subjectLabel: q.subjectLabel,
      number: q.number, type: q.type, chapter: q.chapter, chapterTitle: q.chapterTitle,
      unitKey: q.unitKey, unitId: q.unitId, unitTitle: q.unitTitle, unitHref: q.unitHref,
      outcome, discussion, observedDay, needsReview, firstAttempt: first,
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
    if (session.runtimeVersion !== 2 || session.revision !== catalog.revision || !session.id || !Number.isInteger(session.index) || session.index < 0 || !Array.isArray(session.ids) || session.ids.some(id => !catalog.questions?.some(row => row.id === id)) || !q || !q.unitKey) {
      return { href: `${prefix}practice/`, title: '核对上次题组', detail: '原题组已变化，记录保留；不会跳到其他题。', stale: true };
    }
    // Exact repair-source return keeps the native location instead of dragging
    // the learner out of the source companion just because a session exists.
    try {
      const url = new URL(snapshot.last?.href || '', 'https://kianos.invalid');
      if (url.origin === 'https://kianos.invalid' && url.pathname.startsWith(prefix)
        && url.searchParams.get('practiceSession') === session.id
        && url.searchParams.get('practiceQuestion') === q.id
        && url.pathname === new URL(q.unitHref, 'https://kianos.invalid').pathname) {
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
  const review = selectPoliticsReview(catalog, snapshot, options);
  return { schema: 'kianos.politics.return_packet.v1', study_day: options.day || '',
    exported_at: new Date().toISOString(), last_location: snapshot.last,
    events: review.items.flatMap(i => i.events.length ? i.events : [{
      ...i.firstAttempt, subject: i.subject, chapter: i.chapter, unit_id: i.unitId,
      source: 'xiao1000', source_href: i.unitHref
    }]),
    review_context: review.items.map(i => ({ question_id: i.id, unit_key: i.unitKey,
      current_outcome: i.outcome, discussion: i.discussion, note: i.note, cause: i.cause,
      source_href: i.unitHref })) };
}
