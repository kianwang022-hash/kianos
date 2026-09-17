import { globalNavigation } from './sharedNavigation.mjs';

export const HOME_SUBJECT_IDS = Object.freeze(
  globalNavigation('/')
    .filter((item) => item.key !== 'home')
    .map((item) => item.key)
);

export const HOME_SUBJECT_ORDER = Object.freeze(
  Object.fromEntries(HOME_SUBJECT_IDS.map((subject, index) => [subject, index]))
);

export function compareHomeSubjects(a, b) {
  return (HOME_SUBJECT_ORDER[a] ?? Number.MAX_SAFE_INTEGER)
    - (HOME_SUBJECT_ORDER[b] ?? Number.MAX_SAFE_INTEGER);
}
