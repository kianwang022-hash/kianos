import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(process.cwd(), '..');

export const SOURCE = Object.freeze({
  manifest: 'content/english/manifest.json',
  provenance: 'content/english/provenance.json',
  questionBank: 'content/english/source/question_bank.v1.json',
  contract: 'content/english/modules/writing/learning.md'
});

export const WRITING_SOURCE_BOUNDARY = Object.freeze({
  schema: 'kianos.english.writing.source-boundary.v1',
  sections: Object.freeze({
    writing_part_a: Object.freeze({
      kind: 'small',
      yearStart: 2005,
      yearEnd: 2026,
      setCount: 22,
      promptCount: 22,
      setIdForYear: (year) => `english1-${year}-writing-a-main`,
      promptIdForYear: (year) => `english1-${year}-writing-a-main-prompt`
    }),
    writing_part_b: Object.freeze({
      kind: 'big',
      yearStart: 2000,
      yearEnd: 2026,
      setCount: 27,
      promptCount: 27,
      setIdForYear: (year) => `english1-${year}-writing-b-main`,
      promptIdForYear: (year) => `english1-${year}-writing-b-main-prompt`
    })
  })
});

const FORBIDDEN_LEARNER_KEYS = new Set([
  'answer',
  'answers',
  'analysis',
  'explanation',
  'solution',
  'reference',
  'reference_answer',
  'sample_answer',
  'model_answer',
  'taxonomy',
  'qa_state',
  'seal_state',
  'chat_source_decision_binding'
]);

const LEARNER_CONTEXT_KEYS = [
  'title',
  'subtitle',
  'task_background',
  'directions',
  'images',
  'instruction',
  'directive'
];

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

function looksLikeWriting(value) {
  const token = normalizeToken(value);
  return /(^|_)(writing|composition|essay)($|_)/.test(token);
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
  if (Array.isArray(value.sentences)) return value.sentences.flatMap(textBlocks);
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

function instructionOf(row) {
  const context = row?.context || {};
  return firstText(
    row?.instruction,
    row?.directive,
    row?.stem,
    row?.question,
    context?.instruction,
    context?.directive,
    context?.stem,
    context?.question
  );
}

function sourceTextOf(row) {
  const context = row?.context || {};
  return firstText(
    row?.prompt,
    row?.source_text,
    row?.source,
    row?.material,
    row?.passage,
    row?.text,
    row?.content,
    context?.prompt,
    context?.source_text,
    context?.source,
    context?.material,
    context?.passage,
    context?.raw_text,
    context?.text,
    context?.content
  );
}

function cloneLearnerSafe(value) {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) return value.map(cloneLearnerSafe);
  if (typeof value !== 'object') return value;
  const out = {};
  for (const [key, child] of Object.entries(value)) {
    if (FORBIDDEN_LEARNER_KEYS.has(String(key).toLowerCase())) continue;
    out[key] = cloneLearnerSafe(child);
  }
  return out;
}

function learnerContextOf(set) {
  const context = set?.context && typeof set.context === 'object' ? set.context : {};
  const out = {};
  for (const key of LEARNER_CONTEXT_KEYS) {
    if (context[key] === undefined || context[key] === null) continue;
    out[key] = cloneLearnerSafe(context[key]);
  }
  return out;
}

function materialForSet(set) {
  const context = set?.context || {};
  const blocks = [
    set?.material,
    set?.passage,
    set?.source_text,
    set?.source,
    set?.prompt,
    set?.text,
    set?.content,
    context?.material,
    context?.passage,
    context?.source_text,
    context?.source,
    context?.prompt,
    context?.raw_text,
    context?.text,
    context?.content,
    context?.paragraphs,
    context?.segments
  ];
  for (const value of blocks) {
    const rows = textBlocks(value);
    if (rows.length) return rows.map((text, index) => ({ id: `m${index + 1}`, text }));
  }
  return [];
}

function sectionInventory(bank) {
  const sets = Array.isArray(bank?.passage_or_sets) ? bank.passage_or_sets : [];
  const questions = Array.isArray(bank?.questions_or_prompts) ? bank.questions_or_prompts : [];
  const questionsBySet = new Map();
  for (const question of questions) {
    const setId = String(question?.set_id || '');
    if (!questionsBySet.has(setId)) questionsBySet.set(setId, []);
    questionsBySet.get(setId).push(question);
  }
  const sections = new Map();
  for (const set of sets) {
    const section = String(set?.section || '').trim();
    if (!section || !set?.id) continue;
    if (!sections.has(section)) sections.set(section, []);
    sections.get(section).push(set);
  }
  return [...sections.entries()]
    .map(([section, rows]) => ({
      section,
      setCount: rows.length,
      setIds: rows.map((row) => String(row.id || '')),
      promptIds: rows.flatMap((row) => (questionsBySet.get(String(row.id || '')) || []).map((q) => String(q?.id || q?.question_id || '')))
    }))
    .sort((a, b) => a.section.localeCompare(b.section));
}

function expectedYears(spec) {
  return Array.from({ length: spec.yearEnd - spec.yearStart + 1 }, (_, index) => spec.yearStart + index);
}

function promptRowsForSet(bank, set) {
  return (Array.isArray(bank?.questions_or_prompts) ? bank.questions_or_prompts : [])
    .filter((row) => String(row?.set_id || '') === String(set?.id || ''))
    .sort((a, b) => Number(a?.ordinal || 0) - Number(b?.ordinal || 0));
}

function paperForSet(bank, set) {
  return (Array.isArray(bank?.papers) ? bank.papers : [])
    .find((paper) => String(paper?.id || '') === String(set?.paper_id || '')) || null;
}

function kindFor(set) {
  const spec = WRITING_SOURCE_BOUNDARY.sections[String(set?.section || '')];
  return spec?.kind || 'unknown';
}

function titleForSet(set, paper) {
  const context = set?.context || {};
  const explicit = String(context?.title || set?.title || '').trim();
  if (explicit) return explicit;
  const label = kindFor(set) === 'small' ? 'Small Writing' : kindFor(set) === 'big' ? 'Big Writing' : 'Writing';
  return [paper?.year ? String(paper.year) : '', label].filter(Boolean).join(' · ') || String(set?.id || label);
}

function publicPrompt(row) {
  return {
    id: String(row?.id || row?.question_id || ''),
    ordinal: Number(row?.ordinal || 0),
    instruction: instructionOf(row),
    promptText: sourceTextOf(row)
  };
}

function promptProjection(bank, set) {
  const rows = promptRowsForSet(bank, set);
  const prompts = rows.map(publicPrompt);
  const material = materialForSet(set);
  const context = learnerContextOf(set);
  const promptReady = prompts.length === 1
    && Boolean(prompts[0].id)
    && Boolean(prompts[0].instruction || prompts[0].promptText);
  return { rows, prompts, material, context, sourceReady: promptReady };
}

function collectForbiddenPaths(value, prefix = '') {
  if (value === null || value === undefined || typeof value !== 'object') return [];
  if (Array.isArray(value)) {
    return value.flatMap((child, index) => collectForbiddenPaths(child, `${prefix}[${index}]`));
  }
  const hits = [];
  for (const [key, child] of Object.entries(value)) {
    const next = prefix ? `${prefix}.${key}` : key;
    if (FORBIDDEN_LEARNER_KEYS.has(String(key).toLowerCase())) hits.push(next);
    hits.push(...collectForbiddenPaths(child, next));
  }
  return hits;
}

function validateBoundary(bank) {
  const sets = Array.isArray(bank?.passage_or_sets) ? bank.passage_or_sets : [];
  const inventory = sectionInventory(bank);
  const actualWritingSections = inventory
    .filter((row) => looksLikeWriting(row.section) || [...row.setIds, ...row.promptIds].some(looksLikeWriting))
    .map((row) => row.section)
    .sort();
  const expectedWritingSections = Object.keys(WRITING_SOURCE_BOUNDARY.sections).sort();
  const checks = {
    exactWritingSections: JSON.stringify(actualWritingSections) === JSON.stringify(expectedWritingSections),
    exactSectionCoverage: true,
    oneStablePromptPerSet: true,
    exactStableIdPattern: true,
    noDuplicateWritingSetIds: true,
    noDuplicateWritingPromptIds: true,
    cleanAttemptProjection: true,
    requiredTaskContextPreserved: true
  };
  const issues = [];
  const selectedSets = [];
  const seenSetIds = new Set();
  const seenPromptIds = new Set();

  if (!checks.exactWritingSections) {
    issues.push(`WRITING_SECTION_BOUNDARY_DRIFT:expected=${expectedWritingSections.join('|')}:actual=${actualWritingSections.join('|')}`);
  }

  for (const [section, spec] of Object.entries(WRITING_SOURCE_BOUNDARY.sections)) {
    const sectionSets = sets.filter((set) => String(set?.section || '') === section);
    const years = sectionSets
      .map((set) => Number(paperForSet(bank, set)?.year || 0))
      .sort((a, b) => a - b);
    const expected = expectedYears(spec);
    const promptCount = sectionSets.reduce((sum, set) => sum + promptRowsForSet(bank, set).length, 0);
    if (sectionSets.length !== spec.setCount || promptCount !== spec.promptCount || JSON.stringify(years) !== JSON.stringify(expected)) {
      checks.exactSectionCoverage = false;
      issues.push(`WRITING_SECTION_COVERAGE_DRIFT:${section}:sets=${sectionSets.length}/${spec.setCount}:prompts=${promptCount}/${spec.promptCount}:years=${years.join(',')}`);
    }

    for (const set of sectionSets) {
      selectedSets.push(set);
      const paper = paperForSet(bank, set);
      const year = Number(paper?.year || 0);
      const setId = String(set?.id || '');
      const rows = promptRowsForSet(bank, set);
      if (!setId || seenSetIds.has(setId)) checks.noDuplicateWritingSetIds = false;
      seenSetIds.add(setId);
      if (setId !== spec.setIdForYear(year)) {
        checks.exactStableIdPattern = false;
        issues.push(`WRITING_SET_ID_DRIFT:${section}:${year}:${setId}`);
      }
      if (rows.length !== 1) {
        checks.oneStablePromptPerSet = false;
        issues.push(`WRITING_PROMPT_CARDINALITY:${setId}:${rows.length}`);
        continue;
      }
      const row = rows[0];
      const promptId = String(row?.id || row?.question_id || '');
      if (!promptId || seenPromptIds.has(promptId)) checks.noDuplicateWritingPromptIds = false;
      seenPromptIds.add(promptId);
      if (promptId !== spec.promptIdForYear(year) || String(row?.set_id || '') !== setId || String(row?.section || '') !== section) {
        checks.exactStableIdPattern = false;
        issues.push(`WRITING_PROMPT_ID_OR_BINDING_DRIFT:${setId}:${promptId}`);
      }

      const projection = {
        material: materialForSet(set),
        context: learnerContextOf(set),
        prompts: rows.map(publicPrompt)
      };
      const forbidden = collectForbiddenPaths(projection);
      if (forbidden.length) {
        checks.cleanAttemptProjection = false;
        issues.push(`WRITING_ATTEMPT_PROJECTION_LEAK:${setId}:${forbidden.join('|')}`);
      }
      if (!projection.prompts[0]?.id || !(projection.prompts[0]?.instruction || projection.prompts[0]?.promptText)) {
        checks.cleanAttemptProjection = false;
        issues.push(`WRITING_ATTEMPT_PROMPT_EMPTY:${setId}`);
      }

      const sourceContext = set?.context && typeof set.context === 'object' ? set.context : {};
      for (const key of ['task_background', 'directions', 'images']) {
        if (sourceContext[key] !== undefined && sourceContext[key] !== null && projection.context[key] === undefined) {
          checks.requiredTaskContextPreserved = false;
          issues.push(`WRITING_CONTEXT_DROPPED:${setId}:${key}`);
        }
      }
    }
  }

  if (!checks.noDuplicateWritingSetIds) issues.push('WRITING_SET_ID_MISSING_OR_DUPLICATE');
  if (!checks.noDuplicateWritingPromptIds) issues.push('WRITING_PROMPT_ID_MISSING_OR_DUPLICATE');

  return { checks, issues, inventory, selectedSets };
}

let cache;

function snapshot() {
  if (cache) return cache;
  const required = [SOURCE.manifest, SOURCE.provenance, SOURCE.questionBank, SOURCE.contract];
  const missing = required.filter((relativePath) => !fs.existsSync(absolute(relativePath)));
  if (missing.length) {
    cache = { status: 'missing', missing, issues: [], sections: [], inventory: [], checks: {} };
    return cache;
  }

  try {
    const manifestText = readText(SOURCE.manifest);
    const provenanceText = readText(SOURCE.provenance);
    const bankText = readText(SOURCE.questionBank);
    const manifest = JSON.parse(manifestText);
    const provenance = JSON.parse(provenanceText);
    const bank = JSON.parse(bankText);
    const issues = [];
    const expectedManifestHash = String(manifest?.source_identity?.question_bank_sha256 || '');
    const expectedProvenanceHash = String(provenance?.source_materialization?.question_bank?.sha256 || '');
    const actualHash = sha256(bankText);
    const ownerChecks = {
      manifestCurrentReady: manifest?.status === 'CURRENT_READY',
      manifestLegacyFallbackDisabled: manifest?.runtime_boundary?.legacy_fallback === false,
      manifestQuestionBankOwnerExact: manifest?.source?.question_bank === SOURCE.questionBank,
      manifestWritingOwnerExact: manifest?.knowledge_and_learning_content?.writing === SOURCE.contract,
      provenanceQuestionBankOwnerExact: provenance?.source_materialization?.question_bank?.owner_path === SOURCE.questionBank,
      manifestHashMatchesBytes: Boolean(expectedManifestHash) && expectedManifestHash === actualHash,
      provenanceHashMatchesBytes: Boolean(expectedProvenanceHash) && expectedProvenanceHash === actualHash,
      manifestAndProvenanceHashAgree: Boolean(expectedManifestHash) && expectedManifestHash === expectedProvenanceHash
    };
    for (const [name, pass] of Object.entries(ownerChecks)) {
      if (!pass) issues.push(name);
    }

    const boundary = validateBoundary(bank);
    issues.push(...boundary.issues);
    const checks = { ...ownerChecks, ...boundary.checks };
    const status = Object.values(checks).every(Boolean) ? 'ready' : 'invalid';

    cache = {
      status,
      missing: [],
      issues,
      checks,
      manifest,
      provenance,
      bank,
      sets: boundary.selectedSets.sort((a, b) => {
        const paperA = paperForSet(bank, a);
        const paperB = paperForSet(bank, b);
        const yearDelta = Number(paperB?.year || 0) - Number(paperA?.year || 0);
        if (yearDelta) return yearDelta;
        return String(a.section).localeCompare(String(b.section));
      }),
      sections: Object.keys(WRITING_SOURCE_BOUNDARY.sections),
      inventory: boundary.inventory,
      sourceHash: actualHash
    };
    return cache;
  } catch (error) {
    cache = {
      status: 'invalid',
      missing: [],
      issues: [error instanceof Error ? error.message : String(error)],
      sections: [],
      inventory: [],
      checks: {}
    };
    return cache;
  }
}

export function inspectWritingSources() {
  const data = snapshot();
  const projected = data.status === 'ready' ? data.sets.map((set) => promptProjection(data.bank, set)) : [];
  const kindCounts = { small: 0, big: 0, unknown: 0 };
  if (data.status === 'ready') {
    for (const set of data.sets) kindCounts[kindFor(set)] += 1;
  }
  return {
    status: data.status,
    sourceGate: data.status === 'ready' ? 'S_PASS' : 'S_BLOCKED',
    issues: [...(data.issues || [])],
    missing: [...(data.missing || [])],
    checks: { ...(data.checks || {}) },
    sections: [...(data.sections || [])],
    availableSections: (data.inventory || []).map((row) => ({ section: row.section, setCount: row.setCount, promptCount: row.promptIds.length })),
    setCount: data.status === 'ready' ? data.sets.length : 0,
    promptCount: data.status === 'ready' ? data.sets.reduce((sum, set) => sum + promptRowsForSet(data.bank, set).length, 0) : 0,
    sourceReadySetCount: projected.filter((row) => row.sourceReady).length,
    blockedSetCount: projected.filter((row) => !row.sourceReady).length,
    kindCounts,
    yearsBySection: data.status === 'ready'
      ? Object.fromEntries(Object.entries(WRITING_SOURCE_BOUNDARY.sections).map(([section]) => [
          section,
          data.sets
            .filter((set) => String(set.section) === section)
            .map((set) => Number(paperForSet(data.bank, set)?.year || 0))
            .sort((a, b) => a - b)
        ]))
      : {},
    sourceHash: data.sourceHash || ''
  };
}

export function listWritingTasks() {
  const data = snapshot();
  if (data.status !== 'ready') return [];
  return data.sets.map((set, index) => {
    const paper = paperForSet(data.bank, set);
    const projection = promptProjection(data.bank, set);
    return {
      id: String(set.id),
      title: titleForSet(set, paper),
      paperId: set.paper_id || null,
      year: paper?.year || null,
      section: String(set.section || ''),
      kind: kindFor(set),
      sourceReady: projection.sourceReady,
      position: index + 1,
      total: data.sets.length
    };
  });
}

export function loadWritingById(objectId) {
  const data = snapshot();
  if (data.status !== 'ready') {
    throw new Error(`CURRENT_WRITING_SOURCE_NOT_READY:${data.status}:${[...(data.issues || []), ...(data.missing || [])].join(',')}`);
  }
  const index = data.sets.findIndex((row) => String(row.id) === String(objectId));
  if (index < 0) throw new Error(`CURRENT_WRITING_SET_NOT_FOUND:${objectId}`);
  const set = data.sets[index];
  const paper = paperForSet(data.bank, set);
  const projection = promptProjection(data.bank, set);
  const publicObject = {
    task: 'writing',
    objectId: String(set.id),
    title: titleForSet(set, paper),
    paperId: set.paper_id || null,
    year: paper?.year || null,
    code: paper?.code || null,
    section: String(set.section || ''),
    kind: kindFor(set),
    material: projection.material,
    prompts: projection.prompts,
    sourceReady: projection.sourceReady,
    context: projection.context,
    navigation: {
      position: index + 1,
      total: data.sets.length,
      previousId: index > 0 ? String(data.sets[index - 1].id) : null,
      nextId: index < data.sets.length - 1 ? String(data.sets[index + 1].id) : null
    },
    sourcePaths: {
      questions: SOURCE.questionBank,
      manifest: SOURCE.manifest,
      provenance: SOURCE.provenance,
      contract: SOURCE.contract
    },
    sourceHashes: {
      questionOwner: data.sourceHash,
      renderedObject: sha256(stableJson({ set, prompts: projection.rows }))
    },
    manifestStatus: data.manifest?.status || ''
  };
  const forbidden = collectForbiddenPaths(publicObject);
  if (forbidden.length) throw new Error(`CURRENT_WRITING_PROJECTION_LEAK:${forbidden.join('|')}`);
  return publicObject;
}
