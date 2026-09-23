import {
  compileRepairTargets,
  emptyLexicalLedger,
  exportReturnEvents,
  readLexicalLedger,
  LEXICAL_LEDGER_STORAGE_KEY,
  normalizeLexicalLedger
} from './lexicalEvidence.mjs';
import {
  introducedCountForDay,
  LEXICAL_ROUTING_STORAGE_KEY,
  LEXICAL_INTAKE_STORAGE_KEY,
  LEXICAL_SETTINGS_STORAGE_KEY,
  introducedTotal,
  localLexicalDay,
  normalizeLexicalIntake,
  normalizeLexicalRouting,
  normalizeLexicalSettings,
  sameDayLexicalRevisits
} from './lexicalSettings.mjs';
import { readLexicalChallengeSession } from './lexicalChallenge.mjs';

export const LEXICAL_CHAT_STATE_SCHEMA = 'kianos.lexical.chat_state.v1';

const routeName = (value) => String(value || '').toUpperCase();
const eventDay = (iso) => localLexicalDay(iso);
const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);

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
      same_day_revisit: revisits.slice(0, 80),
      truncated_revisit_count: Math.max(0, revisits.length - 80),
      recent_judgments: recent
    },
    repair: {
      active_target_count: repairTargets.length,
      active_word_count: new Set(repairTargets.map((target) => target.word_id).filter(Boolean)).size,
      active_targets: repairPreview,
      truncated_target_count: Math.max(0, repairTargets.length - repairPreview.length)
    },
    today_evidence: todayEvidence.slice(-60),
    today_evidence_count: todayEvidence.length,
    truncated_today_evidence_count: Math.max(0, todayEvidence.length - 60),
    challenge_session: challengeSession
  };
}

// The browser clipboard and private Daily Packet consume the same native view.
// This is a projection, never another stored learner snapshot.
export function readLexicalChatState(storage, { now = Date.now() } = {}) {
  const keys = [LEXICAL_LEDGER_STORAGE_KEY, LEXICAL_ROUTING_STORAGE_KEY, LEXICAL_INTAKE_STORAGE_KEY,
    LEXICAL_SETTINGS_STORAGE_KEY, 'kianos-vocabulary-last-ordinal', 'kianos-lexical-challenge-packet-v1',
    'kianos-lexical-challenge-progress-v1', 'kianos-lexical-challenge-events-v1'];
  if (!keys.some(key => storage.getItem(key) !== null)) return { status: 'missing', packet: null };
  try {
    const read = (key, schema = null) => {
      const raw = storage.getItem(key);
      if (raw === null) return null;
      const value = JSON.parse(raw);
      if (!record(value) || (schema && value.schema !== schema)) throw new Error('LEXICAL_STATE_UNREADABLE');
      return value;
    };
    const ledger = readLexicalLedger(storage);
    const routing = read(LEXICAL_ROUTING_STORAGE_KEY, 'kianos.lexical.card_routing.v1');
    const intake = read(LEXICAL_INTAKE_STORAGE_KEY, 'kianos.lexical.intake.v1');
    const settings = read(LEXICAL_SETTINGS_STORAGE_KEY, 'kianos.lexical.settings.v1');
    if (routing && (!Array.isArray(routing.history) || !record(routing.latest_by_word)
      || [...routing.history, ...Object.values(routing.latest_by_word)].some(row => !record(row) || !row.word_id
        || !['UNKNOWN','FUZZY','KNOWN','MASTERED'].includes(routeName(row.route))))) throw new Error('LEXICAL_ROUTING_UNREADABLE');
    if (intake && !record(intake.introduced)) throw new Error('LEXICAL_INTAKE_UNREADABLE');
    if (settings && (!Number.isInteger(settings.daily_new_limit) || settings.daily_new_limit < 1)) throw new Error('LEXICAL_SETTINGS_UNREADABLE');
    const ordinalRaw = storage.getItem('kianos-vocabulary-last-ordinal');
    const ordinal = ordinalRaw === null ? null : Number(ordinalRaw);
    if (ordinal !== null && (!Number.isInteger(ordinal) || ordinal < 1)) throw new Error('LEXICAL_CURSOR_UNREADABLE');
    const cursorEvent = Object.values(routing?.latest_by_word || {}).find(row => row?.ordinal === ordinal);
    const challenge = readLexicalChallengeSession(storage);
    const packet = buildLexicalChatStatePacket({ ledger, routing, intake, settings,
      cursor: ordinal === null ? null : { ordinal, word_id: cursorEvent?.word_id || null, word: cursorEvent?.word || null },
      challengePacket: challenge?.packet, challengeProgress: challenge?.progress,
      challengeEvents: challenge?.events || [], now });
    packet.availability = {
      ledger: storage.getItem(LEXICAL_LEDGER_STORAGE_KEY) === null ? 'missing' : 'ready',
      routing: routing ? 'ready' : 'missing', intake: intake ? 'ready' : 'missing'
    };
    if (packet.availability.ledger === 'missing') {
      packet.repair = { status: 'unknown', active_target_count: null, active_targets: [] };
    }
    return { status: 'ready', packet };
  } catch {
    return { status: 'unreadable', packet: null, semantics: 'UNREADABLE_PRIVATE_STATE_IS_UNKNOWN_NOT_ZERO' };
  }
}

export function serializeLexicalChatStateForChat(packet) {
  if (!packet || packet.schema !== LEXICAL_CHAT_STATE_SCHEMA) {
    throw new Error('Invalid Lexical Chat State Packet.');
  }
  return [
    'KIANOS_LEXICAL_HANDOFF_V1',
    'This packet was exported by the KianOS Vocabulary learner website for Chat.',
    '',
    'HOW TO READ IT',
    '- Read the embedded chat_instruction and semantics first. Coverage is traversal, not mastery; same-day revisit is not debt; Repair contains exact evidence-backed targets.',
    '- Continue learning from this private state. Read content/lexical/LEARNING_CONTRACT.md or exact Word owners only when needed; engineering CURRENT is not the learning entry.',
    '- Missing evidence quality stays unknown. Do not turn whole-card Unknown/Fuzzy alone into durable Repair.',
    '',
    'WHAT CHAT SHOULD DO',
    '- Explain the current vocabulary state in normal language and choose only a small useful action.',
    '- If a Repair test is useful, deliver one kianos.lexical.challenge_packet.v1 through the existing private control operation lexical.challenge; verify the apply receipt. Follow content/lexical/learner/packet-contract.json. Manual paste is a fallback when delivery is unavailable.',
    '- If no generated test is useful, answer normally; a structured return is not mandatory.',
    '',
    'LEXICAL_CHAT_STATE_JSON',
    JSON.stringify(packet, null, 2)
  ].join('\n');
}

export function parseLexicalChallengePacketText(input) {
  if (input && typeof input === 'object' && !Array.isArray(input)) return input;
  const raw = String(input || '').trim();
  if (!raw) throw new Error('LEXICAL_CHALLENGE_IMPORT_EMPTY');

  const candidates = [raw];
  const fenced = raw.match(/\`\`\`(?:json)?\s*([\s\S]*?)\`\`\`/i);
  if (fenced?.[1]) candidates.push(fenced[1].trim());
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start >= 0 && end > start) candidates.push(raw.slice(start, end + 1));

  for (const candidate of candidates) {
    try {
      const value = JSON.parse(candidate);
      if (value && typeof value === 'object' && !Array.isArray(value)) return value;
    } catch {}
  }
  throw new Error('LEXICAL_CHALLENGE_IMPORT_INVALID');
}
