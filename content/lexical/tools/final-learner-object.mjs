export function compileLexicalStudyObject(record = {}, decisions = {}) {
  const clone = (value) => JSON.parse(JSON.stringify(value));

  const usageNoteDecisions = decisions?.sense_usage_notes && typeof decisions.sense_usage_notes === 'object'
    ? decisions.sense_usage_notes
    : {};

  const senses = (Array.isArray(record.senses) ? record.senses : []).map((sourceSense) => {
    const sense = clone(sourceSense);
    const senseId = String(sense?.sense_id || '');
    const disposition = usageNoteDecisions?.[senseId]?.disposition || null;
    if (disposition && !['DEFAULT_DEPTH', 'EXPLORE_ONLY'].includes(disposition)) {
      throw new Error(`LEXICAL_FINAL_OBJECT_USAGE_NOTE_DISPOSITION_INVALID:${senseId}:${disposition}`);
    }
    if (disposition === 'EXPLORE_ONLY') delete sense.usage_note;
    return sense;
  });
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


const exactUniqueText = (values = []) => {
  const seen = new Set();
  const rows = [];
  for (const raw of values) {
    const value = String(raw || '').trim();
    if (!value || seen.has(value)) continue;
    seen.add(value);
    rows.push(value);
  }
  return rows;
};

const repairTarget = (kind, id, locator, label) => ({
  kind: String(kind || 'lexical'),
  id: id ? String(id) : '',
  locator: locator ? String(locator) : '',
  label: String(label || '').trim()
});

const posLabel = (value = '') => {
  const pos = String(value || '').toLowerCase();
  if (pos.startsWith('verb') || pos === 'v') return 'V';
  if (pos.startsWith('adj') || pos === 'a') return 'A';
  if (pos.startsWith('noun') || pos === 'n') return 'N';
  if (pos.startsWith('adv')) return 'ADV';
  if (pos.startsWith('prep')) return 'PREP';
  if (pos.startsWith('interj')) return 'INTJ';
  if (pos.startsWith('numeral')) return 'NUM';
  return String(value || 'S').toUpperCase();
};

const relationLearnerObject = (relation = {}, kind, locator, word) => {
  const evidenceObjects = Array.isArray(relation.source_evidence_objects)
    ? relation.source_evidence_objects
    : [];
  const differences = [];
  if (relation.difference_axes && typeof relation.difference_axes === 'object') {
    for (const [key, value] of Object.entries(relation.difference_axes)) {
      if (value) differences.push({ key: String(key).replaceAll('_', ' '), value: String(value) });
    }
  }
  for (const item of evidenceObjects) {
    if (!item?.difference || typeof item.difference !== 'object') continue;
    for (const [key, value] of Object.entries(item.difference)) {
      if (value) differences.push({ key: String(key).replaceAll('_', ' '), value: String(value) });
    }
  }

  const title = String(
    relation.target_expression ||
    relation.target_word ||
    relation.module ||
    relation.relation_type ||
    'contrast'
  ).trim();

  return {
    id: String(relation.relation_id || relation.fact_id || ''),
    kind,
    title,
    lines: exactUniqueText([
      relation.meaning_cn,
      relation.definition_cn,
      relation.boundary,
      ...(Array.isArray(relation.boundaries) ? relation.boundaries : []),
      relation.learning_note,
      relation.relation_note,
      relation.shared_definition,
      relation.shared_core,
      relation.shared_meaning,
      relation.unsafe_swap,
      ...evidenceObjects.map((item) => item?.learner_note),
      relation.definition_en
    ]).filter((line) => line !== title),
    differences,
    repair_target: repairTarget(
      'relation',
      relation.fact_id || relation.relation_id || '',
      locator,
      title || word
    )
  };
};

export function compileLexicalFinalLearnerObject(record = {}, decisions = {}) {
  const study = compileLexicalStudyObject(record, decisions);
  const word = String(study.word || '');
  const core = study.core_concept && typeof study.core_concept === 'object'
    ? study.core_concept
    : {};

  const senses = [];
  for (const [index, sense] of (Array.isArray(study.senses) ? study.senses : []).entries()) {
    senses.push({
      id: String(sense?.sense_id || ''),
      kind: 'active',
      pos: String(sense?.pos || ''),
      pos_label: posLabel(sense?.pos),
      governing_pattern: String(sense?.governing_pattern || ''),
      meaning_cn: String(sense?.definition_cn || ''),
      calibration_en: String(sense?.definition_en || ''),
      usage_note: String(sense?.usage_note || ''),
      collocations: (Array.isArray(sense?.collocations) ? sense.collocations : []).map((item, collocationIndex) => ({
        id: String(item?.collocation_id || ''),
        phrase: String(item?.phrase || ''),
        meaning_cn: String(item?.meaning_cn || ''),
        role: item?.exam_value === 'fixed_pattern' ? 'fixed_pattern' : 'usage_example',
        repair_target: item?.exam_value === 'fixed_pattern'
          ? repairTarget(
              'collocation',
              item?.collocation_id || '',
              `record.senses[${index}].collocations[${collocationIndex}]`,
              item?.phrase || word
            )
          : null
      })),
      repair_target: repairTarget(
        'sense',
        sense?.sense_id || '',
        `record.senses[${index}]`,
        sense?.definition_cn || sense?.definition_en || word
      )
    });
  }

  for (const [index, sense] of (Array.isArray(study.secondary_senses) ? study.secondary_senses : []).entries()) {
    senses.push({
      id: String(sense?.fact_id || sense?.source_sense_id || ''),
      kind: 'secondary',
      pos: String(sense?.pos || ''),
      pos_label: posLabel(sense?.pos),
      governing_pattern: String(sense?.governing_pattern || ''),
      meaning_cn: String(sense?.definition_cn || sense?.meaning_cn || ''),
      calibration_en: String(sense?.definition_en || sense?.label_en || ''),
      usage_note: String(sense?.usage_note || ''),
      pattern: String(sense?.pattern || sense?.boundary || ''),
      collocations: (Array.isArray(sense?.collocations) ? sense.collocations : []).map((item) => ({
        id: String(item?.collocation_id || ''),
        phrase: String(item?.phrase || ''),
        meaning_cn: String(item?.meaning_cn || ''),
        role: item?.exam_value === 'fixed_pattern' ? 'fixed_pattern' : 'usage_example',
        repair_target: null
      })),
      repair_target: repairTarget(
        'secondary_sense',
        sense?.fact_id || sense?.source_sense_id || '',
        `record.secondary_senses[${index}]`,
        sense?.definition_cn || sense?.meaning_cn || sense?.definition_en || sense?.label_en || word
      )
    });
  }

  const constructions = (Array.isArray(study.constructions) ? study.constructions : []).map((item, index) => {
    const locator = String(item?.learner_source_locator || `record.constructions[${index}]`);
    const title = String(item?.pattern || item?.label_en || item?.boundary || '').trim();
    return {
      id: String(item?.construction_id || item?.fact_id || ''),
      pattern: title,
      meaning_cn: String(item?.meaning_cn || item?.definition_cn || ''),
      lines: exactUniqueText([
        item?.learning_note,
        item?.definition_en,
        item?.boundary
      ]).filter((line) => line !== title),
      repair_target: repairTarget(
        'construction',
        item?.construction_id || item?.fact_id || '',
        locator,
        title || word
      )
    };
  });

  const relations = [
    ...(Array.isArray(study.semantic_neighbors) ? study.semantic_neighbors : []).map((relation, index) =>
      relationLearnerObject(relation, 'relation', `record.semantic_neighbors[${index}]`, word)),
    ...(Array.isArray(study.confusables) ? study.confusables : []).map((relation, index) =>
      relationLearnerObject(relation, 'confusable', `record.confusables[${index}]`, word))
  ];

  const formNotes = [];
  for (const sense of Array.isArray(study.senses) ? study.senses : []) {
    const overlay = sense?.lexical_identity_overlay;
    if (!overlay || overlay?.identity_type !== 'form_boundary') continue;
    const note = String(
      overlay.note || overlay.label_cn || overlay.label_en || overlay.boundary || ''
    ).trim();
    if (note) formNotes.push({
      source_sense_id: String(sense?.sense_id || ''),
      text: note
    });
  }

  const form = study.form_identity
    ? {
        form_type: String(study.form_identity.form_type || ''),
        spelling: String(study.form_identity.spelling || word),
        variants: (Array.isArray(study.form_identity.variants) ? study.form_identity.variants : []).map((variant) => ({
          id: String(variant?.variant_id || ''),
          pos: Array.isArray(variant?.pos) ? variant.pos.map(String) : [],
          learner_key: String(variant?.learner_key || ''),
          ipa: String(variant?.ipa || '')
        })),
        notes: formNotes,
        repair_target: repairTarget('form_identity', '', 'record.form_identity', word)
      }
    : formNotes.length
      ? {
          form_type: 'form_boundary',
          spelling: word,
          variants: [],
          notes: formNotes,
          repair_target: repairTarget('form_identity', '', 'record.form_identity', word)
        }
      : null;

  const family = (Array.isArray(study.word_family) ? study.word_family : []).map((item) => ({
    id: String(item?.fact_id || ''),
    target_word: String(item?.target_word || ''),
    lines: exactUniqueText([
      item?.meaning_cn,
      item?.definition_cn,
      item?.boundary,
      item?.learning_note,
      item?.shared_definition,
      item?.definition_en
    ])
  }));

  const coreMeaning = String(core.core_meaning_cn || core.mental_model_cn || '').trim();
  const decision = String(core.mental_model_cn || '').trim();

  const posOrder = ['V', 'A', 'N', 'ADV', 'PREP', 'INTJ', 'NUM'];
  const primaryCounts = {};
  const secondaryCounts = {};
  for (const sense of senses) {
    const bucket = sense.kind === 'secondary' ? secondaryCounts : primaryCounts;
    bucket[sense.pos_label] = (bucket[sense.pos_label] || 0) + 1;
  }
  const recallParts = [...new Set([...Object.keys(primaryCounts), ...Object.keys(secondaryCounts)])]
    .sort((a, b) => {
      const ai = posOrder.indexOf(a);
      const bi = posOrder.indexOf(b);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi) || a.localeCompare(b);
    })
    .map((code) => {
      const primary = primaryCounts[code] || 0;
      const secondary = secondaryCounts[code] || 0;
      if (primary && secondary) return `(${primary}+${secondary})${code}`;
      if (secondary) return `${secondary}${code}+`;
      return `${primary}${code}`;
    });

  return {
    schema: 'kianos.lexical.final_learner_object.v1',
    word_id: String(study.word_id || ''),
    word,
    word_feel: {
      core_cn: coreMeaning,
      decision_cn: decision && decision !== coreMeaning ? decision : '',
      repair_target: repairTarget('core', '', 'record.core_concept', coreMeaning || word)
    },
    senses,
    constructions,
    relations,
    form,
    family,
    recall_map: {
      parts: recallParts,
      density: senses.length > 1
        || constructions.length > 0
        || senses.some((sense) => sense.collocations.length > 0)
        ? 'rich'
        : 'light'
    }
  };
}
