import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(process.cwd(), '..');

const CURRENT = Object.freeze({
  manifest: 'content/politics/manifest.json',
  continuation: 'content/politics/continuation.json',
  interaction: 'content/politics/INTERACTION_CONTRACT.md',
  regions: 'content/politics/source/politics_unified_regions.v1.jsonl',
  nodes: 'content/politics/source/source_node_registry.v2.jsonl',
  questions: 'content/politics/source/xiao_2027_questions.jsonl',
  marxCh01: 'content/politics/learning/marxism/ch01.json'
});

function absolute(relativePath) {
  return path.join(repoRoot, relativePath);
}

function readText(relativePath) {
  return fs.readFileSync(absolute(relativePath), 'utf8');
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function parseJsonl(relativePath) {
  return readText(relativePath)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function findObjectContainingExactString(value, target) {
  if (!value || typeof value !== 'object') return null;
  const values = Array.isArray(value) ? value : Object.values(value);
  if (values.some((entry) => typeof entry === 'string' && entry === target)) return value;
  for (const entry of values) {
    const match = findObjectContainingExactString(entry, target);
    if (match) return match;
  }
  return null;
}

function stringifyTextValue(value) {
  if (typeof value === 'string') return value.trim();
  if (Array.isArray(value)) {
    return value.map(stringifyTextValue).filter(Boolean).join('\n\n');
  }
  if (!value || typeof value !== 'object') return '';
  if (typeof value.text === 'string') return value.text.trim();
  if (typeof value.content === 'string') return value.content.trim();
  const parts = [];
  for (const [key, entry] of Object.entries(value)) {
    if (/^(id|.*_id|.*_ref|.*_refs|path|sha|sha256|hash|role|type|kind|status|subject|page|page_no|ordinal|order|source)$/i.test(key)) continue;
    const text = stringifyTextValue(entry);
    if (text) parts.push(text);
  }
  return parts.join('\n\n');
}

function bestText(object) {
  if (!object || typeof object !== 'object') return '';
  const directKeys = [
    'source_text', 'raw_text', 'plain_text', 'node_text', 'markdown',
    'content', 'body', 'text', 'paragraphs', 'paragraph', 'value'
  ];
  for (const key of directKeys) {
    const text = stringifyTextValue(object[key]);
    if (text && text.length > 1) return text;
  }
  return '';
}

function bestTitle(object, fallback = '') {
  if (!object || typeof object !== 'object') return fallback;
  for (const key of ['title', 'heading', 'label', 'name']) {
    if (typeof object[key] === 'string' && object[key].trim()) return object[key].trim();
  }
  return fallback;
}

function resolveJsonlObjects(relativePath, ids) {
  const wanted = [...new Set((ids || []).filter(Boolean))];
  if (!wanted.length) return new Map();
  const unresolved = new Set(wanted);
  const result = new Map();
  const lines = readText(relativePath).split(/\r?\n/);

  for (const raw of lines) {
    if (!raw || ![...unresolved].some((id) => raw.includes(id))) continue;
    let row;
    try { row = JSON.parse(raw); } catch { continue; }
    for (const id of [...unresolved]) {
      if (!raw.includes(id)) continue;
      const object = findObjectContainingExactString(row, id) || row;
      result.set(id, object);
      unresolved.delete(id);
    }
    if (!unresolved.size) break;
  }
  return result;
}

function sourceNodeView(id, object) {
  const text = bestText(object);
  return {
    id,
    title: bestTitle(object, id),
    text,
    resolved: Boolean(text)
  };
}

function normalizeOptionLabel(value, index) {
  const raw = String(value ?? '').trim();
  if (/^[A-D]$/i.test(raw)) return raw.toUpperCase();
  return String.fromCharCode(65 + index);
}

function normalizeOptions(value, object) {
  if (Array.isArray(value)) {
    return value.map((entry, index) => {
      if (typeof entry === 'string') return { label: normalizeOptionLabel('', index), text: entry.trim() };
      const label = entry?.label ?? entry?.key ?? entry?.option ?? entry?.id ?? '';
      const text = entry?.text ?? entry?.content ?? entry?.value ?? entry?.body ?? '';
      return { label: normalizeOptionLabel(label, index), text: String(text || '').trim() };
    }).filter((option) => option.text);
  }
  if (value && typeof value === 'object') {
    return Object.entries(value).map(([key, entry], index) => ({
      label: normalizeOptionLabel(key, index),
      text: String(typeof entry === 'string' ? entry : entry?.text ?? entry?.content ?? entry?.value ?? '').trim()
    })).filter((option) => option.text);
  }
  const found = [];
  for (const label of ['A', 'B', 'C', 'D']) {
    const candidates = [object?.[`option_${label.toLowerCase()}`], object?.[`option${label}`], object?.[label]];
    const text = candidates.find((entry) => typeof entry === 'string' && entry.trim());
    if (text) found.push({ label, text: text.trim() });
  }
  return found;
}

function normalizeAnswer(value) {
  if (Array.isArray(value)) return value.map(normalizeAnswer).filter(Boolean).join('');
  if (value && typeof value === 'object') {
    return normalizeAnswer(value.label ?? value.key ?? value.answer ?? value.value ?? '');
  }
  const raw = String(value ?? '').toUpperCase();
  const letters = raw.match(/[A-D]/g);
  return letters ? [...new Set(letters)].sort().join('') : raw.trim();
}

function questionView(id, object) {
  const stemKeys = ['question_text', 'stem', 'question', 'prompt', 'title', 'text', 'content'];
  let stem = '';
  for (const key of stemKeys) {
    if (typeof object?.[key] === 'string' && object[key].trim()) {
      stem = object[key].trim();
      break;
    }
  }
  const options = normalizeOptions(object?.options ?? object?.choices ?? object?.option_list, object);
  const answer = normalizeAnswer(
    object?.official_answer ?? object?.correct_answer ?? object?.answer ?? object?.correct ?? object?.key ?? ''
  );
  const explanation = String(
    object?.explanation ?? object?.analysis ?? object?.official_explanation ?? object?.rationale ?? ''
  ).trim();
  return { id, stem, options, answer, explanation, resolved: Boolean(stem && options.length && answer) };
}

function fallbackBoundaries(unit) {
  const values = [];
  if (typeof unit?.key_boundary === 'string') values.push(unit.key_boundary);
  if (Array.isArray(unit?.major_boundaries)) values.push(...unit.major_boundaries);
  if (typeof unit?.boundary === 'string') values.push(unit.boundary);
  return values.filter(Boolean);
}

export function loadPoliticsPilot() {
  const required = Object.values(CURRENT);
  const missing = required.filter((relativePath) => !fs.existsSync(absolute(relativePath)));
  if (missing.length) return { status: 'missing', missing, required };

  const manifest = readJson(CURRENT.manifest);
  const continuation = readJson(CURRENT.continuation);
  const chapter = readJson(CURRENT.marxCh01);
  const regionRows = parseJsonl(CURRENT.regions);
  const regionById = new Map(regionRows.map((row) => [row.unified_region_id, row]));

  const allSourceRefs = [];
  const allQuestionIds = [];
  const units = (chapter.unit_projections || []).map((unit) => {
    const region = regionById.get(unit.region_id) || regionRows.find((row) => row.natural_unit_id === unit.natural_unit_id) || null;
    const sourceRefs = [...new Set(region?.chengfeng_refs || [])];
    const questionIds = [...new Set(region?.xiao_question_refs || [])];
    allSourceRefs.push(...sourceRefs);
    allQuestionIds.push(...questionIds);
    return {
      ...unit,
      sourceRefs,
      questionIds,
      boundaries: fallbackBoundaries(unit)
    };
  });

  const sourceObjects = resolveJsonlObjects(CURRENT.nodes, allSourceRefs);
  const questionObjects = resolveJsonlObjects(CURRENT.questions, allQuestionIds);

  const hydratedUnits = units.map((unit) => ({
    ...unit,
    sourceNodes: unit.sourceRefs.map((id) => sourceNodeView(id, sourceObjects.get(id))).filter((node) => node.resolved),
    unresolvedSourceRefs: unit.sourceRefs.filter((id) => !bestText(sourceObjects.get(id))),
    questions: unit.questionIds.map((id) => questionView(id, questionObjects.get(id))).filter((question) => question.resolved),
    unresolvedQuestionIds: unit.questionIds.filter((id) => !questionView(id, questionObjects.get(id)).resolved)
  }));

  const issues = [];
  if (manifest.readiness?.all_subject_content_projection_complete !== true) issues.push('POLITICS_CONTENT_NOT_COMPLETE');
  if (manifest.readiness?.interaction_contract_current !== true) issues.push('INTERACTION_CONTRACT_NOT_CURRENT');
  if (!hydratedUnits.length) issues.push('MARX_C01_UNITS_MISSING');
  if (hydratedUnits.some((unit) => !unit.sourceNodes.length)) issues.push('CHENGFENG_SOURCE_TEXT_UNRESOLVED');
  if (hydratedUnits.some((unit) => unit.questionIds.length && !unit.questions.length)) issues.push('XIAO_QUESTION_CONTENT_UNRESOLVED');

  return {
    status: issues.length ? 'partial' : 'ready',
    issues,
    manifest,
    continuation,
    chapter,
    units: hydratedUnits,
    paths: CURRENT
  };
}

export function politicsPilotSummary() {
  const state = loadPoliticsPilot();
  return {
    status: state.status,
    issues: state.issues || [],
    chapterTitle: state.chapter?.title || '马原第一章',
    unitCount: state.units?.length || 0,
    sourceNodeCount: state.units?.reduce((sum, unit) => sum + unit.sourceNodes.length, 0) || 0,
    questionCount: state.units?.reduce((sum, unit) => sum + unit.questions.length, 0) || 0
  };
}
