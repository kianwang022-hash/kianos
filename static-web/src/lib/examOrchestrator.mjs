import orchestratorCurrent from '../../../EXAM_ORCHESTRATOR_CURRENT.json' with { type: 'json' };

// Cross-subject planning only. EXAM_ORCHESTRATOR_CONTRACT.md owns the policy.
// EXAM_ORCHESTRATOR_CURRENT.json is a checked derived projection for runtime use,
// not a second semantic owner.
// No subject state writer, completion predicate, answer key or mastery ledger.
export const EXAM_PROFILE_KEY = 'kianos-exam-orchestrator-v1';
export const SUBJECTS = ['xizong', 'english', 'politics'];

if (orchestratorCurrent?.schema !== 'kianos.exam-orchestrator.current.v1'
  || orchestratorCurrent?.authority !== 'DERIVED_PROJECTION'
  || orchestratorCurrent?.source !== 'EXAM_ORCHESTRATOR_CONTRACT.md') {
  throw new Error('Exam Orchestrator Current projection is invalid or has lost its contract binding.');
}

const freezeRows = rows => Object.freeze((rows || []).map(row => Object.freeze({
  ...row,
  ...(Array.isArray(row.roles) ? { roles: Object.freeze([...row.roles]) } : {})
})));

export const TARGETS = Object.freeze({ ...orchestratorCurrent.targets });
export const GATES = freezeRows(orchestratorCurrent.gates);
const PHASES = freezeRows(orchestratorCurrent.phases);
export const REFRESH_WINDOWS = freezeRows(orchestratorCurrent.refresh_windows);

const obj = value => value && typeof value === 'object' && !Array.isArray(value);
const finite = value => typeof value === 'number' && Number.isFinite(value);
export const validDay = day => typeof day === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(day) && !Number.isNaN(Date.parse(`${day}T00:00:00Z`)) && new Date(`${day}T00:00:00Z`).toISOString().slice(0, 10) === day;
export const dayDistance = (a, b) => Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86400000);
export const examDay = (now = new Date()) => new Intl.DateTimeFormat('en-CA', { timeZone: orchestratorCurrent.timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
export const formatMinutes = value => value === null ? '待设置' : value === 0 ? '休息' : `${Math.floor(value / 60) ? `${Math.floor(value / 60)}h` : ''}${value % 60 ? `${value % 60}m` : ''}`;
export function emptyExamProfile() { return { schema: 'kianos.exam.orchestrator.v1', defaultDailyMinutes: null,
  capacityByDay: {}, maintenanceByDay: {}, observations: [], reports: [], gateReports: [], reminders: {} }; }

// Imports are private reported planning inputs, never promoted to subject Truth.
// Unknown fields cannot carry scripts/URLs or silently overwrite domain stores.
export function validateExamProfile(value, today = examDay()) {
  if (!obj(value) || value.schema !== 'kianos.exam.orchestrator.v1') throw new Error('不是本系统的调度记录。');
  const p = emptyExamProfile();
  for (const key of ['observations','reports','gateReports']) if (value[key] !== undefined && (!Array.isArray(value[key]) || value[key].length > 5000)) throw new Error('调度记录结构不完整，未应用。');
  for (const key of ['capacityByDay','maintenanceByDay','reminders']) if (value[key] !== undefined && !obj(value[key])) throw new Error('调度记录结构不完整，未应用。');
  const minutes = (v, max = 1440) => { if (!finite(v) || v < 0 || v > max) throw new Error('时间必须是有效的分钟数。'); return Math.round(v); };
  const clean = (s, max = 300) => typeof s === 'string' ? s.slice(0, max) : '';
  p.defaultDailyMinutes = value.defaultDailyMinutes === null || value.defaultDailyMinutes === undefined ? null : minutes(value.defaultDailyMinutes);
  for (const [day, v] of Object.entries(value.capacityByDay || {})) { if (!validDay(day)) throw new Error('时间安排的日期无效。'); p.capacityByDay[day] = minutes(v); }
  for (const [day, subject] of Object.entries(value.maintenanceByDay || {})) {
    if (!validDay(day) || !SUBJECTS.includes(subject)) throw new Error('维护模式的日期或科目无效。'); p.maintenanceByDay[day] = subject;
  }
  for (const o of value.observations || []) {
    if (!obj(o) || !clean(o.id) || !validDay(o.day) || o.day > today || !SUBJECTS.includes(o.subject) || o.confirmed !== true) throw new Error('已学时间需要真实日期、科目与本人确认。');
    p.observations.push({ id: clean(o.id), day: o.day, subject: o.subject, minutes: minutes(o.minutes), confirmed: true });
  }
  for (const date of new Set(p.observations.map(o => o.day))) if (p.observations.filter(o => o.day === date).reduce((n, o) => n + o.minutes, 0) > 1440) throw new Error('一天的已学时间超过 24 小时，未应用。');
  if (new Set(p.observations.map(o => o.id)).size !== p.observations.length) throw new Error('已学记录存在重复身份。');
  // Explicit source reference and expiry are required for workload/score reports.
  for (const r of value.reports || []) {
    if (!obj(r) || !SUBJECTS.includes(r.subject) || !validDay(r.day) || r.day > today || !validDay(r.validThrough)
      || r.validThrough < r.day || !Array.isArray(r.evidenceRefs) || !r.evidenceRefs.length || r.evidenceRefs.some(x => !clean(x))
      || !clean(r.note)) throw new Error('阶段评估缺少日期、依据或说明；未应用。');
    const row = { subject: r.subject, day: r.day, validThrough: r.validThrough, note: clean(r.note),
      evidenceRefs: r.evidenceRefs.map(x => clean(x)), confidence: ['low', 'medium', 'high'].includes(r.confidence) ? r.confidence : 'low',
      recoverability: ['low', 'medium', 'high'].includes(r.recoverability) ? r.recoverability : 'low' };
    if (r.remainingMinutes != null) {
      row.remainingMinutes = minutes(r.remainingMinutes, 200000);
      if (!validDay(r.gateDate) || r.gateDate < r.day) throw new Error('剩余工作量需要对应截止点。'); row.gateDate = r.gateDate;
    }
    if (r.ceilingMinutes != null) row.ceilingMinutes = minutes(r.ceilingMinutes);
    if (r.scoreBand != null) {
      const max = r.subject === 'xizong' ? 300 : 100;
      if (!Array.isArray(r.scoreBand) || r.scoreBand.length !== 2 || r.scoreBand.some(x => !finite(x) || x < 0 || x > max) || r.scoreBand[0] > r.scoreBand[1]) throw new Error('分数区间无效。');
      if (r.subject === 'english' && !['objective', 'translation', 'writing'].every(s => r.coverage?.includes(s))) throw new Error('英语估分必须覆盖客观题、翻译和写作，不能只用阅读推总分。');
      row.scoreBand = [...r.scoreBand]; row.coverage = Array.isArray(r.coverage) ? r.coverage.map(x => clean(x)) : [];
      row.contamination = clean(r.contamination) || '未说明污染程度';
    }
    p.reports.push(row);
  }
  for (const g of value.gateReports || []) {
    if (!GATES.some(x => x.date === g?.date && x.kind !== 'exam') || !['PASS', 'PARTIAL_ADVANCE', 'BLOCKED'].includes(g.outcome) || !clean(g.note) || !validDay(g.recordedOn) || g.recordedOn > today || g.recordedOn < g.date) throw new Error('阶段结论需要真实日期与说明；不会按日历自动通过。');
    p.gateReports.push({ date: g.date, outcome: g.outcome, note: clean(g.note), recordedOn: g.recordedOn });
  }
  for (const [id, day] of Object.entries(value.reminders || {})) if (REFRESH_WINDOWS.some(w => w.id === id) && validDay(day)) p.reminders[id] = day;
  return p;
}

export function resolveExamPhase(day) {
  if (!validDay(day)) throw new Error('无效日期');
  if (day < PHASES[0].start) return { ...PHASES[0], label: '考前准备', outsideCycle: true };
  if (day > PHASES.at(-1).end) return { id: 'DONE', label: '本轮考试已结束', roles: ['自由学习', '自由学习', '自由学习'], outsideCycle: true };
  return PHASES.find(p => day >= p.start && day <= p.end);
}
