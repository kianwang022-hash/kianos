// Formatting only. Scope/placement and IPA acceptance belong to the Final builder.
const locales = ['en-US', 'en-GB', 'unknown'];
export const pronunciationLocaleLabel = locale => locale === 'en-US' ? '美音' : locale === 'en-GB' ? '英音' : '其他／未注明地区';
export function pronunciationRows(support, senseId = null) {
  const readings = Array.isArray(support?.readings) ? support.readings : [];
  const indices = senseId === null ? readings.map((_, index) => index) : (support?.sense_readings?.[senseId] || []);
  const rows = [];
  for (const index of indices) {
    const reading = readings[index];
    if (!reading) continue;
    const regions = reading.locales?.length ? reading.locales : ['unknown'];
    for (const locale of regions) {
      if (!locales.includes(locale)) continue;
      rows.push({ ...reading, locale, reading_index: index });
    }
  }
  return rows;
}
// Display only: retain uncertain, generic and mixed observations without rebinding sources.
export function pronunciationReadingVisibleInStudy(reading, senses, support, index) {
  const byId = new Map((Array.isArray(senses) ? senses : []).map(sense => [sense.id, sense]));
  const scopes = reading?.applicability;
  if (!Array.isArray(scopes) || !scopes.length) return true;
  for (const scope of scopes) {
    if (!Array.isArray(scope?.sense_ids) || !scope.sense_ids.length) return true;
    if (scope.excluded_sense_ids != null && !Array.isArray(scope.excluded_sense_ids)) return true;
    const excluded = new Set(scope.excluded_sense_ids || []);
    const ids = scope.sense_ids.filter(id => !excluded.has(id));
    if (!ids.length || ids.some(id => !byId.has(id) || !['EXPLORE_ONLY', 'RECOGNITION_EXPANSION'].includes(byId.get(id).disposition))) return true;
  }
  // Conflicting or unknown explicit reverse bindings must not be silently discarded.
  for (const [id, indices] of Object.entries(support?.sense_readings || {})) {
    if (Array.isArray(indices) && indices.includes(index)
        && (!byId.has(id) || !['EXPLORE_ONLY', 'RECOGNITION_EXPANSION'].includes(byId.get(id).disposition))) return true;
  }
  return false;
}
// Compact headword restriction from accepted applicability only; no provenance prose.
export function pronunciationHeaderRestriction(reading, senses = [], support, index) {
  const byId = new Map(senses.map(sense => [sense.id, sense]));
  const posLabels = { noun: '名词', verb: '动词', adjective: '形容词', adverb: '副词', preposition: '介词', conjunction: '连词', interjection: '感叹词' };
  const scopes = reading?.applicability;
  if (!Array.isArray(scopes) || !scopes.length) return '';
  const labels = [];
  const boundIds = new Set();
  const boundPoses = new Set();
  let allBound = true;
  for (const scope of scopes) {
    if (!scope || typeof scope !== 'object') return '';
    const condition = typeof scope.conditions?.owner_identity_condition === 'string'
      ? scope.conditions.owner_identity_condition.trim() : '';
    let poses = Array.isArray(scope.pos) ? [...new Set(scope.pos)] : [];
    let ids = null;
    if (scope.sense_ids != null) {
      if (!Array.isArray(scope.sense_ids) || !scope.sense_ids.length
        || (scope.excluded_sense_ids != null && !Array.isArray(scope.excluded_sense_ids))) return '';
      ids = scope.sense_ids.filter(id => !(scope.excluded_sense_ids || []).includes(id));
      if (!ids.length || ids.some(id => !byId.has(id))) return '';
      const boundPos = [...new Set(ids.map(id => byId.get(id).pos))];
      if (poses.length && boundPos.some(pos => !poses.includes(pos))) return '';
      if (!poses.length) poses = boundPos;
      ids.forEach(id => boundIds.add(id));
    } else {
      allBound = false;
      if (scope.excluded_sense_ids != null) return '';
    }
    if (poses.some(pos => !posLabels[pos])) return '';
    poses.forEach(pos => boundPoses.add(pos));
    // Header reminders are explicit learner-facing text or recognized forms only.
    // Sense/POS bindings validate safety; they never generate a header POS label.
    const formNames = { base: '原形', present: '现在时', past: '过去式', past_participle: '过去分词' };
    const forms = scope.grammatical_forms;
    if (forms != null && (!Array.isArray(forms) || !forms.length
      || forms.some(form => !Object.hasOwn(formNames, form)))) return '';
    const formLabel = forms ? [...new Set(forms.map(form => formNames[form]))].join('/') : '';
    // Do not flatten another explicit restriction into a form-only reminder.
    if (!condition && (scope.case_sensitive || scope.component_scope_note
      || scope.conditions?.reviewed_usage_limits?.length
      || (scope.morphological_role && scope.morphological_role !== 'lemma_citation_form'))) return '';
    const label = [condition, formLabel].filter(Boolean).join('；');
    if (!label) return '';
    labels.push(label);
  }
  for (const [id, indices] of Object.entries(support?.sense_readings || {})) {
    if (!Array.isArray(indices) || !indices.includes(index)) continue;
    if (!byId.has(id) || (allBound && !boundIds.has(id))
      || (boundPoses.size && !boundPoses.has(byId.get(id).pos))) return '';
  }
  return new Set(labels).size === 1 ? labels[0] : '';
}
export function pronunciationFrontText(support, locale, { senses = [], mode = 'full', showRestriction = false } = {}) {
  const available = pronunciationRows(support).filter(row => mode !== 'study'
    || pronunciationReadingVisibleInStudy(row, senses, support, row.reading_index));
  const rows = available.filter(row => row.locale === locale);
  const ipas = [...new Set(rows.map(row => row.ipa))];
  if (!ipas.length) return locale === 'unknown' ? ''
    : available.some(row => row.locale === 'unknown') ? '该地区读音未确认；另有其他或未注明地区的读音' : '音标暂缺';
  return ipas.map(ipa => {
    if (!showRestriction) return ipa;
    // Existing identical-IPA display deduplication must not turn a generic or
    // mixed observation into a restricted one. No source identities are merged.
    const labels = rows.filter(row => row.ipa === ipa).map(row => pronunciationHeaderRestriction(row, senses, support, row.reading_index));
    const label = labels.every(Boolean) && new Set(labels).size === 1 ? labels[0] : '';
    return label ? `${ipa}（${label}）` : ipa;
  }).join(' · ');
}
export function pronunciationScopeText(reading) {
  const labels = [];
  if (reading.learner_reading) labels.push(reading.learner_reading);
  for (const scope of reading.applicability || []) {
    if (scope.case_sensitive && scope.surface) labels.push(scope.surface);
    if (Array.isArray(scope.pos)) labels.push(...scope.pos);
    const conditions = scope.conditions;
    const qualifiers = Array.isArray(conditions)
      ? conditions.filter(condition => condition.kind === 'original_source_sound_qualifiers').map(condition => condition.raw)
      : [conditions?.source_sound_qualifiers_raw || conditions];
    for (const qualifier of qualifiers) {
      if (typeof qualifier?.note === 'string') labels.push(qualifier.note);
      if (Array.isArray(qualifier?.tags)) labels.push(...qualifier.tags);
    }
    if (conditions?.owner_identity_condition) labels.push(conditions.owner_identity_condition);
  }
  if (reading.evidence_basis === 'derived_moby') labels.push('来源转写；未确认标准或首选读法');
  if (reading.spelling_binding) {
    const binding = reading.spelling_binding;
    labels.push(`${binding.source_surface} 的同词拼写变体读音`);
    if (binding.owner_spelling_condition) labels.push(binding.owner_spelling_condition);
    if (binding.source_spelling_condition_text) labels.push(binding.source_spelling_condition_text);
  }
  return [...new Set(labels.filter(Boolean))].join(' · ');
}
