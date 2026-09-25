import { assertLearnerStorageWritable, commitLearnerStorageChanges } from './browserLearnerWriter.mjs';
import {
  EXAM_CHAT_PLAN_KEY
} from './examChatPlan.mjs';
import {
  EXAM_PROFILE_KEY
} from './examOrchestrator.mjs';
import {
  PRIVATE_CHECKPOINT_SCHEMA,
  buildPrivateLearnerCheckpoint,
  readPrivateLearnerCheckpoint,
  writePrivateLearnerCheckpoint
} from './privateLearnerCheckpoint.mjs';
import {
  SHARED_CONTROL_CHECKPOINT_SCHEMA,
  captureSharedControlCheckpoint,
  restoreSharedControlCheckpoint
} from './sharedControlCheckpoint.mjs';
import {
  STUDY_TIMER_LEDGER_KEY,
  STUDY_TIMER_STATE_KEY,
  studyDayAt
} from './studyTimer.mjs';
import {
  applyPrivateSubjectCheckpointRestore,
  capturePrivateSubjectCheckpoints,
  preparePrivateSubjectCheckpointRestore,
  sameCheckpointRaw,
  SUBJECT_CHECKPOINT_GROUPS,
  subjectCheckpointEntries,
  subjectCheckpointConflicts
} from './privateSubjectCheckpoints.mjs';

import { CONTROL_LOCAL_RECEIPT_KEY } from './privateControlCommand.mjs';
import { STEWARD_REALITY_KEY } from './stewardReality.mjs';

export const PRIVATE_CHECKPOINT_RUNTIME_SCHEMA = 'kianos.private-checkpoint-runtime.v1';

const SHARED_STORAGE_KEYS = Object.freeze([
  EXAM_PROFILE_KEY,
  EXAM_CHAT_PLAN_KEY,
  STUDY_TIMER_STATE_KEY,
  STUDY_TIMER_LEDGER_KEY,
  STEWARD_REALITY_KEY
]);

const readRaw = (storage, key) => {
  if (!storage?.getItem) throw new Error('PRIVATE_CHECKPOINT_STORAGE_UNAVAILABLE');
  return storage.getItem(key);
};

export function sharedControlStorageIsEmpty(storage) {
  return SHARED_STORAGE_KEYS.every((key) => readRaw(storage, key) == null);
}

function sharedForCurrentDay(shared, currentDay) {
  if (!shared || shared.schema !== SHARED_CONTROL_CHECKPOINT_SCHEMA) {
    throw new Error('PRIVATE_CHECKPOINT_SHARED_CONTROL_INVALID');
  }
  return {
    ...shared,
    study_day: currentDay,
    chat_plan: shared.study_day === currentDay ? shared.chat_plan : null
  };
}

// Transport concurrency token only: no learner facts, cache, or second ledger.
export const PRIVATE_CHECKPOINT_BASE_KEY = 'kianos-private-checkpoint-base-v1';
export const PRIVATE_CHECKPOINT_LINEAGE_KEY = 'kianos-private-checkpoint-lineage-v2';
const PRIVATE_CHECKPOINT_LINEAGE_SCHEMA = 'kianos.private-checkpoint-lineage.v2';
const CHECKPOINT_SHARED_GROUP_ID = 'shared';
const CHECKPOINT_GROUP_IDS = Object.freeze([
  CHECKPOINT_SHARED_GROUP_ID,
  ...SUBJECT_CHECKPOINT_GROUPS.map(({ id }) => id)
]);
class SharedStorage {
  constructor(storage = null) {
    this.map = new Map([...SHARED_STORAGE_KEYS, CONTROL_LOCAL_RECEIPT_KEY]
      .map(key => [key, storage?.getItem(key) ?? null]).filter(([, raw]) => raw != null));
  }
  get length() { return this.map.size; }
  key(i) { return [...this.map.keys()][i] ?? null; }
  getItem(key) { return this.map.get(key) ?? null; }
  setItem(key, raw) { this.map.set(key, String(raw)); }
  removeItem(key) { this.map.delete(key); }
}
function sharedProjection(shared, day) {
  const staged = new SharedStorage();
  const result = restoreSharedControlCheckpoint(staged, sharedForCurrentDay(shared, day), { expectedDay: day, restoreReceipt: true });
  return { staged, warnings: result.warnings || [] };
}
function sharedConflict(storage, projected) {
  return [...projected.map].some(([key, raw]) => storage.getItem(key) != null && !sameCheckpointRaw(storage.getItem(key), raw));
}
function rememberBase(storage, id, warnings) {
  try { storage.setItem(PRIVATE_CHECKPOINT_BASE_KEY, id); }
  catch { warnings.push('checkpoint:shared:PRIVATE_CHECKPOINT_BASE_UNAVAILABLE'); }
}
function readLineageMap(storage) {
  const raw = storage.getItem(PRIVATE_CHECKPOINT_LINEAGE_KEY);
  if (typeof raw !== 'string' || !raw.trim()) return {};
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.schema !== PRIVATE_CHECKPOINT_LINEAGE_SCHEMA || !parsed.groups || typeof parsed.groups !== 'object' || Array.isArray(parsed.groups)) {
      return {};
    }
    return Object.fromEntries(Object.entries(parsed.groups).filter(([key, value]) =>
      CHECKPOINT_GROUP_IDS.includes(key) && typeof value === 'string' && value.trim()
    ));
  } catch {
    return {};
  }
}
function allowLocalChangesByGroup(storage, checkpointId) {
  if (!checkpointId) return Object.fromEntries(CHECKPOINT_GROUP_IDS.map((id) => [id, true]));
  const lineage = readLineageMap(storage);
  const legacyBase = storage.getItem(PRIVATE_CHECKPOINT_BASE_KEY);
  return Object.fromEntries(CHECKPOINT_GROUP_IDS.map((id) => [
    id,
    legacyBase === checkpointId || lineage[id] === checkpointId
  ]));
}
function warningGroupId(warning) {
  if (typeof warning !== 'string' || !warning.startsWith('checkpoint:')) return null;
  const prefix = warning.slice('checkpoint:'.length);
  const sep = prefix.indexOf(':');
  if (sep <= 0) return null;
  const id = prefix.slice(0, sep);
  return CHECKPOINT_GROUP_IDS.includes(id) ? id : null;
}
function rememberLineage(storage, checkpointId, successfulGroupIds, warnings) {
  try {
    const next = readLineageMap(storage);
    for (const groupId of successfulGroupIds) next[groupId] = checkpointId;
    storage.setItem(PRIVATE_CHECKPOINT_LINEAGE_KEY, JSON.stringify({
      schema: PRIVATE_CHECKPOINT_LINEAGE_SCHEMA,
      groups: next
    }));
  } catch {
    warnings.push('checkpoint:shared:PRIVATE_CHECKPOINT_LINEAGE_UNAVAILABLE');
  }
}
// These keys contain navigation/liveness metadata, not new learner evidence.
// Only a locally newer observation of the SAME paused state/position can prove
// equivalence. Active timing, answers, ledger rows and receipts stay exact.
function sameRecoveredValue(key, localRaw, durableRaw) {
  if (sameCheckpointRaw(localRaw, durableRaw)) return true;
  try {
    const local = JSON.parse(localRaw), durable = JSON.parse(durableRaw);
    if (!local || !durable || Array.isArray(local) || Array.isArray(durable)) return false;
    let fields;
    if (['kianos-xizong-last-location-v1', 'kianos-politics-last-location-v1'].includes(key)) {
      const a = Date.parse(local.observed_at), b = Date.parse(durable.observed_at);
      if (!Number.isFinite(a) || !Number.isFinite(b) || a < b) return false;
      fields = ['observed_at'];
    } else if (key === STUDY_TIMER_STATE_KEY && local.running === false && durable.running === false) {
      fields = ['lastSeenAt', 'updatedAt', 'revision'];
      if (!fields.every(field => Number.isFinite(local[field]) && Number.isFinite(durable[field]) && local[field] >= durable[field])) return false;
    } else return false;
    for (const field of fields) { delete local[field]; delete durable[field]; }
    return sameCheckpointRaw(JSON.stringify(local), JSON.stringify(durable));
  } catch { return false; }
}
function localContainsCheckpoint(storage, checkpoint, day, { includeReceipt = true } = {}) {
  const entries = Object.values(checkpoint.payload?.subjects || {}).flatMap(subjectCheckpointEntries);
  const projection = sharedProjection(checkpoint.payload?.shared, day);
  if (projection.warnings.length) return false;
  if (!entries.every(([key, raw]) => storage.getItem(key) != null && sameRecoveredValue(key, storage.getItem(key), raw))) return false;
  // Native timer readers define an absent timer as empty. Compare that read
  // model, so an initial empty save need not manufacture local storage keys.
  const local = sharedProjection(captureSharedControlCheckpoint(storage, { studyDay: day }), day);
  return !local.warnings.length && [...projection.staged.map]
    .filter(([key])=>includeReceipt || key!==CONTROL_LOCAL_RECEIPT_KEY)
    .every(([key, raw]) => sameRecoveredValue(key, local.staged.getItem(key), raw));
}

export async function restoreSharedControlFromPrivate(storage, {
  now = Date.now(), readCheckpoint = readPrivateLearnerCheckpoint
} = {}) {
  const studyDay = studyDayAt(now), remote = await readCheckpoint();
  assertLearnerStorageWritable(storage);
  if (remote?.status !== 'ready' || remote?.checkpoint?.schema !== PRIVATE_CHECKPOINT_SCHEMA) {
    return { status: remote?.status || 'unavailable', reason: remote?.error || null, study_day: studyDay };
  }
  const checkpoint = remote.checkpoint;
  // A denied local read is not an empty store. Read the receipt destination
  // before preparing recovery; malformed shared VALUES still isolate locally.
  const originalReceiptRaw = storage.getItem(CONTROL_LOCAL_RECEIPT_KEY);
  const prepared = preparePrivateSubjectCheckpointRestore(storage, checkpoint.payload?.subjects || {}, { onlyIfEmpty: true });
  const warnings = Object.entries(prepared.results).filter(([, row]) => row.status === 'blocked' || row.blocked?.length)
    .map(([subject, row]) => 'checkpoint:' + subject + ':' + (row.reason || 'native recovery ambiguous'));
  const sharedChanges = [];
  let deferredReceipt = null;
  let concurrent = Object.values(checkpoint.payload?.subjects || {}).some(value => subjectCheckpointConflicts(storage, value));
  try {
    const projection = sharedProjection(checkpoint.payload?.shared, studyDay);
    warnings.push(...projection.warnings);
    concurrent ||= sharedConflict(storage, projection.staged);
    for (const [key, raw] of projection.staged.map) {
      if(key===CONTROL_LOCAL_RECEIPT_KEY){deferredReceipt=raw;continue;}
      if(storage.getItem(key)==null)sharedChanges.push([key,raw]);
    }
  } catch (error) { warnings.push('checkpoint:shared:' + String(error.message || error)); }
  // Apply the existing native preparation to an ephemeral overlay first. The
  // success receipt is admitted only with its actual recovered native values,
  // then the WHOLE write-set commits under the same browser ownership.
  const pending = new Map(sharedChanges);
  const staged = {
    getItem:key=>pending.has(key)?pending.get(key):storage.getItem(key),
    setItem:(key,raw)=>pending.set(key,String(raw)),
    removeItem:key=>pending.set(key,null)
  };
  const subjects=applyPrivateSubjectCheckpointRestore(staged,prepared);
  let nativePresent=false;
  if(!warnings.length){
    try { nativePresent=localContainsCheckpoint(staged,checkpoint,studyDay,{includeReceipt:false}); }
    catch(error){warnings.push('checkpoint:shared:'+String(error.message||error));}
  }
  if(deferredReceipt!=null && originalReceiptRaw==null){
    if(nativePresent)pending.set(CONTROL_LOCAL_RECEIPT_KEY,deferredReceipt);
    else warnings.push('checkpoint:shared:RECEIPT_WITHHELD_NATIVE_CONFLICT');
  }
  concurrent=!nativePresent;
  const changes=[...pending];
  commitLearnerStorageChanges(storage,changes);
  if (!concurrent && !warnings.length && localContainsCheckpoint(storage, checkpoint, studyDay)) rememberBase(storage, checkpoint.checkpoint_id, warnings);
  return { status: changes.length ? 'restored' : 'skipped', study_day: studyDay,
    checkpoint_id: checkpoint.checkpoint_id, source_day: checkpoint.study_day,
    shared: sharedChanges.length ? 'restored' : 'skipped', subjects, warnings };
}

export async function saveSharedControlToPrivate(storage, {
  now = Date.now(), readCheckpoint = readPrivateLearnerCheckpoint, writeCheckpoint = writePrivateLearnerCheckpoint
} = {}) {
  const studyDay = studyDayAt(now), existing = await readCheckpoint();
  assertLearnerStorageWritable(storage);
  if (!['ready', 'missing'].includes(existing?.status)) throw new Error('PRIVATE_CHECKPOINT_EXISTING_READ_UNSAFE:' + (existing?.status || 'unknown'));
  if (existing.status === 'ready' && existing.checkpoint?.schema !== PRIVATE_CHECKPOINT_SCHEMA) throw new Error('PRIVATE_CHECKPOINT_EXISTING_SCHEMA_INVALID');
  const previous = existing.checkpoint || null, existingSubjects = previous?.payload?.subjects || {};
  const warnings = [];
  const groupAuthorizations = allowLocalChangesByGroup(storage, previous?.checkpoint_id || null);
  // A fresh disk read is not proof this browser descends from that checkpoint.
  // Only a previously recovered/saved token permits changed local keys to win.
  let shared;
  try {
    const staged = new SharedStorage(storage);
    if (previous) {
      const prior = sharedProjection(previous.payload.shared, studyDay);
      if (!groupAuthorizations[CHECKPOINT_SHARED_GROUP_ID] && sharedConflict(storage, prior.staged)) throw new Error('PRIVATE_CHECKPOINT_LOCAL_BASE_CONFLICT');
      for (const [key, raw] of prior.staged.map) if (staged.getItem(key) == null) staged.setItem(key, raw);
    }
    shared = captureSharedControlCheckpoint(staged, { studyDay, now });
  } catch (error) {
    warnings.push('checkpoint:shared:' + String(error.message || error));
    shared = previous?.payload?.shared || { schema: SHARED_CONTROL_CHECKPOINT_SCHEMA, study_day: studyDay, unavailable: true };
  }
  const subjects = capturePrivateSubjectCheckpoints(storage, existingSubjects, {
    now,
    warnings,
    allowLocalChanges: false,
    allowLocalChangesByGroup: Object.fromEntries(
      SUBJECT_CHECKPOINT_GROUPS.map(({ id }) => [id, Boolean(groupAuthorizations[id])])
    )
  });
  shared = { ...shared, capture_warnings: warnings };
  const checkpoint = buildPrivateLearnerCheckpoint({ studyDay, now, shared, subjects });
  await writeCheckpoint(checkpoint, { expectedCheckpoint: previous });
  const blockedGroups = new Set(warnings.map(warningGroupId).filter(Boolean));
  const successfulGroups = CHECKPOINT_GROUP_IDS.filter((groupId) => !blockedGroups.has(groupId));
  rememberLineage(storage, checkpoint.checkpoint_id, successfulGroups, warnings);
  // Shadow-only recovery protects the durable checkpoint, but cannot prove that
  // this browser inherited those records. Never authorize its later overwrite.
  if (!warnings.length && localContainsCheckpoint(storage, checkpoint, studyDay)) rememberBase(storage, checkpoint.checkpoint_id, warnings);
  return { status: warnings.length ? 'partial' : 'saved', warnings, study_day: studyDay, checkpoint_id: checkpoint.checkpoint_id };
}

export function initPrivateCheckpointAutosave(storage, {
  intervalMs = 5 * 60 * 1000,
  debounceMs = 2500,
  now = () => Date.now()
} = {}) {
  if (!storage?.getItem) return { stop() {}, checkpoint() {} };

  let timer = null;
  let interval = null;
  let stopped = false;
  let inFlight = null;

  const checkpoint = async () => {
    if (stopped) return;
    if (inFlight) return inFlight;
    inFlight = (async () => {
      try {
        const result = await saveSharedControlToPrivate(storage, { now: now() });
        if (result.status !== 'saved') throw new Error('部分记录尚未安全合并，原记录已保留。');
        globalThis.dispatchEvent?.(new CustomEvent('kianos:private-checkpoint-saved'));
      } catch (error) {
        globalThis.dispatchEvent?.(new CustomEvent('kianos:private-checkpoint-error', {
          detail: { message: error instanceof Error ? error.message : String(error) }
        }));
      } finally {
        inFlight = null;
      }
    })();
    return inFlight;
  };

  const schedule = () => {
    if (stopped) return;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      void checkpoint();
    }, debounceMs);
  };

  const storageHandler = (event) => {
    if (SHARED_STORAGE_KEYS.includes(event?.key)) schedule();
  };
  const flushNow = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    void checkpoint();
  };
  const visibilityHandler = () => {
    if (globalThis.document?.visibilityState !== 'hidden') return;
    flushNow();
  };
  const blurHandler = () => flushNow();

  globalThis.addEventListener?.('kianos:study-timer-change', schedule);
  globalThis.addEventListener?.('kianos:exam-plan-read-model', schedule);
  globalThis.addEventListener?.('kianos:english-exam-updated', schedule);
  globalThis.addEventListener?.('kianos:steward-reality-change', schedule);
  globalThis.addEventListener?.('storage', storageHandler);
  globalThis.addEventListener?.('focus', schedule);
  globalThis.addEventListener?.('blur', blurHandler);
  globalThis.document?.addEventListener?.('visibilitychange', visibilityHandler);

  interval = setInterval(() => void checkpoint(), intervalMs);
  schedule();

  return {
    schema: PRIVATE_CHECKPOINT_RUNTIME_SCHEMA,
    checkpoint,
    stop() {
      stopped = true;
      if (timer) clearTimeout(timer);
      if (interval) clearInterval(interval);
      globalThis.removeEventListener?.('kianos:study-timer-change', schedule);
      globalThis.removeEventListener?.('kianos:exam-plan-read-model', schedule);
      globalThis.removeEventListener?.('kianos:english-exam-updated', schedule);
      globalThis.removeEventListener?.('kianos:steward-reality-change', schedule);
      globalThis.removeEventListener?.('storage', storageHandler);
      globalThis.removeEventListener?.('focus', schedule);
      globalThis.removeEventListener?.('blur', blurHandler);
      globalThis.document?.removeEventListener?.('visibilitychange', visibilityHandler);
    }
  };
}
