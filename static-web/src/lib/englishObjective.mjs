import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { inspectReadingSources } from './current.mjs';

const repoRoot = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(process.cwd(), '..');

const SOURCE = Object.freeze({
  manifest: 'content/english/manifest.json',
  questionBank: 'content/english/source/question_bank.v1.json',
  readingBLayout: 'content/english/source/reading_b_layout.v1.json'
});

const ENGLISH_TASK_MAP_SCHEMA = 'kianos.english.task_map.v1';

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

function cleanWhitespace(value) {
  return String(value || '')
    .replace(/\r/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
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
      .map((text) => cleanWhitespace(text))
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

function optionEntries(options) {
  if (Array.isArray(options)) {
    return options.map((value, index) => {
      if (value && typeof value === 'object') {
        const label = String(value.label ?? value.id ?? value.option ?? String.fromCharCode(65 + index));
        return { label, text: cleanWhitespace(String(cleanOptionValue(value) || '')) };
      }
      return { label: String.fromCharCode(65 + index), text: cleanWhitespace(String(value ?? '')) };
    });
  }
  if (!options || typeof options !== 'object') return [];
  return Object.entries(options).map(([label, value]) => ({
    label: String(label),
    text: cleanWhitespace(typeof cleanOptionValue(value) === 'string' ? cleanOptionValue(value) : JSON.stringify(cleanOptionValue(value)))
  }));
}

function readingBSectionRaw(set) {
  const raw = String(set?.context?.raw_text || set?.raw_text || '');
  if (!raw) return '';
  const matches = [...raw.matchAll(/Directions\s*:?\s*/gi)];
  const relevant = matches.find((match) => /(?:Questions?|questions?)\s*4\s*1\s*[-–—]?\s*4\s*5|4\s*1\s*[-–—]\s*4\s*5/.test(raw.slice(match.index, match.index + 1400)));
  if (relevant) return raw.slice(relevant.index).trim();
  return raw.trim();
}

function directionsFromRaw(raw) {
  const text = String(raw || '');
  const match = text.match(/^Directions\s*:?\s*([\s\S]*?)(?:\n\s*\n)/i);
  return cleanWhitespace(match?.[1] || '').replace(/\n/g, ' ');
}

function afterDirections(raw) {
  const text = String(raw || '');
  const match = text.match(/^Directions\s*:?\s*[\s\S]*?\n\s*\n/i);
  return match ? text.slice(match[0].length).trim() : text.trim();
}

function bracketCandidates(raw) {
  const text = String(raw || '');
  const matches = [...text.matchAll(/^\s*\[\s*([A-H])\s*\]\s*/gm)];
  return matches.map((match, index) => {
    const start = Number(match.index || 0) + match[0].length;
    const end = index + 1 < matches.length ? Number(matches[index + 1].index || text.length) : text.length;
    return { label: match[1], text: cleanWhitespace(text.slice(start, end)).replace(/\n/g, ' ') };
  }).filter((entry) => entry.text);
}

function headingCandidates(raw) {
  const entries = [...String(raw || '').matchAll(/^\s*([A-H])\.\s+(.+?)\s*$/gm)]
    .map((match) => ({ label: match[1], text: cleanWhitespace(match[2]) }))
    .filter((entry) => entry.text);
  return entries.length >= 5 ? entries.slice(0, 8) : [];
}

function sourceCandidateEntries(set, taskForm) {
  const context = set?.context || {};
  const directSources = [set?.candidates, set?.options, set?.choices, context?.candidates, context?.options, context?.choices, context?.shared_option_pool, context?.headings];
  for (const source of directSources) {
    const entries = optionEntries(source);
    const meaningful = entries.length >= 5 && entries.some((entry) => normalizeToken(entry.text) !== normalizeToken(entry.label));
    if (meaningful) return entries;
  }
  const raw = afterDirections(readingBSectionRaw(set));
  if (taskForm === 'heading_match') {
    const headings = headingCandidates(raw);
    if (headings.length) return headings;
  }
  const bracketed = bracketCandidates(raw);
  return bracketed.length ? bracketed : [];
}

function candidateInventory(set, questions, taskForm) {
  let entries = sourceCandidateEntries(set, taskForm);
  if (!entries.length) entries = questions.flatMap((question) => optionEntries(question?.options));
  const seen = new Set();
  return entries.filter((entry) => {
    const key = `${entry.label}\u0000${entry.text}`;
    if (!entry.text || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function readingBTaskForm(groupType, directions) {
  const value = String(groupType || '').trim().toUpperCase();
  if (value === 'GAP_MATCHING') return 'gap_match';
  if (value === 'HEADING_MATCHING') return 'heading_match';
  if (value === 'PARAGRAPH_ORDERING') return 'ordering';
  if (value === 'OTHER' && /comments?.*statements?|numbered name/i.test(String(directions || ''))) return 'comment_match';
  return 'generic_matching';
}

function readingBCandidatePolicy(directions, taskForm) {
  const text = String(directions || '').toLowerCase();
  if (/may be used more than once|can be used more than once|may be chosen more than once/.test(text)) return 'repeat_allowed';
  if (/two extra (?:choices|headings)|one paragraph which does not fit|paragraphs? .* correctly placed/.test(text)) return 'single_use';
  if (['ordering', 'heading_match', 'gap_match', 'comment_match'].includes(taskForm)) return 'single_use';
  return 'source_unspecified';
}

function readingBItemLabel(taskForm) {
  if (taskForm === 'gap_match') return 'Gap';
  if (taskForm === 'heading_match') return 'Paragraph';
  if (taskForm === 'ordering') return 'Slot';
  if (taskForm === 'comment_match') return 'Comment';
  return 'Item';
}

function readingBFormLabel(taskForm) {
  return ({
    gap_match: 'Gap Matching',
    heading_match: 'Heading Matching',
    ordering: 'Paragraph Ordering',
    comment_match: 'Comment–Statement Matching',
    generic_matching: 'Matching'
  })[taskForm] || 'Matching';
}

function commentTargetLabels(raw) {
  const labels = new Map();
  for (const match of String(raw || '').matchAll(/\(\s*(4[1-5])\s*\)\s*([^\n:_]{1,80})(?::|\n)/g)) {
    const name = cleanWhitespace(match[2]).replace(/[_—-]+$/g, '').trim();
    if (name) labels.set(match[1], name);
  }
  return labels;
}

function readingBMaterial(set, taskForm) {
  const context = set?.context || {};
  const explicit = [set?.passage, set?.material, set?.text, context?.passage, context?.material, context?.text, context?.paragraphs, context?.segments];
  for (const source of explicit) {
    const blocks = textBlocks(source);
    if (blocks.length) return blocks.map((text, index) => ({ id: `m${index + 1}`, text }));
  }

  if (taskForm === 'ordering') return [];
  const raw = afterDirections(readingBSectionRaw(set));
  let body = raw;
  if (taskForm === 'heading_match') {
    const headingLines = [...raw.matchAll(/^\s*([A-H])\.\s+(.+?)\s*$/gm)].slice(0, 8);
    if (headingLines.length >= 5) {
      const last = headingLines[headingLines.length - 1];
      const lastLineEnd = raw.indexOf('\n', Number(last.index || 0));
      body = raw.slice(lastLineEnd >= 0 ? lastLineEnd + 1 : Number(last.index || 0) + last[0].length).trim();
    }
  } else {
    const firstCandidate = raw.search(/^\s*\[\s*A\s*\]\s*/m);
    if (firstCandidate > 0) body = raw.slice(0, firstCandidate).trim();
  }
  return textBlocks(body).map((text, index) => ({ id: `m${index + 1}`, text }));
}

function taskContextForSet(taskName, set, layoutObject = null) {
  const context = set?.context || {};
  if (taskName !== 'reading_b') {
    return {
      instruction: String(context?.instruction || set?.instruction || ''),
      subtitle: String(context?.subtitle || '')
    };
  }

  const sectionRaw = readingBSectionRaw(set);
  const directions = cleanWhitespace(context?.directions || set?.directions || directionsFromRaw(sectionRaw)).replace(/\n/g, ' ');
  const questionGroupType = String(context?.question_group_type || layoutObject?.question_group_type || '').trim().toUpperCase();
  const taskForm = readingBTaskForm(questionGroupType, directions);
  const sourceSkeleton = Array.isArray(context?.ordering_skeleton) ? context.ordering_skeleton.map(String) : [];
  const layoutSkeleton = Array.isArray(layoutObject?.ordering_skeleton) ? layoutObject.ordering_skeleton.map(String) : [];
  const orderingSkeleton = taskForm === 'ordering' ? (sourceSkeleton.length ? sourceSkeleton : layoutSkeleton) : [];
  const fixedGivens = taskForm === 'ordering'
    ? (Array.isArray(layoutObject?.fixed_givens) ? layoutObject.fixed_givens.map(String) : orderingSkeleton.filter((token) => /^[A-H]$/.test(token)))
    : [];

  return {
    directions,
    questionGroupType,
    taskForm,
    formLabel: readingBFormLabel(taskForm),
    candidateUsePolicy: readingBCandidatePolicy(directions, taskForm),
    itemLabel: readingBItemLabel(taskForm),
    orderingSkeleton,
    fixedGivens
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
      questionIds: rows.flatMap((row) => (questionsBySet.get(String(row.id || '')) || []).map((q) => String(q?.id || q?.question_id || '')))
    }))
    .sort((a, b) => a.section.localeCompare(b.section));
}

function resolveTaskSections(bank, manifest, taskName) {
  const map = manifest?.final_learner_objects?.task_map;
  if (map?.schema !== ENGLISH_TASK_MAP_SCHEMA || !map?.tasks || typeof map.tasks !== 'object') {
    throw new Error('OBJECTIVE_TASK_MAP_NOT_READY');
  }

  const task = map.tasks[taskName];
  if (!task || !Array.isArray(task.sections) || task.sections.length < 1) {
    throw new Error(`OBJECTIVE_TASK_IDENTITY_MISSING:${taskName}`);
  }

  const sections = task.sections.map((value) => String(value || '').trim()).filter(Boolean);
  if (!sections.length || new Set(sections).size !== sections.length) {
    throw new Error(`OBJECTIVE_TASK_IDENTITY_INVALID:${taskName}`);
  }

  const inventory = sectionInventory(bank);
  const available = inventory.map((row) => row.section);
  const missing = sections.filter((section) => !available.includes(section));
  if (missing.length) {
    throw new Error(`OBJECTIVE_TASK_SECTION_MISSING:${taskName}:missing=${missing.join('|')}:available=${available.join('|')}`);
  }

  return { sections, inventory, mode: 'content-owned-task-map' };
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
    let readingBLayout = { objects: {} };
    let readingBLayoutHash = '';

    if (taskName === 'reading_b') {
      if (manifest?.source?.reading_b_layout !== SOURCE.readingBLayout || !fs.existsSync(absolute(SOURCE.readingBLayout))) {
        throw new Error('READING_B_LAYOUT_OWNER_NOT_READY');
      }
      const layoutText = readText(SOURCE.readingBLayout);
      readingBLayout = JSON.parse(layoutText);
      readingBLayoutHash = sha256(layoutText);
    }

    const resolution = resolveTaskSections(bank, manifest, taskName);
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
      readingBLayout,
      readingBLayoutHash,
      sections: resolution.sections,
      sectionResolutionMode: resolution.mode,
      inventory: resolution.inventory,
      sourceHash: manifest.source_identity?.question_bank_sha256 || sha256(bankText)
    };
    cache.set(taskName, ready);
    return ready;
  } catch (error) {
    const issue = error instanceof Error ? error.message : String(error);
    const failed = { status: 'invalid', issues: [issue], missing: [], sections: [], inventory: [] };
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
  return (Array.isArray(data.bank.papers) ? data.bank.papers : []).find((paper) => paper?.id === set?.paper_id) || null;
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
    return { id: set.id, title: titleForSet(taskName, set, paper), paperId: set.paper_id || null, year: paper?.year || null, section: set.section, position: index + 1, total: data.sets.length };
  });
}

function loadById(taskName, objectId) {
  const data = snapshot(taskName);
  if (data.status !== 'ready') throw new Error(`CURRENT_OBJECTIVE_SOURCE_NOT_READY:${taskName}:${data.status}:${[...(data.issues || []), ...(data.missing || [])].join(',')}`);
  const index = data.sets.findIndex((row) => row.id === objectId);
  if (index < 0) throw new Error(`CURRENT_OBJECTIVE_SET_NOT_FOUND:${taskName}:${objectId}`);
  const set = data.sets[index];
  const paper = paperForSet(data, set);
  const sourceQuestions = questionsForSet(data, set.id);
  if (!sourceQuestions.length) throw new Error(`CURRENT_OBJECTIVE_QUESTIONS_NOT_FOUND:${taskName}:${set.id}`);

  const layoutObject = taskName === 'reading_b' ? data.readingBLayout?.objects?.[set.id] || null : null;
  const context = taskContextForSet(taskName, set, layoutObject);
  if (taskName === 'reading_b' && context.taskForm === 'ordering' && !context.orderingSkeleton.length) {
    throw new Error(`READING_B_ORDERING_SKELETON_MISSING:${set.id}`);
  }

  const targetNames = taskName === 'reading_b' && context.taskForm === 'comment_match'
    ? commentTargetLabels(readingBSectionRaw(set))
    : new Map();
  const questions = sourceQuestions.map((question) => ({
    ...attemptQuestion(question),
    displayLabel: targetNames.get(String(question?.ordinal || '')) || ''
  }));
  const material = taskName === 'reading_b' ? readingBMaterial(set, context.taskForm) : (() => {
    const sources = [set?.passage, set?.material, set?.text, set?.context?.passage, set?.context?.material, set?.context?.raw_text, set?.context?.text, set?.context?.paragraphs, set?.context?.segments];
    for (const source of sources) {
      const blocks = textBlocks(source);
      if (blocks.length) return blocks.map((text, blockIndex) => ({ id: `m${blockIndex + 1}`, text }));
    }
    return [];
  })();
  const candidates = taskName === 'reading_b'
    ? candidateInventory(set, questions, context.taskForm)
    : candidateInventory(set, questions, 'generic_matching');

  if (taskName === 'reading_b' && candidates.length < 5) throw new Error(`READING_B_CANDIDATE_TEXT_NOT_RESOLVED:${set.id}:${candidates.length}`);

  return {
    task: taskName,
    objectId: set.id,
    title: titleForSet(taskName, set, paper),
    paperId: set.paper_id || null,
    year: paper?.year || null,
    code: paper?.code || null,
    section: set.section,
    material,
    context,
    questions,
    candidates,
    navigation: {
      position: index + 1,
      total: data.sets.length,
      previousId: index > 0 ? data.sets[index - 1].id : null,
      nextId: index < data.sets.length - 1 ? data.sets[index + 1].id : null
    },
    sourcePaths: {
      questions: SOURCE.questionBank,
      manifest: SOURCE.manifest,
      ...(taskName === 'reading_b' ? { readingBLayout: SOURCE.readingBLayout } : {})
    },
    sourceHashes: {
      questionOwner: data.sourceHash,
      ...(taskName === 'reading_b' ? { readingBLayout: data.readingBLayoutHash } : {}),
      renderedObject: sha256(stableJson({ set, layoutObject, questions: sourceQuestions }))
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
    if (id) answers[id] = answerOf(question);
  });
  return { schema: 'kianos.english.objective_answers.v1', task: taskName, objectId: set.id, answers };
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