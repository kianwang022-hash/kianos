import {
  POLITICS_MEMORY_PLAN_KEY,
  recordPoliticsMemoryResponse,
  resolvePoliticsMemoryResume
} from './politicsMemoryRuntime.mjs';

const responseLabels = {
  FORGOT: '忘了',
  FUZZY: '模糊',
  STABLE: '稳定'
};

const responseKeys = {
  '1': 'FORGOT',
  '2': 'FUZZY',
  '3': 'STABLE'
};

export function initPoliticsMemoryWorkspace(root) {
  if (!(root instanceof HTMLElement)) return;
  const $ = (selector) => root.querySelector(selector);
  const catalogNode = $('[data-memory-catalog]');
  let catalog;
  try { catalog = JSON.parse(catalogNode?.textContent || '{}'); }
  catch { catalog = null; }
  catalogNode?.remove();

  const prompt = $('[data-memory-prompt]');
  const answer = $('[data-memory-answer]');
  const answerItems = $('[data-memory-answer-items]');
  const reveal = $('[data-memory-reveal]');
  const controls = $('[data-memory-controls]');
  const status = $('[data-memory-status]');
  const progress = $('[data-memory-progress]');
  const empty = $('[data-memory-empty]');
  const stale = $('[data-memory-stale]');
  const complete = $('[data-memory-complete]');
  const card = $('[data-memory-card]');

  let revealed = false;
  let active = null;
  const localStudyDay = () => new Date().toLocaleDateString('en-CA');

  const setHidden = (node, value) => {
    if (node instanceof HTMLElement) node.hidden = value;
  };

  const render = () => {
    revealed = false;
    setHidden(answer, true);
    setHidden(controls, true);
    setHidden(reveal, true);
    setHidden(empty, true);
    setHidden(stale, true);
    setHidden(complete, true);
    setHidden(card, true);
    if (status) status.textContent = '';

    let next;
    try {
      next = resolvePoliticsMemoryResume(localStorage, catalog, { expectedDay: localStudyDay() });
    } catch (error) {
      if (status) status.textContent = '当前政治记忆记录无法安全读取：' + String(error?.message || error);
      active = null;
      return;
    }

    active = next;

    if (!next) {
      setHidden(empty, false);
      if (progress) progress.textContent = '0';
      return;
    }

    if (next.status === 'STALE') {
      setHidden(stale, false);
      if (status) status.textContent = '当前计划与最新政治内容不一致；没有替换成其他卡。回 Chat 重新生成今天的计划。';
      return;
    }

    if (next.status === 'COMPLETE') {
      if (Number(next.total || 0) === 0) setHidden(empty, false);
      else setHidden(complete, false);
      if (progress) progress.textContent = String(next.total || 0);
      return;
    }

    if (next.status !== 'ACTIVE') return;

    setHidden(card, false);
    if (progress) progress.textContent = `${next.index + 1} / ${next.total}`;
    if (prompt) prompt.textContent = next.candidate.prompt || '回忆这一项';
    if (answerItems) {
      answerItems.replaceChildren(...(next.candidate.answer_items || []).map((item) => {
        const li = document.createElement('li');
        li.textContent = item;
        return li;
      }));
    }
    const reason = $('[data-memory-reason]');
    if (reason) {
      reason.textContent = next.item.reason || '';
      reason.hidden = !next.item.reason;
    }
    setHidden(reveal, false);
    reveal?.focus({ preventScroll: true });
  };

  const showAnswer = () => {
    if (active?.status !== 'ACTIVE' || revealed) return;
    revealed = true;
    setHidden(answer, false);
    setHidden(controls, false);
    setHidden(reveal, true);
    root.querySelector('[data-memory-response="FUZZY"]')?.focus({ preventScroll: true });
  };

  const respond = (value) => {
    if (!revealed || active?.status !== 'ACTIVE') return;
    try {
      recordPoliticsMemoryResponse(localStorage, catalog, {
        plan_id: active.plan.plan_id,
        candidate_id: active.candidate.id,
        response: value,
        observed_at: new Date().toISOString()
      }, { expectedDay: localStudyDay() });
      if (status) status.textContent = '已记录：' + (responseLabels[value] || value);
      render();
    } catch (error) {
      if (status) status.textContent = '没有记录：' + String(error?.message || error);
    }
  };

  reveal?.addEventListener('click', showAnswer);
  root.querySelectorAll('[data-memory-response]').forEach((button) => {
    button.addEventListener('click', () => respond(button.getAttribute('data-memory-response')));
  });

  window.addEventListener('keydown', (event) => {
    if (event.metaKey || event.ctrlKey || event.altKey || event.isComposing || event.repeat) return;
    const target = event.target;
    if (target instanceof HTMLElement && (target.matches('input,textarea,select') || target.isContentEditable)) return;

    if ((event.key === ' ' || event.key === 'Enter') && active?.status === 'ACTIVE' && !revealed) {
      event.preventDefault();
      showAnswer();
      return;
    }

    const response = responseKeys[event.key];
    if (response && revealed) {
      event.preventDefault();
      respond(response);
    }
  });

  window.addEventListener('storage', (event) => {
    if (event.key === POLITICS_MEMORY_PLAN_KEY) render();
  });
  window.addEventListener('focus', render);
  render();
}
