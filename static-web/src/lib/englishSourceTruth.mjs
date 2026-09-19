import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(process.cwd(), '..');

export const ENGLISH_SOURCE_TRUTH = Object.freeze({
  manifest: 'content/english/manifest.json',
  global: 'content/english/source/global_source_truth.v1.json'
});

const FORBIDDEN_ATTEMPT_KEYS = new Set([
  'answer', 'answers', 'formal_answer', 'correct_answer', 'analysis', 'explanation', 'rationale',
  'solution', 'reference', 'reference_answer', 'sample_answer', 'model_answer', 'template_answer',
  'canonical_evidence_sets', 'option_diagnosis', 'analysis_verification_status', 'taxonomy',
  'qa_state', 'seal_state', 'chat_source_decision_binding'
]);

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

function textOf(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string' || typeof value === 'number') return String(value).trim();
  if (Array.isArray(value)) return value.map(textOf).filter(Boolean).join(' ');
  if (typeof value !== 'object') return '';
  for (const key of ['text', 'content', 'raw_text', 'alt', 'caption', 'description', 'title']) {
    const text = textOf(value[key]);
    if (text) return text;
  }
  return '';
}

function cleanWhitespace(value) {
  return String(value || '')
    .replace(/\r/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function learnerSafeClone(value) {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) return value.map(learnerSafeClone);
  if (typeof value !== 'object') return value;
  const out = {};
  for (const [key, child] of Object.entries(value)) {
    if (FORBIDDEN_ATTEMPT_KEYS.has(String(key).toLowerCase())) continue;
    out[key] = learnerSafeClone(child);
  }
  return out;
}

let cache;

function snapshot() {
  if (cache) return cache;
  const required = [ENGLISH_SOURCE_TRUTH.manifest, ENGLISH_SOURCE_TRUTH.global];
  const missing = required.filter((relativePath) => !fs.existsSync(absolute(relativePath)));
  if (missing.length) {
    cache = { status: 'missing', missing, issues: [], units: {}, ownerHash: '' };
    return cache;
  }

  try {
    const manifestText = readText(ENGLISH_SOURCE_TRUTH.manifest);
    const globalText = readText(ENGLISH_SOURCE_TRUTH.global);
    const manifest = JSON.parse(manifestText);
    const global = JSON.parse(globalText);
    const expectedHash = String(manifest?.source_identity?.global_source_truth_sha256 || '');
    const actualHash = sha256(globalText);
    const issues = [];

    if (manifest?.status !== 'CURRENT_READY') issues.push('MANIFEST_NOT_CURRENT_READY');
    if (manifest?.source?.global_source_truth !== ENGLISH_SOURCE_TRUTH.global) issues.push('MANIFEST_GLOBAL_SOURCE_TRUTH_OWNER_MISMATCH');
    if (!expectedHash) issues.push('MANIFEST_GLOBAL_SOURCE_TRUTH_HASH_MISSING');
    if (expectedHash && expectedHash !== actualHash) issues.push('GLOBAL_SOURCE_TRUTH_HASH_MISMATCH');
    if (global?.status !== 'SOURCE_READY') issues.push(`GLOBAL_SOURCE_TRUTH_NOT_READY:${global?.status || 'missing'}`);
    if (!global?.units || typeof global.units !== 'object') issues.push('GLOBAL_SOURCE_TRUTH_UNITS_MISSING');

    cache = {
      status: issues.length ? 'invalid' : 'ready',
      missing: [],
      issues,
      manifest,
      global,
      units: global?.units || {},
      ownerHash: expectedHash || actualHash
    };
    return cache;
  } catch (error) {
    cache = {
      status: 'invalid',
      missing: [],
      issues: [`GLOBAL_SOURCE_TRUTH_READ_ERROR:${error instanceof Error ? error.message : String(error)}`],
      units: {},
      ownerHash: ''
    };
    return cache;
  }
}

export function inspectEnglishSourceTruth() {
  const data = snapshot();
  return {
    status: data.status,
    missing: [...(data.missing || [])],
    issues: [...(data.issues || [])],
    unitCount: Object.keys(data.units || {}).length,
    ownerHash: data.ownerHash || ''
  };
}

export function sourceTruthFor(objectId) {
  const data = snapshot();
  if (data.status !== 'ready') {
    throw new Error(`ENGLISH_SOURCE_TRUTH_NOT_READY:${data.status}:${[...(data.issues || []), ...(data.missing || [])].join(',')}`);
  }
  const id = String(objectId || '');
  const unit = data.units?.[id];
  if (!unit || unit.status !== 'SOURCE_READY') {
    throw new Error(`ENGLISH_SOURCE_TRUTH_UNIT_NOT_READY:${id}:${unit?.status || 'missing'}`);
  }
  return unit;
}

export function sourceTruthBlocks(unit, prefix = 'm') {
  const explicit = Array.isArray(unit?.paragraphs)
    ? unit.paragraphs.map(textOf).map(cleanWhitespace).filter(Boolean)
    : [];
  const blocks = explicit.length
    ? explicit
    : cleanWhitespace(unit?.source_text || '')
      .split(/\n\s*\n/)
      .map(cleanWhitespace)
      .filter(Boolean);
  return blocks.map((text, index) => ({ id: `${prefix}${index + 1}`, text }));
}

export function overlayQuestion(question, unit) {
  const id = String(question?.id || question?.question_id || '');
  const replacement = unit?.question_overlays?.[id] || {};
  const projected = {
    ...learnerSafeClone(question),
    ...(replacement.prompt ? { prompt: replacement.prompt } : {}),
    ...(replacement.options ? { options: learnerSafeClone(replacement.options) } : {})
  };
  return learnerSafeClone(projected);
}

function sourceIdentity(unit) {
  const data = snapshot();
  return {
    ownerPath: ENGLISH_SOURCE_TRUTH.global,
    ownerHash: data.ownerHash || '',
    unitHash: String(unit?.source_text_sha256 || sha256(stableJson(unit))),
    finalSourceFile: unit?.source_file || null,
    finalSourceFileHash: unit?.source_file_sha256 || null
  };
}

function withSourceIdentity(object, unit) {
  const identity = sourceIdentity(unit);
  const projected = {
    ...object,
    sourceTruthStatus: unit.status,
    sourcePaths: {
      ...(object?.sourcePaths || {}),
      sourceTruth: identity.ownerPath
    },
    sourceHashes: {
      ...(object?.sourceHashes || {}),
      sourceTruthOwner: identity.ownerHash,
      sourceTruthUnit: identity.unitHash
    },
    sourceTruth: {
      status: unit.status,
      finalSourceFile: identity.finalSourceFile,
      finalSourceFileHash: identity.finalSourceFileHash
    }
  };
  projected.sourceHashes.renderedObject = sha256(stableJson({
    objectId: projected.objectId || projected.id,
    sourceTruthUnit: identity.unitHash,
    material: projected.material || projected.paragraphs || null,
    prompts: projected.prompts || projected.questions || projected.officialEvidence?.prompt || null
  }));
  return projected;
}

function optionEntries(options) {
  if (Array.isArray(options)) {
    return options.map((value, index) => ({
      label: String(value?.label ?? value?.id ?? value?.option ?? String.fromCharCode(65 + index)),
      text: cleanWhitespace(textOf(value) || String(value ?? ''))
    })).filter((entry) => entry.text);
  }
  if (!options || typeof options !== 'object') return [];
  return Object.entries(options)
    .map(([label, value]) => ({ label: String(label), text: cleanWhitespace(textOf(value) || String(value ?? '')) }))
    .filter((entry) => entry.text);
}

function directionsFromSource(sourceText) {
  const text = cleanWhitespace(sourceText);
  const match = text.match(/^Directions\s*:?\s*([\s\S]*?)(?:\n\s*\n)/i);
  return cleanWhitespace(match?.[1] || '').replace(/\n/g, ' ');
}

export function projectReadingSourceTruth(reading) {
  const unit = sourceTruthFor(reading?.objectId);
  const paragraphs = sourceTruthBlocks(unit, 'p');
  const questions = (reading?.questions || []).map((question) => overlayQuestion(question, unit));
  return withSourceIdentity({
    ...reading,
    ...(paragraphs.length ? { paragraphs } : {}),
    questions
  }, unit);
}

export function projectObjectiveSourceTruth(item) {
  const unit = sourceTruthFor(item?.objectId);
  const questions = (item?.questions || []).map((question) => overlayQuestion(question, unit));
  const material = sourceTruthBlocks(unit, 'm');
  const context = { ...(item?.context || {}) };

  if (unit.question_group_type) context.questionGroupType = unit.question_group_type;
  if (unit.format_profile) context.formatProfile = unit.format_profile;
  const directions = directionsFromSource(unit.source_text);
  if (directions) context.directions = directions;

  let candidates = item?.candidates || [];
  if (unit.shared_option_pool && typeof unit.shared_option_pool === 'object') {
    candidates = optionEntries(unit.shared_option_pool);
  } else if (item?.task === 'cloze') {
    const seen = new Set();
    candidates = questions.flatMap((question) => optionEntries(question?.options)).filter((entry) => {
      const key = `${entry.label}\u0000${entry.text}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  return withSourceIdentity({
    ...item,
    ...(material.length ? { material } : {}),
    context,
    questions,
    candidates
  }, unit);
}

export function projectTranslationSourceTruth(translation) {
  const unit = sourceTruthFor(translation?.objectId);
  const prompts = (translation?.prompts || []).map((prompt) => {
    const replacement = unit?.question_overlays?.[String(prompt?.id || '')] || {};
    return learnerSafeClone({
      ...prompt,
      ...(replacement.prompt ? { sourceText: replacement.prompt } : {})
    });
  });
  const material = sourceTruthBlocks(unit, 'm');
  const context = {
    ...(translation?.context || {}),
    ...(Array.isArray(unit?.images) && unit.images.length ? { images: unit.images } : {})
  };
  return withSourceIdentity({
    ...translation,
    ...(material.length ? { material } : {}),
    prompts,
    context
  }, unit);
}

function promptTextFor(prompts) {
  const prompt = Array.isArray(prompts) ? prompts[0] : null;
  return [prompt?.instruction, prompt?.promptText]
    .map((value) => cleanWhitespace(value))
    .filter(Boolean)
    .filter((value, index, rows) => rows.indexOf(value) === index)
    .join('\n\n');
}

function materialTexts(material) {
  return (Array.isArray(material) ? material : []).map(textOf).map(cleanWhitespace).filter(Boolean);
}

function contextTexts(context) {
  const value = context && typeof context === 'object' ? context : {};
  return ['title', 'subtitle', 'task_background', 'directions', 'instruction', 'directive']
    .map((key) => cleanWhitespace(textOf(value[key])))
    .filter(Boolean);
}

function visualTexts(context) {
  const images = context?.images;
  return Array.isArray(images) ? images.map(textOf).map(cleanWhitespace).filter(Boolean) : [];
}

export function projectWritingRuntimeSourceTruth(task) {
  if (!task || task.sourceKind !== 'exam') return task;
  const unit = sourceTruthFor(task.id);
  const originalEvidence = task.officialEvidence || {};
  const prompts = (originalEvidence.prompt || []).map((prompt) => {
    const replacement = unit?.question_overlays?.[String(prompt?.id || '')] || {};
    return learnerSafeClone({
      ...prompt,
      ...(replacement.prompt ? { promptText: replacement.prompt } : {})
    });
  });
  const material = sourceTruthBlocks(unit, 'm');
  const context = {
    ...(originalEvidence.context || {}),
    ...(Array.isArray(unit?.images) && unit.images.length ? { images: unit.images } : {})
  };
  const officialEvidence = learnerSafeClone({
    ...originalEvidence,
    prompt: prompts,
    ...(material.length ? { material } : {}),
    context
  });
  const officialPrompt = promptTextFor(prompts);
  const materials = materialTexts(officialEvidence.material);
  const contexts = contextTexts(context);
  const visuals = visualTexts(context);
  const learnerTask = task.kind === 'small'
    ? {
        ...(task.learnerTask || {}),
        background: [...contexts, ...materials].join('\n\n') || task.learnerTask?.background || '',
        directions: officialPrompt || task.learnerTask?.directions || '',
        official: officialEvidence
      }
    : {
        ...(task.learnerTask || {}),
        visual_scenario: '', // Original visual, not provenance prose or an interpreted substitute.
        images: (context.images || []).map(image => ({asset_path:image.asset_path, alt:'原始题面图表', asset_sha256:image.asset_sha256})),
        directions: officialPrompt || task.learnerTask?.directions || '',
        official: officialEvidence
      };

  const projected = withSourceIdentity({
    ...task,
    officialEvidence,
    learnerTask
  }, unit);
  return {
    ...projected,
    sourcePath: ENGLISH_SOURCE_TRUTH.global,
    sourceHash: projected.sourceHashes.renderedObject
  };
}
