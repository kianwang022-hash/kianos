import fs from 'node:fs';
import path from 'node:path';
import { loadPoliticsChapterCurrent } from '../src/lib/politicsCurrent.mjs';

const repoRoot = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(process.cwd(), '..');

const LEARNING_ROOT = path.join(repoRoot, 'content/politics/learning/marxism');
const REGIONS = path.join(repoRoot, 'content/politics/source/politics_unified_regions.v1.jsonl');
const NODE_SHARDS = path.join(repoRoot, 'content/politics/source/nodes/shards');
const SOURCE_REVIEW = path.join(LEARNING_ROOT, 'source-review.json');
const K03 = 'POL27-CF-MARX-C02-K03';

function readJson(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }
function readJsonl(file) {
  return fs.readFileSync(file, 'utf8').split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map(JSON.parse);
}
function asList(value) { return Array.isArray(value) ? value.map(String).filter(Boolean) : (value ? [String(value)] : []); }
function uniq(values) { return [...new Set(values.filter(Boolean))]; }

const sourceReview = fs.existsSync(SOURCE_REVIEW) ? readJson(SOURCE_REVIEW) : null;
const rootDispositions = sourceReview?.root_ocr_dispositions || {};
const approvedRootStatuses = new Set(['APPROVED_OCR_BOUNDARY', 'COVERED_BY_ACCEPTED_K03_SOURCE_GATE']);
const suyiReviewComplete = sourceReview?.status === 'CURRENT_REVIEW_COMPLETE'
  && sourceReview?.suyi_delta_review?.status === 'COMPLETE';

function rootReviewApproved(nodeId) {
  return approvedRootStatuses.has(String(rootDispositions?.[nodeId]?.status || ''));
}

const regionRows = readJsonl(REGIONS).filter((row) => row?.status === 'canonical' && row?.subject === 'MARX');
const regionByUnit = new Map(regionRows.map((row) => [String(row.natural_unit_id), row]));
const shardCache = new Map();

function shardPathForNode(nodeId) {
  const id = String(nodeId || '');
  if (id.startsWith('POL27-CF-MARX-')) {
    const chapter = id.match(/-C(\d{2})(?:-|$)/)?.[1];
    return chapter ? path.join(NODE_SHARDS, 'pol27-cf', 'marx', `c${chapter}.json`) : '';
  }
  if (id.startsWith('POL27-SY-MARX-')) {
    const page = id.match(/-P(\d{3})(?:-|$)/)?.[1];
    return page ? path.join(NODE_SHARDS, 'pol27-sy', 'marx', `p${page}.json`) : '';
  }
  return '';
}

function nodeRow(nodeId) {
  const file = shardPathForNode(nodeId);
  if (!file || !fs.existsSync(file)) return null;
  if (!shardCache.has(file)) shardCache.set(file, readJson(file));
  return shardCache.get(file)?.[nodeId] || null;
}

function ownerRoots(refs) {
  const values = uniq(asList(refs));
  const kRoots = values.filter((id) => /-K\d+$/i.test(id));
  if (kRoots.length) return kRoots;
  return values.filter((id) => !values.some((other) => other !== id && id.startsWith(`${other}-`)));
}

function teachingSignals(unit) {
  return [
    ...(Array.isArray(unit?.teaching_beats) ? unit.teaching_beats : []),
    ...asList(unit?.major_boundaries),
    ...asList(unit?.boundaries),
    unit?.key_boundary,
    unit?.why_now,
    unit?.from_previous,
    unit?.key_relation,
    unit?.relation,
    unit?.application
  ].filter(Boolean).length;
}

const blockers = [];
const reviewQueue = [];
const chapters = [];
const allUnitIds = new Set();
const approvedRootReviews = [];

if (!sourceReview || sourceReview?.status !== 'CURRENT_REVIEW_COMPLETE') {
  reviewQueue.push({ chapter: 'all', unit_id: 'MARXISM', priority: 'P0', code: 'SOURCE_REVIEW_DISPOSITION_NOT_COMPLETE' });
}

for (const name of fs.readdirSync(LEARNING_ROOT).filter((file) => /^ch\d+\.json$/i.test(file)).sort()) {
  const chapterCode = path.basename(name, '.json').toLowerCase();
  const raw = readJson(path.join(LEARNING_ROOT, name));
  const current = loadPoliticsChapterCurrent('marxism', chapterCode);
  const declared = asList(raw?.source_bindings?.natural_unit_ids);
  const projected = (raw?.unit_projections || []).map((unit) => String(unit?.natural_unit_id || '')).filter(Boolean);
  const chapterSuyi = new Set(asList(raw?.source_bindings?.suyi_refs));
  const currentRepresented = new Set(current.units.flatMap((unit) => asList(unit?.representedNaturalUnitIds)));

  if (declared.length !== projected.length || declared.some((id) => !projected.includes(id))) {
    blockers.push({ chapter: chapterCode, code: 'UNIT_DECLARATION_PROJECTION_MISMATCH', declared, projected });
  }

  const chapterReport = {
    chapter: chapterCode,
    title: raw?.title || current.title,
    declaredUnits: declared.length,
    units: [],
    reviewCount: 0,
    blockerCount: 0
  };

  for (const unit of raw?.unit_projections || []) {
    const unitId = String(unit?.natural_unit_id || '');
    if (!unitId) continue;
    allUnitIds.add(unitId);
    const region = regionByUnit.get(unitId) || null;
    const priority = String(region?.chat_decision?.priority || 'UNKNOWN');
    const sourceRefs = asList(region?.chengfeng_refs);
    const suyiRefs = asList(region?.suyi_refs);
    const sourceOwners = ownerRoots(sourceRefs);
    const sourceMissing = sourceRefs.filter((id) => !nodeRow(id));
    const suyiMissing = suyiRefs.filter((id) => !nodeRow(id));
    const rootReview = sourceOwners
      .map((id) => ({ id, status: String(nodeRow(id)?.verification_status || '') }))
      .filter((row) => row.status && row.status !== 'source_bound_cross_engine_ocr')
      .filter((row) => {
        if (!rootReviewApproved(row.id)) return true;
        approvedRootReviews.push({ chapter: chapterCode, unit_id: unitId, node_id: row.id, source_status: row.status, disposition: rootDispositions[row.id]?.status || '' });
        return false;
      });
    const currentUnit = current.units.find((candidate) => asList(candidate?.representedNaturalUnitIds).includes(unitId));
    const signals = teachingSignals(unit);
    const localReview = [];
    const localBlockers = [];

    if (!region) localBlockers.push('MISSING_CANONICAL_REGION');
    if (!sourceRefs.length) localBlockers.push('NO_CHENGFENG_SOURCE_REFS');
    if (sourceMissing.length) localBlockers.push(`UNRESOLVED_CHENGFENG:${sourceMissing.join(',')}`);
    if (!currentRepresented.has(unitId) || !currentUnit) localBlockers.push('NOT_REPRESENTED_IN_CURRENT_LEARNER_PROJECTION');
    if (currentUnit && sourceRefs.length && !currentUnit.sourceNodes?.length) localBlockers.push('SOURCE_NOT_RENDERABLE');
    if (!String(unit?.core_problem || '').trim()) localBlockers.push('MISSING_CORE_PROBLEM');
    if (!String(unit?.closure_cue || '').trim()) localBlockers.push('MISSING_CLOSURE_CUE');
    if (suyiMissing.length) localBlockers.push(`UNRESOLVED_SUYI:${suyiMissing.join(',')}`);

    if ((priority === 'P0' || priority === 'P1') && signals < 2) localReview.push('HIGH_PRIORITY_TEACHING_PROJECTION_THIN');
    if (rootReview.length) localReview.push(`SOURCE_ROOT_REVIEW:${rootReview.map((row) => `${row.id}:${row.status}`).join('|')}`);
    if (suyiRefs.length && !suyiReviewComplete) localReview.push(`SUYI_DELTA_REVIEW:${suyiRefs.length}`);
    for (const ref of suyiRefs) if (!chapterSuyi.has(ref)) localReview.push(`SUYI_BINDING_DRIFT:${ref}`);

    if (unitId === K03) {
      for (let i = localReview.length - 1; i >= 0; i -= 1) {
        if (localReview[i].startsWith('SUYI_DELTA_REVIEW') || localReview[i].startsWith('SOURCE_ROOT_REVIEW')) localReview.splice(i, 1);
      }
    }

    for (const code of localBlockers) blockers.push({ chapter: chapterCode, unit_id: unitId, priority, code });
    for (const code of uniq(localReview)) reviewQueue.push({ chapter: chapterCode, unit_id: unitId, priority, code });

    chapterReport.units.push({
      unit_id: unitId,
      title: unit?.title || region?.title || '',
      priority,
      source_ref_count: sourceRefs.length,
      source_owner_count: sourceOwners.length,
      suyi_ref_count: suyiRefs.length,
      teaching_signal_count: signals,
      blocker_count: localBlockers.length,
      review_count: uniq(localReview).length
    });
    chapterReport.reviewCount += uniq(localReview).length;
    chapterReport.blockerCount += localBlockers.length;
  }

  chapters.push(chapterReport);
}

const regionIds = new Set(regionRows.map((row) => String(row.natural_unit_id)));
const orphanCanonicalRegions = [...regionIds].filter((id) => !allUnitIds.has(id) && id !== K03);
for (const unitId of orphanCanonicalRegions) {
  reviewQueue.push({ chapter: unitId.match(/-C(\d{2})/)?.[1] ? `ch${unitId.match(/-C(\d{2})/)[1]}` : 'unknown', unit_id: unitId, priority: regionByUnit.get(unitId)?.chat_decision?.priority || 'UNKNOWN', code: 'CANONICAL_REGION_NOT_TOP_LEVEL_PROJECTION' });
}

const severity = { P0: 0, P1: 1, P2: 2, UNKNOWN: 3 };
reviewQueue.sort((a, b) => (severity[a.priority] ?? 9) - (severity[b.priority] ?? 9) || a.chapter.localeCompare(b.chapter) || a.unit_id.localeCompare(b.unit_id));

const compact = {
  status: blockers.length ? 'BLOCKED' : reviewQueue.length ? 'PASS_WITH_REVIEW_QUEUE' : 'PASS',
  scope: 'MARXISM_ALL_CHAPTERS_CONTENT',
  chapter_count: chapters.length,
  projected_unit_count: allUnitIds.size,
  canonical_region_count: regionRows.length,
  blocker_count: blockers.length,
  review_count: reviewQueue.length,
  p0_review_count: reviewQueue.filter((row) => row.priority === 'P0').length,
  p1_review_count: reviewQueue.filter((row) => row.priority === 'P1').length,
  source_review_disposition_status: String(sourceReview?.status || 'MISSING'),
  suyi_delta_review_complete: suyiReviewComplete,
  approved_root_review_count: approvedRootReviews.length,
  approved_root_reviews: approvedRootReviews,
  chapters: chapters.map((chapter) => ({
    chapter: chapter.chapter,
    title: chapter.title,
    units: chapter.units.length,
    blockers: chapter.blockerCount,
    reviews: chapter.reviewCount
  })),
  blockers,
  review_queue: reviewQueue
};

console.log('POLITICS_MARXISM_CONTENT_AUDIT');
console.log(JSON.stringify(compact, null, 2));
if (blockers.length) process.exit(2);
