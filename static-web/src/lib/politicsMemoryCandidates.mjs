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
  const items = list(group?.items).map((item) => clean(item, 2000)).filter(Boolean);
  const sourceRefs = list(group?.source_refs).map((ref) => clean(ref, 240)).filter(Boolean);
  if (!items.length || !sourceRefs.length) return null;
  const raw = chapter?.raw || chapter || {};
  const subject = subjectId(chapter?.subject || raw?.subject);
  const chapterId = clean(raw?.chapter_id || chapter?.chapter_id || chapter?.code || chapter?.chapter, 160);
  const naturalUnitId = clean(group?.natural_unit_id, 200);
  const prompt = clean(group?.name || family, 240);
  const basis = [chapterId, family, naturalUnitId, prompt, ...sourceRefs].join('|');
  return {
    id: `polmem-${stableHash(basis)}`,
    subject,
    chapter_id: chapterId,
    chapter_title: clean(raw?.teaching_title || chapter?.teaching_title || chapter?.title, 240),
    natural_unit_id: naturalUnitId || null,
    family,
    prompt,
    answer_items: items,
    source_refs: [...new Set(sourceRefs)],
    source_role: 'CURRENT_LEARNING_CONTENT',
    admission: 'CANDIDATE_ONLY'
  };
}

function sidecarCandidates(chapter) {
  const projection = chapter?.memoryProjection;
  if (!projection || projection.schema !== 'kianos.politics.memory_projection.v1') return [];
  const out = [];
  for (const [unitId, unit] of Object.entries(projection.units || {})) {
    for (const candidate of list(unit?.candidates)) {
      const statement = clean(candidate?.statement, 2400);
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
        prompt: clean((unit?.title || unitId) + '｜' + (candidate?.form || '精确边界'), 240),
        answer_items: [statement],
        source_refs: [...new Set(sourceRefs)],
        source_role: 'POLITICS_MEMORY_PROJECTION',
        admission: 'CANDIDATE_ONLY',
        handbook_alignment: clean(candidate?.handbook_alignment, 120) || null
      });
    }
  }
  return out;
}

export function extractPoliticsMemoryCandidates(chapterInput) {
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
    if (!candidate.id || unique.has(candidate.id)) continue;
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
  const revisionBasis = candidates.map((row) => ({
    id: row.id,
    family: row.family,
    prompt: row.prompt,
    answer_items: row.answer_items,
    source_refs: row.source_refs
  }));
  return {
    schema: 'kianos.politics.memory-candidate-catalog.v1',
    revision: 'politics-memory-' + stableHash(JSON.stringify(revisionBasis)),
    candidates
  };
}
