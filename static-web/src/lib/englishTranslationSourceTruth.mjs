import {
  inspectTranslationSources as baseInspectTranslationSources,
  listTranslationSets as baseListTranslationSets,
  loadTranslationById as baseLoadTranslationById,
  loadTranslationReferencesById
} from './englishTranslation.mjs';
import { inspectEnglishSourceTruth, projectTranslationSourceTruth } from './englishSourceTruth.mjs';

export { loadTranslationReferencesById };
export const listTranslationSets = baseListTranslationSets;

export function inspectTranslationSources() {
  const base = baseInspectTranslationSources();
  const truth = inspectEnglishSourceTruth();
  return {
    ...base,
    sourceTruthStatus: truth.status,
    sourceTruthIssues: truth.issues,
    sourceTruthUnitCount: truth.unitCount,
    status: base.status === 'ready' && truth.status === 'ready' ? 'ready' : 'invalid',
    issues: [...(base.issues || []), ...(truth.status === 'ready' ? [] : truth.issues || [])]
  };
}

export function loadTranslationById(id) {
  return projectTranslationSourceTruth(baseLoadTranslationById(id));
}

export function loadDefaultTranslation() {
  const items = listTranslationSets();
  if (!items.length) throw new Error('CURRENT_TRANSLATION_SOURCE_NOT_READY:empty');
  const preferred = process.env.KIANOS_TRANSLATION_SET_ID;
  const selected = preferred && items.some((item) => item.id === preferred) ? preferred : items[0].id;
  return loadTranslationById(selected);
}
