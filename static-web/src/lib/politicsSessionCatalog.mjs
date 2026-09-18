import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { listPoliticsChapterPathsCurrent, loadPoliticsChapterCurrent } from './politicsCurrent.mjs';
import { loadPoliticsCompiledPresentation } from './politicsCompiledPresentation.mjs';

const repoRoot = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(process.cwd(), '..');
const learningRoot = path.join(repoRoot, 'content/politics/learning');
const clean = (value) => String(value || '').trim();
const routeSubject = (directory) => directory === 'ethics-law' ? 'ethics_law' : directory;

export function politicsFinalTargetRef({ subject, chapter, unitId, state, groupId }) {
  return [
    'politics-final',
    encodeURIComponent(subject),
    encodeURIComponent(chapter),
    encodeURIComponent(unitId),
    encodeURIComponent(state),
    encodeURIComponent(groupId)
  ].join(':');
}


export function politicsMemoryTargetRef({ subject, owner, id }) {
  return ['politics-memory', encodeURIComponent(subject), encodeURIComponent(owner), encodeURIComponent(id)].join(':');
}

function memoryItem(id, heading, lines) {
  return {
    id,
    heading: heading || null,
    lines: lines.filter((row) => row && row.text),
    children: [],
    locator: null,
    lookFor: [],
    relationClaim: null,
    compare: null
  };
}

function memoryGroup({ id, title, item }) {
  return {
    id,
    zone: 'CORE',
    primitive: 'STATEMENT',
    title: title || null,
    items: [item],
    transitions: []
  };
}

function chapterHref(base, subject, chapter) {
  return chapter ? base + 'politics/' + subject + '/' + chapter + '/' : base + 'politics/';
}

function memorySidecarTargets(base) {
  const targets = [];
  if (!fs.existsSync(learningRoot)) return targets;

  for (const entry of fs.readdirSync(learningRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const directory = entry.name;
    const subject = routeSubject(directory);
    const dir = path.join(learningRoot, directory);
    for (const name of fs.readdirSync(dir).filter((row) => row.endsWith('.memory.json')).sort()) {
      const data = JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8'));
      const chapter = name.replace(/\.memory\.json$/i, '');
      for (const [unitId, unit] of Object.entries(data?.units || {})) {
        for (const candidate of unit?.candidates || []) {
          const id = clean(candidate?.id);
          if (!id) continue;
          const ref = politicsMemoryTargetRef({ subject, owner: chapter, id });
          const group = memoryGroup({
            id,
            title: clean(unit?.title),
            item: memoryItem(id, null, [
              { field: 'statement', text: clean(candidate?.statement) }
            ])
          });
          targets.push({
            ref,
            target_kind: 'MEMORY',
            memory_shape: 'POINT',
            subject,
            chapter,
            unit_id: clean(unitId),
            state: 'MEMORY',
            group_id: id,
            title: clean(unit?.title),
            zone: group.zone,
            primitive: group.primitive,
            unit_href: chapterHref(base, subject, chapter),
            memory_admission: clean(candidate?.memory_admission),
            precision_admission: clean(candidate?.precision_admission),
            precision_blocker: clean(candidate?.precision_blocker),
            source_refs: Array.isArray(candidate?.source_refs) ? candidate.source_refs.map(String) : [],
            group
          });
        }
      }
    }
  }
  return targets;
}

function historyHorizontalTargets(base) {
  const file = path.join(learningRoot, 'history', 'later-stage-knowledge.json');
  if (!fs.existsSync(file)) return [];
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  const targets = [];

  for (const [lineKey, line] of Object.entries(data?.horizontal_lines || {})) {
    for (const candidate of line?.candidates || []) {
      const id = clean(candidate?.id);
      if (!id) continue;
      const chapterRef = (candidate?.chapter_refs || [])[0] || '';
      const chapter = /^C\d+$/i.test(chapterRef) ? 'ch' + chapterRef.slice(1).padStart(2, '0') : '';
      const ref = politicsMemoryTargetRef({ subject: 'history', owner: lineKey, id });
      const group = memoryGroup({
        id,
        title: clean(line?.role),
        item: memoryItem(id, clean(candidate?.label), [
          { field: 'year', text: clean(candidate?.year) },
          { field: 'stage', text: clean(candidate?.stage) },
          { field: 'hold', text: clean(candidate?.hold) }
        ])
      });
      targets.push({
        ref,
        target_kind: 'MEMORY',
        memory_shape: 'POINT',
        subject: 'history',
        chapter,
        unit_id: lineKey,
        state: 'MEMORY',
        group_id: id,
        title: clean(candidate?.label),
        zone: group.zone,
        primitive: group.primitive,
        unit_href: chapterHref(base, 'history', chapter),
        memory_admission: clean(candidate?.memory_admission),
        precision_admission: clean(candidate?.precision_admission),
        precision_blocker: clean(candidate?.precision_blocker),
        source_refs: Array.isArray(candidate?.source_refs) ? candidate.source_refs.map(String) : [],
        group
      });
    }
  }
  return targets;
}


function normalizedMemoryAdmission(memoryKnowledge) {
  const raw = clean(memoryKnowledge?.memory_admission_state || memoryKnowledge?.admission_state);
  return raw === 'ADMITTED_STABLE_SEMANTIC' ? 'ADMITTED_STABLE' : raw;
}

function memoryModelLineText(value) {
  if (typeof value === 'string') return clean(value);
  if (!value || typeof value !== 'object') return '';
  return clean(value.claim || value.boundary || value.text || value.label || value.hold);
}

function chapterMemoryModelLines(compression) {
  const lines = [];
  const seen = new Set();
  const add = (field, value) => {
    const text = memoryModelLineText(value);
    if (!text || seen.has(text)) return;
    seen.add(text);
    lines.push({ field, text });
  };

  add('reconstruction', compression?.reconstruction);
  add('reconstruction', compression?.chapter_compression?.reconstruction);
  for (const row of compression?.reconstruction_targets || []) add('target', row);
  for (const row of compression?.decisive_boundaries || []) add('boundary', row);
  for (const row of compression?.cross_unit_confusables || []) add('confusable', row);
  return lines;
}

function chapterMemoryModelSourceRefs(compression) {
  const refs = new Set();
  for (const row of [
    ...(compression?.reconstruction_targets || []),
    ...(compression?.decisive_boundaries || []),
    ...(compression?.cross_unit_confusables || [])
  ]) {
    for (const ref of row?.owner_ids || []) if (ref) refs.add(String(ref));
    for (const ref of row?.source_refs || []) if (ref) refs.add(String(ref));
  }
  return [...refs];
}

function chapterMemoryModelTargets(base) {
  const targets = [];

  for (const row of listPoliticsChapterPathsCurrent()) {
    const subject = clean(row.subject);
    const chapter = clean(row.chapter);
    const directory = subject === 'ethics_law' ? 'ethics-law' : subject;
    const file = path.join(learningRoot, directory, chapter + '.json');
    if (!fs.existsSync(file)) continue;

    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    const later = data?.later_stage_knowledge || null;
    const memoryKnowledge = later?.memory_knowledge || null;
    const memoryAdmission = normalizedMemoryAdmission(memoryKnowledge);
    if (memoryAdmission !== 'ADMITTED_STABLE') continue;

    const compression = later?.compression_model || null;
    const lines = chapterMemoryModelLines(compression);
    if (!lines.length) continue;

    const id = 'POL27-MEMMODEL-' + subject.toUpperCase().replace(/[^A-Z0-9]+/g, '-') + '-' + chapter.toUpperCase();
    const ref = politicsMemoryTargetRef({ subject, owner: chapter, id });
    const group = memoryGroup({
      id,
      title: clean(data?.title) || clean(chapter),
      item: memoryItem(id, null, lines)
    });

    targets.push({
      ref,
      target_kind: 'MEMORY',
      memory_shape: 'MODEL',
      subject,
      chapter,
      unit_id: clean(data?.object_id || data?.objectId || chapter),
      state: 'MEMORY',
      group_id: id,
      title: clean(data?.title) || clean(chapter),
      zone: group.zone,
      primitive: group.primitive,
      unit_href: chapterHref(base, subject, chapter),
      memory_admission: 'ADMITTED_STABLE',
      precision_admission: 'NOT_APPLICABLE',
      precision_blocker: '',
      source_refs: chapterMemoryModelSourceRefs(compression),
      group
    });
  }

  return targets;
}

export function buildPoliticsSessionTargetCatalog(base = '/') {
  const targets = [];

  for (const row of listPoliticsChapterPathsCurrent()) {
    const subject = clean(row.subject);
    const chapter = clean(row.chapter);
    const current = loadPoliticsChapterCurrent(subject, chapter);
    const compiled = loadPoliticsCompiledPresentation(subject, chapter);
    if (!(compiled instanceof Map)) continue;

    const indexByUnit = new Map((current?.units || []).map((unit, index) => [unit.unitId, index + 1]));

    for (const [unitId, projection] of compiled.entries()) {
      const finalObject = projection?.finalLearnerObject;
      if (!finalObject?.states) continue;
      const unitIndex = indexByUnit.get(unitId) || null;
      const unitHref = unitIndex
        ? `${base}politics/${subject}/${chapter}/#unit-${unitIndex}`
        : `${base}politics/${subject}/${chapter}/`;

      for (const [state, groups] of Object.entries(finalObject.states)) {
        for (const group of groups || []) {
          const ref = politicsFinalTargetRef({
            subject,
            chapter,
            unitId,
            state,
            groupId: group.id
          });
          targets.push({
            ref,
            target_kind: 'FINAL',
            subject,
            chapter,
            unit_id: unitId,
            state,
            group_id: group.id,
            title: group.title || '',
            zone: group.zone,
            primitive: group.primitive,
            unit_href: unitHref,
            memory_admission: '',
            precision_admission: '',
            precision_blocker: '',
            source_refs: [],
            group
          });
        }
      }
    }
  }

  targets.push(...chapterMemoryModelTargets(base), ...memorySidecarTargets(base), ...historyHorizontalTargets(base));

  const identities = targets.map(({ group, ...row }) => row);
  const revision = createHash('sha256').update(JSON.stringify(identities)).digest('hex');

  return {
    schema: 'kianos.politics.session-target-catalog.v1',
    revision,
    target_count: targets.length,
    targets
  };
}

export function publicPoliticsSessionTargetCatalog(catalog) {
  return {
    schema: catalog.schema,
    revision: catalog.revision,
    target_count: catalog.target_count,
    targets: (catalog.targets || []).map(({ group, ...row }) => row)
  };
}
