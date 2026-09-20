const clean = (value, max = 1000) => String(value ?? '').trim().slice(0, max);

export function buildPoliticsAnalysisRegistry({ manifest, legacyIndex } = {}) {
  const boundCurrentYearSources = Object.entries(manifest?.future_source_families?.families || {})
    .filter(([, row]) => row?.status === 'BOUND' && row?.current_year_authority === true)
    .map(([family, row]) => ({
      family: clean(family, 160),
      revision: clean(row?.revision_id, 240),
      current_year_authority: true
    }))
    .filter(row => row.family && row.revision);

  const acceptedLegacyTasks = (Array.isArray(legacyIndex?.drills) ? legacyIndex.drills : [])
    .map(row => ({
      task_id: clean(row?.task_id, 240),
      task_revision: clean(row?.task_revision, 240),
      subject: clean(row?.subject, 80),
      subquestion_id: clean(String(row?.question || '') + '-' + String(row?.subquestion || ''), 200),
      task_mode: clean(row?.mode, 40),
      rubric_version: clean(row?.rubric_version, 120),
      freshness_class: clean(row?.freshness_class, 60),
      formulation_requirement: clean(row?.formulation_requirement, 60),
      source_basis: row?.source_basis && typeof row.source_basis === 'object' && !Array.isArray(row.source_basis)
        ? {
            family: clean(row.source_basis.family, 160),
            identity: clean(row.source_basis.identity, 500),
            revision: clean(row.source_basis.revision, 240) || null,
            authority_status: clean(row.source_basis.authority_status, 40)
          }
        : null
    }))
    .filter(row => row.task_id && row.task_revision && row.source_basis);

  return {
    schema: 'kianos.politics.analysis-registry.v1',
    acceptedLegacyTasks,
    boundCurrentYearSources
  };
}
