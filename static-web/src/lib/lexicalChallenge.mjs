import { readLexicalLedger, lexicalTargetKey } from './lexicalEvidence.mjs';
import { commitLearnerStorageChanges } from './browserLearnerWriter.mjs';

export const LEXICAL_CHALLENGE_PACKET_KEY = 'kianos-lexical-challenge-packet-v1';
export const LEXICAL_CHALLENGE_PROGRESS_KEY = 'kianos-lexical-challenge-progress-v1';
export const LEXICAL_CHALLENGE_EVENTS_KEY = 'kianos-lexical-challenge-events-v1';
const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const text = value => typeof value === 'string' && value.trim().length > 0;
const stable = value => Array.isArray(value) ? '[' + value.map(stable).join(',') + ']'
  : record(value) ? '{' + Object.keys(value).sort().map(key => JSON.stringify(key) + ':' + stable(value[key])).join(',') + '}' : JSON.stringify(value);
export const lexicalChallengeSignature = value => `${value?.study_day || ''}|${value?.generated_at || ''}|${value?.challenges?.map(item => item.challenge_id).join(',') || ''}`;

function validQuestion(q) {
  if (!record(q) || !text(q.stem) || !Array.isArray(q.options) || q.options.length < 2 || q.options.length > 4) return false;
  const keys = q.options.map(option => option?.key);
  return q.options.every(option => text(option?.text)) && keys.every(key => ['left','up','right','down'].includes(key))
    && new Set(keys).size === keys.length && keys.includes(q.correct_key);
}

export function validateLexicalChallengePacket(value, { day = null } = {}) {
  if (!record(value) || value.schema !== 'kianos.lexical.challenge_packet.v1') throw new Error('LEXICAL_CHALLENGE_SCHEMA_INVALID');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value.study_day || '') || !Number.isFinite(Date.parse(value.study_day + 'T00:00:00Z'))
    || new Date(value.study_day + 'T00:00:00Z').toISOString().slice(0,10) !== value.study_day) throw new Error('LEXICAL_CHALLENGE_DAY_INVALID');
  if (day && value.study_day !== day) throw new Error('LEXICAL_CHALLENGE_STALE_DAY');
  if (!text(value.generated_at) || !Number.isFinite(Date.parse(value.generated_at))) throw new Error('LEXICAL_CHALLENGE_TIME_INVALID');
  if (!Array.isArray(value.challenges) || !value.challenges.length || value.challenges.length > 80
    || JSON.stringify(value).length > 256_000) throw new Error('LEXICAL_CHALLENGE_SIZE_INVALID');
  const ids = new Set();
  for (const item of value.challenges) {
    if (!record(item) || !text(item.challenge_id) || ids.has(item.challenge_id) || !text(item.word_id)
      || !Number.isInteger(item.ordinal) || item.ordinal < 1 || !text(item.target_kind) || !lexicalTargetKey(item)
      || item.question_type !== 'spatial_choice' || !validQuestion(item)
      || (item.reconstruction != null && !validQuestion(item.reconstruction))) throw new Error('LEXICAL_CHALLENGE_ITEM_INVALID');
    ids.add(item.challenge_id);
  }
  return value;
}

export function initialLexicalChallengeProgress(packet) {
  return { packetSignature: lexicalChallengeSignature(packet), index: 0, mode: 'main', answered: false,
    pendingReconstruction: false, lastAnswerEventId: null };
}

export function readLexicalChallengeSession(storage) {
  const raw = storage.getItem(LEXICAL_CHALLENGE_PACKET_KEY);
  if (raw === null) {
    if (storage.getItem(LEXICAL_CHALLENGE_PROGRESS_KEY) !== null || storage.getItem(LEXICAL_CHALLENGE_EVENTS_KEY) !== null) throw new Error('LEXICAL_CHALLENGE_UNREADABLE_PRESERVE_DATA');
    return null;
  }
  try {
    const packet = validateLexicalChallengePacket(JSON.parse(raw));
    const progressRaw = storage.getItem(LEXICAL_CHALLENGE_PROGRESS_KEY);
    const eventsRaw = storage.getItem(LEXICAL_CHALLENGE_EVENTS_KEY);
    const progress = progressRaw === null ? initialLexicalChallengeProgress(packet) : JSON.parse(progressRaw);
    const events = eventsRaw === null ? [] : JSON.parse(eventsRaw);
    if (!record(progress) || progress.packetSignature !== lexicalChallengeSignature(packet)
      || !Number.isInteger(progress.index) || progress.index < 0 || progress.index > packet.challenges.length
      || !['main','reconstruction'].includes(progress.mode) || typeof progress.answered !== 'boolean'
      || (progress.dismissed !== undefined && typeof progress.dismissed !== 'boolean')
      || (progress.dismissed === true && progress.index !== packet.challenges.length)
      || !Array.isArray(events)) throw new Error('invalid progress');
    return { packet, progress, events };
  } catch { throw new Error('LEXICAL_CHALLENGE_UNREADABLE_PRESERVE_DATA'); }
}

export function lexicalChallengePacketMatches(storage, packet) {
  try { return stable(readLexicalChallengeSession(storage)?.packet) === stable(packet); }
  catch { return false; }
}

// Stage into the existing control transaction, or commit atomically for manual fallback.
export function stageLexicalChallengePacket(storage, value, { day = null } = {}) {
  validateLexicalChallengePacket(value, { day });
  readLexicalLedger(storage);
  const prior = readLexicalChallengeSession(storage);
  if (prior && stable(prior.packet) === stable(value)) return { status: 'idempotent', changes: [] };
  if (prior && lexicalChallengeSignature(prior.packet) === lexicalChallengeSignature(value)) throw new Error('LEXICAL_CHALLENGE_ID_CONFLICT');
  if (prior && Date.parse(prior.packet.generated_at) > Date.parse(value.generated_at)) throw new Error('LEXICAL_CHALLENGE_OLDER_PACKET');
  const changes = [[LEXICAL_CHALLENGE_PACKET_KEY, JSON.stringify(value)],
    [LEXICAL_CHALLENGE_PROGRESS_KEY, JSON.stringify(initialLexicalChallengeProgress(value))],
    [LEXICAL_CHALLENGE_EVENTS_KEY, '[]']];
  return { status: 'prepared', changes };
}

export function installLexicalChallengePacket(storage, value, options = {}) {
  const staged = stageLexicalChallengePacket(storage, value, options);
  commitLearnerStorageChanges(storage, staged.changes);
  return staged;
}

export function dismissLexicalChallengeSession(storage) {
  const session = readLexicalChallengeSession(storage);
  if (!session || session.progress.index !== session.packet.challenges.length) throw new Error('LEXICAL_CHALLENGE_NOT_COMPLETE');
  // Keep the same native identity so a retry cannot resurrect the dismissed session.
  commitLearnerStorageChanges(storage, [[LEXICAL_CHALLENGE_PROGRESS_KEY,
    JSON.stringify({ ...session.progress, dismissed: true })]]);
}
