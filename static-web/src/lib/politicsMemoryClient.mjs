import {
  POLITICS_MEMORY_PLAN_KEY,
  politicsMemoryRecommendedCandidateIds,
  recordPoliticsMemoryFreeResponse,
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

const subjectLabels = {
  marxism: '马原',
  history: '史纲',
  mao: '毛中特',
  xi: '习思想',
  'ethics-law': '思法'
};

export function initPoliticsMemoryWorkspace(root, { storage = localStorage, studyDay = null } = {}) {
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
  const freePanel = $('[data-memory-free]');
  const freeOpen = $('[data-memory-free-open]');
  const freeScope = $('[data-memory-free-scope]');
  const freeSubject = $('[data-memory-free-subject]');
  const freeChapter = $('[data-memory-free-chapter]');
  const freeStart = $('[data-memory-free-start]');
  const freeCount = $('[data-memory-free-count]');

  let revealed = false;
  let active = null;
  let renderedPlanBytes = null;
  let mode = 'plan';
  let freeCandidates = [];
  let freeIndex = 0;
  let freeSessionId = null;

  const localStudyDay = () => studyDay || new Date().toLocaleDateString('en-CA');
  const candidates = Array.isArray(catalog?.candidates)
    ? catalog.candidates.filter((candidate) => candidate?.admission_verified === true)
    : [];

  const setHidden = (node, value) => {
    if (node instanceof HTMLElement) node.hidden = value;
  };

  const hideAllStates = () => {
    revealed = false;
    setHidden(answer, true);
    setHidden(controls, true);
    setHidden(reveal, true);
    setHidden(empty, true);
    setHidden(stale, true);
    setHidden(complete, true);
    setHidden(card, true);
    setHidden(freePanel, true);
    if (status) status.textContent = '';
  };

  const renderCandidate = ({ candidate, index, total, item = null, plan = null, free = false }) => {
    active = {
      status: 'ACTIVE',
      candidate,
      index,
      total,
      item,
      plan,
      free
    };
    setHidden(card, false);
    if (progress) progress.textContent = `${index + 1} / ${total}`;
    if (prompt) prompt.textContent = candidate.prompt || '回忆这一项';
    if (answerItems) {
      answerItems.replaceChildren(...(candidate.answer_items || []).map((itemText) => {
        const li = document.createElement('li');
        li.textContent = itemText;
        return li;
      }));
    }
    const checking = $('[data-memory-checking]');
    if (checking) checking.textContent = (candidate.checking_criteria || []).join('；');
    const cue = $('[data-memory-cue]');
    if (cue) {
      cue.textContent = candidate.memory_cue || '';
      cue.hidden = !candidate.memory_cue;
    }
    const reason = $('[data-memory-reason]');
    const reasonLabel = reason?.previousElementSibling;
    if (reasonLabel) reasonLabel.textContent = free ? '本次范围' : '今天为什么背';
    const fallback = root.querySelector('.politicsMemoryReasonFallback');
    if (reason) {
      const freeReason = free
        ? `自由复习 · ${subjectLabels[candidate.subject] || candidate.subject || '政治'} · ${candidate.chapter_title || candidate.chapter_id || ''}`
        : item?.reason || '';
      reason.textContent = freeReason;
      reason.hidden = !freeReason;
      if (fallback instanceof HTMLElement) fallback.hidden = Boolean(freeReason);
    }
    setHidden(reveal, false);
    reveal?.focus({ preventScroll: true });
  };

  const freeCandidatePool = () => {
    if ((freeScope?.value || 'recommended') === 'all') return candidates;
    let recommendedIds;
    try { recommendedIds = politicsMemoryRecommendedCandidateIds(storage, catalog); }
    catch { recommendedIds = new Set(); }
    return candidates.filter((candidate) => recommendedIds.has(candidate.id));
  };

  const filteredFreeCandidates = () => {
    const subject = freeSubject?.value || 'all';
    const chapter = freeChapter?.value || 'all';
    return freeCandidatePool().filter((candidate) =>
      (subject === 'all' || candidate.subject === subject)
      && (chapter === 'all' || candidate.chapter_id === chapter)
    );
  };

  const updateFreeCount = () => {
    const count = filteredFreeCandidates().length;
    if (freeCount) freeCount.textContent = String(count);
    if (mode === 'free-picker' && progress) progress.textContent = String(count);
  };

  const fillChapterOptions = () => {
    if (!(freeChapter instanceof HTMLSelectElement)) return;
    const subject = freeSubject?.value || 'all';
    const pool = freeCandidatePool();
    const rows = subject === 'all'
      ? []
      : pool.filter((candidate) => candidate.subject === subject);
    const seen = new Map();
    for (const row of rows) {
      if (!row.chapter_id || seen.has(row.chapter_id)) continue;
      seen.set(row.chapter_id, row.chapter_title || row.chapter_id);
    }
    freeChapter.replaceChildren();
    const all = document.createElement('option');
    all.value = 'all';
    all.textContent = subject === 'all' ? '全部章节' : `全部章节 · ${rows.length} 项`;
    freeChapter.append(all);
    for (const [chapterId, chapterTitle] of seen) {
      const option = document.createElement('option');
      option.value = chapterId;
      const count = rows.filter((row) => row.chapter_id === chapterId).length;
      option.textContent = `${chapterTitle} · ${count}`;
      freeChapter.append(option);
    }
    updateFreeCount();
  };

  const fillFreeOptions = () => {
    if (!(freeSubject instanceof HTMLSelectElement)) return;
    const previous = freeSubject.value || 'all';
    const pool = freeCandidatePool();
    freeSubject.replaceChildren();
    const all = document.createElement('option');
    all.value = 'all';
    all.textContent = `全部政治 · ${pool.length}`;
    freeSubject.append(all);
    const subjects = [...new Set(pool.map((candidate) => candidate.subject).filter(Boolean))];
    for (const subject of subjects) {
      const option = document.createElement('option');
      option.value = subject;
      option.textContent = `${subjectLabels[subject] || subject} · ${pool.filter((row) => row.subject === subject).length}`;
      freeSubject.append(option);
    }
    if ([...freeSubject.options].some((option) => option.value === previous)) freeSubject.value = previous;
    fillChapterOptions();
  };

  const showFreePicker = () => {
    mode = 'free-picker';
    active = null;
    hideAllStates();
    fillFreeOptions();
    setHidden(freePanel, false);
    if (freeOpen) {
      const hasPlan = Boolean(storage.getItem(POLITICS_MEMORY_PLAN_KEY));
      freeOpen.textContent = hasPlan ? '返回今日任务' : '自主选练';
      freeOpen.disabled = !hasPlan;
    }
    if (progress) progress.textContent = String(freeCandidatePool().length);
  };

  const renderFreeCandidate = () => {
    hideAllStates();
    if (freeIndex >= freeCandidates.length) {
      mode = 'free-complete';
      active = { status: 'COMPLETE', free: true };
      setHidden(complete, false);
      const title = complete?.querySelector('h2');
      const copy = complete?.querySelector('p');
      if (title) title.textContent = '这一组自由复习完成了';
      if (copy) copy.textContent = '回忆结果已经记录。可以继续换科目或章节刷。';
      if (freeOpen) { freeOpen.disabled = false; freeOpen.textContent = '换一组'; }
      if (progress) progress.textContent = String(freeCandidates.length);
      return;
    }
    if (freeOpen) { freeOpen.disabled = false; freeOpen.textContent = '换一组'; }
    renderCandidate({
      candidate: freeCandidates[freeIndex],
      index: freeIndex,
      total: freeCandidates.length,
      free: true
    });
  };

  const startFree = () => {
    freeCandidates = filteredFreeCandidates();
    if (!freeCandidates.length) {
      if (status) status.textContent = (freeScope?.value || 'recommended') === 'all'
        ? '这个范围暂时没有已审核的 Memory。'
        : '这个范围暂时没有推荐 Memory；可以切到「全部已审核练习」查看保留的参考卡。';
      return;
    }
    mode = 'free-active';
    freeIndex = 0;
    freeSessionId = crypto?.randomUUID
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    renderFreeCandidate();
  };

  const renderPlan = () => {
    mode = 'plan';
    hideAllStates();
    if (freeOpen) { freeOpen.disabled = false; freeOpen.textContent = '自由复习'; }

    let next;
    try {
      renderedPlanBytes = storage.getItem(POLITICS_MEMORY_PLAN_KEY);
      next = resolvePoliticsMemoryResume(storage, catalog, { expectedDay: localStudyDay() });
    } catch (error) {
      if (status) status.textContent = '当前政治记忆记录无法安全读取：' + String(error?.message || error);
      active = null;
      return;
    }

    active = next;

    if (!next) {
      showFreePicker();
      return;
    }

    if (next.status === 'STALE') {
      setHidden(stale, false);
      if (status) status.textContent = '当前计划与最新政治内容不一致；你仍可使用「自由复习」刷当前已审核 Memory。';
      if (progress) progress.textContent = '—';
      return;
    }

    if (next.status === 'COMPLETE') {
      const title = complete?.querySelector('h2');
      const copy = complete?.querySelector('p');
      if (title) title.textContent = '这一组完成了';
      if (copy) copy.textContent = '回忆结果已经记录。可以选择自由复习，或回到原安排。';
      if (Number(next.total || 0) === 0) showFreePicker();
      else setHidden(complete, false);
      if (progress) progress.textContent = String(next.total || 0);
      return;
    }

    if (next.status !== 'ACTIVE') return;

    renderCandidate({
      candidate: next.candidate,
      index: next.index,
      total: next.total,
      item: next.item,
      plan: next.plan,
      free: false
    });
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
      if (active.free) {
        recordPoliticsMemoryFreeResponse(storage, catalog, {
          session_id: freeSessionId,
          candidate_id: active.candidate.id,
          response: value,
          study_day: localStudyDay(),
          observed_at: new Date().toISOString()
        });
        if (status) status.textContent = '已记录：' + (responseLabels[value] || value);
        freeIndex += 1;
        renderFreeCandidate();
      } else {
        recordPoliticsMemoryResponse(storage, catalog, {
          plan_id: active.plan.plan_id,
          candidate_id: active.candidate.id,
          response: value,
          observed_at: new Date().toISOString()
        }, { expectedDay: localStudyDay() });
        if (status) status.textContent = '已记录：' + (responseLabels[value] || value);
        renderPlan();
      }
    } catch (error) {
      if (status) status.textContent = '没有记录：' + String(error?.message || error);
    }
  };

  reveal?.addEventListener('click', showAnswer);
  root.querySelectorAll('[data-memory-response]').forEach((button) => {
    button.addEventListener('click', () => respond(button.getAttribute('data-memory-response')));
  });

  freeOpen?.addEventListener('click', () => {
    if (mode === 'plan') showFreePicker();
    else if (mode === 'free-picker') renderPlan();
    else showFreePicker();
  });
  freeScope?.addEventListener('change', fillFreeOptions);
  freeSubject?.addEventListener('change', fillChapterOptions);
  freeChapter?.addEventListener('change', updateFreeCount);
  freeStart?.addEventListener('click', startFree);

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

  window.addEventListener('kianos:politics-memory-plan-updated', () => {
    if (mode !== 'plan' && mode !== 'free-picker') return;
    try {
      if (storage.getItem(POLITICS_MEMORY_PLAN_KEY) !== renderedPlanBytes) renderPlan();
    } catch {
      renderPlan();
    }
  });
  window.addEventListener('storage', (event) => {
    if (event.key === POLITICS_MEMORY_PLAN_KEY && mode === 'plan') renderPlan();
  });
  window.addEventListener('focus', () => {
    if (mode === 'plan') renderPlan();
  });

  fillFreeOptions();
  renderPlan();
}
