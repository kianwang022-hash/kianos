export function compileLexicalStudyObject(record = {}) {
  const clone = (value) => JSON.parse(JSON.stringify(value));

  const rawSenses = Array.isArray(record.senses) ? clone(record.senses) : [];
  const secondarySenses = Array.isArray(record.secondary_senses) ? clone(record.secondary_senses) : [];

  const formIdentity = record.form_identity && typeof record.form_identity === 'object'
    ? clone(record.form_identity)
    : null;
  const structuredFormVariants = Array.isArray(formIdentity?.variants) && formIdentity.variants.length > 0;

  const noteIsFormOnly = (note) => {
    if (!structuredFormVariants || !note) return false;
    const text = String(note).toLowerCase();
    const hasFormCue = text.includes('stress') || text.includes('syllable') || text.includes('pronunciation');
    const hasNonFormCue = text.includes('frequency') || text.includes('formal') || text.includes('informal') ||
      text.includes('plural') || text.includes('rare') || text.includes('common') || text.includes('academic');
    return hasFormCue && !hasNonFormCue;
  };

  const senses = rawSenses.map((sense) => {
    if (!noteIsFormOnly(sense?.usage_note)) return sense;
    const next = { ...sense };
    delete next.usage_note;
    return next;
  });

  const materializedCollocationIds = new Set();
  for (const sense of [...senses, ...secondarySenses]) {
    for (const collocation of Array.isArray(sense?.collocations) ? sense.collocations : []) {
      if (collocation?.collocation_id) materializedCollocationIds.add(String(collocation.collocation_id));
    }
  }

  const constructions = (Array.isArray(record.constructions) ? record.constructions : [])
    .map((construction, canonicalIndex) => ({ construction, canonicalIndex }))
    .filter(({ construction }) => {
      const survivor = construction?.presentation_merge?.surviving_object_id;
      return !(survivor && materializedCollocationIds.has(String(survivor)));
    })
    .map(({ construction, canonicalIndex }) => ({
      ...clone(construction),
      learner_source_locator: `record.constructions[${canonicalIndex}]`
    }));

  const core = record.core_concept && typeof record.core_concept === 'object'
    ? record.core_concept
    : {};

  const coreMeaningCn = String(core.core_meaning_cn || core.mental_model_cn || '').trim();
  const mentalModelCn = String(core.mental_model_cn || '').trim();

  let compactFormIdentity = formIdentity;
  if (structuredFormVariants) {
    compactFormIdentity = {
      ...formIdentity,
      boundary: '',
      variants: formIdentity.variants.map((variant) => {
        const next = { ...variant };
        delete next.stress;
        return next;
      })
    };
  }

  return {
    ...clone(record),
    core_concept: {
      core_meaning_cn: coreMeaningCn,
      mental_model_cn: mentalModelCn && mentalModelCn !== coreMeaningCn ? mentalModelCn : '',
      core_meaning_en: '',
      mental_model_en: '',
      core_clusters: []
    },
    senses,
    secondary_senses: secondarySenses,
    constructions,
    form_identity: compactFormIdentity
  };
}
