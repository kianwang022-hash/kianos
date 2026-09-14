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
  const english = [];
  const objective = read('kianos-objective-last-action-v1');
  if (objective) english.push(objective);
  const writing = read('kianos-writing-last-location-v1');
  if (writing?.id) {
    const record = read(`kianos-writing-runtime-v1:${writing.id}`);
    if (record && (record.draftEssay || record.draftPlan || record.firstDraft)) english.push(writing);
  }
  const translation = read('kianos-translation-last-location-v1');
  if (translation?.id) {
    const record = read(`kianos-translation-attempt-v2:${translation.id}`);
    if (record && (Object.values(record.drafts || {}).some(Boolean) || Object.values(record.firstAttempts || {}).some(Boolean))) english.push(translation);
  }
  const reading = read('kianos-reading-last-location-v1');
  if (reading?.id) {
    const record = read(`kianos-reading-attempt-v1:${reading.id}`);
    if (record && (Object.values(record.answers || {}).some(Boolean) || record.submitted)) english.push({...reading,href:`${base}reading/${encodeURIComponent(reading.id)}/`});
  }
  const best = english.map(row => ({...row, href:safe(row.href,['reading/','cloze/','reading-b/','translation/','writing/'])})).filter(row=>row.href).sort((a,b)=>time(b)-time(a))[0];
  if (best) result.english = {title:best.title || 'English task',href:best.href,time:time(best)};
  return result;
}
