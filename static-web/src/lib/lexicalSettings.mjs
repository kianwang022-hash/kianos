export const LEXICAL_SETTINGS_STORAGE_KEY = 'kianos-lexical-settings-v1';
export const LEXICAL_INTAKE_STORAGE_KEY = 'kianos-lexical-intake-v1';
export const LEXICAL_ROUTING_STORAGE_KEY = 'kianos-lexical-card-routing-v1';
export const DEFAULT_DAILY_NEW_LIMIT = 50;
export const DAILY_NEW_LIMIT_OPTIONS = [20, 30, 50, 80, 100];
export const DEFAULT_PRONUNCIATION = 'en-US';
export const PRONUNCIATION_OPTIONS = ['en-US', 'en-GB'];

export function localLexicalDay(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('en-CA');
}

export function normalizeLexicalSettings(value) {
  const raw = Number(value?.daily_new_limit);
  const dailyNewLimit = Number.isFinite(raw) && raw >= 1
    ? Math.round(raw)
    : DEFAULT_DAILY_NEW_LIMIT;
  const pronunciation = PRONUNCIATION_OPTIONS.includes(String(value?.default_pronunciation || ''))
    ? String(value.default_pronunciation)
    : DEFAULT_PRONUNCIATION;
  return {
    schema: 'kianos.lexical.settings.v1',
    daily_new_limit: dailyNewLimit,
    default_pronunciation: pronunciation
  };
}

export function normalizeLexicalIntake(value) {
  const introduced = value?.introduced && typeof value.introduced === 'object' && !Array.isArray(value.introduced)
    ? { ...value.introduced }
    : {};
  return {
    schema: 'kianos.lexical.intake.v1',
    introduced
  };
}

export function introducedCountForDay(intakeInput, studyDay = localLexicalDay()) {
  const intake = normalizeLexicalIntake(intakeInput);
  return Object.values(intake.introduced).filter((day) => day === studyDay).length;
}

export function introducedTotal(intakeInput) {
  return Object.keys(normalizeLexicalIntake(intakeInput).introduced).length;
}

export function introductionDayFor(intakeInput, wordId) {
  return normalizeLexicalIntake(intakeInput).introduced?.[String(wordId || '')] || '';
}

export function registerLexicalIntroduction(intakeInput, wordId, observedAt = new Date()) {
  const intake = normalizeLexicalIntake(intakeInput);
  const id = String(wordId || '');
  if (!id) return { intake, added: false, studyDay: '' };
  const existing = intake.introduced[id];
  if (existing) return { intake, added: false, studyDay: existing };
  const studyDay = localLexicalDay(observedAt);
  if (!studyDay) return { intake, added: false, studyDay: '' };
  intake.introduced[id] = studyDay;
  return { intake, added: true, studyDay };
}
export function normalizeLexicalRouting(value) {
  const history = Array.isArray(value?.history) ? [...value.history] : [];
  const latest = value?.latest_by_word && typeof value.latest_by_word === 'object' && !Array.isArray(value.latest_by_word)
    ? { ...value.latest_by_word }
    : {};
  return {
    schema: 'kianos.lexical.card_routing.v1',
    history,
    latest_by_word: latest
  };
}

function lexicalEventLocalDay(value) {
  return localLexicalDay(value?.observed_at || '');
}

export function sameDayLexicalRevisits(routingInput, studyDay = localLexicalDay()) {
  const routing = normalizeLexicalRouting(routingInput);
  const priority = { UNKNOWN: 0, FUZZY: 1 };
  return Object.values(routing.latest_by_word)
    .filter((event) => lexicalEventLocalDay(event) === studyDay)
    .filter((event) => ['UNKNOWN', 'FUZZY'].includes(String(event?.route || '').toUpperCase()))
    .sort((a, b) => {
      const routeDelta = (priority[String(a?.route || '').toUpperCase()] ?? 9) - (priority[String(b?.route || '').toUpperCase()] ?? 9);
      if (routeDelta) return routeDelta;
      return String(b?.observed_at || '').localeCompare(String(a?.observed_at || ''));
    });
}

export function sameDayLexicalRevisitCount(routingInput, studyDay = localLexicalDay()) {
  return sameDayLexicalRevisits(routingInput, studyDay).length;
}
