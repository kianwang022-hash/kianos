import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = p => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const list = x => Array.isArray(x) ? x : x == null ? [] : [x];
export function resolvePoliticsFrameRef(ref, source, unit) {
  if (ref == null) return null;
  if (Array.isArray(ref)) return ref.map(x => resolvePoliticsFrameRef(x, source, unit));
  if (typeof ref !== 'object') return ref;
  if (ref.scope && ref.field) {
    let value = ref.scope === 'chapter' ? source : ref.scope === 'unit' ? unit : null;
    for (const key of ref.field.split('.')) value = value?.[key];
    if (value == null) throw new Error(`POLITICS_FRAME_MISSING_REF:${ref.scope}.${ref.field}`);
    if (ref.match) {
      const matches = list(value).filter(x => Object.entries(ref.match).every(([k,v]) => x?.[k] === v));
      if (matches.length !== 1) throw new Error(`POLITICS_FRAME_AMBIGUOUS_REF:${ref.field}`);
      value = matches;
    }
    if (ref.ids) value = ref.ids.map(id => {
      const matches = list(value).filter(x => x?.id === id);
      if (matches.length !== 1) throw new Error(`POLITICS_FRAME_AMBIGUOUS_ID:${id}`);
      return matches[0];
    });
    return value;
  }
  return Object.fromEntries(Object.entries(ref).map(([k,v]) => [k, resolvePoliticsFrameRef(v,source,unit)]));
}
export function loadPoliticsFrameProjection(subject, chapter) {
  const key = subject === 'ethics_law' ? 'ethics-law' : subject;
  const manifest = read('content/politics/projection/manifest.json');
  const relative = `${key}/${chapter}.projection.json`;
  if (!manifest.subjects?.[key]?.files.includes(relative)) throw new Error(`POLITICS_FRAME_NOT_CURRENT:${relative}`);
  const projection = read(`content/politics/projection/${relative}`);
  const expectedPath = `content/politics/learning/${key}/${chapter}.json`;
  if (projection.source.path !== expectedPath) throw new Error('POLITICS_FRAME_OWNER_MISMATCH');
  const bytes = fs.readFileSync(path.join(root,expectedPath));
  const blob = crypto.createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
  if (blob !== projection.source.blob_sha) throw new Error(`POLITICS_FRAME_STALE:${relative}`);
  const source = JSON.parse(bytes);
  const candidates = [...list(source.units),...list(source.unit_projections),...list(source.natural_units),...list(source.unit)];
  const units = projection.units.filter(x => x.projection_disposition === 'PASS').map(unit => {
    const matches = candidates.filter(x => x.natural_unit_id === unit.unit_id);
    if (matches.length !== 1) throw new Error(`POLITICS_FRAME_OWNER:${unit.unit_id}`);
    return { ...resolvePoliticsFrameRef(unit, source, matches[0]), title: matches[0].title || unit.unit_id };
  });
  return { source: projection.source, context: resolvePoliticsFrameRef(projection.chapter_context, source, null), units, referenceOnly: projection.units.filter(x=>x.projection_disposition==='REFERENCE_ONLY') };
}
