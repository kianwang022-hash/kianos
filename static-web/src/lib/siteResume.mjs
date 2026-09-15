// Read-only presentation of existing local task evidence. No scheduler or mastery inference.
export function readSiteResumes(storage, origin, base = '/') {
  const read = key => { try { return JSON.parse(storage.getItem(key) || 'null'); } catch { return null; } };
  const safe = (raw, prefixes) => { try { const u = new URL(raw, origin); return u.origin === origin && prefixes.some(p => u.pathname.startsWith(`${base}${p}`)) ? u.pathname + u.search + u.hash : null; } catch { return null; } };
  const time = row => Date.parse(row?.updatedAt || row?.observed_at || '') || 0;
  const result = {};
  const politics = read('kianos-politics-last-location-v1');
  if (politics && (politics.unit_id || politics.question_id || politics.action)) {
    const href = safe(politics.href, ['politics/']);
    if (href) result.politics = {title: politics.title || '政治学习', href, time:time(politics)};
  }
  const xizong = read('kianos-xizong-last-location-v1');
  if (xizong?.meaningfulAction) {
    const href = safe(xizong.href, ['xizong/circulation/','xizong/respiratory/','xizong/urinary/']);
    if (href) result.xizong = {title:xizong.blockTitle || xizong.systemTitle || '西综学习', href, time:time(xizong)};
  }
  // English Current priorities are owned by LEARNING_CONTRACT §15 and the
  // current English hub: task state first, recency only within the same priority.
  const english = [];
  const hasText = value => typeof value === 'string' && Boolean(value.trim());
  const hasValues = value => value && typeof value === 'object' && Object.values(value).some(hasText);
  const validRecord = value => value && typeof value === 'object' && !Array.isArray(value);
  const englishHref = (row, family) => {
    if (!hasText(row?.id)) return null;
    const expected = `${base}${family}/${encodeURIComponent(row.id)}/`;
    try {
      const target = new URL(row.href || expected, origin);
      if (target.origin !== origin || target.username || target.password
        || ![expected, expected.slice(0,-1)].includes(target.pathname)) return null;
      return target.pathname + target.search + target.hash;
    } catch { return null; }
  };
  const add = (row, family, priority) => {
    const href = englishHref(row, family);
    if (priority && href) english.push({...row,href,priority});
  };
  const objectivePriority = record => {
    if (!validRecord(record)) return 0;
    if (!record.submitted) return hasValues(record.answers) ? 100 : 0;
    if (record.reviewUnlocked === false) return 0;
    const uncertain = new Set(Array.isArray(record.uncertain) ? record.uncertain : []);
    const problems = Object.entries(record.results || {}).some(([id,outcome]) =>
      ['wrong','unanswered'].includes(outcome) || uncertain.has(id));
    return problems ? 82 : 0;
  };
  const objective = read('kianos-objective-last-action-v1');
  if (objective?.id) {
    for (const family of ['cloze','reading-b']) {
      if (englishHref(objective,family)) add(objective,family,objectivePriority(read(`kianos-${family}-attempt-v1:${objective.id}`)));
    }
  }
  const writing = read('kianos-writing-last-location-v1');
  if (writing?.id) {
    const record = read(`kianos-writing-runtime-v1:${writing.id}`);
    const priorities = {ATTEMPT:100,REVIEW_PENDING:90,REPAIR_NEEDED:96,REPAIR_CHECK_PENDING:86};
    if (validRecord(record) && [record.draftEssay,record.draftPlan,record.firstDraft].some(hasText)) add(writing,'writing',priorities[record.state] || 0);
  }
  const translation = read('kianos-translation-last-location-v1');
  if (translation?.id) {
    const record = read(`kianos-translation-attempt-v2:${translation.id}`);
    const priorities = {attempt:100,decision:86,diagnosis:92,reconstruct:96};
    if (validRecord(record) && (hasValues(record.drafts) || hasValues(record.firstAttempts))) add(translation,'translation',priorities[record.stage] || 0);
  }
  const reading = read('kianos-reading-last-location-v1');
  if (reading?.id) add(reading,'reading',objectivePriority(read(`kianos-reading-attempt-v1:${reading.id}`)));
  const best = english.sort((a,b)=>b.priority-a.priority || time(b)-time(a))[0];
  if (best) result.english = {title:best.title || 'English task',href:best.href,time:time(best)};
  return result;
}
