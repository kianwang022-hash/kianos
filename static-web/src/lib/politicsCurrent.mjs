import {
  listPoliticsSubjectsCurrent,
  listPoliticsChapterPathsCurrent,
  loadPoliticsChapterCurrent as loadPoliticsChapterFirstReady,
  politicsCurrentHealth as politicsFirstReadyHealth,
  politicsRuntimeDiagnostics as politicsFirstReadyDiagnostics
} from './politicsRuntimeFirstReady.mjs';
import {
  applyMarxismGlobalFirstReady,
  marxismFirstReadyDiagnostics
} from './politicsMarxismFirstReady.mjs';

export { listPoliticsSubjectsCurrent, listPoliticsChapterPathsCurrent };

export function loadPoliticsChapterCurrent(subject, chapter) {
  return applyMarxismGlobalFirstReady(loadPoliticsChapterFirstReady(subject, chapter), subject);
}

export function politicsCurrentHealth() {
  const base = politicsFirstReadyHealth();
  const marxism = marxismFirstReadyDiagnostics();
  return {
    ...base,
    marxismGlobalFirstReady: marxism.missingRegions.length === 0 && marxism.questionCount === 396
  };
}

export function politicsRuntimeDiagnostics() {
  const base = politicsFirstReadyDiagnostics();
  const marxism = marxismFirstReadyDiagnostics();
  return {
    ...base,
    marxismGlobalFirstReady: {
      units: marxism.orderedUnitIds.length,
      questions: marxism.questionCount,
      missingRegions: marxism.missingRegions
    }
  };
}
