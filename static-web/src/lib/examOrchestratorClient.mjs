import { EXAM_PROFILE_KEY, SUBJECTS, TARGETS, emptyExamProfile, validateExamProfile, buildExamPlan, examDay, formatMinutes } from './examOrchestrator.mjs';
import { readExamDemand, safeProductHref } from './examDemand.mjs';
import { buildExamStudyTimeOverlay } from './examStudyTime.mjs';
import { readPoliticsSnapshot, resolvePoliticsContinue } from './politicsPracticeState.mjs';
const names = { xizong: '西综', english: '英语', politics: '政治' };
export function initExamHome(root) {
  if (!(root instanceof HTMLElement)) return;
  const $ = s => root.querySelector(s), $$ = s => [...root.querySelectorAll(s)];
  const catalog = JSON.parse($('[data-exam-catalog]').textContent);
  $('[data-exam-catalog]').remove();
  let bytes = null, profile = emptyExamProfile(), plan, readable = true, pendingImport = null, timeOverlay = null;
  const day = () => examDay();
  const error = message => { const el = $('[data-exam-error]'); el.hidden = !message; el.textContent = message || ''; };
  function load() {
    try { bytes = localStorage.getItem(EXAM_PROFILE_KEY); profile = bytes === null ? emptyExamProfile() : validateExamProfile(JSON.parse(bytes), day()); readable = true; error(''); }
    catch { readable = false; error('本机调度记录暂时读不完整；原记录未被改动。恢复存储后刷新，三科入口仍可使用。'); }
  }
  function persist(next) {
    if (!readable) throw new Error('当前记录未能读取，未覆盖原记录。');
    if (localStorage.getItem(EXAM_PROFILE_KEY) !== bytes) throw new Error('调度记录已在其他页面改变，请关闭窗口并刷新后再修改。');
    const valid = validateExamProfile(next, day()), encoded = JSON.stringify(valid);
    try { localStorage.setItem(EXAM_PROFILE_KEY, encoded); } catch { throw new Error('保存失败，安排未改变。请恢复本机存储后重试。'); }
    bytes = encoded; profile = valid; render();
  }
  const nativeLink = (selector, titleSelector, fallback, label) => {
    const node = document.querySelector(selector);
    const visible = node && !node.closest('[hidden]');
    return visible && safeProductHref(node.getAttribute('href'), catalog.base)
      ? { href: node.getAttribute('href'), title: document.querySelector(titleSelector)?.textContent?.trim() || label }
      : { href: fallback, title: label };
  };
  function render() {
    const native = {
      xizong: nativeLink('[data-xizong-continue]', '[data-xizong-continue-title]', `${catalog.base}xizong/`, '选择西综学习位置'),
      english: nativeLink('[data-english-resume-link]', '[data-english-resume-title]', `${catalog.base}english/`, '选择英语完整任务'),
      politics: resolvePoliticsContinue(catalog.politics, readPoliticsSnapshot(localStorage), catalog.base)
        || nativeLink('[data-politics-continue]', '[data-politics-continue-title]', `${catalog.base}politics/`, '选择政治学习位置')
    };
    const demand = readExamDemand(localStorage, catalog, native);
    const sourceProfile = readable ? profile : emptyExamProfile();
    timeOverlay = buildExamStudyTimeOverlay(localStorage, sourceProfile, day(), Date.now());
    plan = buildExamPlan({ day: day(), profile: timeOverlay.profile, demands: demand.demands });
    root.dataset.studyTimeSource = timeOverlay.usesTimer ? 'timer' : 'manual';
    const gate = document.querySelector('[data-exam-gate]');
    const phase = document.querySelector('[data-exam-phase]');
    if (gate) gate.textContent = plan.gate ? `${plan.gate.date.slice(5).replace('-', '/')} ${plan.gate.label} · ${plan.gate.daysRemaining === 0 ? '今天' : `还有 ${plan.gate.daysRemaining} 天`}` : '本轮考试已结束';
    if (phase) phase.textContent = `${plan.phase.label} · 总目标 ${TARGETS.total}+`;
    $('[data-exam-capacity]').textContent = !readable ? '先恢复记录，暂不推算安排。' : plan.capacity === null ? '设置可用时间后，三科一起分配。' : plan.phase.outsideCycle ? '本轮之外不自动安排考试学习。' : `今天可用 ${formatMinutes(plan.dayCapacity)}${plan.doneTotal ? ` · 已学 ${formatMinutes(plan.doneTotal)} · 下方为剩余安排` : ' · 含必要回访'}`;
    $('[data-exam-settings]').textContent = plan.capacity === null ? '设置时间' : '调整时间';
    const allocations = $('[data-exam-allocations]'); allocations.replaceChildren();
    for (const r of plan.rows) {
      const row = document.createElement('div'); row.className = 'examSubjectAllocation'; row.dataset.allocation = r.subject;
      const label = document.createElement('strong'); label.textContent = names[r.subject];
      const role = document.createElement('span'); role.textContent = !readable ? '记录待恢复' : r.minutes === 0 && plan.capacity === 0 ? '今天休息' : r.status === '需要加速' || r.status === '时间偏紧' ? r.status : r.role;
      const amount = document.createElement('b'); amount.textContent = !readable || plan.phase.outsideCycle ? '—' : formatMinutes(r.minutes);
      row.append(label, role, amount); allocations.append(row);
    }
    const best = plan.continue;
    const link = $('[data-exam-next]'); link.href = best?.href || `${catalog.base}xizong/`; link.textContent = best ? `${names[best.subject]} · ${best.title} →` : '自由选择学习 →';
    $('[data-exam-next-label]').textContent = plan.capacity === null || plan.capacity === 0 ? '自由进入' : '按当前安排继续';
    const attention = $('[data-exam-attention]'); attention.hidden = !plan.attention || !readable;
    if (plan.attention) { $('[data-exam-attention-text]').textContent = plan.attention.text; $('[data-exam-attention-action]').textContent = plan.attention.action; }
    if (demand.errors.length && readable) error('有一科本机记录未读完整；相关回访量不参与重排，请先在科目页核对。');
    const reminder = $('[data-exam-reminder]'); reminder.hidden = !plan.reminder || !readable;
    if (plan.reminder) reminder.querySelector('p').textContent = plan.reminder.label;
    root.dataset.ready = 'true';
  }
  const open = name => { const dialog = $(`[data-exam-${name}-dialog]`); if (!dialog.open) dialog.showModal(); };
  function settings() {
    $('[data-capacity-hours]').value = profile.capacityByDay[day()] != null ? profile.capacityByDay[day()] / 60 : profile.defaultDailyMinutes != null ? profile.defaultDailyMinutes / 60 : '';
    $('[data-capacity-default]').checked = profile.defaultDailyMinutes == null;
    $('[data-maintenance]').value = profile.maintenanceByDay[day()] || '';
    $('[data-exam-settings-form] [data-form-error]').hidden = true; open('settings');
  }
  function why() {
    const target = $('[data-exam-reasons]'); target.replaceChildren();
    const p = text => { const node = document.createElement('p'); node.textContent = text; target.append(node); };
    p('分配的是接下来可用的时间，不是掌握程度。没有个人证据时，先守住英语与政治的连续性，余量主推西综。');
    p(plan.horizonKnown ? '已按未来七天可用时间分摊最低安排；不会把过去缺的小时累加成欠账。' : '尚无完整未来七天容量，先按今天安排；之后的容量仍留空。');
    if (plan.provisional) p('当前已过最初阶段，但还没有新的三科最低安排，暂用起步先验；并非已经完成重新估分。');
    for (const r of plan.rows) {
      const title = document.createElement('h3'); title.textContent = names[r.subject]; target.append(title);
      p(r.why.length ? r.why.join(' ') : '没有足够证据推算剩余工作量；沿本科已开放主线继续。');
      const observed = plan.confirmedWeek.find(x => x.subject === r.subject)?.minutes || 0;
      if (observed) p(`最近七天有效学习时间记录：${formatMinutes(observed)}；时间不等于完成或掌握。`);
      if (r.required !== null) p(`当前已报工作量需要日均约 ${formatMinutes(Math.ceil(r.required / 5) * 5)}，这里只是容量估计。`);
    }
    if (!plan.scores.length) p('尚无有依据的分数区间；不会由刷题数或单次正确率编造估分。');
    for (const s of plan.scores) p(`${names[s.subject]} ${s.band.join('–')}；可信度 ${s.confidence}。${s.note}；${s.contamination}。依据：${s.evidenceRefs.join('、')}`);
    if (plan.totalBand) p(`三科已报总区间 ${plan.totalBand.join('–')}，目标 ${TARGETS.total}+。仅反映所提供评估，不代表考试结果。`);
    open('why');
  }
  $$('[data-close]').forEach(b => b.addEventListener('click', () => b.closest('dialog').close()));
  $('[data-exam-settings]').addEventListener('click', settings);
  $('[data-exam-why]').addEventListener('click', why);
  $('[data-exam-attention-action]').addEventListener('click', () => plan.attention?.type === 'capacity' ? settings() : why());
  $('[data-exam-settings-form]').addEventListener('submit', event => {
    event.preventDefault(); const form = event.currentTarget;
    try {
      const next = structuredClone(profile), hours = Number($('[data-capacity-hours]').value);
      if ($('[data-capacity-hours]').value === '' || !Number.isFinite(hours) || hours < 0 || hours > 24) throw new Error('请填 0–24 小时之间的有效时间。');
      next.capacityByDay[day()] = Math.round(hours * 60);
      if ($('[data-capacity-default]').checked) next.defaultDailyMinutes = next.capacityByDay[day()];
      const mode = $('[data-maintenance]').value; if (mode) next.maintenanceByDay[day()] = mode; else delete next.maintenanceByDay[day()];
      persist(next); form.closest('dialog').close();
    } catch (e) { const el = form.querySelector('[data-form-error]'); el.hidden = false; el.textContent = e.message; }
  });
  $('[data-exam-record]').addEventListener('click', () => {
    SUBJECTS.forEach(s => { $(`[data-studied="${s}"]`).value = profile.observations.filter(o => o.day === day() && o.subject === s).reduce((n,o) => n + o.minutes, 0); });
    $('[data-exam-record-form] [data-form-error]').hidden = true; open('record');
  });
  $('[data-exam-record-form]').addEventListener('submit', event => {
    event.preventDefault(); const form = event.currentTarget;
    try {
      const next = structuredClone(profile); next.observations = next.observations.filter(o => o.day !== day());
      for (const s of SUBJECTS) next.observations.push({ id: `confirmed-${day()}-${s}`, day: day(), subject: s, minutes: Number($(`[data-studied="${s}"]`).value), confirmed: true });
      persist(next); form.closest('dialog').close();
    } catch (e) { const el = form.querySelector('[data-form-error]'); el.hidden = false; el.textContent = e.message; }
  });
  $('[data-exam-reminder-dismiss]').addEventListener('click', () => {
    try { const next = structuredClone(profile); next.reminders[plan.reminder.id] = day(); persist(next); } catch (e) { error(e.message); }
  });
  $('[data-exam-export]').addEventListener('click', () => {
    if (!readable) return;
    const blob = new Blob([JSON.stringify(profile, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob), a = document.createElement('a'); a.href = url; a.download = `kianos-exam-${day()}.json`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  $('[data-exam-import]').addEventListener('change', async event => {
    pendingImport = null; $('[data-exam-import-confirm]').hidden = true; $('[data-exam-import-preview]').hidden = true;
    try {
      const file = event.target.files?.[0]; if (!file) return;
      if (file.size > 1024 * 1024) throw new Error('调度文件过大，未读取。');
      pendingImport = validateExamProfile(JSON.parse(await file.text()), day());
      const preview = $('[data-exam-import-preview]'); preview.hidden = false;
      preview.textContent = `将替换本机调度记录（不修改三科学习记录）\n通常可用：${formatMinutes(pendingImport.defaultDailyMinutes)}\n阶段评估 ${pendingImport.reports.length} 条 · 阶段结论 ${pendingImport.gateReports.length} 条 · 已学时间 ${pendingImport.observations.length} 条\n` + pendingImport.reports.map(r => `${names[r.subject]} · ${r.day}–${r.validThrough} · ${r.note}`).join('\n');
      $('[data-exam-import-confirm]').hidden = false; $('[data-import-error]').hidden = true;
    } catch (e) { const el = $('[data-import-error]'); el.hidden = false; el.textContent = e.message; }
  });
  $('[data-exam-import-confirm]').addEventListener('click', () => {
    try { if (!pendingImport) return; persist(pendingImport); pendingImport = null; $('[data-exam-import-confirm]').hidden = true; $('[data-exam-why-dialog]').close(); }
    catch (e) { const el = $('[data-import-error]'); el.hidden = false; el.textContent = e.message; }
  });
  const refreshFromExternalTime = () => {
    if (!$$('dialog').some(d => d.open)) render();
  };
  window.addEventListener('kianos:study-timer-change', refreshFromExternalTime);
  window.addEventListener('storage', () => { if ($$('dialog').some(d => d.open)) { error('另一页面的记录已改变；当前编辑未覆盖它。关闭窗口并刷新后再改。'); return; } load(); render(); });
  window.addEventListener('focus', () => { if (!$$('dialog').some(d => d.open)) { load(); render(); } });
  load(); render();
  // Read subject Resume surfaces after their own modules hydrate; never duplicate their priority rules.
  setTimeout(render, 250);
}
