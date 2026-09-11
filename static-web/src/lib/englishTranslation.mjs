import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(process.cwd(), '..');

const SOURCE = Object.freeze({
  manifest: 'content/english/manifest.json',
  questionBank: 'content/english/source/question_bank.v1.json',
  contract: 'content/english/modules/translation.md'
});

function absolute(relativePath) {
  return path.join(repoRoot, relativePath);
}

function readText(relativePath) {
  return fs.readFileSync(absolute(relativePath), 'utf8');
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function stableJson(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(',')}}`;
}

function normalizeToken(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function textBlocks(value) {
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value)
      .split(/\n\s*\n/)
      .map((text) => text.trim())
      .filter(Boolean);
  }
  if (Array.isArray(value)) return value.flatMap(textBlocks);
  if (!value || typeof value !== 'object') return [];
  if (typeof value.text === 'string') return textBlocks(value.text);
  if (typeof value.content === 'string') return textBlocks(value.content);
  if (typeof value.raw_text === 'string') return textBlocks(value.raw_text);
  if (Array.isArray(value.sentences)) {
    const joined = value.sentences
      .map((sentence) => typeof sentence === 'string' ? sentence : String(sentence?.text || sentence?.content || ''))
      .map((sentence) => sentence.trim())
      .filter(Boolean)
      .join(' ');
    return joined ? [joined] : [];
  }
  if (Array.isArray(value.paragraphs)) return value.paragraphs.flatMap(textBlocks);
  if (Array.isArray(value.segments)) return value.segments.flatMap(textBlocks);
  return [];
}

function firstText(...values) {
  for (const value of values) {
    const blocks = textBlocks(value);
    if (blocks.length) return blocks.join('\n\n');
  }
  return '';
}

function materialForSet(set) {
  const context = set?.context || {};
  const sources = [
    set?.passage,
    set?.material,
    set?.source_text,
    set?.source,
    set?.english_text,
    set?.english,
    set?.text,
    context?.passage,
    context?.material,
    context?.source_text,
    context?.source,
    context?.english_text,
    context?.english,
    context?.raw_text,
    context?.text,
    context?.paragraphs,
    context?.segments,
    context?.sentences
  ];
  for (const source of sources) {
    const blocks = textBlocks(source);
    if (blocks.length) return blocks.map((text, index) => ({ id: `m${index + 1}`, text }));
  }
  return [];
}

function referenceText(value) {
  if (typeof value === 'string' || typeof value === 'number') return String(value).trim();
  if (Array.isArray(value)) return value.map(referenceText).filter(Boolean).join('\n');
  if (!value || typeof value !== 'object') return '';
  return firstText(
    value.text,
    value.content,
    value.reference_translation,
    value.translation,
    value.chinese_translation,
    value.answer,
    value.value
  );
}

function referenceResolution(row) {
  const context = row?.context || {};
  const candidates = [
    ['formal_answer', row?.formal_answer],
    ['correct_answer', row?.correct_answer],
    ['reference_translation', row?.reference_translation],
    ['translation', row?.translation],
    ['chinese_translation', row?.chinese_translation],
    ['model_answer', row?.model_answer],
    ['reference_answer', row?.reference_answer],
    ['target_text', row?.target_text],
    ['answer', row?.answer],
    ['analysis.reference_translation', row?.analysis?.reference_translation],
    ['context.formal_answer', context?.formal_answer],
    ['context.reference_translation', context?.reference_translation],
    ['context.translation', context?.translation],
    ['context.chinese_translation', context?.chinese_translation],
    ['context.model_answer', context?.model_answer],
    ['context.target_text', context?.target_text],
    ['context.answer', context?.answer]
  ];
  for (const [source, candidate] of candidates) {
    const text = referenceText(candidate);
    if (text) {
      const verification = source === 'analysis.reference_translation'
        ? row?.analysis?.reference_translation_verification || null
        : null;
      return {
        text,
        available: true,
        status: verification?.status || row?.analysis?.analysis_status || 'available',
        source,
        official: verification?.official ?? null,
        semanticRule: verification?.semantic_rule || ''
      };
    }
  }
  return {
    text: '',
    available: false,
    status: row?.analysis?.analysis_status || row?.qa_state || row?.seal_state || 'missing_reference',
    source: '',
    official: null,
    semanticRule: ''
  };
}

function instructionOf(row) {
  const context = row?.context || {};
  return firstText(row?.instruction, row?.directive, context?.instruction, context?.directive);
}

function sourceTextOf(row) {
  const context = row?.context || {};
  return firstText(
    row?.source_text,
    row?.source,
    row?.english_text,
    row?.english,
    row?.text,
    row?.stem,
    row?.prompt,
    row?.question,
    row?.content,
    context?.source_text,
    context?.source,
    context?.english_text,
    context?.english,
    context?.text,
    context?.prompt,
    context?.question
  );
}

function publicPrompt(row, index, setId) {
  return {
    id: String(row?.id || row?.question_id || `${setId}:segment-${index + 1}`),
    ordinal: Number(row?.ordinal || index + 1),
    instruction: instructionOf(row),
    sourceText: sourceTextOf(row)
  };
}

function sectionInventory(bank) {
  const sets = Array.isArray(bank?.passage_or_sets) ? bank.passage_or_sets : [];
  const questions = Array.isArray(bank?.questions_or_prompts) ? bank.questions_or_prompts : [];
  const questionsBySet = new Map();
  questions.forEach((question) => {
    const setId = String(question?.set_id || '');
    if (!setId) return;
    if (!questionsBySet.has(setId)) questionsBySet.set(setId, []);
    questionsBySet.get(setId).push(question);
  });
  const sections = new Map();
  sets.forEach((set) => {
    const section = String(set?.section || '').trim();
    if (!section || !set?.id) return;
    if (!sections.has(section)) sections.set(section, []);
    sections.get(section).push(set);
  });
  return [...sections.entries()]
    .map(([section, rows]) => ({
      section,
      setCount: rows.length,
      setIds: rows.map((row) => String(row.id || '')),
      promptIds: rows.flatMap((row) => (questionsBySet.get(String(row.id || '')) || []).map((q) => String(q?.id || q?.question_id || '')))
    }))
    .sort((a, b) => a.section.localeCompare(b.section));
}

function sectionMatch(section) {
  return /(^|_)translation($|_)/.test(normalizeToken(section));
}

function idMatch(id) {
  return /(^|[-_:])translation($|[-_:])/i.test(String(id || ''));
}

function resolveTranslationSections(bank) {
  const inventory = sectionInventory(bank);
  const available = inventory.map((row) => row.section);
  const override = String(process.env.KIANOS_TRANSLATION_SECTIONS || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  if (override.length) {
    const missing = override.filter((section) => !available.includes(section));
    if (missing.length) {
      throw new Error(`TRANSLATION_SECTION_OVERRIDE_INVALID:missing=${missing.join('|')}:available=${available.join('|')}`);
    }
    return { sections: override, inventory, mode: 'explicit-current-override' };
  }

  const candidates = inventory.filter((row) => {
    const ids = [...row.setIds, ...row.promptIds];
    return sectionMatch(row.section) || ids.some(idMatch);
  });
  if (!candidates.length) {
    throw new Error(`TRANSLATION_SECTION_NOT_RESOLVED:available=${available.join('|')}`);
  }
  return {
    sections: candidates.map((row) => row.section),
    inventory,
    mode: 'current-evidence'
  };
}

let cache;

function snapshot() {
  if (cache) return cache;
  const required = [SOURCE.manifest, SOURCE.questionBank, SOURCE.contract];
  const missing = required.filter((relativePath) => !fs.existsSync(absolute(relativePath)));
  if (missing.length) {
    cache = { status: 'missing', missing, issues: [], sections: [], inventory: [] };
    return cache;
  }

  try {
    const manifestText = readText(SOURCE.manifest);
    const bankText = readText(SOURCE.questionBank);
    const manifest = JSON.parse(manifestText);
    const bank = JSON.parse(bankText);
    const issues = [];
    const expectedHash = String(manifest?.source_identity?.question_bank_sha256 || '');
    const actualHash = sha256(bankText);
    if (manifest?.status !== 'CURRENT_READY') issues.push('MANIFEST_NOT_CURRENT_READY');
    if (manifest?.runtime_contract?.legacy_fallback !== false) issues.push('MANIFEST_LEGACY_FALLBACK_NOT_DISABLED');
    if (manifest?.owners?.question_bank !== SOURCE.questionBank) issues.push('MANIFEST_QUESTION_BANK_OWNER_MISMATCH');
    if (!expectedHash) issues.push('MANIFEST_QUESTION_BANK_HASH_MISSING');
    if (expectedHash && expectedHash !== actualHash) issues.push('QUESTION_BANK_HASH_MISMATCH');
    if (issues.length) {
      cache = { status: 'invalid', missing: [], issues, sections: [], inventory: sectionInventory(bank) };
      return cache;
    }

    const resolution = resolveTranslationSections(bank);
    const selected = new Set(resolution.sections);
    const sets = (Array.isArray(bank?.passage_or_sets) ? bank.passage_or_sets : [])
      .filter((row) => row?.id && selected.has(String(row?.section || '')))
      .sort((a, b) => String(a.id).localeCompare(String(b.id)));
    if (!sets.length) throw new Error(`TRANSLATION_SET_NOT_FOUND:${resolution.sections.join('|')}`);

    cache = {
      status: 'ready',
      missing: [],
      issues: [],
      manifest,
      bank,
      sets,
      sections: resolution.sections,
      inventory: resolution.inventory,
      sectionResolutionMode: resolution.mode,
      sourceHash: expectedHash || actualHash
    };
    return cache;
  } catch (error) {
    cache = {
      status: 'invalid',
      missing: [],
      issues: [error instanceof Error ? error.message : String(error)],
      sections: [],
      inventory: []
    };
    return cache;
  }
}

function promptsForSet(data, set) {
  const rows = (Array.isArray(data?.bank?.questions_or_prompts) ? data.bank.questions_or_prompts : [])
    .filter((row) => String(row?.set_id || '') === String(set?.id || ''))
    .sort((a, b) => Number(a?.ordinal || 0) - Number(b?.ordinal || 0));
  return rows.length ? rows : [set];
}

function paperForSet(data, set) {
  return (Array.isArray(data?.bank?.papers) ? data.bank.papers : [])
    .find((paper) => String(paper?.id || '') === String(set?.paper_id || '')) || null;
}

function titleForSet(set, paper) {
  const context = set?.context || {};
  const explicit = String(context?.title || set?.title || '').trim();
  if (explicit) return explicit;
  return [paper?.year ? String(paper.year) : '', 'Translation'].filter(Boolean).join(' · ') || String(set?.id || 'Translation');
}

function referenceCoverageForSet(data, set) {
  const rows = promptsForSet(data, set);
  const resolved = rows.map(referenceResolution);
  const available = resolved.filter((row) => row.available).length;
  return {
    available,
    total: rows.length,
    missing: rows.length - available,
    complete: rows.length > 0 && available === rows.length
  };
}

function allReferenceGaps(data) {
  return data.sets.flatMap((set) => promptsForSet(data, set).flatMap((row, index) => {
    const resolved = referenceResolution(row);
    if (resolved.available) return [];
    return [{
      setId: String(set.id),
      id: String(row?.id || row?.question_id || `${set.id}:segment-${index + 1}`),
      ordinal: Number(row?.ordinal || index + 1),
      status: resolved.status
    }];
  }));
}

export function inspectTranslationSources() {
  const data = snapshot();
  const gaps = data.status === 'ready' ? allReferenceGaps(data) : [];
  const completeSetCount = data.status === 'ready'
    ? data.sets.filter((set) => referenceCoverageForSet(data, set).complete).length
    : 0;
  return {
    status: data.status,
    issues: [...(data.issues || [])],
    missing: [...(data.missing || [])],
    sections: [...(data.sections || [])],
    availableSections: (data.inventory || []).map((row) => ({ section: row.section, setCount: row.setCount })),
    sectionResolutionMode: data.sectionResolutionMode || '',
    setCount: data.status === 'ready' ? data.sets.length : 0,
    completeReferenceSetCount: completeSetCount,
    partialReferenceSetCount: data.status === 'ready' ? data.sets.length - completeSetCount : 0,
    referenceGaps: gaps
  };
}

export function listTranslationSets() {
  const data = snapshot();
  if (data.status !== 'ready') return [];
  return data.sets.map((set, index) => {
    const paper = paperForSet(data, set);
    const referenceCoverage = referenceCoverageForSet(data, set);
    return {
      id: String(set.id),
      title: titleForSet(set, paper),
      paperId: set.paper_id || null,
      year: paper?.year || null,
      section: String(set.section || ''),
      position: index + 1,
      total: data.sets.length,
      referenceCoverage
    };
  });
}

export function loadTranslationById(objectId) {
  const data = snapshot();
  if (data.status !== 'ready') {
    throw new Error(`CURRENT_TRANSLATION_SOURCE_NOT_READY:${data.status}:${[...(data.issues || []), ...(data.missing || [])].join(',')}`);
  }
  const index = data.sets.findIndex((row) => String(row.id) === String(objectId));
  if (index < 0) throw new Error(`CURRENT_TRANSLATION_SET_NOT_FOUND:${objectId}`);
  const set = data.sets[index];
  const paper = paperForSet(data, set);
  const sourceRows = promptsForSet(data, set);
  const prompts = sourceRows.map((row, rowIndex) => publicPrompt(row, rowIndex, String(set.id)));
  const material = materialForSet(set);
  const context = set?.context || {};

  return {
    task: 'translation',
    objectId: String(set.id),
    title: titleForSet(set, paper),
    paperId: set.paper_id || null,
    year: paper?.year || null,
    code: paper?.code || null,
    section: String(set.section || ''),
    material,
    prompts,
    referenceCoverage: referenceCoverageForSet(data, set),
    context: {
      instruction: firstText(set?.instruction, context?.instruction),
      subtitle: firstText(context?.subtitle)
    },
    navigation: {
      position: index + 1,
      total: data.sets.length,
      previousId: index > 0 ? String(data.sets[index - 1].id) : null,
      nextId: index < data.sets.length - 1 ? String(data.sets[index + 1].id) : null
    },
    sourcePaths: {
      questions: SOURCE.questionBank,
      manifest: SOURCE.manifest,
      contract: SOURCE.contract
    },
    sourceHashes: {
      questionOwner: data.sourceHash,
      renderedObject: sha256(stableJson({ set, prompts: sourceRows }))
    },
    manifestStatus: data.manifest?.status || '',
    sectionResolutionMode: data.sectionResolutionMode
  };
}

export function loadTranslationReferencesById(objectId) {
  const data = snapshot();
  if (data.status !== 'ready') throw new Error(`CURRENT_TRANSLATION_SOURCE_NOT_READY:${data.status}`);
  const set = data.sets.find((row) => String(row.id) === String(objectId));
  if (!set) throw new Error(`CURRENT_TRANSLATION_SET_NOT_FOUND:${objectId}`);
  const rows = promptsForSet(data, set);
  const references = rows.map((row, index) => {
    const resolved = referenceResolution(row);
    return {
      id: String(row?.id || row?.question_id || `${set.id}:segment-${index + 1}`),
      ordinal: Number(row?.ordinal || index + 1),
      ...resolved
    };
  });
  return {
    schema: 'kianos.english.translation_reference.v1',
    task: 'translation',
    objectId: String(set.id),
    availableCount: references.filter((row) => row.available).length,
    totalCount: references.length,
    missingCount: references.filter((row) => !row.available).length,
    references
  };
}

export function loadDefaultTranslation() {
  const items = listTranslationSets();
  if (!items.length) {
    const data = snapshot();
    throw new Error(`CURRENT_TRANSLATION_SOURCE_NOT_READY:${data.status}:${(data.issues || []).join(',')}`);
  }
  const preferred = process.env.KIANOS_TRANSLATION_SET_ID;
  const selected = preferred && items.some((item) => item.id === preferred) ? preferred : items[0].id;
  return loadTranslationById(selected);
}
