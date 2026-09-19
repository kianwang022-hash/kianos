import {
  EXAM_PROFILE_KEY,
  SUBJECTS,
  TARGETS,
  GATES,
  REFRESH_WINDOWS,
  emptyExamProfile,
  validateExamProfile,
  examDay,
  formatMinutes,
  resolveExamPhase,
  dayDistance
} from './examOrchestrator.mjs';
import {
  EXAM_CHAT_PLAN_SCHEMA,
  EXAM_CHAT_PLAN_KEY,
  readExamChatPlan,
  validateExamChatPlan,
  writeExamChatPlan
} from './examChatPlan.mjs';
import { buildExamStudyTimeOverlay } from './examStudyTime.mjs';
import { buildChatControlledExamReadModel } from './examPlanReadModel.mjs';
import { buildHomeDailyLearningPacket } from './dailyLearningPacketRuntime.mjs';
import { serializeDailyLearningPacketForChat } from './dailyLearningPacket.mjs';
import {
  XIZONG_SESSION_KEY,
  activateXizongSessionNext,
  validateXizongSessionInstruction
} from './xizongSessionInstruction.mjs';
import { readXizongPendingChatReturnState } from './xizongPendingChatReturn.mjs';
import { readXizongSystemWuPendingState } from './xizongSystemWuReturn.mjs';
import { resolvePoliticsMemoryResume } from './politicsMemoryRuntime.mjs';

const names = { xizong: '西综', english: '英语', politics: '政治' };
const PRODUCT_FAMILIES = ['xizong', 'english', 'english-exam', 'reading', 'cloze', 'reading-b', 'external-reading', 'translation', 'writing', 'politics', 'vocabulary'];

function safeProductHref(href, base = '/') {
  if (typeof href !== 'string' || !href.startsWith(base) || href.startsWith('//')) return null;
  try {
    const url = new URL(href, 'https://kianos.invalid');
    if (url.origin !== 'https://kianos.invalid') return null;
    if (!PRODUCT_FAMILIES.some((family) => url.pathname.startsWith(`${base}${family}/`))) return null;
    return url.pathname + url.search + url.hash;
  } catch {
    return null;
  }
}

function dailyCapacity(profile, day) {
  if (Object.hasOwn(profile?.capacityByDay || {}, day)) return profile.capacityByDay[day];
  return profile?.defaultDailyMinutes ?? null;
}

function activeReminder(profile, day) {
  return REFRESH_WINDOWS.find((window) =>
    day >= window.start
    && day <= window.end
    && !profile?.reminders?.[window.id]
  ) || null;
}

export function initExamHome(root) {
  if (!(root instanceof HTMLElement)) return;
  const $ = (selector) => root.querySelector(selector);
  const $$ = (selector) => [...root.querySelectorAll(selector)];
  const catalog = JSON.parse($('[data-exam-catalog]').textContent);
  const politicsCatalog = JSON.parse($('[data-exam-daily-politics-catalog]')?.textContent || 'null');
  const politicsMemoryCatalog = JSON.parse($('[data-exam-politics-memory-catalog]')?.textContent || 'null');
  const xizongPacketIndex = JSON.parse($('[data-exam-daily-xizong-index]')?.textContent || '[]');
  $('[data-exam-catalog]').remove();
  $('[data-exam-daily-politics-catalog]')?.remove();
  $('[data-exam-politics-memory-catalog]')?.remove();
  $('[data-exam-daily-xizong-index]')?.remove();

  let bytes = null;
  let profile = emptyExamProfile();
  let readable = true;
  let pendingImport = null;
  let timeOverlay = null;
  let chatPlanState = { status: 'missing', plan: null, error: null };
  let readModel = null;
  let reminder = null;

  const day = () => examDay();
  const error = (message) => {
    const element = $('[data-exam-error]');
    element.hidden = !message;
    element.textContent = message || '';
  };

  function load() {
    try {
      bytes = localStorage.getItem(EXAM_PROFILE_KEY);
      profile = bytes === null ? emptyExamProfile() : validateExamProfile(JSON.parse(bytes), day());
      readable = true;
      error('');
    } catch {
      readable = false;
      error('本机学习上下文暂时读不完整；原记录未被改动。恢复存储后刷新，三科入口仍可使用。');
    }
    chatPlanState = readExamChatPlan(localStorage, day());
  }

  function persistProfile(next) {
    if (!readable) throw new Error('当前记录未能读取，未覆盖原记录。');
    if (localStorage.getItem(EXAM_PROFILE_KEY) !== bytes) {
      throw new Error('本机学习上下文已在其他页面改变，请关闭窗口并刷新后再修改。');
    }
    const valid = validateExamProfile(next, day());
    const encoded = JSON.stringify(valid);
    try {
      localStorage.setItem(EXAM_PROFILE_KEY, encoded);
    } catch {
      throw new Error('保存失败，本机学习上下文未改变。请恢复本机存储后重试。');
    }
    bytes = encoded;
    profile = valid;
    render();
  }

  function persistChatPlan(next) {
    try {
      writeExamChatPlan(localStorage, next, day());
    } catch (cause) {
      throw new Error(cause instanceof Error ? cause.message : String(cause));
    }
    chatPlanState = readExamChatPlan(localStorage, day());
    render();
  }

  const nativeLink = (selector, titleSelector, fallback, label) => {
    const node = document.querySelector(selector);
    const visible = node && !node.closest('[hidden]');
    const href = visible ? safeProductHref(node.getAttribute('href'), catalog.base) : null;
    const sessionRef = visible ? String(node.getAttribute('data-session-ref') || '').trim() || null : null;
    return href
      ? { href, title: document.querySelector(titleSelector)?.textContent?.trim() || label, sessionRef }
      : { href: fallback, title: label, sessionRef: null };
  };

  const safeControlledHref = (href) => {
    const raw = typeof href === 'string' ? href : '';
    const base = catalog.base || '/';
    const normalized = base !== '/' && raw.startsWith('/') && !raw.startsWith(base)
      ? `${base.replace(/\/$/, '')}${raw}`
      : raw;
    return safeProductHref(normalized, base);
  };

  const latestXizongTypedReturn = () => {
    try {
      const today = day();
      const blockPending = readXizongPendingChatReturnState(localStorage);
      const systemPending = readXizongSystemWuPendingState(localStorage);
      const candidates = [
        ...Object.values(blockPending.pending_by_object || {})
          .filter((row) => (!row?.study_day || row.study_day === today)
            && typeof row?.return_href === 'string'
            && row.return_href.startsWith('/xizong/'))
          .map((row) => ({
            kind: 'BLOCK_RETURN',
            href: row.return_href,
            title: '核对当前 Block',
            sessionRef: row.return_id || row.return_packet?.return_id || null,
            receivedAt: row.received_at || ''
          })),
        ...Object.values(systemPending.pending_by_system || {})
          .filter((row) => (!row?.study_day || row.study_day === today) && row?.system_id)
          .map((row) => ({
            kind: 'SYSTEM_WU_RETURN',
            href: '/xizong/practice/' + encodeURIComponent(row.system_id) + '/',
            title: '核对当前 W/U',
            sessionRef: row.return_id || row.return_packet?.return_id || null,
            receivedAt: row.received_at || ''
          }))
      ].sort((a, b) => String(b.receivedAt).localeCompare(String(a.receivedAt)));
      const current = candidates[0] || null;
      const href = safeControlledHref(current?.href);
      return current && href && current.sessionRef
        ? { href, title: current.title, sessionRef: current.sessionRef }
        : null;
    } catch {
      return null;
    }
  };

  const xizongChatContinue = (fallback, expectedRef = null) => {
    const typedReturn = latestXizongTypedReturn();
    if (typedReturn && (!expectedRef || typedReturn.sessionRef === expectedRef)) return typedReturn;

    try {
      const raw = JSON.parse(localStorage.getItem(XIZONG_SESSION_KEY) || 'null');
      if (!raw) return fallback;
      const instruction = validateXizongSessionInstruction(raw, day());
      if (expectedRef && instruction.session_id !== expectedRef) return fallback;
      let holdoutYears = [];
      try {
        const parsed = JSON.parse(localStorage.getItem('kianos:xizong:full-paper-holdout-years:v1') || '[]');
        holdoutYears = Array.isArray(parsed) ? parsed : [];
      } catch {}
      const result = activateXizongSessionNext(localStorage, instruction, {
        holdoutYears,
        now: Date.now()
      });
      const next = result?.next || null;
      const href = safeControlledHref(next?.href);
      if (!next || !href) return fallback;
      return {
        href,
        title: next.step?.label || (
          next.step?.kind === 'MEMORY_REVIEW' ? 'Memory 回收'
            : next.step?.kind === 'PRACTICE_SET' ? 'Chat 自选题'
              : next.step?.kind === 'SYSTEM_RECALL' ? '系统回忆'
                : next.step?.kind === 'BLOCK_RETURN' ? '回到当前 Block'
                  : '继续当前复习'
        ),
        sessionRef: instruction.session_id
      };
    } catch {
      return fallback;
    }
  };

  const politicsChatContinue = (fallback, expectedRef = null) => {
    try {
      const memory = resolvePoliticsMemoryResume(localStorage, politicsMemoryCatalog, { expectedDay: day() });
      if (memory?.status !== 'ACTIVE') return fallback;
      const sessionRef = memory.plan?.plan_id || memory.plan_id || null;
      if (expectedRef && sessionRef !== expectedRef) return fallback;
      const href = safeControlledHref(`${catalog.base}politics/memory/`);
      if (!href) return fallback;
      return {
        href,
        title: memory.candidate?.prompt ? `今日记忆 · ${memory.candidate.prompt}` : '今日记忆',
        sessionRef
      };
    } catch {
      return fallback;
    }
  };

  function publishPlanReadModel() {
    root.__kianosExamPlanReadModel = readModel;
    root.dispatchEvent(new CustomEvent('kianos:exam-plan-read-model', { detail: readModel, bubbles: true }));
    return readModel;
  }

  function render() {
    const xizongNative = nativeLink(
      '[data-xizong-continue]',
      '[data-xizong-continue-title]',
      `${catalog.base}xizong/`,
      '选择西综学习位置'
    );
    const politicsNative = nativeLink(
      '[data-politics-continue]',
      '[data-politics-continue-title]',
      `${catalog.base}politics/`,
      '选择政治学习位置'
    );
    const plan = chatPlanState.status === 'ready' ? chatPlanState.plan : null;
    const native = {
      xizong: {
        subject: 'xizong',
        ...xizongChatContinue(xizongNative, plan?.subjects?.xizong?.session_ref || null)
      },
      english: { subject: 'english', ...nativeLink('[data-english-resume-link]', '[data-english-resume-title]', `${catalog.base}english/`, '选择英语完整任务') },
      politics: {
        subject: 'politics',
        ...politicsChatContinue(politicsNative, plan?.subjects?.politics?.session_ref || null)
      }
    };

    const sourceProfile = readable ? profile : emptyExamProfile();
    timeOverlay = buildExamStudyTimeOverlay(localStorage, sourceProfile, day(), Date.now());
    const phase = resolveExamPhase(day());
    const nextGate = GATES.find((gate) => gate.date >= day()) || null;
    const gate = nextGate ? { ...nextGate, daysRemaining: dayDistance(day(), nextGate.date) } : null;
    const dayCapacity = dailyCapacity(timeOverlay.profile, day());

    readModel = buildChatControlledExamReadModel({
      day: day(),
      phase,
      gate,
      chatPlanState,
      dayCapacity,
      actualBySubject: timeOverlay.effectiveBySubject,
      nativeContinue: native,
      timeOverlay,
      readable
    });

    reminder = activeReminder(sourceProfile, day());
    root.dataset.studyTimeSource = timeOverlay.usesTimer ? 'timer' : 'manual';
    root.dataset.strategyOwner = 'chat';
    root.dataset.chatPlanStatus = chatPlanState.status;

    const gateNode = document.querySelector('[data-exam-gate]');
    const phaseNode = document.querySelector('[data-exam-phase]');
    if (gateNode) {
      gateNode.textContent = readModel.gate
        ? `${readModel.gate.date.slice(5).replace('-', '/')} ${readModel.gate.label} · ${readModel.gate.daysRemaining === 0 ? '今天' : `还有 ${readModel.gate.daysRemaining} 天`}`
        : '本轮考试已结束';
    }
    if (phaseNode) phaseNode.textContent = `${readModel.phase?.label || '考试周期'} · 总目标 ${TARGETS.total}+`;

    const capacityText = $('[data-exam-capacity]');
    if (!readable) {
      capacityText.textContent = '本机学习记录暂时没有完整恢复。';
    } else if (readModel.capacity.dayMinutes === null) {
      capacityText.textContent = '记录今天可用时间后，这里会显示今天的安排。';
    } else if (readModel.phase?.outsideCycle) {
      capacityText.textContent = '今天没有考试学习安排。';
    } else {
      const planLabel = chatPlanState.status === 'ready' ? '' : ' · 今日安排待同步';
      capacityText.textContent = `可用 ${formatMinutes(readModel.capacity.dayMinutes)} · 已学 ${formatMinutes(readModel.capacity.actualMinutes)}${planLabel}`;
    }
    $('[data-exam-settings]').textContent = readModel.capacity.dayMinutes === null ? '记录时间' : '调整时间';

    const allocations = $('[data-exam-allocations]');
    allocations.replaceChildren();
    for (const subject of SUBJECTS) {
      const rowModel = readModel.subjects[subject];
      const row = document.createElement('div');
      row.className = 'examSubjectAllocation';
      row.dataset.allocation = subject;
      const label = document.createElement('strong');
      label.textContent = names[subject];
      const role = document.createElement('span');
      role.textContent = rowModel.role || '未安排';
      const amount = document.createElement('b');
      amount.textContent = rowModel.targetMinutes === null ? '—' : formatMinutes(rowModel.targetMinutes);
      row.append(label, role, amount);
      allocations.append(row);
    }

    const best = readModel.next;
    const link = $('[data-exam-next]');
    if (best) {
      link.href = best.href;
      link.removeAttribute('aria-disabled');
      link.textContent = `${names[best.subject]} · ${best.title} →`;
    } else {
      link.removeAttribute('href');
      link.setAttribute('aria-disabled', 'true');
      link.textContent = '等待今日安排';
    }
    $('[data-exam-next-label]').textContent = '下一步';

    const attention = $('[data-exam-attention]');
    attention.hidden = !readModel.attention || !readable;
    if (readModel.attention) {
      $('[data-exam-attention-text]').textContent = readModel.attention.text;
      $('[data-exam-attention-action]').textContent = readModel.attention.action || '查看依据';
    }

    const reminderNode = $('[data-exam-reminder]');
    reminderNode.hidden = !reminder || !readable;
    if (reminder) reminderNode.querySelector('p').textContent = reminder.label;

    root.dataset.ready = 'true';
    publishPlanReadModel();
  }

  const open = (name) => {
    const dialog = $(`[data-exam-${name}-dialog]`);
    if (!dialog.open) dialog.showModal();
  };

  function settings() {
    $('[data-capacity-hours]').value = profile.capacityByDay[day()] != null
      ? profile.capacityByDay[day()] / 60
      : profile.defaultDailyMinutes != null ? profile.defaultDailyMinutes / 60 : '';
    $('[data-capacity-default]').checked = profile.defaultDailyMinutes == null;
    $('[data-maintenance]').value = profile.maintenanceByDay[day()] || '';
    $('[data-exam-settings-form] [data-form-error]').hidden = true;
    open('settings');
  }

  function why() {
    const target = $('[data-exam-reasons]');
    target.replaceChildren();
    const p = (value) => {
      const node = document.createElement('p');
      node.textContent = value;
      target.append(node);
    };
    const heading = (value) => {
      const node = document.createElement('h3');
      node.textContent = value;
      target.append(node);
    };

    p('三科分配、优先级和下一步由 Chat 决定；网页只校验并展示已经导入的计划，同时记录可用时间与真实学习证据。');
    p(readModel.gate
      ? `当前阶段：${readModel.phase?.label || '—'}；下一 Gate：${readModel.gate.date} ${readModel.gate.label}。`
      : '当前没有后续考试 Gate。');
    p(readModel.capacity.dayMinutes === null
      ? '今天可用时间尚未记录。'
      : `今天可用 ${formatMinutes(readModel.capacity.dayMinutes)}；已记录学习 ${formatMinutes(readModel.capacity.actualMinutes)}。`);

    if (chatPlanState.status === 'ready') {
      p(`Chat Plan：${chatPlanState.plan.study_day} · ${chatPlanState.plan.generated_at}。`);
      for (const subject of SUBJECTS) {
        const instruction = chatPlanState.plan.subjects[subject];
        heading(names[subject]);
        if (!instruction) {
          p('Chat 本次没有给这一科分配目标。');
          continue;
        }
        p([
          instruction.target_minutes == null ? '未给定时长' : `目标 ${formatMinutes(instruction.target_minutes)}`,
          instruction.role,
          instruction.note
        ].filter(Boolean).join(' · ') || '已纳入 Chat 安排。');
      }
    } else {
      p('当前没有有效的 Chat 今日安排。网页不会根据阶段、错题数、估分或剩余工作量自行补算一个计划。');
    }

    const reports = (profile.reports || []).filter((report) => report.day <= day() && report.validThrough >= day());
    if (reports.length) {
      heading('可供 Chat 使用的阶段证据');
      reports.forEach((report) => p(`${names[report.subject]} · ${report.note} · 依据：${report.evidenceRefs.join('、')}`));
    }
    open('why');
  }

  $$('[data-close]').forEach((button) => button.addEventListener('click', () => button.closest('dialog').close()));
  $('[data-exam-settings]').addEventListener('click', settings);
  $('[data-exam-why]').addEventListener('click', why);
  $('[data-exam-attention-action]').addEventListener('click', why);

  $('[data-exam-copy-daily]')?.addEventListener('click', async () => {
    const status = $('[data-exam-daily-status]');
    try {
      const result = buildHomeDailyLearningPacket({
        storage: localStorage,
        day: day(),
        now: Date.now(),
        plan: readModel,
        xizongPacketIndex,
        politicsCatalog,
        base: catalog.base || '/'
      });
      const text = serializeDailyLearningPacketForChat(result.packet);
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        window.prompt('复制今日学习包给 Chat', text);
      }
      const attached = Object.entries(result.coverage)
        .filter(([, value]) => value === 'attached')
        .map(([subject]) => names[subject] || subject);
      const unknown = Object.entries(result.coverage)
        .filter(([, value]) => value !== 'attached')
        .map(([subject]) => names[subject] || subject);
      if (status) {
        status.textContent = result.warnings.length
          ? '已复制；部分学习记录暂时没有完整读取。'
          : unknown.length
            ? `已复制；${unknown.join('、')}今天还没有可带走的学习记录。`
            : '已复制今日学习包。';
      }
    } catch (cause) {
      if (status) status.textContent = '今日学习包未生成：' + String(cause?.message || cause);
    }
  });

  $('[data-exam-settings-form]').addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    try {
      const next = structuredClone(profile);
      const hours = Number($('[data-capacity-hours]').value);
      if ($('[data-capacity-hours]').value === '' || !Number.isFinite(hours) || hours < 0 || hours > 24) {
        throw new Error('请填 0–24 小时之间的有效时间。');
      }
      next.capacityByDay[day()] = Math.round(hours * 60);
      if ($('[data-capacity-default]').checked) next.defaultDailyMinutes = next.capacityByDay[day()];
      const mode = $('[data-maintenance]').value;
      if (mode) next.maintenanceByDay[day()] = mode;
      else delete next.maintenanceByDay[day()];
      persistProfile(next);
      form.closest('dialog').close();
    } catch (cause) {
      const element = form.querySelector('[data-form-error]');
      element.hidden = false;
      element.textContent = cause.message;
    }
  });

  $('[data-exam-record]').addEventListener('click', () => {
    SUBJECTS.forEach((subject) => {
      $("[data-studied=\"" + subject + "\"]").value = profile.observations
        .filter((observation) => observation.day === day() && observation.subject === subject)
        .reduce((sum, observation) => sum + observation.minutes, 0);
    });
    $('[data-exam-record-form] [data-form-error]').hidden = true;
    open('record');
  });

  $('[data-exam-record-form]').addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    try {
      const next = structuredClone(profile);
      next.observations = next.observations.filter((observation) => observation.day !== day());
      for (const subject of SUBJECTS) {
        next.observations.push({
          id: `confirmed-${day()}-${subject}`,
          day: day(),
          subject,
          minutes: Number($("[data-studied=\"" + subject + "\"]").value),
          confirmed: true
        });
      }
      persistProfile(next);
      form.closest('dialog').close();
    } catch (cause) {
      const element = form.querySelector('[data-form-error]');
      element.hidden = false;
      element.textContent = cause.message;
    }
  });

  $('[data-exam-reminder-dismiss]').addEventListener('click', () => {
    if (!reminder) return;
    try {
      const next = structuredClone(profile);
      next.reminders[reminder.id] = day();
      persistProfile(next);
    } catch (cause) {
      error(cause.message);
    }
  });

  $('[data-exam-export]').addEventListener('click', () => {
    if (!readable) return;
    const bundle = {
      schema: 'kianos.exam.local-context.v1',
      study_day: day(),
      profile,
      chat_plan: chatPlanState.status === 'ready' ? chatPlanState.plan : null
    };
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `kianos-exam-context-${day()}.json`;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });

  $('[data-exam-import]').addEventListener('change', async (event) => {
    pendingImport = null;
    $('[data-exam-import-confirm]').hidden = true;
    $('[data-exam-import-preview]').hidden = true;
    try {
      const file = event.target.files?.[0];
      if (!file) return;
      if (file.size > 1024 * 1024) throw new Error('导入文件过大，未读取。');
      const parsed = JSON.parse(await file.text());
      const preview = $('[data-exam-import-preview]');

      if (parsed?.schema === EXAM_CHAT_PLAN_SCHEMA) {
        const value = validateExamChatPlan(parsed, day());
        pendingImport = { kind: 'chat-plan', value };
        preview.textContent = [
          `将载入 Chat 今日安排：${value.study_day}`,
          ...SUBJECTS.map((subject) => {
            const row = value.subjects[subject];
            return `${names[subject]} · ${row?.target_minutes == null ? '未给时长' : formatMinutes(row.target_minutes)} · ${row?.role || '未指定角色'}`;
          }),
          `下一步：${value.next_subject ? names[value.next_subject] : '未指定'}`
        ].join('\n');
      } else if (parsed?.schema === 'kianos.exam.local-context.v1') {
        const nextProfile = validateExamProfile(parsed.profile, day());
        const nextPlan = parsed.chat_plan ? validateExamChatPlan(parsed.chat_plan, day()) : null;
        pendingImport = { kind: 'context', profile: nextProfile, plan: nextPlan };
        preview.textContent = `将恢复本机学习上下文；Chat Plan：${nextPlan ? '有' : '无'}。`;
      } else {
        const value = validateExamProfile(parsed, day());
        pendingImport = { kind: 'profile', value };
        preview.textContent = `将载入旧版本机上下文（不自动生成学习安排）。\n阶段评估 ${value.reports.length} 条 · 阶段结论 ${value.gateReports.length} 条 · 已学时间 ${value.observations.length} 条`;
      }

      preview.hidden = false;
      $('[data-exam-import-confirm]').hidden = false;
      $('[data-import-error]').hidden = true;
    } catch (cause) {
      const element = $('[data-import-error]');
      element.hidden = false;
      element.textContent = cause.message;
    }
  });

  $('[data-exam-import-confirm]').addEventListener('click', () => {
    try {
      if (!pendingImport) return;
      if (pendingImport.kind === 'chat-plan') {
        persistChatPlan(pendingImport.value);
      } else if (pendingImport.kind === 'profile') {
        persistProfile(pendingImport.value);
      } else if (pendingImport.kind === 'context') {
        persistProfile(pendingImport.profile);
        if (pendingImport.plan) persistChatPlan(pendingImport.plan);
      }
      pendingImport = null;
      $('[data-exam-import-confirm]').hidden = true;
      $('[data-exam-why-dialog]').close();
    } catch (cause) {
      const element = $('[data-import-error]');
      element.hidden = false;
      element.textContent = cause.message;
    }
  });

  const refreshFromExternalTime = () => {
    if (!$$('dialog').some((dialog) => dialog.open)) render();
  };
  const requestSubjectContinues = () => {
    window.dispatchEvent(new CustomEvent('kianos:subject-continue-requested', {
      detail: { subject: null }
    }));
  };
  const refreshFromControl = () => {
    if ($$('dialog').some((dialog) => dialog.open)) return;
    load();
    render();
    requestSubjectContinues();
  };
  window.addEventListener('kianos:study-timer-change', refreshFromExternalTime);
  window.addEventListener('kianos:control-command-applied', refreshFromControl);
  window.addEventListener('kianos:private-control-consumed', refreshFromControl);
  window.addEventListener('kianos:politics-memory-plan-updated', refreshFromControl);
  window.addEventListener('kianos:subject-continue-updated', (event) => {
    if (!event?.detail?.subject) return;
    if (!$$('dialog').some((dialog) => dialog.open)) render();
  });
  window.addEventListener('storage', (event) => {
    if (![EXAM_PROFILE_KEY, EXAM_CHAT_PLAN_KEY, null].includes(event.key)) return;
    if ($$('dialog').some((dialog) => dialog.open)) {
      error('另一页面的本机学习上下文已改变；当前编辑未覆盖它。关闭窗口并刷新后再改。');
      return;
    }
    load();
    render();
  });
  window.addEventListener('focus', () => {
    if (!$$('dialog').some((dialog) => dialog.open)) {
      load();
      render();
    }
  });

  load();
  render();
  queueMicrotask(requestSubjectContinues);
  setTimeout(() => {
    requestSubjectContinues();
    render();
  }, 250);
}
