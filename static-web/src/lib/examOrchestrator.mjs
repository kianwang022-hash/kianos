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
export const nextDay = (day, n = 1) => new Date(Date.parse(`${day}T00:00:00Z`) + n * 86400000).toISOString().slice(0, 10);
export const examDay = (now = new Date()) => new Intl.DateTimeFormat('en-CA', { timeZone: orchestratorCurrent.timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
export const formatMinutes = value => value === null ? '待设置' : value === 0 ? '休息' : `${Math.floor(value / 60) ? `${Math.floor(value / 60)}h` : ''}${value % 60 ? `${value % 60}m` : ''}`;
export function emptyExamProfile() { return { schema: 'kianos.exam.orchestrator.v1', defaultDailyMinutes: null,
  capacityByDay: {}, maintenanceByDay: {}, floorMinutes: null, observations: [], reports: [], gateReports: [], reminders: {} }; }

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
  if (value.floorMinutes != null) {
    if (!obj(value.floorMinutes) || SUBJECTS.some(s => !finite(value.floorMinutes[s]))) throw new Error('三科最低安排需要一起提供。');
    p.floorMinutes = Object.fromEntries(SUBJECTS.map(s => [s, minutes(value.floorMinutes[s])]));
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
export function robustMinutes(samples, fallback = null) {
  const values = samples.filter(finite).filter(x => x > 0 && x <= 1440).sort((a, b) => a - b);
  if (values.length < 3) return { minutes: fallback, confidence: 'seed', sampleCount: values.length };
  const mid = Math.floor(values.length / 2);
  return { minutes: values.length % 2 ? values[mid] : (values[mid - 1] + values[mid]) / 2, confidence: 'observed', sampleCount: values.length };
}
const sum = xs => xs.reduce((a, b) => a + b, 0);
const coarse = n => Math.max(0, Math.round(n / 5) * 5);
export function buildExamPlan({ day = examDay(), profile = emptyExamProfile(), demands = {} } = {}) {
  const p = validateExamProfile(profile, day), phase = resolveExamPhase(day);
  const gate = GATES.find(g => g.date >= day) || null;
  const capacityFor = date => Object.hasOwn(p.capacityByDay, date) ? p.capacityByDay[date] : p.defaultDailyMinutes;
  const dayCapacity = capacityFor(day);
  const doneToday = Object.fromEntries(SUBJECTS.map(subject => [subject, sum(p.observations.filter(o => o.day === day && o.subject === subject).map(o => o.minutes))]));
  const doneTotal = sum(Object.values(doneToday));
  const capacity = dayCapacity === null ? null : Math.max(0, dayCapacity - doneTotal);
  const horizon = Array.from({ length: 7 }, (_, i) => capacityFor(nextDay(day, i)));
  const horizonKnown = horizon.every(finite);
  const horizonTotal = horizonKnown ? sum(horizon) : null;
  // The 120m English / 90m Politics floor is an explicit Phase-A seed only.
  // Later phases must not silently inherit it; without a new explicit floor, elastic
  // capacity is driven by workload/review/score evidence and otherwise remains provisional.
  const floorSeed = p.floorMinutes || (phase.id === 'A'
    ? { xizong: 0, english: 120, politics: 90 }
    : { xizong: 0, english: 0, politics: 0 });
  const reports = Object.fromEntries(SUBJECTS.map(s => [s, p.reports.filter(r => r.subject === s && r.day <= day && r.validThrough >= day).sort((a, b) => b.day.localeCompare(a.day))[0] || null]));
  const maintenance = p.maintenanceByDay[day];
  const rows = SUBJECTS.map((subject, i) => {
    const demand = demands[subject] || {};
    const r = reports[subject];
    const remainingDays = r?.gateDate ? Math.max(1, dayDistance(day, r.gateDate) + 1) : null;
    const required = r?.remainingMinutes != null ? r.remainingMinutes / remainingDays : null;
    // Forward-looking seven-day sharing. No past missed hours are carried as debt.
    const floor = horizonKnown && horizonTotal > 0 ? floorSeed[subject] * 7 * (dayCapacity || 0) / horizonTotal : floorSeed[subject];
    const nativeReview = finite(demand.reviewMinutes) ? Math.max(0, demand.reviewMinutes) : 0;
    const gap = r?.scoreBand ? Math.max(0, TARGETS[subject] - r.scoreBand[1]) : null;
    return { subject, role: phase.roles[i], minutes: capacity === null ? null : 0, reviewMinutes: 0,
      continue: demand.continue || null, nativeReview, floor: Math.max(0, floor - doneToday[subject]), doneMinutes: doneToday[subject],
      required: required === null ? null : Math.max(0, required - doneToday[subject]), gap, report: r, ceiling: r?.ceilingMinutes != null ? Math.max(0, r.ceilingMinutes - doneToday[subject]) : capacity,
      status: '按阶段起步', why: demand.estimateNote ? [demand.estimateNote] : [], confidence: r?.confidence || 'unknown' };
  });
  let unallocated = capacity;
  let shortage = false;
  if (finite(capacity) && !phase.outsideCycle) {
    if (maintenance) {
      rows.find(r => r.subject === maintenance).minutes = capacity;
      rows.forEach(r => r.status = r.subject === maintenance ? '维护这一科' : '暂歇，不补欠账');
      unallocated = 0;
    } else {
      const requestedFloors = rows.map(r => Math.min(r.floor, r.ceiling ?? capacity));
      const floorTotal = sum(requestedFloors); shortage = floorTotal > capacity;
      rows.forEach((r, i) => { r.minutes = Math.min(capacity, Math.floor((shortage ? capacity * requestedFloors[i] / floorTotal : requestedFloors[i]) / 5) * 5); });
      let remaining = capacity - sum(rows.map(r => r.minutes));
      let safety = 0;
      while (remaining >= 5 && safety++ < 300) {
        const available = rows.filter(r => r.minutes + 5 <= (r.ceiling ?? capacity));
        if (!available.length) break;
        const urgent = available.filter(r => r.required !== null && r.minutes < r.required).sort((a, b) => (b.required - b.minutes) - (a.required - a.minutes));
        const review = available.filter(r => r.minutes < Math.min(r.nativeReview, capacity / 3)).sort((a, b) => a.minutes - b.minutes);
        const score = available.filter(r => r.gap > 0 && r.report?.recoverability !== 'low').sort((a, b) => {
          const rank = { high: 2, medium: 1, low: 0 };
          return rank[b.report.recoverability] - rank[a.report.recoverability] || a.minutes - b.minutes;
        });
        const fallback = phase.id === 'A'
          ? available.find(r => r.subject === 'xizong')
          : [...available].sort((a, b) => a.minutes - b.minutes)[0];
        const target = urgent[0] || review[0] || score[0] || fallback || available[0];
        target.minutes += 5; remaining -= 5;
      }
      unallocated = remaining;
      for (const r of rows) {
        // Review occupies the subject's allocation; it is never added on top.
        r.reviewMinutes = Math.min(r.minutes, coarse(r.nativeReview));
        r.status = shortage ? '时间偏紧' : r.required !== null && r.required > r.minutes + 5 ? '需要加速' : r.report ? '按证据推进' : phase.id === 'A' ? '按阶段起步' : '暂用保连续安排';
        if (r.required !== null) r.why.push(`已提供的剩余工作约 ${Math.round(r.report.remainingMinutes / 60)} 小时，对应 ${r.report.gateDate}。`);
        if (r.reviewMinutes) r.why.push('回访包含在本科学习时间内，不额外叠加。');
        if (r.gap > 0) r.why.push(`所提供分数区间尚低于目标；${r.report.note}`);
      }
    }
  }
  const overdue = GATES.filter(g => g.kind !== 'exam' && g.date < day && !p.gateReports.some(r => r.date === g.date)).at(-1);
  const accelerated = rows.find(r => r.status === '需要加速');
  let attention = null;
  if (!phase.outsideCycle) {
    if (capacity === null) attention = { type: 'capacity', text: '先设置今天可用多久，三科时间会一起重排。', action: '设置时间' };
    else if (dayCapacity > 0 && capacity === 0) attention = { type: 'capacity', text: '今天已记录的学习时间达到可用安排；无需补欠账，继续前可调整时间。', action: '调整时间' };
    else if (shortage) attention = { type: 'capacity', text: '当前可用时间不足以守住三科安排；可调整时间，或切换维护模式。', action: '调整安排' };
    else if (overdue) attention = { type: 'assessment', text: `${overdue.date.slice(5).replace('-', '/')} 的阶段评估尚未记录；继续学习，不把日期到达当作通过。`, action: '查看评估' };
    else if (accelerated) attention = { type: 'pace', text: `${({xizong:'西综',english:'英语',politics:'政治'})[accelerated.subject]}的已报工作量高于现有节奏；先压缩稳定内容，再调整后续时间。`, action: '查看原因' };
  }
  const sortedRows = [...rows].filter(r => r.continue).sort((a, b) => {
    if (maintenance) return Number(b.subject === maintenance) - Number(a.subject === maintenance);
    return Number(b.status === '需要加速') - Number(a.status === '需要加速') || (b.minutes || 0) - (a.minutes || 0);
  });
  const scores = rows.filter(r => r.report?.scoreBand).map(r => ({ subject: r.subject, band: r.report.scoreBand,
    confidence: r.report.confidence, note: r.report.note, contamination: r.report.contamination, evidenceRefs: r.report.evidenceRefs }));
  const totalBand = scores.length === 3 ? [sum(scores.map(s => s.band[0])), sum(scores.map(s => s.band[1]))] : null;
  const confirmedWeek = SUBJECTS.map(subject => ({ subject,
    minutes: sum(p.observations.filter(o => o.subject === subject && dayDistance(o.day, day) >= 0 && dayDistance(o.day, day) < 7).map(o => o.minutes)) }));
  return { day, phase, gate: gate ? { ...gate, daysRemaining: dayDistance(day, gate.date) } : null,
    rows, capacity, dayCapacity, doneTotal, unallocated, attention, continue: sortedRows[0]?.continue || null,
    scores, totalBand, confirmedWeek, horizonKnown, horizonTotal,
    provisional: p.floorMinutes === null && phase.id !== 'A',
    reminder: REFRESH_WINDOWS.find(w => day >= w.start && day <= w.end && !p.reminders[w.id]) || null };
}
