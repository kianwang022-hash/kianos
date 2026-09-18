export const LEXICAL_FINAL_WORD_OBJECT_SCHEMA = 'kianos.lexical.final_word_object.v1';

const array = (value) => Array.isArray(value) ? value : [];
const text = (value) => String(value || '').trim();
const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));

const normalizePhrase = (value = '') => String(value || '')
  .toLowerCase()
  .replace(/[’']/g, "'")
  .replace(/\s+/g, ' ')
  .trim();

const posCode = (value = '') => {
  const pos = String(value).toLowerCase();
  if (pos.startsWith('verb') || pos === 'v') return 'V';
  if (pos.startsWith('adj') || pos === 'a') return 'A';
  if (pos.startsWith('noun') || pos === 'n') return 'N';
  if (pos.startsWith('adv')) return 'ADV';
  if (pos.startsWith('prep')) return 'PREP';
  if (pos.startsWith('interj')) return 'INTJ';
  if (pos.startsWith('numeral')) return 'NUM';
  return String(value || 'S').toUpperCase();
};

const target = ({ kind, id = null, locator = null, label = '' } = {}) => ({
  kind: text(kind) || 'lexical',
  id: id ? String(id) : null,
  locator: locator ? String(locator) : null,
  label: text(label)
});

const overlayText = (overlay = {}) => text(
  overlay.note || overlay.label_cn || overlay.label_en || overlay.boundary ||
  overlay.identity_type || overlay.canonical_form || 'Form / identity distinction'
);

const escapeRegExp = (value = '') => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const skeletonize = (value = '', word = '') => {
  const source = text(value);
  const activeWord = text(word);
  if (!source || !activeWord) return source;
  return source.replace(new RegExp(`\\b${escapeRegExp(activeWord)}\\b`, 'gi'), '~');
};

const relationLead = (relation = {}) => text(
  relation.boundary ||
  (Array.isArray(relation.boundaries) ? relation.boundaries[0] : '') ||
  relation.learning_note ||
  relation.shared_core ||
  relation.shared_meaning
);

const relationExtraBoundaries = (relation = {}) => {
  const lead = relationLead(relation);
  const candidates = [
    ...array(relation.boundaries),
    relation.learning_note,
    relation.shared_core,
    relation.shared_meaning
  ].map(text).filter(Boolean);
  return [...new Set(candidates)].filter((item) => item !== lead).slice(0, 2);
};

const relationDifferences = (relation = {}) => {
  const difference = array(relation.source_evidence_objects)
    .find((item) => item?.difference && typeof item.difference === 'object')?.difference;
  if (!difference) return [];
  return Object.entries(difference)
    .filter(([, value]) => Boolean(value))
    .slice(0, 4)
    .map(([key, value]) => ({ key: String(key).replaceAll('_', ' '), value: String(value) }));
};

const acceptedSecondarySense = (branch, activeSenseIds) =>
  ['verified', 'semantic_auditor_verified'].includes(String(branch?.verification_status || '')) &&
  ['publishable', 'codex_reviewed', 'published'].includes(String(branch?.publication_status || '')) &&
  (!branch?.source_sense_id || !activeSenseIds.has(String(branch.source_sense_id)));

const acceptedConstruction = (construction, sensePhraseKeys) =>
  (!construction?.verification_status || ['verified', 'semantic_auditor_verified'].includes(String(construction.verification_status))) &&
  !construction?.presentation_merge?.surviving_object_id &&
  !sensePhraseKeys.has(normalizePhrase(construction?.pattern || construction?.boundary || ''));

const acceptedFamily = (item) =>
  (!item?.verification_status || ['verified', 'semantic_auditor_verified'].includes(String(item.verification_status))) &&
  (!item?.publication_status || ['publishable', 'codex_reviewed', 'published'].includes(String(item.publication_status))) &&
  Boolean(item?.target_word);

const acceptedRelation = (relation, kind) => {
  if (kind === 'confusable') return true;
  const priority = String(relation?.priority || relation?.tier || '').toUpperCase();
  const learningValue = Number(relation?.learning_value_score || 0);
  return ['S', 'A'].includes(priority) || learningValue >= 8.5;
};

function buildSense(sense, index, word) {
  const collocations = array(sense?.collocations)
    .map((item, collocationIndex) => {
      if (!item?.phrase) return null;
      const fixedPattern = item.exam_value === 'fixed_pattern';
      return {
        phrase: text(item.phrase),
        meaningCn: text(item.meaning_cn),
        fixedPattern,
        target: fixedPattern ? target({
          kind: 'collocation',
          id: item.collocation_id || null,
          locator: `record.senses[${index}].collocations[${collocationIndex}]`,
          label: item.phrase || word
        }) : null
      };
    })
    .filter(Boolean);

  const identityOverlay = sense?.lexical_identity_overlay
    ? {
        text: overlayText(sense.lexical_identity_overlay),
        target: target({
          kind: 'form_identity',
          locator: `record.senses[${index}].lexical_identity_overlay`,
          label: overlayText(sense.lexical_identity_overlay)
        })
      }
    : null;

  return {
    senseId: text(sense?.sense_id),
    posCode: posCode(sense?.pos),
    governingPattern: text(sense?.governing_pattern),
    definitionCn: text(sense?.definition_cn),
    definitionEn: text(sense?.definition_en),
    usageNote: text(sense?.usage_note),
    identityOverlay,
    collocations,
    target: target({
      kind: 'sense',
      id: sense?.sense_id || null,
      locator: `record.senses[${index}]`,
      label: sense?.definition_cn || sense?.definition_en || word
    })
  };
}

function buildSecondarySense(branch, index, word) {
  return {
    posCode: posCode(branch?.pos),
    definitionCn: text(branch?.definition_cn || branch?.meaning_cn),
    definitionEn: text(branch?.definition_en || branch?.label_en),
    pattern: text(branch?.pattern || branch?.boundary),
    target: target({
      kind: 'secondary_sense',
      id: branch?.fact_id || branch?.source_sense_id || null,
      locator: `record.secondary_senses[${index}]`,
      label: branch?.definition_cn || branch?.meaning_cn || branch?.definition_en || branch?.label_en || word
    })
  };
}

function buildConstruction(item, index, word) {
  return {
    meaningCn: text(item?.meaning_cn || item?.definition_cn),
    label: text(item?.pattern || item?.boundary || item?.label_en),
    definitionEn: text(item?.definition_en),
    target: target({
      kind: 'construction',
      id: item?.fact_id || item?.construction_id || null,
      locator: `record.constructions[${index}]`,
      label: item?.pattern || item?.boundary || item?.label_en || word
    })
  };
}

function buildRelation(relation, locator, word) {
  return {
    targetExpression: text(relation?.target_expression || relation?.target_word || relation?.module || 'contrast'),
    lead: relationLead(relation),
    extraBoundaries: relationExtraBoundaries(relation),
    differences: relationDifferences(relation),
    target: target({
      kind: 'relation',
      id: relation?.fact_id || relation?.relation_id || null,
      locator,
      label: relation?.target_expression || relation?.target_word || relation?.module || word
    })
  };
}

function buildFormIdentity(formIdentity, word) {
  if (!formIdentity || typeof formIdentity !== 'object') return null;
  const boundaries = array(formIdentity.boundaries).map((boundary) => ({
    surface: text(boundary?.surface),
    condition: text(boundary?.condition),
    note: text(boundary?.note)
  }));
  const variants = array(formIdentity.variants).map((variant) => ({
    learnerKey: text(variant?.learner_key || variant?.canonical_form || variant?.variant_id),
    ipa: text(variant?.ipa),
    pos: array(variant?.pos).map(String)
  }));
  return {
    boundary: text(formIdentity.boundary),
    boundaries,
    variants,
    target: target({
      kind: 'form_identity',
      locator: 'record.form_identity',
      label: formIdentity.boundary || boundaries.map((row) => row.surface).filter(Boolean).join(' / ') || word
    })
  };
}

function recallParts(senses, secondarySenses) {
  const order = ['V', 'A', 'N', 'ADV', 'PREP', 'INTJ', 'NUM'];
  const count = (rows) => rows.reduce((acc, item) => {
    const code = item.posCode || 'S';
    acc[code] = (acc[code] || 0) + 1;
    return acc;
  }, {});
  const primaryCounts = count(senses);
  const secondaryCounts = count(secondarySenses);
  return [...new Set([...Object.keys(primaryCounts), ...Object.keys(secondaryCounts)])]
    .sort((a, b) => {
      const ai = order.indexOf(a);
      const bi = order.indexOf(b);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi) || a.localeCompare(b);
    })
    .map((code) => {
      const primary = primaryCounts[code] || 0;
      const hidden = secondaryCounts[code] || 0;
      if (primary && hidden) return `(${primary}+${hidden})${code}`;
      if (hidden) return `${hidden}${code}+`;
      return `${primary}${code}`;
    });
}

function recallPatterns(word, senses, secondarySenses, constructions) {
  const values = [];
  for (const construction of constructions) {
    const pattern = skeletonize(construction.label, word);
    if (pattern) values.push(pattern);
  }
  for (const sense of senses) {
    for (const collocation of sense.collocations) {
      if (!collocation.fixedPattern) continue;
      const pattern = skeletonize(collocation.phrase, word);
      if (pattern) values.push(pattern);
    }
  }
  for (const branch of secondarySenses) {
    const pattern = skeletonize(branch.pattern, word);
    if (pattern) values.push(pattern);
  }
  return [...new Set(values)].slice(0, 5);
}

export function buildLexicalFinalWordObject({ objectId, ordinal, record } = {}) {
  if (!record || typeof record !== 'object') throw new Error('LEXICAL_FINAL_OBJECT_RECORD_REQUIRED');
  const word = text(record.word);
  if (!objectId || !Number.isInteger(Number(ordinal)) || !word) throw new Error('LEXICAL_FINAL_OBJECT_IDENTITY_INVALID');

  const rawSenses = array(record.senses);
  const activeSenseIds = new Set(rawSenses.map((sense) => text(sense?.sense_id)).filter(Boolean));
  const senses = rawSenses.map((sense, index) => buildSense(sense, index, word));

  const secondarySenses = array(record.secondary_senses)
    .map((branch, index) => ({ branch, index }))
    .filter(({ branch }) => acceptedSecondarySense(branch, activeSenseIds))
    .map(({ branch, index }) => buildSecondarySense(branch, index, word));

  const sensePhraseKeys = new Set(
    rawSenses.flatMap((sense) => array(sense?.collocations)
      .filter((item) => item?.phrase)
      .map((item) => normalizePhrase(item.phrase)))
  );

  const constructions = array(record.constructions)
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => acceptedConstruction(item, sensePhraseKeys))
    .map(({ item, index }) => buildConstruction(item, index, word));

  const relations = [
    ...array(record.semantic_neighbors).map((relation, index) => ({
      relation,
      kind: 'relation',
      locator: `record.semantic_neighbors[${index}]`
    })),
    ...array(record.confusables).map((relation, index) => ({
      relation,
      kind: 'confusable',
      locator: `record.confusables[${index}]`
    }))
  ]
    .filter(({ relation, kind }) => acceptedRelation(relation, kind))
    .map(({ relation, locator }) => buildRelation(relation, locator, word));

  const formIdentity = buildFormIdentity(record.form_identity, word);
  const familyCandidates = array(record.word_family)
    .filter(acceptedFamily)
    .map((item) => ({ targetWord: text(item?.target_word), boundary: text(item?.boundary) }));

  const hasImportantExpansion = constructions.length > 0 || relations.length > 0 || Boolean(formIdentity);
  const family = hasImportantExpansion ? familyCandidates : [];
  const expansionModuleCount = [
    constructions.length > 0,
    relations.length > 0,
    Boolean(formIdentity),
    family.length > 0
  ].filter(Boolean).length;
  const expansionWeight = expansionModuleCount >= 3 ? 'rich' : expansionModuleCount === 1 ? 'light' : 'standard';

  const coreRaw = record.core_concept || {};
  const primaryCn = text(coreRaw.core_meaning_cn || coreRaw.mental_model_cn) || '—';
  const mentalModel = text(coreRaw.mental_model_cn);
  const secondaryCn = mentalModel && mentalModel !== primaryCn ? mentalModel : '';
  const english = text(coreRaw.core_meaning_en);

  const object = {
    schema: LEXICAL_FINAL_WORD_OBJECT_SCHEMA,
    objectId: String(objectId),
    ordinal: Number(ordinal),
    word,
    core: {
      primaryCn,
      secondaryCn,
      english,
      target: target({
        kind: 'core',
        locator: 'record.core_concept',
        label: coreRaw.core_meaning_cn || coreRaw.mental_model_cn || coreRaw.core_meaning_en || word
      })
    },
    senses,
    secondarySenses,
    expansion: {
      hasImportant: hasImportantExpansion,
      weight: expansionWeight,
      constructions,
      relations,
      formIdentity,
      family
    }
  };

  object.recall = {
    parts: recallParts(senses, secondarySenses),
    patterns: recallPatterns(word, senses, secondarySenses, constructions),
    hasDeepBranches: secondarySenses.length > 0
  };
  object.summary = {
    objectId: object.objectId,
    ordinal: object.ordinal,
    word: object.word,
    coreCn: object.core.primaryCn === '—' ? '' : object.core.primaryCn,
    coreEn: object.core.english,
    senseCount: object.senses.length + object.secondarySenses.length,
    promptCount: object.recall.patterns.length + object.expansion.relations.length
  };
  return object;
}

export function validateLexicalFinalWordObject(object) {
  if (object?.schema !== LEXICAL_FINAL_WORD_OBJECT_SCHEMA) throw new Error('LEXICAL_FINAL_OBJECT_SCHEMA_INVALID');
  if (!object?.objectId || !Number.isInteger(object?.ordinal) || !object?.word) throw new Error('LEXICAL_FINAL_OBJECT_IDENTITY_INVALID');
  if (!object?.core || !Array.isArray(object?.senses) || !Array.isArray(object?.secondarySenses)) throw new Error('LEXICAL_FINAL_OBJECT_BODY_INVALID');
  if (!object?.expansion || !Array.isArray(object.expansion.constructions) || !Array.isArray(object.expansion.relations)) throw new Error('LEXICAL_FINAL_OBJECT_EXPANSION_INVALID');
  if (!object?.recall || !Array.isArray(object.recall.parts) || !Array.isArray(object.recall.patterns)) throw new Error('LEXICAL_FINAL_OBJECT_RECALL_INVALID');
  return true;
}

export function cloneLexicalFinalWordObject(object) {
  validateLexicalFinalWordObject(object);
  return clone(object);
}
