import {
  attachDailySubjectPacket,
  buildDailyLearningPacket
} from './dailyLearningPacket.mjs';
import { buildEnglishEvidencePacket } from './englishSessionControl.mjs';
import {
  politicsDailyEvidencePacket,
  readPoliticsSnapshot
} from './politicsPracticeState.mjs';
import { buildXizongStudyPacketFromStorage } from './xizongStudyPacket.mjs';
import { politicsMemoryDailyEvidence } from './politicsMemoryRuntime.mjs';

const record = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

function readJson(storage, key, fallback = null) {
  try {
    const raw = storage?.getItem?.(key);
    if (raw == null) return fallback;
    return JSON.parse(raw) ?? fallback;
  } catch {
    return fallback;
  }
}

function englishEvidencePresent(packet) {
  if (!record(packet)) return false;
  if (Array.isArray(packet.inventory) && packet.inventory.length) return true;
  if (packet.exam_session) return true;
  return Object.values(packet.tasks || {}).some((row) => {
    if (!record(row)) return false;
    return Boolean(
      row.last_location
      || row.attempt
      || row.current
      || row.first_evidence
      || row.updated_at
      || row.submitted_at
    );
  });
}

function politicsEvidencePresent(snapshot) {
  if (!record(snapshot)) return false;
  if (snapshot.last) return true;
  if (Array.isArray(snapshot.events) && snapshot.events.length) return true;
  return Object.values(snapshot.attempts?.units || {}).some((unit) =>
    record(unit?.attempts) && Object.keys(unit.attempts).length > 0
  );
}

function resolveXizongPacketIndex(index, last) {
  if (!Array.isArray(index) || !record(last) || !last.systemId) return null;
  return index.find((row) =>
    row?.systemId === last.systemId
    && (
      (last.blockSlug && row?.slug === last.blockSlug)
      || (last.blockLabel && row?.blockLabel === last.blockLabel)
      || (last.blockId && row?.blockId === last.blockId)
    )
  ) || null;
}

export function buildHomeDailyLearningPacket({
  storage,
  day,
  now = Date.now(),
  plan = null,
  xizongPacketIndex = [],
  politicsCatalog = null,
  base = '/'
} = {}) {
  if (!storage?.getItem) throw new Error('HOME_DAILY_PACKET_STORAGE_UNAVAILABLE');

  let packet = buildDailyLearningPacket({
    storage,
    day,
    now,
    plan,
    subjectPackets: {}
  });
  const coverage = {
    xizong: 'unknown',
    english: 'unknown',
    politics: 'unknown'
  };
  const warnings = [];

  const lastXizong = readJson(storage, 'kianos-xizong-last-location-v1', null);
  const xizongIndex = resolveXizongPacketIndex(xizongPacketIndex, lastXizong);
  if (xizongIndex) {
    try {
      const xizong = buildXizongStudyPacketFromStorage({
        storage,
        packetMeta: xizongIndex.packetMeta,
        kpRows: xizongIndex.kpRows,
        currentStage: '',
        currentIndex: null,
        now
      });
      if (xizong) {
        packet = attachDailySubjectPacket(packet, 'xizong', xizong);
        coverage.xizong = 'attached';
      }
    } catch (error) {
      warnings.push('xizong:' + String(error?.message || error));
    }
  }

  try {
    const english = buildEnglishEvidencePacket(storage, { day, now, catalog: [] });
    if (englishEvidencePresent(english)) {
      packet = attachDailySubjectPacket(packet, 'english', english);
      coverage.english = 'attached';
    }
  } catch (error) {
    warnings.push('english:' + String(error?.message || error));
  }

  if (politicsCatalog) {
    try {
      const snapshot = readPoliticsSnapshot(storage);
      if (snapshot.errors.length) {
        warnings.push('politics:POLITICS_EVIDENCE_UNREADABLE');
      } else {
        const memory = politicsMemoryDailyEvidence(storage, { day, now });
        if (politicsEvidencePresent(snapshot) || memory.summary.recall_count > 0 || memory.current_plan) {
          const politics = politicsDailyEvidencePacket(politicsCatalog, snapshot, { day, now, base });
          politics.memory = memory;
          packet = attachDailySubjectPacket(packet, 'politics', politics);
          coverage.politics = 'attached';
        }
      }
    } catch (error) {
      warnings.push('politics:' + String(error?.message || error));
    }
  }

  return { packet, coverage, warnings };
}
