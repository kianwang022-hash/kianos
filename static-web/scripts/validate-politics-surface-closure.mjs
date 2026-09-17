import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  loadPoliticsCompiledPresentation,
  resolvePoliticsPresentationRef
} from '../src/lib/politicsCompiledPresentation.mjs';

const repoRoot = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(process.cwd(), '..');
const projectionRoot = path.join(repoRoot, 'content/politics/projection');
const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const manifest = readJson(path.join(projectionRoot, 'manifest.json'));
const report = {
  schema: 'kianos.politics.surface_closure_validation.v1',
  generated_at: new Date().toISOString(),
  chapters: 0,
  pass_units: 0,
  reference_only_units: 0,
  handoffs: 0,
  optional_closures: 0,
  exact_items: 0,
  chapter_stage_objects: 0,
  chapter_geometries: 0,
  subjects: {}
};

const normalizeSubject = directory => directory === 'ethics-law' ? 'ethics_law' : directory;
const codeFor = file => path.basename(file, '.projection.json');
const resolveList = (refs, source, unit) => (refs || [])
  .map(ref => resolvePoliticsPresentationRef(ref, source, unit))
  .filter(value => value != null && value !== '' && (!Array.isArray(value) || value.length > 0));

for (const [directory, subjectManifest] of Object.entries(manifest.subjects || {})) {
  const subject = normalizeSubject(directory);
  const subjectReport = {
    chapters: 0,
    pass_units: 0,
    reference_only_units: 0,
    handoffs: 0,
    optional_closures: 0
  };

  for (const file of subjectManifest.files || []) {
    const projectionPath = path.join(projectionRoot, file);
    const projection = readJson(projectionPath);
    const source = readJson(path.join(repoRoot, projection.source.path));
    const rawUnits = source.units || source.unit_projections || (source.unit ? [source.unit] : []);
    const rawById = new Map(rawUnits.map(unit => [unit.natural_unit_id, unit]));
    const compiled = loadPoliticsCompiledPresentation(subject, codeFor(file));

    assert.ok(compiled instanceof Map, `compiled Map missing: ${file}`);
    assert.equal(compiled.meta?.file, file, `compiled meta file mismatch: ${file}`);
    assert.equal(compiled.meta?.sourcePath, projection.source.path, `compiled source path mismatch: ${file}`);

    const passRows = (projection.units || []).filter(row => row.projection_disposition === 'PASS');
    const referenceRows = (projection.units || []).filter(row => row.projection_disposition === 'REFERENCE_ONLY');
    assert.equal(compiled.size, passRows.length, `PASS consumer count mismatch: ${file}`);
    assert.deepEqual(
      [...compiled.referenceOnlyUnitIds].sort(),
      referenceRows.map(row => row.unit_id).sort(),
      `REFERENCE_ONLY registry mismatch: ${file}`
    );
    for (const row of referenceRows) {
      assert.equal(compiled.has(row.unit_id), false, `REFERENCE_ONLY leaked into teaching Map: ${row.unit_id}`);
    }

    const chapter = projection.chapter_context || {};
    const chapterResolve = ref => resolvePoliticsPresentationRef(ref, source, null);
    assert.deepEqual(compiled.chapterContext?.location, chapterResolve(chapter.location), `chapter location mismatch: ${file}`);
    assert.deepEqual(compiled.chapterContext?.problem, chapterResolve(chapter.current_problem), `chapter problem mismatch: ${file}`);
    const expectedStage = (chapter.stage_context || []).map(entry => ({ shape: entry.shape, value: chapterResolve(entry.content) })).filter(entry => entry.value != null && entry.value !== '');
    const expectedGeometries = (chapter.chapter_geometries || []).map(entry => ({ shape: entry.shape, value: chapterResolve(entry.content) })).filter(entry => entry.value != null && entry.value !== '');
    assert.deepEqual(compiled.chapterContext?.stage, expectedStage, `chapter stage context mismatch: ${file}`);
    assert.deepEqual(compiled.chapterContext?.geometries, expectedGeometries, `chapter geometry mismatch: ${file}`);

    for (const selected of passRows) {
      const rawUnit = rawById.get(selected.unit_id);
      assert.ok(rawUnit, `raw Current unit missing: ${selected.unit_id}`);
      const resolved = compiled.get(selected.unit_id);
      assert.ok(resolved, `compiled PASS unit missing: ${selected.unit_id}`);
      assert.equal(resolved.unitId, selected.unit_id, `unit id mismatch: ${selected.unit_id}`);
      assert.equal(resolved.disposition, 'PASS', `unit disposition mismatch: ${selected.unit_id}`);
      assert.equal(resolved.shape, selected.projection_shape, `unit shape mismatch: ${selected.unit_id}`);

      const resolve = ref => resolvePoliticsPresentationRef(ref, source, rawUnit);
      assert.deepEqual(resolved.problem, resolve(selected.current_problem), `problem mismatch: ${selected.unit_id}`);
      assert.deepEqual(resolved.boundaries, resolveList(selected.boundaries, source, rawUnit), `boundary mismatch: ${selected.unit_id}`);
      assert.deepEqual(resolved.exact, resolveList(selected.first_round_exact, source, rawUnit), `exact mismatch: ${selected.unit_id}`);
      assert.deepEqual(resolved.takeaway, resolveList(selected.takeaway, source, rawUnit), `takeaway mismatch: ${selected.unit_id}`);
      assert.deepEqual(resolved.next, resolve(selected.next_bridge), `next mismatch: ${selected.unit_id}`);
      assert.deepEqual(resolved.optionalClosure, resolve(selected.optional_closure), `optional closure mismatch: ${selected.unit_id}`);

      if (selected.chengfeng_handoff) {
        assert.ok(resolved.chengfengHandoff, `handoff dropped: ${selected.unit_id}`);
        assert.equal(resolved.chengfengHandoff.surface, selected.chengfeng_handoff.surface || null, `handoff surface mismatch: ${selected.unit_id}`);
        assert.deepEqual(
          resolved.chengfengHandoff.sourceOwnerIds,
          (selected.chengfeng_handoff.source_owner_ids || []).map(String).filter(Boolean),
          `handoff owners mismatch: ${selected.unit_id}`
        );
        assert.deepEqual(
          resolved.chengfengHandoff.sourceLocator,
          resolve(selected.chengfeng_handoff.source_locator),
          `handoff locator mismatch: ${selected.unit_id}`
        );
        assert.deepEqual(
          resolved.chengfengHandoff.lookFor,
          resolveList(selected.chengfeng_handoff.look_for, source, rawUnit),
          `handoff look-for mismatch: ${selected.unit_id}`
        );
        subjectReport.handoffs += 1;
        report.handoffs += 1;
      }

      if (selected.optional_closure) {
        subjectReport.optional_closures += 1;
        report.optional_closures += 1;
      }
      report.exact_items += resolved.exact.length;
    }

    subjectReport.chapters += 1;
    subjectReport.pass_units += passRows.length;
    subjectReport.reference_only_units += referenceRows.length;
    report.chapters += 1;
    report.pass_units += passRows.length;
    report.reference_only_units += referenceRows.length;
    report.chapter_stage_objects += compiled.chapterContext?.stage?.length || 0;
    report.chapter_geometries += compiled.chapterContext?.geometries?.length || 0;
  }

  assert.equal(subjectReport.chapters, subjectManifest.chapters, `manifest chapter count mismatch: ${directory}`);
  assert.equal(subjectReport.pass_units, subjectManifest.pass, `manifest PASS count mismatch: ${directory}`);
  assert.equal(subjectReport.reference_only_units, subjectManifest.reference_only, `manifest REFERENCE_ONLY count mismatch: ${directory}`);
  assert.equal(subjectManifest.blocked, 0, `BLOCKED Projection owners remain: ${directory}`);
  report.subjects[directory] = subjectReport;
}

assert.equal(report.chapters, 53, 'expected 53 Current compiled Politics chapters');
assert.equal(report.pass_units, 151, 'expected 151 PASS Projection units');
assert.equal(report.reference_only_units, 9, 'expected 9 REFERENCE_ONLY Projection owners');
assert.equal(report.pass_units + report.reference_only_units, 160, 'expected 160 accounted Current Projection owners');

const qaDir = path.join(process.cwd(), '.qa');
fs.mkdirSync(qaDir, { recursive: true });
fs.writeFileSync(path.join(qaDir, 'politics-surface-closure.json'), JSON.stringify(report, null, 2));
console.log(`POLITICS_SURFACE_CLOSURE_PASS chapters=${report.chapters} pass=${report.pass_units} reference_only=${report.reference_only_units} handoffs=${report.handoffs} closures=${report.optional_closures}`);
