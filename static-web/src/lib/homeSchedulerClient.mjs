import { buildHomeSchedulerProjection } from './homeSchedulerProjection.mjs';

const SUBJECT_LABELS = Object.freeze({ xizong: '西综', politics: '政治', english: 'English' });
const ROLE_LABELS = Object.freeze({ 主推: '主推进', 推进: '稳推进', 稳推进: '稳推进', 保连续: '保连续' });
const URGENT_STATUS = new Set(['需要加速', '时间偏紧']);
const QUIET_STATUS = new Set(['按阶段起步', '按当前阶段', '正常推进', '保持连续']);

function formatMinutes(value) {
  if (!Number.isFinite(value)) return '—';
  const minutes = Math.max(0, Math.round(value));
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (!hours) return `${minutes}m`;
  if (!rest) return `${hours}h`;
  return `${hours}h${String(rest).padStart(2, '0')}`;
}

function formatDay(day) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(day || ''))) return '—';
  return `${day.slice(5, 7)}/${day.slice(8, 10)}`;
}

function normalizedLabel(value) {
  return String(value || '').replace(/[\s·—–-]+/g, '').toLowerCase();
}

function formatGate(gate, phase) {
  if (!gate) return '本轮暂无下一 Gate';
  const date = formatDay(gate.date);
  const remaining = Number.isFinite(gate.daysRemaining)
    ? (gate.daysRemaining === 0 ? '今天' : `${gate.daysRemaining} 天`)
    : '';
  const sameAsPhase = normalizedLabel(gate.label) === normalizedLabel(phase?.label);
  const label = sameAsPhase ? 'Gate' : (gate.label || 'Gate');
  return [date, label, remaining].filter(Boolean).join(' · ');
}

function setText(root, selector, value) {
  const node = root.querySelector(selector);
  if (node) node.textContent = value;
}

function applySubject(page, subject) {
  const row = page.querySelector(`[data-home-subject="${subject.subject}"]`);
  if (!(row instanceof HTMLElement)) return;

  const baseRole = ROLE_LABELS[subject.role] || subject.role || '按当前阶段';
  const role = URGENT_STATUS.has(subject.status) ? subject.status : baseRole;
  const meaningfulStatus = subject.status && subject.status !== role && !QUIET_STATUS.has(subject.status)
    ? subject.status
    : '';
  setText(row, '[data-home-role]', role);
  setText(row, '[data-home-actual]', formatMinutes(subject.actualMinutes));
  setText(row, '[data-home-target]', formatMinutes(subject.targetMinutes));
  setText(row, '[data-home-remaining]', formatMinutes(subject.remainingMinutes));
  setText(row, '[data-home-status]', meaningfulStatus || (subject.reviewMinutes > 0 ? `含 ${formatMinutes(subject.reviewMinutes)} 回访` : ''));

  const progress = row.querySelector('[data-home-progress]');
  if (progress instanceof HTMLElement) {
    const ratio = Number.isFinite(subject.targetMinutes) && subject.targetMinutes > 0
      ? Math.min(1, Math.max(0, subject.actualMinutes / subject.targetMinutes))
      : 0;
    progress.style.width = `${Math.round(ratio * 1000) / 10}%`;
  }
}

function applyProjection(page, projection) {
  if (!projection) return;
  page.dataset.schedulerReady = 'true';
  page.dataset.schedulerReadable = projection.readable ? 'true' : 'false';
  page.dataset.studyTimeSource = projection.usesTimer ? 'timer' : 'manual';

  setText(page, '[data-home-day]', formatDay(projection.day));
  setText(page, '[data-home-phase]', projection.phase?.label || '等待阶段信息');
  setText(page, '[data-home-gate]', formatGate(projection.gate, projection.phase));

  const capacity = projection.capacity || {};
  setText(page, '[data-home-capacity-day]', formatMinutes(capacity.dayMinutes));
  setText(page, '[data-home-capacity-actual]', formatMinutes(capacity.actualMinutes));
  setText(page, '[data-home-capacity-remaining]', formatMinutes(capacity.remainingMinutes));

  projection.subjects.forEach((subject) => applySubject(page, subject));
  page.querySelectorAll('[data-home-subject]').forEach((row) => {
    row.toggleAttribute('data-home-next', row.getAttribute('data-home-subject') === projection.next?.subject);
  });

  const next = projection.next;
  const nextLink = page.querySelector('[data-home-next-link]');
  if (nextLink instanceof HTMLAnchorElement) {
    nextLink.href = next?.href || page.dataset.base || '/';
    const title = next ? `${SUBJECT_LABELS[next.subject] || next.subject} · ${next.title || '继续学习'}` : '自由选择学习';
    setText(nextLink, '[data-home-next-title]', title);
  }

  const attention = page.querySelector('[data-home-plan-attention]');
  if (attention instanceof HTMLElement) {
    const visible = Boolean(projection.attention?.text) && projection.readable;
    attention.hidden = !visible;
    setText(attention, '[data-home-plan-attention-text]', projection.attention?.text || '');
    const action = attention.querySelector('[data-home-plan-attention-action]');
    if (action instanceof HTMLButtonElement) {
      action.textContent = projection.attention?.action || '为什么？';
      action.dataset.actionType = projection.attention?.type || 'why';
    }
  }
}

export function initHomeScheduler(root = document) {
  const page = root.querySelector?.('[data-home-workbench]');
  const exam = root.querySelector?.('[data-exam-home]');
  if (!(page instanceof HTMLElement) || !(exam instanceof HTMLElement)) return;

  const sync = (readModel = exam.__kianosExamPlanReadModel) => {
    applyProjection(page, buildHomeSchedulerProjection(readModel));
  };

  page.addEventListener('kianos:exam-plan-read-model', (event) => sync(event.detail));
  const attentionAction = page.querySelector('[data-home-plan-attention-action]');
  attentionAction?.addEventListener('click', () => {
    const selector = attentionAction.dataset.actionType === 'capacity' ? '[data-exam-settings]' : '[data-exam-why]';
    exam.querySelector(selector)?.click();
  });

  queueMicrotask(() => sync());
  setTimeout(() => sync(), 50);
  setTimeout(() => sync(), 350);
}
