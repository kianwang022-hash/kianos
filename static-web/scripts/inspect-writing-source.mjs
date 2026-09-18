import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(process.cwd(), '..');

const paths = {
  manifest: path.join(repoRoot, 'content/english/manifest.json'),
  provenance: path.join(repoRoot, 'content/english/provenance.json'),
  questionBank: path.join(repoRoot, 'content/english/source/question_bank.v1.json')
};

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function sha256Text(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

function normalizeToken(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function looksWriting(value) {
  const token = normalizeToken(value);
  return /(^|_)(writing|composition|essay)($|_)/.test(token);
}

function classifyKind(set) {
  const token = normalizeToken([
    set?.section,
    set?.id,
    set?.title,
    set?.type,
    set?.task_type,
    set?.context?.title,
    set?.context?.subtitle
  ].filter(Boolean).join(' '));
  if (/(small|practical|application|letter|notice|email|part_a|writing_a|section_a)/.test(token)) return 'small';
  if (/(big|picture|graph|chart|table|essay|part_b|writing_b|section_b)/.test(token)) return 'big';
  return 'unknown';
}

function uniqueSorted(values) {
  return [...new Set(values.filter((value) => value !== null && value !== undefined && String(value) !== ''))]
    .map(String)
    .sort((a, b) => a.localeCompare(b, 'en'));
}

function keySignature(value) {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? Object.keys(value).sort()
    : [];
}

const manifestText = fs.readFileSync(paths.manifest, 'utf8');
const provenanceText = fs.readFileSync(paths.provenance, 'utf8');
const bankText = fs.readFileSync(paths.questionBank, 'utf8');
const manifest = JSON.parse(manifestText);
const provenance = JSON.parse(provenanceText);
const bank = JSON.parse(bankText);

const papers = Array.isArray(bank?.papers) ? bank.papers : [];
const sets = Array.isArray(bank?.passage_or_sets) ? bank.passage_or_sets : [];
const prompts = Array.isArray(bank?.questions_or_prompts) ? bank.questions_or_prompts : [];
const paperById = new Map(papers.map((paper) => [String(paper?.id || ''), paper]));
const promptsBySet = new Map();
for (const prompt of prompts) {
  const setId = String(prompt?.set_id || '');
  if (!promptsBySet.has(setId)) promptsBySet.set(setId, []);
  promptsBySet.get(setId).push(prompt);
}

const sections = new Map();
for (const set of sets) {
  const section = String(set?.section || 'UNSPECIFIED');
  if (!sections.has(section)) sections.set(section, []);
  sections.get(section).push(set);
}

function sectionSummary(section, sectionSets) {
  const childPrompts = sectionSets.flatMap((set) => promptsBySet.get(String(set?.id || '')) || []);
  const years = uniqueSorted(sectionSets.map((set) => paperById.get(String(set?.paper_id || ''))?.year));
  const ids = [
    ...sectionSets.map((set) => set?.id),
    ...childPrompts.map((prompt) => prompt?.id || prompt?.question_id)
  ];
  const evidenceMatches = uniqueSorted([
    ...(looksWriting(section) ? [`section:${section}`] : []),
    ...ids.filter(looksWriting).map((id) => `id:${id}`)
  ]);
  const kindCounts = { small: 0, big: 0, unknown: 0 };
  for (const set of sectionSets) kindCounts[classifyKind(set)] += 1;
  return {
    section,
    setCount: sectionSets.length,
    childPromptCount: childPrompts.length,
    years,
    setIds: uniqueSorted(sectionSets.map((set) => set?.id)),
    promptIds: uniqueSorted(childPrompts.map((prompt) => prompt?.id || prompt?.question_id)),
    setKeyVariants: uniqueSorted(sectionSets.map((set) => JSON.stringify(keySignature(set)))),
    contextKeyVariants: uniqueSorted(sectionSets.map((set) => JSON.stringify(keySignature(set?.context)))),
    promptKeyVariants: uniqueSorted(childPrompts.map((prompt) => JSON.stringify(keySignature(prompt)))),
    kindCounts,
    writingEvidence: evidenceMatches,
    candidate: evidenceMatches.length > 0
  };
}

const availableSections = [...sections.entries()]
  .map(([section, rows]) => sectionSummary(section, rows))
  .sort((a, b) => a.section.localeCompare(b.section, 'en'));
const writingCandidates = availableSections.filter((row) => row.candidate);

const expectedManifestHash = String(manifest?.source_identity?.question_bank_sha256 || '');
const expectedProvenanceHash = String(provenance?.source_materialization?.question_bank?.sha256 || '');
const actualHash = sha256Text(bankText);

const taskMap = manifest?.final_learner_objects?.task_map;
const writingMap = taskMap?.tasks?.writing;
const writingSections = Array.isArray(writingMap?.sections) ? writingMap.sections.map(String) : [];
const writingSpecs = writingMap?.section_specs || {};

const checks = {
  manifestCurrentReady: manifest?.status === 'CURRENT_READY',
  contentTaskMapCurrent: taskMap?.schema === 'kianos.english.task_map.v1'
    && taskMap?.role === 'CONTENT_OWNED_TASK_IDENTITY',
  writingSectionsExact: JSON.stringify(writingSections) === JSON.stringify(['writing_part_a', 'writing_part_b']),
  writingPartAIdentityExact: writingSpecs?.writing_part_a?.kind === 'small'
    && Number(writingSpecs?.writing_part_a?.set_count) === 22
    && Number(writingSpecs?.writing_part_a?.prompt_count) === 22,
  writingPartBIdentityExact: writingSpecs?.writing_part_b?.kind === 'big'
    && Number(writingSpecs?.writing_part_b?.set_count) === 27
    && Number(writingSpecs?.writing_part_b?.prompt_count) === 27,
  manifestHashMatchesBytes: Boolean(expectedManifestHash) && expectedManifestHash === actualHash,
  provenanceHashMatchesBytes: Boolean(expectedProvenanceHash) && expectedProvenanceHash === actualHash,
  manifestAndProvenanceHashAgree: Boolean(expectedManifestHash) && expectedManifestHash === expectedProvenanceHash,
  writingCandidateResolved: writingCandidates.length > 0
};

const report = {
  schema: 'kianos.english.writing.source-inspection.v1',
  generatedFrom: {
    manifest: 'content/english/manifest.json',
    provenance: 'content/english/provenance.json',
    questionBank: 'content/english/source/question_bank.v1.json'
  },
  sourceIdentity: {
    questionBankSha256: actualHash,
    manifestExpectedSha256: expectedManifestHash,
    provenanceExpectedSha256: expectedProvenanceHash,
    totalPapers: papers.length,
    totalSets: sets.length,
    totalQuestionsOrPrompts: prompts.length
  },
  checks,
  availableSections,
  writingCandidates,
  blockers: Object.entries(checks).filter(([, pass]) => !pass).map(([name]) => name),
  privacy: {
    promptTextIncluded: false,
    answerIncluded: false,
    analysisIncluded: false,
    purpose: 'Inspect current Content-owned Writing task identity without consuming protected task content.'
  }
};

const rendered = `${JSON.stringify(report, null, 2)}\n`;
const outPath = process.env.KIANOS_AUDIT_OUT;
if (outPath) {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, rendered, 'utf8');
}
console.log(rendered);

if (report.blockers.length) process.exitCode = 1;
