import { recordPoliticsFirstAttempt } from './politicsUnitReturn.mjs';

export const PRACTICE_KEYS = Object.freeze({
  attempts: 'kianos-politics-attempts-v1', meta: 'kianos-politics-practice-meta-v1',
  session: 'kianos-politics-practice-session-v1', last: 'kianos-politics-last-location-v1',
  evidence: 'kianos-politics-evidence-v1'
});
const emptyMeta = () => ({ schema: 'kianos.politics.practice_meta.v1', favorites: {}, discussion: {}, causes: {}, notes: {}, latestOutcome: {} });
const seconds = (n) => `${Math.floor(Math.max(0, n) / 60)}:${String(Math.floor(Math.max(0, n)) % 60).padStart(2, '0')}`;
const iso = () => new Date().toISOString();
const sorted = (s) => [...s].sort().join('');

export function initPoliticsPractice(root) {
  if (!(root instanceof HTMLElement)) return;
  const $ = (s) => root.querySelector(s);
  const $$ = (s) => [...root.querySelectorAll(s)];
  const hide = (s, value = true) => { $(s).hidden = value; };
  const text = (s, value) => { $(s).textContent = String(value ?? ''); };
  const error = (message) => { text('[data-practice-error]', message); hide('[data-practice-error]', false); };
  const clearError = () => hide('[data-practice-error]');
  const read = (key, fallback) => {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    const value = JSON.parse(raw);
    if (!value || typeof value !== 'object') throw new Error('本地记录无法读取；请先保留记录并恢复存储。');
    return value;
  };
  const write = (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch { throw new Error(key === PRACTICE_KEYS.evidence ? '复盘记录保存失败；当前题不推进。' : '本地保存失败；当前操作未完成，请恢复存储后重试。'); }
  };
  let catalog, meta, session, sessionBytes;
  try {
    catalog = JSON.parse($('[data-politics-practice-catalog]').textContent);
    meta = read(PRACTICE_KEYS.meta, emptyMeta());
    session = read(PRACTICE_KEYS.session, null);
    sessionBytes = localStorage.getItem(PRACTICE_KEYS.session);
  } catch (e) { error(e.message); $$('button').forEach((b) => { b.disabled = true; }); return; }
  // Don't leave even the public catalogue as an unnecessary accessibility node.
  $('[data-politics-practice-catalog]').remove();
  const qById = new Map(catalog.questions.map((q) => [q.id, q]));
  const uByKey = new Map(catalog.units.map((u) => [u.key, u]));
  const controls = Object.fromEntries(['subject', 'chapter', 'unit', 'type', 'count', 'mode'].map((name) => [name, $(`[data-filter-${name}]`)]));
  let selected = new Set(), uncertain = false, trajectory = [], elapsedMs = 0, activeSince = 0;
  let busy = false, stale = false, blocked = false, noteTimer, advanceTimer, startQuestionId = null;
  const active = () => session?.status === 'active';
  const question = () => qById.get(session?.ids?.[session.index]);
  const result = () => session?.results?.[question()?.id];
  const totalMs = () => elapsedMs + (activeSince ? Date.now() - activeSince : 0);
  const ensureWritable = () => {
    if (stale || localStorage.getItem(PRACTICE_KEYS.session) !== sessionBytes) {
      stale = true;
      throw new Error('题组已在其他页面改变。请刷新以恢复最新位置；当前操作未覆盖记录。');
    }
  };
  const saveSession = (next) => {
    ensureWritable(); write(PRACTICE_KEYS.session, next);
    session = next; sessionBytes = JSON.stringify(next);
  };
  const updateMeta = (field, id, value) => {
    ensureWritable();
    const next = read(PRACTICE_KEYS.meta, emptyMeta());
    next[field] = { ...(next[field] || {}), [id]: value };
    write(PRACTICE_KEYS.meta, next); meta = next;
  };
  const run = (fn) => async (event) => {
    try { await fn(event); } catch (e) { error(e.message || '保存失败，当前操作未完成。'); }
  };
  const on = (selector, event, fn) => $$(selector).forEach((node) => node.addEventListener(event, run(fn)));
  const eligible = () => catalog.questions.filter((q) =>
    (controls.subject.value === 'all' || q.subject === controls.subject.value) &&
    (controls.chapter.value === 'all' || `${q.subject}/${q.chapter}` === controls.chapter.value) &&
    (controls.unit.value === 'all' || q.unitKey === controls.unit.value) &&
    (controls.type.value === 'all' || q.type === controls.type.value) &&
    (controls.mode.value !== 'wrong' || meta.latestOutcome?.[q.id] === 'WRONG') &&
    (controls.mode.value !== 'favorite' || meta.favorites?.[q.id]));
  const options = (node, rows, label) => {
    node.replaceChildren(new Option(label, 'all'));
    rows.forEach(([value, name]) => node.add(new Option(name, value)));
  };
  const scopeSummary = () => {
    const count = eligible().length;
    text('[data-scope-summary]', `当前范围 ${count} 题`);
    text('[data-available-count]', count); text('[data-target-count]', controls.count.value);
    $$('[data-mode-value]').forEach((b) => {
      b.classList.toggle('active', b.dataset.modeValue === controls.mode.value);
      b.setAttribute('aria-pressed', String(b.dataset.modeValue === controls.mode.value));
      b.disabled = active();
    });
  };
  const unitOptions = () => {
    options(controls.unit, catalog.units.filter((u) => (controls.subject.value === 'all' || u.subject === controls.subject.value) && (controls.chapter.value === 'all' || `${u.subject}/${u.chapter}` === controls.chapter.value)).map((u) => [u.key, u.title]), '全部学习单元');
    scopeSummary();
  };
  const chapterOptions = () => {
    options(controls.chapter, catalog.chapters.filter((c) => controls.subject.value === 'all' || c.subject === controls.subject.value).map((c) => [c.key, c.title]), '全部章节');
    unitOptions();
  };
  options(controls.subject, catalog.subjects.map((s) => [s.id, s.label]), '全部科目');
  chapterOptions();

  const exactHref = () => `${location.pathname}?session=${encodeURIComponent(session.id)}&question=${encodeURIComponent(question().id)}`;
  const saveLocation = () => {
    if (!question()) return;
    const q = question();
    history.replaceState(null, "", exactHref());
    write(PRACTICE_KEYS.last, { subject: q.subject, chapter: q.chapter, title: `${q.subjectLabel} · ${q.chapterTitle}`, unit_id: q.unitId, question_id: q.id, action: 'VERIFY', href: exactHref(), observed_at: iso() });
  };
  const draft = () => ({ questionId: question().id, selected: sorted(selected), uncertain, trajectory, elapsedMs: totalMs() });
  const saveDraft = () => {
    if (!active() || !question() || result() || session.pending || blocked) return;
    const nextDraft = draft(); saveSession({ ...session, draft: nextDraft });
    elapsedMs = nextDraft.elapsedMs; activeSince = Date.now();
  };
  const persistNote = () => {
    if (!active() || !result()) return;
    const id = question().id, value = $('[data-note]').value;
    if (value === (meta.notes?.[id] || '')) return;
    try { updateMeta('notes', id, value); text('[data-note-status]', '已保存'); }
    catch { text('[data-note-status]', '保存失败 · 文字仍留在这里'); throw new Error('备注保存失败；请重试保存后再离开。'); }
  };
  const cancelAdvance = () => { clearTimeout(advanceTimer); advanceTimer = null; };
  const freezeInputs = (value) => {
    $$('[data-question-options] button, [data-submit], [data-uncertain], [data-interaction-normal], [data-interaction-fast]').forEach((b) => { b.disabled = value; });
  };
  const renderMode = () => {
    const fast = session.scope.interaction === 'FAST';
    for (const name of ['normal', 'fast']) {
      const b = $(`[data-interaction-${name}]`), enabled = fast === (name === 'fast');
      b.classList.toggle('active', enabled); b.setAttribute('aria-pressed', String(enabled));
    }
    hide('[data-submit]', fast && question().type === 'single');
    hide('[data-fast-hint]', !(fast && question().type === 'single'));
  };
  const renderSignals = () => {
    for (const [selector, enabled, yes, no] of [
      ['[data-favorite], [data-result-favorite]', !!meta.favorites?.[question().id], '★ 已收藏', '☆ 收藏'],
      ['[data-discussion], [data-result-discussion-toggle]', !!meta.discussion?.[question().id], '✓ 待讨论', '待讨论'],
      ['[data-uncertain]', uncertain, '▲ 已标不确定', '△ 不确定']
    ]) {
      $$(selector).forEach((b) => { b.classList.toggle('active', enabled); b.setAttribute('aria-pressed', String(enabled)); b.textContent = enabled ? yes : no; });
    }
    hide('[data-result-discussion]', !meta.discussion?.[question().id]);
  };
  const validateReview = (payload, q) => {
    if (payload?.schema !== 'kianos.politics.practice_review.v1' || payload.revision !== catalog.revision || payload.id !== q.id || payload.sourceId !== q.sourceId || payload.unitKey !== q.unitKey || !payload.takeaway?.trim() || !payload.chatExplanation?.trim() || !/^[A-D]+$/.test(payload.answer) || new Set(payload.answer).size !== payload.answer.length || [...payload.answer].some((l) => !q.options.some((o) => o.label === l)) || (q.type === 'single' && payload.answer.length !== 1)) throw new Error('本题解析缺失、绑定不符或已更新；当前题未提交。请等待内容对账后重试。');
  };
  const renderResult = () => {
    const q = question(), r = result(), payload = r.review;
    validateReview(payload, q);
    hide('[data-question-card]'); hide('[data-submitted-result]', false);
    $('[data-submitted-result]').dataset.outcome = r.outcome.toLowerCase();
    text('[data-result-status]', r.correct ? (r.uncertain ? '△ 答对了，仍有不确定' : '✓ 本题答对') : '× 本题答错');
    text('[data-takeaway]', payload.takeaway); text('[data-chat-explanation]', payload.chatExplanation);
    text('[data-result-selected]', r.selected); text('[data-result-answer]', payload.answer);
    const missing = [...payload.answer].filter((l) => !r.selected.includes(l));
    const extra = [...r.selected].filter((l) => !payload.answer.includes(l));
    const delta = q.type === 'multiple' ? [missing.length && `漏选 ${missing.join('、')}`, extra.length && `多选 ${extra.join('、')}`].filter(Boolean).join('；') : '';
    text('[data-result-delta]', delta); hide('[data-result-delta-row]', !delta);
    hide('[data-result-uncertain]', !r.uncertain); hide('[data-cause-picker]', r.correct);
    hide('[data-result-discussion]', !meta.discussion?.[q.id]); renderSignals();
    $('[data-note]').value = meta.notes?.[q.id] || ''; text('[data-note-status]', '已保存');
    $$('[data-cause]').forEach((b) => { const enabled = meta.causes?.[q.id] === b.dataset.cause; b.classList.toggle('active', enabled); b.setAttribute('aria-pressed', String(enabled)); });
    const face = $('[data-result-question]'); face.replaceChildren();
    for (const copy of [q.stem, ...q.options.map((o) => `${o.label}. ${o.text}`)]) { const p = document.createElement('p'); p.textContent = copy; face.append(p); }
    $('.practiceQuestionReference').open = false;
    const sources = $('[data-review-sources]'); sources.replaceChildren();
    for (const source of payload.source || []) {
      const detail = document.createElement('details'), summary = document.createElement('summary');
      summary.textContent = source.title || '对应原讲义'; detail.append(summary);
      if (source.id) { const p = document.createElement('code'); p.textContent = source.id; detail.append(p); }
      if (source.text) { const p = document.createElement('p'); p.textContent = source.text; detail.append(p); }
      sources.append(detail);
    }
    if (!(payload.source || []).length) { const p = document.createElement('p'); p.textContent = '本题没有已绑定的精确来源；可回所属学习单元定位。'; sources.append(p); }
    const url = new URL(q.unitHref, location.origin);
    url.searchParams.set('practiceSession', session.id); url.searchParams.set('practiceQuestion', q.id);
    $('[data-return-unit]').href = url.pathname + url.search + url.hash;
    text('[data-next-question]', session.index === session.ids.length - 1 ? '完成题组' : '下一题');
  };
  const renderQuestion = () => {
    const q = question();
    if (!q) throw new Error('保存的题目已不在当前目录；请先对账原题组。');
    hide('[data-submitted-result]'); $('[data-submitted-result]').removeAttribute('data-outcome'); hide('[data-question-card]', false); hide('[data-fast-feedback]');
    // Remove previous answer-bearing content even from hidden DOM before clean work.
    for (const s of ['[data-result-status]', '[data-result-question]', '[data-takeaway]', '[data-chat-explanation]', '[data-result-answer]', '[data-result-selected]', '[data-result-delta]', '[data-review-sources]']) $(s).replaceChildren();
    $('[data-note]').value = '';
    text('[data-session-current]', session.index + 1); text('[data-session-total]', session.ids.length);
    $('[data-session-progress]').style.width = `${session.index / session.ids.length * 100}%`;
    text('[data-session-scope]', `${q.subjectLabel} · ${q.chapterTitle} · ${q.unitTitle}`);
    text('[data-question-location]', `${q.subjectLabel} · ${q.chapterTitle}`);
    text('[data-question-number]', q.number); text('[data-question-type]', q.type === 'single' ? '单选' : '多选');
    text('[data-question-progress]', session.index + 1); text('[data-question-total]', session.ids.length);
    text('[data-question-stem]', q.stem);
    const d = session.draft?.questionId === q.id ? session.draft : {};
    selected = new Set(d.selected || ''); uncertain = !!d.uncertain; trajectory = d.trajectory || []; elapsedMs = d.elapsedMs || 0; activeSince = Date.now();
    $('[data-question-options]').replaceChildren();
    for (const o of q.options) {
      const b = document.createElement('button'); b.type = 'button'; b.dataset.option = o.label;
      const key = document.createElement('b'); key.textContent = o.label;
      const copy = document.createElement('span'); copy.textContent = o.text;
      b.append(key, copy); b.classList.toggle('selected', selected.has(o.label)); b.setAttribute('aria-pressed', String(selected.has(o.label)));
      b.addEventListener('click', run(() => choose(o.label))); $('[data-question-options]').append(b);
    }
    renderMode(); renderSignals(); freezeInputs(!!session.pending || busy);
    hide('[data-retry-save]', !session.pending);
    if (result()) { activeSince = 0; renderResult(); }
    else if (session.pending) { activeSince = 0; error('本次作答尚未全部保存；答案已锁定，请重试保存。'); }
    try { saveLocation(); } catch { error('继续位置未保存；请恢复本地存储后再离开。'); }
  };
  const render = () => {
    root.toggleAttribute('data-active', active());
    root.toggleAttribute('data-completed', session?.status === 'completed');
    hide('[data-practice-session]', !active()); hide('[data-session-complete]', session?.status !== 'completed');
    hide('[data-resume-session]', session?.status !== 'paused');
    hide('[data-practice-setup]', active() || session?.status === 'completed');
    $$('[data-start-session], [data-start-session-inline]').forEach((b) => { b.disabled = active() || session?.status === 'paused' || blocked; });
    scopeSummary();
    if (active()) renderQuestion();
    if (session?.status === 'completed') {
      const rows = Object.values(session.results), correct = rows.filter((r) => r.correct).length;
      text('[data-complete-title]', `${rows.length} 题完成`); text('[data-complete-score]', `${correct} / ${rows.length} 正确`);
      text('[data-complete-time]', `总用时 ${seconds(rows.reduce((sum, r) => sum + r.elapsedMs, 0) / 1000)}`);
      text('[data-complete-wrong]', `错题 ${rows.length - correct} · 不确定 ${rows.filter((r) => r.uncertain).length}`);
      const counts = Object.fromEntries(['memory', 'understanding', 'options', 'careless'].map((c) => [c, session.ids.filter((id) => meta.causes?.[id] === c).length]));
      const labels = { memory: '没记住', understanding: '没想明白', options: '选项没辨清', careless: '看错 / 粗心' };
      text('[data-complete-causes]', Object.entries(counts).filter(([, n]) => n).map(([c, n]) => `${labels[c]} ${n}`).join(' · '));
      $('[data-complete-return]').href = session.origin || '/politics/';
    }
  };
  const flushPending = () => {
    const p = session.pending, q = question(), unit = uByKey.get(q?.unitKey);
    if (!p || !q || p.questionId !== q.id || !unit) throw new Error('待保存作答与当前位置不符；未写入。');
    validateReview(p.review, q); ensureWritable();
    const store = read(PRACTICE_KEYS.attempts, { schema: 'kianos.politics.attempt_snapshot.v1', units: {} });
    const first = recordPoliticsFirstAttempt(store, unit.returnConfig, { question_id: q.id, outcome: p.outcome, selected: p.selected, correct_answer: p.review.answer, study_day: p.studyDay, observed_at: p.observedAt });
    if (!first.recorded && first.reason !== 'FIRST_ATTEMPT_ALREADY_RECORDED') throw new Error('首次作答绑定无效；未推进。');
    if (first.recorded) {
      try { write(PRACTICE_KEYS.attempts, first.store); }
      catch { throw new Error('本轮 first attempt 没有保存下来；为保护证据，当前题不推进。'); }
    }
    // A durable pending record locks this attempt across partial writes/reload.
    // The existing first-attempt writer remains sole owner of first evidence.
    updateMeta('latestOutcome', q.id, p.outcome);
    if (p.outcome === 'WRONG' || p.uncertain) {
      const events = read(PRACTICE_KEYS.evidence, []);
      if (!Array.isArray(events)) throw new Error('复盘记录格式不符；未推进。');
      if (!events.some((e) => e.event_id === p.eventId)) write(PRACTICE_KEYS.evidence, [...events, { event_id: p.eventId, subject: q.subject, chapter: q.chapter, chapter_title: q.chapterTitle, unit_id: q.unitId, question_id: q.id, source: 'xiao1000', outcome: p.outcome, uncertain: p.uncertain, selected: p.selected, correct_answer: p.review.answer, study_day: p.studyDay, observed_at: p.observedAt }]);
    }
    saveSession({ ...session, pending: null, draft: null, results: { ...session.results, [q.id]: p } });
    hide('[data-retry-save]'); clearError(); activeSince = 0; renderResult();
    $('[data-submitted-result]').focus({ preventScroll: true });
    if (session.scope.interaction === 'FAST' && q.type === 'single' && p.outcome === 'STABLE') {
      advanceTimer = setTimeout(run(nextQuestion), 520);
    }
  };
  const submit = async () => {
    if (!active() || !selected.size || result() || busy || blocked || session.pending) return;
    busy = true; freezeInputs(true); clearError();
    try {
      saveDraft(); const q = question();
      const response = await fetch(`${catalog.reviewBase}${encodeURIComponent(q.id)}.json${import.meta.env?.DEV ? "/" : ""}`);
      if (!response.ok) throw new Error('本题解析暂不可用；当前题未提交，请稍后重试。');
      const review = await response.json(); validateReview(review, q);
      const answer = sorted(selected), correct = answer === sorted(review.answer);
      const pending = { questionId: q.id, eventId: `${session.id}:${q.id}`, selected: answer, correct, uncertain, outcome: correct ? (uncertain ? 'UNCERTAIN' : 'STABLE') : 'WRONG', elapsedMs: totalMs(), answerChanges: trajectory.filter((t) => t.from && t.from !== t.to).length, trajectory: [...trajectory], observedAt: iso(), studyDay: new Date().toLocaleDateString('en-CA'), review };
      saveSession({ ...session, pending }); activeSince = 0;
      flushPending();
    } catch (e) {
      error(e.message); hide('[data-retry-save]', !session.pending);
    } finally { busy = false; freezeInputs(!!session.pending || !!result()); }
  };
  const choose = async (label) => {
    if (!active() || busy || result() || session.pending || blocked) return;
    const old = new Set(selected), from = sorted(old);
    if (question().type === 'single') selected = new Set([label]);
    else if (selected.has(label)) selected.delete(label); else selected.add(label);
    const to = sorted(selected), previousTrajectory = trajectory;
    if (from !== to) trajectory = [...trajectory, { from, to, elapsedMs: totalMs() }];
    try { saveDraft(); } catch (e) { selected = old; trajectory = previousTrajectory; throw e; }
    $$('[data-option]').forEach((b) => { b.classList.toggle('selected', selected.has(b.dataset.option)); b.setAttribute('aria-pressed', String(selected.has(b.dataset.option))); });
    if (question().type === 'single' && session.scope.interaction === 'FAST') await submit();
  };
  const nextQuestion = () => {
    if (!active() || !result() || busy || session.pending || blocked) return;
    persistNote(); cancelAdvance();
    const last = session.index === session.ids.length - 1;
    saveSession({ ...session, index: last ? session.index : session.index + 1, status: last ? 'completed' : 'active', ...(last ? { completedAt: iso() } : {}) });
    clearError(); render();
    if (!last) $('[data-question-card]').focus({ preventScroll: true });
  };
  const pause = () => {
    if (!active() || busy || session.pending) throw new Error('请先完成本题保存，再退出题组。');
    persistNote(); saveDraft(); cancelAdvance(); activeSince = 0;
    saveSession({ ...session, status: 'paused' }); render();
  };
  const start = () => {
    if (blocked || active() || session?.status === 'paused') return;
    if (!$('[data-learned-scope]').checked) throw new Error('请先在原讲义学习所选范围，再开始配套题。');
    let pool = eligible();
    if (controls.mode.value === 'random') {
      pool = [...pool]; for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
    }
    if (startQuestionId) {
      if (!pool.some((q) => q.id === startQuestionId)) throw new Error('当前筛选不包含链接中的原题；请重新选择范围。');
      pool = [qById.get(startQuestionId), ...pool.filter((q) => q.id !== startQuestionId)];
    }
    const ids = pool.slice(0, Number(controls.count.value)).map((q) => q.id);
    if (!ids.length) throw new Error('当前筛选没有可开始的题目。');
    saveSession({ schema: 'kianos.politics.practice_session.v1', runtimeVersion: 2, revision: catalog.revision, id: `politics-${crypto.randomUUID()}`, status: 'active', ids, index: 0, startedAt: iso(), results: {}, pending: null, draft: null, origin: controls.unit.value !== 'all' ? uByKey.get(controls.unit.value).href : '/politics/', scope: { subject: controls.subject.value, chapter: controls.chapter.value, unit: controls.unit.value, type: controls.type.value, mode: controls.mode.value, interaction: 'NORMAL', learnedScopeConfirmedAt: iso() } });
    clearError(); render(); $('[data-question-card]').focus({ preventScroll: true });
  };
  on('[data-start-session], [data-start-session-inline]', 'click', start);
  on('[data-resume-session]', 'click', () => { if (blocked) return; saveSession({ ...session, status: 'active' }); clearError(); render(); });
  on('[data-exit-session]', 'click', pause);
  on('[data-start-another]', 'click', () => { if (session?.status !== 'completed') return; root.removeAttribute('data-completed'); hide('[data-session-complete]'); hide('[data-practice-setup]', false); $$('[data-start-session], [data-start-session-inline]').forEach((b) => { b.disabled = false; }); $('[data-learned-scope]').checked = false; });
  on('[data-submit]', 'click', submit); on('[data-next-question]', 'click', nextQuestion);
  on('[data-retry-save]', 'click', () => { ensureWritable(); flushPending(); });
  on('[data-favorite], [data-discussion], [data-result-favorite], [data-result-discussion-toggle]', 'click', (event) => {
    if (!question() || blocked) return;
    const field = (event.currentTarget.hasAttribute('data-favorite') || event.currentTarget.hasAttribute('data-result-favorite')) ? 'favorites' : 'discussion';
    updateMeta(field, question().id, !meta[field]?.[question().id]); renderSignals(); scopeSummary();
  });
  on('[data-uncertain]', 'click', () => {
    if (!active() || result() || session.pending || busy) return;
    const previous = uncertain; uncertain = !uncertain;
    try { saveDraft(); } catch (e) { uncertain = previous; throw e; } renderSignals();
  });
  for (const name of ['normal', 'fast']) on(`[data-interaction-${name}]`, 'click', () => {
    if (!active() || result() || session.pending || busy) return;
    saveSession({ ...session, scope: { ...session.scope, interaction: name.toUpperCase() } }); renderMode();
  });
  on('[data-cause]', 'click', (event) => {
    if (!result()) return;
    const value = event.currentTarget.dataset.cause;
    updateMeta('causes', question().id, meta.causes?.[question().id] === value ? '' : value);
    $$('[data-cause]').forEach((b) => { const enabled = meta.causes?.[question().id] === b.dataset.cause; b.classList.toggle('active', enabled); b.setAttribute('aria-pressed', String(enabled)); });
  });
  on('[data-note]', 'input', () => { cancelAdvance(); text('[data-note-status]', '待保存'); clearTimeout(noteTimer); noteTimer = setTimeout(run(persistNote), 350); });
  on('[data-note]', 'blur', persistNote);
  on('[data-mode-value]', 'click', (event) => { if (active()) return; controls.mode.value = event.currentTarget.dataset.modeValue; startQuestionId = null; scopeSummary(); });
  for (const name of ['subject', 'chapter', 'unit', 'type', 'count']) on(`[data-filter-${name}]`, 'change', () => {
    $('[data-learned-scope]').checked = false; if (name !== 'count') startQuestionId = null;
    if (name === 'subject') chapterOptions(); else if (name === 'chapter') unitOptions(); else scopeSummary();
  });
  document.addEventListener('click', (event) => {
    if (!event.target.closest('a') || !active()) return;
    try {
      if (busy || session.pending) throw new Error('本次作答尚未保存完整，请先重试保存。');
      persistNote(); saveDraft(); cancelAdvance();
    } catch (e) { event.preventDefault(); error(e.message); }
  });
  window.addEventListener('keydown', run(async (event) => {
    if (!active() || blocked || busy || event.metaKey || event.ctrlKey || event.altKey || event.isComposing || event.repeat) return;
    const target = event.target;
    if (target instanceof HTMLElement && (target.matches('input, textarea, select') || target.isContentEditable)) return;
    // Native Enter/Space activation belongs to a focused control; digits remain
    // available after a mouse selection, without double-submitting on Enter.
    if (event.key === 'Enter' && (!target.closest('button,a,summary') || target.closest('[data-option]'))) { event.preventDefault(); if (result()) nextQuestion(); else await submit(); }
    if (!result() && /^[1-4]$/.test(event.key)) { const o = question().options[Number(event.key) - 1]; if (o) { event.preventDefault(); await choose(o.label); } }
  }));
  window.addEventListener('beforeunload', (event) => {
    try { if (busy || session?.pending) throw new Error('pending'); persistNote(); saveDraft(); }
    catch { event.preventDefault(); event.returnValue = ''; }
  });
  window.addEventListener('pagehide', () => { clearTimeout(noteTimer); cancelAdvance(); try { persistNote(); saveDraft(); } catch {} });
  window.addEventListener('storage', (event) => { if (event.key === PRACTICE_KEYS.session) { stale = true; cancelAdvance(); error('题组已在其他页面改变，请刷新后继续。'); } });
  window.setInterval(() => { if (active() && !result()) text('[data-question-timer]', seconds(totalMs() / 1000)); }, 1000);

  try {
    if (session && (session.runtimeVersion !== 2 || session.revision !== catalog.revision || !Array.isArray(session.ids) || !session.ids.length || session.ids.some((id) => !qById.has(id)) || !Number.isInteger(session.index) || session.index < 0 || session.index >= session.ids.length || !['active', 'paused', 'completed'].includes(session.status))) throw new Error('原题组版本或内容已变化，无法安全恢复。记录已保留，请先对账原题组。');
    const params = new URLSearchParams(location.search);
    if (params.has('session')) {
      if (!session || params.get('session') !== session.id || params.get('question') !== question()?.id || !['active', 'paused', 'completed'].includes(session.status)) throw new Error('返回目标已过期或与当前题组不符；没有跳到其他题。');
      if (session.status === 'paused') saveSession({ ...session, status: 'active' });
    } else if (params.has('unit') || params.has('question')) {
      const targetQuestion = params.has('question') ? qById.get(params.get('question')) : null;
      if (params.has('question') && !targetQuestion) throw new Error('原题链接无效；没有替换成其他题。');
      const u = uByKey.get(params.get('unit') || targetQuestion?.unitKey);
      if (targetQuestion && u?.key !== targetQuestion.unitKey) throw new Error('原题与学习单元不匹配；未开始。');
      if (targetQuestion && session && ['active', 'paused'].includes(session.status)) throw new Error('已有未完成题组，请使用原题组的继续入口。');
      startQuestionId = targetQuestion?.id || null;
      if (!u) throw new Error('学习单元链接无效；没有替换成其他范围。');
      if (session && ['active', 'paused'].includes(session.status) && session.scope.unit !== u.key) throw new Error('另有未完成题组，请从原入口恢复；没有替换题组。');
      controls.subject.value = u.subject; chapterOptions(); controls.chapter.value = `${u.subject}/${u.chapter}`; unitOptions(); controls.unit.value = u.key;
    }
    render();
  } catch (e) { blocked = true; root.dataset.blocked = 'true'; error(e.message); $$('button').forEach((b) => { b.disabled = true; }); }
}
