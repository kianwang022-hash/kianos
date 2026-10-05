// Formatting only. Scope/placement and IPA acceptance belong to the Final builder.
const locales = ['en-US', 'en-GB', 'unknown'];
export const pronunciationLocaleLabel = locale => locale === 'en-US' ? '美音' : locale === 'en-GB' ? '英音' : '地区未注明';
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
export function pronunciationFrontText(support, locale) {
  const rows = pronunciationRows(support).filter(row => row.locale === locale);
  const ipas = [...new Set(rows.map(row => row.ipa))];
  if (!ipas.length) return locale === 'unknown' ? '' : '音标暂缺';
  return ipas.join(' · ');
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
