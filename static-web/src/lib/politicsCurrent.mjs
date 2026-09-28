import {
  listPoliticsSubjectsCurrent as listPoliticsSubjectsFirstReady,
  listPoliticsChapterPathsCurrent,
  loadPoliticsChapterCurrent as loadPoliticsChapterFirstReady,
  politicsCurrentHealth as politicsFirstReadyHealth,
  politicsRuntimeDiagnostics as politicsFirstReadyDiagnostics
} from './politicsRuntimeFirstReady.mjs';
import {
  applyMarxismGlobalFirstReady,
  marxismFirstReadyDiagnostics
} from './politicsMarxismFirstReady.mjs';
import {
  applyHistoryGlobalFirstReady,
  historyFirstReadyDiagnostics
} from './politicsHistoryFirstReady.mjs';
import { applyMaoProjection } from './politicsMaoProjection.mjs';
import { applyXiProjection } from './politicsXiProjection.mjs';
import { applyEthicsProjection } from './politicsEthicsProjection.mjs';
import { resolvePoliticsSurfaceMapping } from './politicsSurfaceMapping.mjs';

export { listPoliticsChapterPathsCurrent };

export function listPoliticsSubjectsCurrent() {
  return listPoliticsSubjectsFirstReady().map((subject) => {
    const { subjectMap, ...publicSubject } = subject;
    const frameworkPlan = subjectMap?.surface_mapping
      ? resolvePoliticsSurfaceMapping(subjectMap.surface_mapping, null, null, subjectMap)
      : null;
    return { ...publicSubject, frameworkPlan };
  });
}

export function loadPoliticsChapterCurrent(subject, chapter) {
  const firstReady = loadPoliticsChapterFirstReady(subject, chapter);
  const marxism = applyMarxismGlobalFirstReady(firstReady, subject);
  const history = applyHistoryGlobalFirstReady(marxism, subject);
  const mao = applyMaoProjection(history, subject);
  const xi = applyXiProjection(mao, subject);
  return applyEthicsProjection(xi, subject);
}

export function politicsCurrentHealth() {
  const base = politicsFirstReadyHealth();
  const marxism = marxismFirstReadyDiagnostics();
  const history = historyFirstReadyDiagnostics();
  return {
    ...base,
    marxismGlobalFirstReady: marxism.missingRegions.length === 0 && marxism.questionCount === 396,
    historyGlobalFirstReady: history.missingRegions.length === 0
      && history.unrepresentedRegions.length === 0
      && history.questionCount > 0
  };
}

export function politicsRuntimeDiagnostics() {
  const base = politicsFirstReadyDiagnostics();
  const marxism = marxismFirstReadyDiagnostics();
  const history = historyFirstReadyDiagnostics();
  return {
    ...base,
    marxismGlobalFirstReady: {
      units: marxism.orderedUnitIds.length,
      questions: marxism.questionCount,
      missingRegions: marxism.missingRegions
    },
    historyGlobalFirstReady: {
      canonicalUnits: history.orderedCanonicalUnitIds.length,
      learnerUnits: history.learnerGroups.length,
      questions: history.questionCount,
      missingRegions: history.missingRegions,
      unrepresentedRegions: history.unrepresentedRegions
    }
  };
}
