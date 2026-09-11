import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { inspectReadingSources } from './current.mjs';

const repoRoot = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(process.cwd(), '..');

const SOURCE = Object.freeze({
  manifest: 'content/english/manifest.json',
  questionBank: 'content/english/source/question_bank.v1.json'
});

const TASK = Object.freeze({
  cloze: {
    env: 'KIANOS_CLOZE_SECTIONS',
    sectionMatch(section) {
      const value = normalizeToken(section);
      return /(^|_)cloze($|_)/.test(value);
    },
    idMatch(id) {
      return /(^|[-_:])cloze($|[-_:])/i.test(String(id || ''));
    }
  },
  reading_b: {
    env: 'KIANOS_READING_B_SECTIONS',
    sectionMatch(section) {
      const value = normalizeToken(section);
      return /reading.*(?:part_?b|_b)(?:_|$)/.test(value)
        || /^(?:reading_)?part_?b(?:_|$)/.test(value);
    },
    idMatch(id) {
      const value = String(id || '');
      return /(^|[-_:])reading[-_:](?:part[-_:])?b($|[-_:])/i.test(value)
        || /(^|[-_:])reading[-_:]part[-_:]?b($|[-_:])/i.test(value);
    }
  }
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

function answerOf(question) {
  return question?.answer ?? question?.formal_answer ?? question?.correct_answer ?? '';
}

function cleanOptionValue(value) {
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (!value || typeof value !== 'object') return '';
  const text = value.text ?? value.content ?? value.label_text ?? value.value ?? value.prompt;
  if (typeof text === 'string' || typeof text === 'number') return String(text);
  const clean = { ...value };
  ['answer', 'formal_answer', 'correct_answer', 'is_correct', 'correct', 'analysis', 'explanation', 'rationale', 'diagnosis'].forEach((key) => delete clean[key]);
  return clean;
}

function cleanOptions(options) {
  if (Array.isArray(options)) return options.map(cleanOptionValue);
  if (!options || typeof options !== 'object') return options;
  return Object.fromEntries(Object.entries(options).map(([key, value]) => [key, cleanOptionValue(value)]));
}

function attemptQuestion(question) {
  if (!question || typeof question !== 'object') return question;
  const clean = { ...question };
  [
    'answer', 'formal_answer', 'correct_answer', 'analysis', 'explanation', 'rationale',
    'canonical_evidence_sets', 'option_diagnosis', 'analysis_verification_status'
  ].forEach((key) => delete clean[key]);
  if (Object.prototype.hasOwnProperty.call(clean, 'options')) clean.options = cleanOptions(clean.options);
  return clean;
}

function textBlocks(value) {
  if (typeof value === 'string') {
    return value
      .split(/\n\s*\n/)
      .map((text) => text.trim())
      .filter(Boolean);
  }
  if (Array.isArray(value)) return value.flatMap(textBlocks);
  if (!value || typeof value !== 'object') return [];
  if (typeof value.text === 'string') return textBlocks(value.text);
  if (typeof value.raw_text === 'string') return textBlocks(value.raw_text);
  if (Array.isArray(value.sentences)) {
    const joined = value.sentences
      .map((sentence) => typeof sentence === 'string' ? sentence : String(sentence?.text || ''))
      .map((sentence) => sentence.trim())
      .filter(Boolean)
      .join(' ');
    return joined ? [joined] : [];
  }
  if (Array.isArray(value.paragraphs)) return value.paragraphs.flatMap(textBlocks);
  return [];
}

function materialForSet(set) {
  const context = set?.context || {};
  const sources = [
    set?.passage,
    set?.material,
    set?.text,
    context?.passage,
    context?.material,
    context?.raw_text,
    context?.text,
    context?.paragraphs,
    context?.segments
  ];
  for (const source of sources) {
    const blocks = textBlocks(source);
    if (blocks.length) return blocks.map((text, index) => ({ id: `m${index + 1}`, text }));
  }
  return [];
}

function optionEntries(options) {
  if (Array.isArray(options)) {
    return options.map((value, index) => {
      if (value && typeof value === 'object') {
        const label = String(value.label ?? value.id ?? value.option ?? String.fromCharCode(65 + index));
        return { label, text: String(cleanOptionValue(value) || '') };
      }
      return { label: String.fromCharCode(65 + index), text: String(value ?? '') };
    });
  }
  if (!options || typeof options !== 'object') return [];
  return Object.entries(options).map(([label, value]) => ({
    label: String(label),
    text: typeof cleanOptionValue(value) === 'string' ? cleanOptionValue(value) : JSON.stringify(cleanOptionValue(value))
  }));
}

function candidateInventory(set, questions) {
  const context = set?.context || {};
  const directSources = [
    set?.candidates,
    set?.options,
    set?.choices,
    context?.candidates,
    context?.options,
    context?.choices,
    context?.headings
  ];
  let entries = [];
  for (const source of directSources) {
    entries = optionEntries(source);
    if (entries.length) break;
  }
  if (!entries.length) {
    entries = questions.flatMap((question) => optionEntries(question?.options));
  }
  const seen = new Set();
  return entries.filter((entry) => {
    const key = `${entry.label}\u0000${entry.text}`;
    if (!entry.text || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
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
      questionIds: rows.flatMap((row) => (questionsBySet.get(String(row.id || '')) || []).map((q) => String(q?.id || q?.question_id || '')))
    }))
    .sort((a, b) => a.section.localeCompare(b.section));
}

function resolveTaskSections(bank, taskName) {
  const config = TASK[taskName];
  if (!config) throw new Error(`OBJECTIVE_TASK_UNKNOWN:${taskName}`);
  const inventory = sectionInventory(bank);
  const available = inventory.map((row) => row.section);
  const override = String(process.env[config.env] || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  if (override.length) {
    const missing = override.filter((section) => !available.includes(section));
    if (missing.length) {
      throw new Error(`OBJECTIVE_SECTION_OVERRIDE_INVALID:${taskName}:missing=${missing.join('|')}:available=${available.join('|')}`);
    }
    return { sections: override, inventory, mode: 'explicit-current-override' };
  }

  const candidates = inventory.filter((row) => {
    const nameEvidence = config.sectionMatch(row.section);
    const ids = [...row.setIds, ...row.questionIds];
    const idEvidence = ids.some((id) => config.idMatch(id));
    return nameEvidence || idEvidence;
  });

  if (!candidates.length) {
    throw new Error(`OBJECTIVE_SECTION_NOT_RESOLVED:${taskName}:available=${available.join('|')}`);
  }

  const suspicious = candidates.filter((row) => {
    const ids = [...row.setIds, ...row.questionIds].filter(Boolean);
    const idMatches = ids.filter((id) => config.idMatch(id)).length;
    return !config.sectionMatch(row.section) && ids.length > 0 && idMatches === 0;
  });
  if (suspicious.length) {
    throw new Error(`OBJECTIVE_SECTION_EVIDENCE_CONFLICT:${taskName}:${suspicious.map((row) => row.section).join('|')}`);
  }

  return {
    sections: candidates.map((row) => row.section),
    inventory,
    mode: 'current-evidence'
  };
}

const cache = new Map();

function snapshot(taskName) {
  if (cache.has(taskName)) return cache.get(taskName);
  const gate = inspectReadingSources();
  if (gate.status !== 'ready') {
    const failed = { status: gate.status, issues: gate.issues || [], missing: gate.missing || [], sections: [], inventory: [] };
    cache.set(taskName, failed);
    return failed;
  }

  try {
    const manifestText = readText(SOURCE.manifest);
    const bankText = readText(SOURCE.questionBank);
    const manifest = JSON.parse(manifestText);
    const bank = JSON.parse(bankText);
    const resolution = resolveTaskSections(bank, taskName);
    const selected = new Set(resolution.sections);
    const sets = (Array.isArray(bank.passage_or_sets) ? bank.passage_or_sets : [])
      .filter((row) => row?.id && selected.has(String(row?.section || '')))
      .sort((a, b) => String(a.id).localeCompare(String(b.id)));
    if (!sets.length) throw new Error(`OBJECTIVE_SET_NOT_FOUND:${taskName}:${resolution.sections.join('|')}`);

    const ready = {
      status: 'ready',
      issues: [],
      missing: [],
      taskName,
      manifest,
      bank,
      sets,
      sections: resolution.sections,
      sectionResolutionMode: resolution.mode,
      inventory: resolution.inventory,
      sourceHash: manifest.source_identity?.question_bank_sha256 || sha256(bankText)
    };
    cache.set(taskName, ready);
    return ready;
  } catch (error) {
    const issue = error instanceof Error ? error.message : String(error);
    let inventory = [];
    try {
      inventory = sectionInventory(JSON.parse(readText(SOURCE.questionBank)));
    } catch {}
    const failed = { status: 'invalid', issues: [issue], missing: [], sections: [], inventory };
    cache.set(taskName, failed);
    return failed;
  }
}

function questionsForSet(data, setId) {
  return (Array.isArray(data.bank.questions_or_prompts) ? data.bank.questions_or_prompts : [])
    .filter((row) => row?.set_id === setId)
    .sort((a, b) => Number(a?.ordinal || 0) - Number(b?.ordinal || 0));
}

function paperForSet(data, set) {
  return (Array.isArray(data.bank.papers) ? data.bank.papers : [])
    .find((paper) => paper?.id === set?.paper_id) || null;
}

function titleForSet(taskName, set, paper) {
  const context = set?.context || {};
  if (context?.title || set?.title) return context.title || set.title;
  const year = paper?.year ? `${paper.year}` : '';
  const label = taskName === 'cloze' ? 'Cloze' : 'Reading B';
  return [year, label].filter(Boolean).join(' · ') || set?.id || label;
}

function listSets(taskName) {
  const data = snapshot(taskName);
  if (data.status !== 'ready') return [];
  return data.sets.map((set, index) => {
    const paper = paperForSet(data, set);
    return {
      id: set.id,
      title: titleForSet(taskName, set, paper),
      paperId: set.paper_id || null,
      year: paper?.year || null,
      section: set.section,
      position: index + 1,
      total: data.sets.length
    };
  });
}

function loadById(taskName, objectId) {
  const data = snapshot(taskName);
  if (data.status !== 'ready') {
    throw new Error(`CURRENT_OBJECTIVE_SOURCE_NOT_READY:${taskName}:${data.status}:${[...(data.issues || []), ...(data.missing || [])].join(',')}`);
  }
  const index = data.sets.findIndex((row) => row.id === objectId);
  if (index < 0) throw new Error(`CURRENT_OBJECTIVE_SET_NOT_FOUND:${taskName}:${objectId}`);
  const set = data.sets[index];
  const paper = paperForSet(data, set);
  const sourceQuestions = questionsForSet(data, set.id);
  if (!sourceQuestions.length) throw new Error(`CURRENT_OBJECTIVE_QUESTIONS_NOT_FOUND:${taskName}:${set.id}`);
  const material = materialForSet(set);
  const questions = sourceQuestions.map(attemptQuestion);

  return {
    task: taskName,
    objectId: set.id,
    title: titleForSet(taskName, set, paper),
    paperId: set.paper_id || null,
    year: paper?.year || null,
    code: paper?.code || null,
    section: set.section,
    material,
    context: {
      instruction: String(set?.context?.instruction || set?.instruction || ''),
      subtitle: String(set?.context?.subtitle || '')
    },
    questions,
    candidates: candidateInventory(set, questions),
    navigation: {
      position: index + 1,
      total: data.sets.length,
      previousId: index > 0 ? data.sets[index - 1].id : null,
      nextId: index < data.sets.length - 1 ? data.sets[index + 1].id : null
    },
    sourcePaths: {
      questions: SOURCE.questionBank,
      manifest: SOURCE.manifest
    },
    sourceHashes: {
      questionOwner: data.sourceHash,
      renderedObject: sha256(stableJson({ set, questions: sourceQuestions }))
    },
    manifestStatus: data.manifest.status || '',
    sectionResolutionMode: data.sectionResolutionMode
  };
}

function answersById(taskName, objectId) {
  const data = snapshot(taskName);
  if (data.status !== 'ready') throw new Error(`CURRENT_OBJECTIVE_SOURCE_NOT_READY:${taskName}:${data.status}`);
  const set = data.sets.find((row) => row.id === objectId);
  if (!set) throw new Error(`CURRENT_OBJECTIVE_SET_NOT_FOUND:${taskName}:${objectId}`);
  const answers = {};
  questionsForSet(data, set.id).forEach((question) => {
    const id = String(question?.id || question?.question_id || '');
    if (!id) return;
    answers[id] = answerOf(question);
  });
  return {
    schema: 'kianos.english.objective_answers.v1',
    task: taskName,
    objectId: set.id,
    answers
  };
}

function loadDefault(taskName, envName) {
  const items = listSets(taskName);
  if (!items.length) {
    const data = snapshot(taskName);
    throw new Error(`CURRENT_OBJECTIVE_SOURCE_NOT_READY:${taskName}:${data.status}:${(data.issues || []).join(',')}`);
  }
  const preferred = process.env[envName];
  const selected = preferred && items.some((item) => item.id === preferred) ? preferred : items[0].id;
  return loadById(taskName, selected);
}

export function inspectObjectiveTask(taskName) {
  const data = snapshot(taskName);
  return {
    status: data.status,
    issues: [...(data.issues || [])],
    missing: [...(data.missing || [])],
    sections: [...(data.sections || [])],
    availableSections: (data.inventory || []).map((row) => ({ section: row.section, setCount: row.setCount })),
    sectionResolutionMode: data.sectionResolutionMode || ''
  };
}

export const listClozeSets = () => listSets('cloze');
export const loadClozeById = (id) => loadById('cloze', id);
export const loadClozeAnswersById = (id) => answersById('cloze', id);
export const loadDefaultCloze = () => loadDefault('cloze', 'KIANOS_CLOZE_SET_ID');

export const listReadingBSets = () => listSets('reading_b');
export const loadReadingBById = (id) => loadById('reading_b', id);
export const loadReadingBAnswersById = (id) => answersById('reading_b', id);
export const loadDefaultReadingB = () => loadDefault('reading_b', 'KIANOS_READING_B_SET_ID');
