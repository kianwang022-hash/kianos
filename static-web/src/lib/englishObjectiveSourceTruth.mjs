import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {
  inspectObjectiveTask,
  listClozeSets as baseListClozeSets,
  loadClozeById as baseLoadClozeById,
  loadClozeAnswersById,
  listReadingBSets as baseListReadingBSets,
  loadReadingBById as baseLoadReadingBById,
  loadReadingBAnswersById as baseLoadReadingBAnswersById
} from './englishObjective.mjs';
import { projectObjectiveSourceTruth, rebindRenderedEnglishSourceIdentity } from './englishSourceTruth.mjs';

export { inspectObjectiveTask, loadClozeAnswersById };
export const listClozeSets = baseListClozeSets;
export function listReadingBSets() {
  const official = baseListReadingBSets();
  const synthetic = syntheticPartBBank().items.map(item => ({
    id: item.id, title: syntheticPartBTitle(item), sourceKind: 'synthetic',
    paperId: null, year: null, section: 'synthetic'
  }));
  if (synthetic.some(item => official.some(other => other.id === item.id))) {
    throw new Error('SYNTHETIC_READING_B_OFFICIAL_ID_COLLISION');
  }
  return [...official, ...synthetic];
}

export function loadClozeById(id) {
  return projectObjectiveSourceTruth(baseLoadClozeById(id));
}

export function loadDefaultCloze() {
  const items = listClozeSets();
  if (!items.length) throw new Error('CURRENT_OBJECTIVE_SOURCE_NOT_READY:cloze:empty');
  const preferred = process.env.KIANOS_CLOZE_SET_ID;
  const selected = preferred && items.some((item) => item.id === preferred) ? preferred : items[0].id;
  return loadClozeById(selected);
}

export function loadReadingBById(id) {
  // Official objects do not depend on the optional synthetic bank being readable.
  if (baseListReadingBSets().some(item => item.id === id)) return projectObjectiveSourceTruth(baseLoadReadingBById(id));
  const bank = syntheticPartBBank();
  const index = bank.items.findIndex(item => item.id === id);
  if (index >= 0) {
    const item = projectSyntheticReadingB(bank.items[index], bank.keys[id], bank.paths);
    item.navigation = { position: index + 1, total: bank.items.length,
      previousId: bank.items[index - 1]?.id || null, nextId: bank.items[index + 1]?.id || null };
    return item;
  }
  return projectObjectiveSourceTruth(baseLoadReadingBById(id));
}

export function loadReadingBAnswersById(id) {
  if (baseListReadingBSets().some(item => item.id === id)) return baseLoadReadingBAnswersById(id);
  const bank = syntheticPartBBank();
  const source = bank.items.find(item => item.id === id);
  if (!source) return baseLoadReadingBAnswersById(id);
  // Run the same admission checks, but return the key only through the existing answer gate.
  const item = projectSyntheticReadingB(source, bank.keys[id], bank.paths);
  return { schema: 'kianos.english.objective_answers.v1', task: 'reading_b', objectId: id,
    answers: Object.fromEntries(item.questions.map(q => [q.id, bank.keys[id][q.ordinal]])) };
}

export function loadDefaultReadingB() {
  const items = listReadingBSets();
  if (!items.length) throw new Error('CURRENT_OBJECTIVE_SOURCE_NOT_READY:reading_b:empty');
  const preferred = process.env.KIANOS_READING_B_SET_ID;
  const selected = preferred && items.some((item) => item.id === preferred) ? preferred : items[0].id;
  return loadReadingBById(selected);
}

// Adapter, not a second bank: source objects/roles/keys stay in manifest.practice_assets.
const SYNTHETIC_FORMS = Object.freeze({
  GAP_MATCHING: ['gap_match', 'Gap Matching', 'Gap'],
  PARAGRAPH_ORDERING: ['ordering', 'Paragraph Ordering', 'Slot'],
  HEADING_MATCHING: ['heading_match', 'Heading Matching', 'Paragraph'],
  COMMENT_STATEMENT_MATCHING: ['comment_match', 'Comment–Statement Matching', 'Comment']
});
const contentHash = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
const ensure = (ok, code) => { if (!ok) throw new Error('SYNTHETIC_READING_B_' + code); };
const nonempty = value => typeof value === 'string' && value.trim().length > 0;
const formOf = source => SYNTHETIC_FORMS[source?.form];
const syntheticPartBTitle = source => `合成${source.role === 'CALIBRATION' ? '校准' : '迁移练习'} · ${formOf(source)?.[1] || source.form}`;
let syntheticCache;
function syntheticPartBBank() {
  if (syntheticCache) return syntheticCache;
  const root = path.resolve(process.env.KIANOS_REPO_ROOT || path.join(process.cwd(), '..'));
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'content/english/manifest.json'), 'utf8'));
  const entry = manifest.practice_assets?.objective;
  // Missing admission does not fabricate content or break the unchanged official bank.
  if (!entry) return { items: [], keys: {}, paths: {} };
  const readRegistered = relative => {
    ensure(nonempty(relative), 'OWNER_PATH_REQUIRED');
    const resolved = path.resolve(root, relative);
    ensure(resolved.startsWith(root + path.sep), 'OWNER_PATH_OUTSIDE_REPO');
    return JSON.parse(fs.readFileSync(resolved, 'utf8'));
  };
  const bank = readRegistered(entry.prompt_bank), sealed = readRegistered(entry.sealed_key);
  ensure(bank.schema === 'kianos.english.objective.synthetic_baseline.v1', 'BANK_SCHEMA');
  ensure(sealed.schema === 'kianos.english.objective.synthetic_baseline_key.v1', 'KEY_SCHEMA');
  ensure(sealed.source_bank === entry.prompt_bank && bank.evidence_rules?.answer_key_location === entry.sealed_key, 'KEY_OWNER_MISMATCH');
  ensure(bank.evidence_rules?.score_equivalent === false && bank.evidence_rules?.whole_unit_attempts === true, 'EVIDENCE_BOUNDARY');
  ensure(['CURRENT_CANDIDATE', 'CURRENT'].includes(bank.status), 'BANK_STATUS');
  ensure(Array.isArray(bank.part_b), 'BANK_ITEMS');
  ensure(new Set(bank.part_b.map(item => item.id)).size === bank.part_b.length, 'DUPLICATE_ID');
  const paths = { bank: entry.prompt_bank, key: entry.sealed_key };
  for (const item of bank.part_b) projectSyntheticReadingB(item, sealed.answers?.[item.id], paths);
  syntheticCache = { items: bank.part_b, keys: sealed.answers, paths };
  return syntheticCache;
}

export function projectSyntheticReadingB(source, answerMap, paths) {
  ensure(source && nonempty(source.id) && /^pb-[a-z0-9-]+$/.test(source.id), 'ID');
  const form = formOf(source);
  ensure(Boolean(form), 'FORM_UNSUPPORTED');
  ensure(['CALIBRATION','TRANSFER'].includes(source.role), 'EVIDENCE_ROLE');
  ensure(nonempty(source.directions), 'DIRECTIONS_REQUIRED');
  let candidates;
  if (['gap_match','ordering'].includes(form[0])) {
    const pool = form[0] === 'ordering' ? source.paragraphs : source.candidates;
    ensure(pool && !Array.isArray(pool) && typeof pool === 'object', 'CANDIDATES');
    candidates = Object.entries(pool).map(([label,text]) => ({label,text}));
  } else {
    const pool = form[0] === 'heading_match' ? source.headings : source.statements;
    ensure(Array.isArray(pool), 'CANDIDATES');
    candidates = pool.map(text => {
      const match = typeof text === 'string' && /^([A-Z])\.\s+([\s\S]+)$/.exec(text);
      ensure(Boolean(match), 'CANDIDATE_LABEL');
      return {label:match[1],text:match[2]};
    });
  }
  const labels = candidates.map(c => c.label);
  ensure(candidates.length === 7 && new Set(labels).size === 7 && candidates.every(c => /^[A-Z]$/.test(c.label) && nonempty(c.text)), 'CANDIDATE_INVENTORY');
  const fixed = form[0] === 'ordering' ? source.fixed : [];
  const skeleton = form[0] === 'ordering' ? source.skeleton : [];
  ensure(Array.isArray(fixed) && Array.isArray(skeleton), 'ORDERING_SHAPE');
  const ordinals = ['1','2','3','4','5'];
  if (form[0] === 'ordering') {
    ensure(fixed.length === 2 && new Set(fixed).size === 2 && fixed.every(x=>labels.includes(x)), 'FIXED_GIVENS');
    ensure(skeleton.length === 7 && new Set(skeleton).size === 7 && [...ordinals,...fixed].every(x=>skeleton.includes(x)), 'ORDERING_SKELETON');
  }
  ensure(answerMap && typeof answerMap === 'object' && Object.keys(answerMap).length === 5 && ordinals.every(x => labels.includes(answerMap[x]) && !fixed.includes(answerMap[x])), 'ANSWER_MAP');
  ensure(new Set(Object.values(answerMap)).size === 5, 'ANSWER_SINGLE_USE');
  const texts = form[0] === 'gap_match' ? source.body : form[0] === 'heading_match' ? source.paragraphs : form[0] === 'comment_match' ? source.comments : [];
  ensure(Array.isArray(texts) && texts.every(nonempty), 'MATERIAL');
  if (form[0] === 'gap_match') ensure(ordinals.every(x => texts.filter(t => t.trim() === `[${x}]`).length === 1), 'GAP_SKELETON');
  if (['heading_match','comment_match'].includes(form[0])) ensure(texts.length === 5, 'MATERIAL_TARGETS');
  const material = texts.map((text,i) => ({id:`m${i+1}`,text: ['heading_match','comment_match'].includes(form[0]) ? `${i+1}. ${text}` : text}));
  const questions = ordinals.map(ordinal => ({ id:`${source.id}-q${ordinal}`, ordinal:Number(ordinal),
    prompt:`${form[2]} ${ordinal}`, options:Object.fromEntries(candidates.map(c=>[c.label,c.text])),
    ...(form[0] === 'comment_match' ? {displayLabel:texts[Number(ordinal)-1].split(':')[0]} : {}) }));
  return rebindRenderedEnglishSourceIdentity({
    task:'reading_b', objectId:source.id, title:syntheticPartBTitle(source), paperId:null, year:null, code:null,
    section:'合成练习 · 非真题估分', sourceKind:'synthetic', questionOrigin:'CHAT_GENERATED',
    material, questions, candidates,
    context:{directions:source.directions, taskForm:form[0], formLabel:form[1], itemLabel:form[2],
      candidateUsePolicy:'single_use', orderingSkeleton:[...skeleton], fixedGivens:[...fixed],
      evidence_role:source.role, calibration_status:'NOT_SCORE_EQUIVALENT'},
    sourcePaths:{questions:paths.bank, sourceTruth:paths.bank, sealedKey:paths.key},
    // Per-object input, never bank-wide SHA: unrelated asset edits do not stale this attempt.
    sourceHashes:{sourceTruthUnit:contentHash({source,answerMap})},
    sourceTruthStatus:'SYNTHETIC_BASELINE',
    sourceTruth:{status:'SYNTHETIC_BASELINE',finalSourceFile:paths.bank,scoreEquivalent:false}
  });
}
