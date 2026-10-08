import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import {
  listPoliticsChapterPathsCurrent,
  loadPoliticsChapterCurrent
} from './politicsCurrent.mjs';
import { enrichPoliticsChapterCurrent } from './politicsRepairMemory.mjs';

const clean = (value, max = 1000) => String(value ?? '').trim().slice(0, max);
const list = (value) => Array.isArray(value) ? value : [];
const slug = (value) => clean(value, 200)
  .toLowerCase()
  .replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 80);

function stableHash(text) {
  let hash = 2166136261;
  for (const char of String(text || '')) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

function subjectId(value) {
  const v = clean(value, 40).toLowerCase().replace('_', '-');
  const map = {
    marx: 'marxism',
    history: 'history',
    mao: 'mao',
    xi: 'xi',
    ethics: 'ethics-law',
    'ethics-law': 'ethics-law'
  };
  return map[v] || v;
}

function groupCandidate({ chapter, family, group }) {
  const items = strings(group?.items);
  const sourceRefs = list(group?.source_refs).map((ref) => clean(ref, 240)).filter(Boolean);
  if (!items.length || !sourceRefs.length) return null;
  const raw = chapter?.raw || chapter || {};
  const subject = subjectId(chapter?.subject || raw?.subject);
  const chapterId = clean(raw?.chapter_id || chapter?.chapter_id || chapter?.code || chapter?.chapter, 160);
  const naturalUnitId = clean(group?.natural_unit_id, 200);
  const identityName = clean(group?.name || family, 240);
  const prompt = String(group?.prompt || '').trim();
  const basis = [chapterId, family, naturalUnitId, identityName, ...sourceRefs].join('|');
  return {
    id: clean(group?.id, 220) || `polmem-${stableHash(basis)}`,
    subject,
    chapter_id: chapterId,
    chapter_title: clean(raw?.teaching_title || chapter?.teaching_title || chapter?.title, 240),
    natural_unit_id: naturalUnitId || null,
    family,
    prompt,
    answer_items: items,
    source_refs: [...new Set(sourceRefs)],
    source_role: 'CURRENT_LEARNING_CONTENT',
    admission: 'CANDIDATE_ONLY',
    handbook_alignment: clean(group?.handbook_alignment, 120) || null,
    checking_criteria: strings(group?.checking_criteria),
    memory_cue: String(group?.memory_cue || '').trim(),
    inspected_refs: strings(group?.inspected_refs),
    admission_basis: group?.admission_basis || null
  };
}

function sidecarCandidates(chapter) {
  const projection = chapter?.memoryProjection;
  if (!projection || projection.schema !== 'kianos.politics.memory_projection.v1') return [];
  const out = [];
  for (const [unitId, unit] of Object.entries(projection.units || {})) {
    for (const candidate of list(unit?.candidates)) {
      const statement = String(candidate?.statement || '').trim();
      const sourceRefs = list(candidate?.source_refs).map((ref) => clean(ref, 240)).filter(Boolean);
      if (!statement || !sourceRefs.length || candidate?.admission !== 'CANDIDATE_ONLY') continue;
      const id = clean(candidate?.id, 200);
      if (!id) continue;
      out.push({
        id,
        subject: subjectId(chapter?.subject || chapter?.raw?.subject),
        chapter_id: clean(chapter?.raw?.chapter_id || chapter?.chapter_id || chapter?.code || chapter?.chapter, 160),
        chapter_title: clean(chapter?.raw?.teaching_title || chapter?.teaching_title || chapter?.title, 240),
        natural_unit_id: clean(unitId, 200) || null,
        family: clean(candidate?.form || 'SELECTIVE_PRECISION', 80).toUpperCase(),
        prompt: String(candidate?.prompt || '').trim(),
        answer_items: [statement],
        source_refs: [...new Set(sourceRefs)],
        source_role: 'POLITICS_MEMORY_PROJECTION',
        admission: 'CANDIDATE_ONLY',
        handbook_alignment: clean(candidate?.handbook_alignment, 120) || null,
        checking_criteria: strings(candidate?.checking_criteria),
        memory_cue: String(candidate?.memory_cue || '').trim(),
        inspected_refs: strings(candidate?.inspected_refs),
        admission_basis: candidate?.admission_basis || null
      });
    }
  }
  return out;
}

export function extractPoliticsMemoryCandidates(chapterInput, { selectableOnly = true, repoRoot = process.env.KIANOS_REPO_ROOT || path.resolve(process.cwd(), '..') } = {}) {
  const chapter = enrichPoliticsChapterCurrent(chapterInput);
  const support = chapter?.raw?.content_support || chapter?.content_support || {};
  const out = [];

  [
    ['PRECISION', support.active_precision],
    ['BOUNDARY', support.active_boundaries]
  ].forEach(([family, groups]) => {
    list(groups).forEach((group) => {
      const candidate = groupCandidate({ chapter, family, group });
      if (candidate) out.push(candidate);
    });
  });

  out.push(...sidecarCandidates(chapter));

  const unique = new Map();
  for (const candidate of out) {
    if (!candidate.id) continue;
    if (unique.has(candidate.id)) throw new Error('POLITICS_MEMORY_DUPLICATE_ID:'+candidate.id);
    if (selectableOnly && !politicsMemoryAdmissionVerified(candidate, repoRoot)) continue;
    candidate.admission_verified = politicsMemoryAdmissionVerified(candidate, repoRoot);
    unique.set(candidate.id, candidate);
  }
  return [...unique.values()];
}

export function buildPoliticsMemoryCandidateCatalogCurrent() {
  const candidates = [];
  for (const row of listPoliticsChapterPathsCurrent()) {
    const chapter = loadPoliticsChapterCurrent(row.subject, row.chapter);
    candidates.push(...extractPoliticsMemoryCandidates(chapter));
  }
  candidates.sort((a, b) =>
    [a.subject, a.chapter_id, a.family, a.prompt, a.id].join('|')
      .localeCompare([b.subject, b.chapter_id, b.family, b.prompt, b.id].join('|'))
  );
  assertDistinctPoliticsMemoryPrompts(candidates);
  return {
    schema: 'kianos.politics.memory-candidate-catalog.v1',
    revision: politicsMemoryCatalogRevision(candidates),
    candidates
  };
}

export function politicsMemoryCatalogRevision(candidates) {
  const revisionBasis = candidates.map((row) => ({
    id: row.id,
    subject: row.subject, chapter_id: row.chapter_id, natural_unit_id: row.natural_unit_id,
    family: row.family,
    prompt: row.prompt,
    answer_items: row.answer_items,
    source_refs: row.source_refs,
    checking_criteria: row.checking_criteria, memory_cue: row.memory_cue,
    inspected_refs: row.inspected_refs, admission_basis: row.admission_basis
  }));
  return 'politics-memory-' + stableHash(JSON.stringify(revisionBasis));
}

const strings = value => (Array.isArray(value) ? value : []).map(x => String(x ?? '').trim()).filter(Boolean);
const sortedRefs = value => [...new Set(strings(value))].sort();
const canonical = value => Array.isArray(value) ? '['+value.map(canonical).join(',')+']'
  : value && typeof value === 'object' ? '{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+canonical(value[k])).join(',')+'}'
  : JSON.stringify(value);
export function politicsMemoryReviewedTargetRevision(candidate) {
  const b = candidate.admission_basis || {};
  const payload = {id:candidate.id, subject:String(candidate.subject||'').trim(), chapter_id:String(candidate.chapter_id||'').trim(),
    natural_unit_id:String(candidate.natural_unit_id||'').trim(), family:String(candidate.family||'').trim(), prompt:String(candidate.prompt||'').trim(),
    answer_items:strings(candidate.answer_items), checking_criteria:strings(candidate.checking_criteria),
    memory_cue:String(candidate.memory_cue||'').trim(), source_refs:sortedRefs(candidate.source_refs),
    inspected_refs:sortedRefs(candidate.inspected_refs), admission_basis:{route:String(b.route||'').trim(),
      source_edition:String(b.source_edition||'').trim(), source_locator:String(b.source_locator||'').trim(),
      prerequisite:String(b.prerequisite||'').trim()}};
  return 'sha256:'+createHash('sha256').update(canonical(payload),'utf8').digest('hex');
}
export function politicsMemoryAdmissionVerified(candidate, repoRoot) {
  const b = candidate.admission_basis || {};
  if (candidate.admission !== 'CANDIDATE_ONLY' || b.review_status !== 'REVIEWED'
    || !['FIRST_ROUND_EXACT','INDIVIDUAL_GAP','OUTPUT_REQUIREMENT'].includes(b.route)
    || !candidate.subject || !candidate.chapter_id || !candidate.natural_unit_id || !candidate.family
    || !candidate.prompt || !strings(candidate.answer_items).length || !strings(candidate.checking_criteria).length
    || !strings(candidate.source_refs).length || !/^POL27-[A-Z][A-Z0-9_-]*$/.test(String(b.source_edition||'')) || !b.source_locator || !b.prerequisite
    || b.reviewed_target_revision !== politicsMemoryReviewedTargetRevision(candidate)) return false;
  const [file, anchor, extra] = String(b.review_ref||'').split('#');
  if (!file || !anchor || extra || path.isAbsolute(file)) return false;
  const root=path.resolve(repoRoot), resolved=path.resolve(root,file);
  if (!resolved.startsWith(root+path.sep) || !file.startsWith('content/politics/learning/')) return false;
  try {
    if (!fs.realpathSync(resolved).startsWith(fs.realpathSync(root)+path.sep)) return false;
    const text=fs.readFileSync(resolved,'utf8'), marker='<a id="'+anchor+'"></a>';
    const start=text.indexOf(marker);
    if (start<0 || text.indexOf(marker,start+marker.length)>=0) return false;
    const rest=text.slice(start+marker.length), end=rest.search(/\n(?:<a id=|#{1,3} )/);
    const section=end<0?rest:rest.slice(0,end);
    // Pair target and digest in one explicit record; never borrow another row's hash.
    const rows=section.split(/\r?\n/).filter(line=>/^\s*\|.*\|\s*$/.test(line))
      .map(line=>line.trim().slice(1,-1).split('|').map(cell=>cell.trim()));
    const targetRows=rows.filter(cells=>cells[0]===candidate.id);
    if(targetRows.length!==1)return false;
    const cells=targetRows[0], digests=cells.filter(cell=>/^sha256:[0-9a-f]{64}$/.test(cell));
    return cells.length>=2 && digests.length===1 && cells.at(-1)===b.reviewed_target_revision
      && !cells.some(cell=>/\b(?:PENDING(?:_[A-Z]+)*|UNREVIEWED|REJECTED|BLOCKED)\b/i.test(cell));
  } catch { return false; }
}
export function assertDistinctPoliticsMemoryPrompts(candidates) {
  const prompts=new Map(), ids=new Set();
  for (const c of candidates) {
    if (ids.has(c.id)) throw new Error('POLITICS_MEMORY_DUPLICATE_ID:'+c.id);
    ids.add(c.id);
    const key=[c.subject,c.chapter_id,c.prompt].join('|'), answer=JSON.stringify(c.answer_items);
    if (prompts.has(key) && prompts.get(key)!==answer) throw new Error('POLITICS_MEMORY_AMBIGUOUS_PROMPT:'+c.id);
    prompts.set(key,answer);
  }
}
