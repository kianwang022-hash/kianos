import { createHash } from 'node:crypto';
import { listPoliticsChapterPathsCurrent, loadPoliticsChapterCurrent } from './politicsCurrent.mjs';
import { loadPoliticsCompiledPresentation } from './politicsCompiledPresentation.mjs';

const clean = (value) => String(value || '').trim();

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
            subject,
            chapter,
            unit_id: unitId,
            state,
            group_id: group.id,
            title: group.title || '',
            zone: group.zone,
            primitive: group.primitive,
            unit_href: unitHref,
            group
          });
        }
      }
    }
  }

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
