export function compileLexicalStudyObject(record = {}) {
  const clone = (value) => JSON.parse(JSON.stringify(value));

  const senses = Array.isArray(record.senses) ? clone(record.senses) : [];
  const secondarySenses = Array.isArray(record.secondary_senses) ? clone(record.secondary_senses) : [];

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

  const formIdentity = record.form_identity && typeof record.form_identity === 'object'
    ? record.form_identity
    : null;

  const form = formIdentity
    ? {
        form_type: String(formIdentity.form_type || ''),
        spelling: String(formIdentity.spelling || record.word || ''),
        variants: (Array.isArray(formIdentity.variants) ? formIdentity.variants : []).map((variant) => ({
          variant_id: String(variant?.variant_id || ''),
          pos: Array.isArray(variant?.pos) ? variant.pos.map(String) : [],
          ipa: String(variant?.ipa || ''),
          learner_key: String(variant?.learner_key || '')
        }))
      }
    : null;

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
    form_identity: form
  };
}
