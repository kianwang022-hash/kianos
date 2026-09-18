import {
  compileRepairTargets,
  emptyLexicalLedger,
  exportReturnEvents,
  normalizeLexicalLedger
} from './lexicalEvidence.mjs';
import {
  introducedCountForDay,
  introducedTotal,
  localLexicalDay,
  normalizeLexicalIntake,
  normalizeLexicalRouting,
  normalizeLexicalSettings,
  sameDayLexicalRevisits
} from './lexicalSettings.mjs';

export const LEXICAL_CHAT_STATE_SCHEMA = 'kianos.lexical.chat_state.v1';

const routeName = (value) => String(value || '').toUpperCase();
const eventDay = (iso) => localLexicalDay(iso);

function compactRoutingEvent(event) {
  if (!event || typeof event !== 'object') return null;
  return {
    word_id: event.word_id || null,
    ordinal: Number(event.ordinal || 0) || null,
    word: event.word || null,
    route: routeName(event.route),
    observed_at: event.observed_at || null
  };
}

function compactRepairTarget(target) {
  return {
    word_id: target.word_id || null,
    ordinal: Number(target.ordinal || 0) || null,
    word: target.word || null,
    target_kind: target.target_kind || null,
    target_id: target.target_id || null,
    target_locator: target.target_locator || null,
    target_revision: target.target_revision || null,
    required_demand: target.required_demand || target.demand || null,
    diagnosis_required: Boolean(target.diagnosis_required),
    activated_at: target.activated_at || null,
    last_evidence_at: target.last_evidence_at || null
  };
}

export function buildLexicalChatStatePacket({
  ledger,
  routing,
  intake,
  settings,
  cursor = null,
  challengePacket = null,
  challengeProgress = null,
  challengeEvents = [],
  now = new Date()
} = {}) {
  const date = now instanceof Date ? now : new Date(now);
  const studyDay = localLexicalDay(date);
  const safeLedger = normalizeLexicalLedger(ledger || emptyLexicalLedger());
  const safeRouting = normalizeLexicalRouting(routing);
  const safeIntake = normalizeLexicalIntake(intake);
  const safeSettings = normalizeLexicalSettings(settings);
  const latest = Object.values(safeRouting.latest_by_word || {});
  const routeCounts = { UNKNOWN: 0, FUZZY: 0, KNOWN: 0, MASTERED: 0 };
  latest.forEach((event) => {
    const route = routeName(event?.route);
    if (route in routeCounts) routeCounts[route] += 1;
  });

  const revisits = sameDayLexicalRevisits(safeRouting, studyDay).map(compactRoutingEvent).filter(Boolean);
  const recent = [...safeRouting.history]
    .sort((a, b) => String(b?.observed_at || '').localeCompare(String(a?.observed_at || '')))
    .slice(0, 24).map(compactRoutingEvent).filter(Boolean);
  const repairTargets = compileRepairTargets(safeLedger);
  const repairPreview = repairTargets.slice(0, 80).map(compactRepairTarget);
  const todayEvidence = exportReturnEvents(safeLedger, studyDay, eventDay);
  const todayNew = introducedCountForDay(safeIntake, studyDay);
  const introduced = introducedTotal(safeIntake);

  const challenges = challengePacket?.schema === 'kianos.lexical.challenge_packet.v1' && Array.isArray(challengePacket.challenges)
    ? challengePacket.challenges : [];
  const challengeIndex = Number(challengeProgress?.index || 0);
  const challengeCurrent = challenges[challengeIndex] || null;
  const challengeSession = challenges.length ? {
    total: challenges.length,
    next_index: Math.min(Math.max(challengeIndex, 0), challenges.length),
    mode: challengeProgress?.mode || 'main',
    answered: Boolean(challengeProgress?.answered),
    current_challenge_id: challengeCurrent?.challenge_id || null,
    current_word: challengeCurrent?.word || null,
    current_target_kind: challengeCurrent?.target_kind || null,
    session_event_count: Array.isArray(challengeEvents) ? challengeEvents.length : 0
  } : null;

  return {
    schema: LEXICAL_CHAT_STATE_SCHEMA,
    study_day: studyDay,
    exported_at: date.toISOString(),
    chat_instruction: 'Read Coverage as traversal, not mastery. Whole-card routes are current routing judgments only. Same-day revisit is today-only and never debt. Repair contains exact evidence-backed unstable objects. Use active Repair targets for generated Tests; do not turn Fuzzy/Unknown alone into future Repair.',
    semantics: {
      coverage: 'learner traversal only; not mastery',
      card_routing: 'latest whole-card routing judgment; not an SRS score',
      same_day_revisit: 'ephemeral today-only Unknown/Fuzzy routing support; not debt',
      repair: 'exact ACTIVE lexical targets derived from meaningful evidence',
      reconstruction: 'same-session reconstruction does not prove delayed transfer'
    },
    coverage: {
      cursor: cursor && typeof cursor === 'object' ? {
        word_id: cursor.word_id || null,
        ordinal: Number(cursor.ordinal || 0) || null,
        word: cursor.word || null
      } : null,
      introduced_total: introduced,
      today_new: todayNew,
      daily_new_limit: safeSettings.daily_new_limit,
      remaining_new_capacity: Math.max(0, safeSettings.daily_new_limit - todayNew)
    },
    routing: {
      latest_total: latest.length,
      latest_counts: {
        unknown: routeCounts.UNKNOWN,
        fuzzy: routeCounts.FUZZY,
        known: routeCounts.KNOWN,
        mastered: routeCounts.MASTERED
      },
      same_day_revisit: revisits,
      recent_judgments: recent
    },
    repair: {
      active_target_count: repairTargets.length,
      active_word_count: new Set(repairTargets.map((target) => target.word_id).filter(Boolean)).size,
      active_targets: repairPreview,
      truncated_target_count: Math.max(0, repairTargets.length - repairPreview.length)
    },
    today_evidence: todayEvidence,
    challenge_session: challengeSession
  };
}
