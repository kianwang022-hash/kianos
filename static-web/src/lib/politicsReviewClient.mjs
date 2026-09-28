import { readPoliticsSnapshot, selectPoliticsReview, resolvePoliticsContinue, politicsReviewPacket } from './politicsPracticeState.mjs';
import { applyPoliticsChatReturn, readPoliticsChatReturn } from './politicsChatReturn.mjs';
import { POLITICS_ANALYSIS_BATCH_SCHEMA, applyPoliticsAnalysisEvidenceBatch } from './politicsAnalysisEvidence.mjs';
const outcomes = { WRONG: '上次答错', UNCERTAIN: '上次不确定', STABLE: '本次稳定' };
export function initPoliticsReview(root) {
  if (!(root instanceof HTMLElement)) return;
  const $ = s => root.querySelector(s), $$ = s => [...root.querySelectorAll(s)];
  const catalog = JSON.parse($('[data-review-catalog]').textContent), base = root.dataset.base || '/';
  $('[data-review-catalog]').remove();
  let filter = 'all';
  const today = () => new Date().toLocaleDateString('en-CA'); // Same study-day semantics as native Politics.
  const options = () => ({ day: today(), filter, subject: $('[data-review-subject]').value });
  const make = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
  const link = (href, cls, text) => { const a = make('a', cls, text); a.href = href; return a; };
  const activeSessionState = (snapshot, resolvedResume = resolvePoliticsContinue(catalog, snapshot, base)) => {
    const session = snapshot?.session;
    if (!session || !['active', 'paused'].includes(session.status) || resolvedResume?.stale) return null;
    const currentQuestionId = session.ids?.[session.index] || '';
    if (!currentQuestionId) return null;
    return {
      session,
      currentQuestionId,
      questionHref: `${base}politics/practice/?session=${encodeURIComponent(session.id)}&question=${encodeURIComponent(currentQuestionId)}`
    };
  };
  const reviewQuestionLink = (questionId, snapshot, label = '打开这道题 →') => {
    const active = activeSessionState(snapshot);
    if (active) return questionId === active.currentQuestionId ? link(active.questionHref, '', '继续这道题 →') : null;
    return link(`${base}politics/practice/?question=${encodeURIComponent(questionId)}`, '', label);
  };
  const actionLabels = {
    SOURCE_RETURN: '回原讲义',
    RETEST: '再测一次',
    DISCUSS: '继续讨论',
    MEMORY_CANDIDATE: '记忆候选'
  };
  function renderChatReturn(value) {
    const target = $('[data-review-return-result]');
    if (!(target instanceof HTMLElement)) return;
    target.replaceChildren();
    if (!value) return;
    if (value.verdict === 'NO_ACTION') {
      const note = make('p', 'reviewReturnNoAction', value.diagnosis_summary || 'Chat 判断本批次无需额外修补，继续主线即可。');
      target.append(note);
      return;
    }
    const snapshot = readPoliticsSnapshot(localStorage);
    for (const item of value.follow_ups || []) {
      const article = make('article', 'reviewReturnItem');
      article.append(make('strong', '', actionLabels[item.action] || item.action));
      article.append(make('p', '', item.reason));
      article.append(make('p', 'reviewReturnInstruction', item.instruction));
      const actions = make('nav', 'reviewReturnActions');
      if (item.action === 'RETEST') {
        for (const questionId of item.question_ids || []) {
          const action = reviewQuestionLink(questionId, snapshot, '打开题目 →');
          if (action) actions.append(action);
        }
      } else {
        for (const targetRow of item.return_targets || []) {
          if (targetRow?.href) actions.append(link(targetRow.href, '', '回原学习单元 ↗'));
        }
      }
      if (actions.childElementCount) article.append(actions);
      target.append(article);
    }
  }
  function render() {
    const snapshot = readPoliticsSnapshot(localStorage), review = selectPoliticsReview(catalog, snapshot, options());
    const error = $('[data-review-error]'); error.hidden = !snapshot.errors.length;
    error.textContent = '本机记录没有完整读出，暂不显示任务数，也不覆盖原记录。请恢复存储后刷新。';
    $('[data-review-copy]').disabled = !!snapshot.errors.length;
    const resume = resolvePoliticsContinue(catalog, snapshot, base);
    const activeSession = activeSessionState(snapshot, resume);
    $('[data-review-resume]').hidden = !resume || !!snapshot.errors.length;
    if (resume) { $('[data-review-resume-title]').textContent = resume.title; $('[data-review-resume-detail]').textContent = resume.detail; $('[data-review-resume-link]').href = resume.href; }
    $('[data-review-action]').hidden = !review.problemIds.length || !!snapshot.errors.length || !!activeSession;
    $('[data-review-count]').textContent = `${review.problemIds.length} 道题需要复习，已经按原学习单元归好。`;
    const scope = $('[data-review-subject]').value;
    // Current Review selection is recomputed natively at entry, not captured as a second queue ledger.
    $('[data-review-start]').href = `${base}politics/practice/?review=problems${scope === 'all' ? '' : `&reviewSubject=${encodeURIComponent(scope)}`}${filter === 'today' ? `&reviewDay=${today()}` : ''}`;
    const empty = $('[data-review-empty]'); empty.hidden = !!review.items.length || !!snapshot.errors.length;
    empty.textContent = filter === 'today' ? '今天还没有新增这类问题。其他待处理内容仍在「待处理」中。' : filter === 'discussion' ? '还没有单独标记要讨论的题目。' : '当前没有待复习的问题，继续主线即可。';
    const groups = $('[data-review-groups]'); groups.replaceChildren();
    if (!snapshot.errors.length) for (const group of review.groups) {
      const article = make('section', 'reviewGroup'); article.dataset.reviewUnit = group.key;
      const header = make('header'); const heading = make('div'); heading.append(make('span', '', `${group.subject} · ${group.chapter}`), make('h2', '', group.title));
      const actions = make('nav'); actions.append(link(group.href, '', '回原学习单元 ↗'));
      if (!activeSession && group.items.some(i => i.needsReview)) actions.append(link(`${base}politics/practice/?review=problems&unit=${encodeURIComponent(group.key)}${filter === 'today' ? `&reviewDay=${today()}` : ''}`, '', '复习本单元 →'));
      header.append(heading, actions); article.append(header);
      for (const item of group.items) {
        const row = make('div', 'reviewQuestionRow'); row.dataset.reviewQuestion = item.id;
        const identity = make('div', 'reviewQuestionIdentity'); identity.append(make('strong', '', `第 ${item.number} 题`), make('span', '', item.type === 'single' ? '单选' : '多选'));
        const detail = make('div', 'reviewQuestionDetail'); const signals = make('div', 'reviewSignals');
        if (item.needsReview) signals.append(make('span', '', outcomes[item.outcome]));
        if (item.discussion) signals.append(make('span', '', '留给讨论'));
        detail.append(signals); if (item.note) detail.append(make('p', '', item.note)); if (item.cause) detail.append(make('small', '', `我的原因记录：${item.cause}`));
        row.append(identity, detail);
        const questionAction = reviewQuestionLink(item.id, snapshot);
        if (questionAction) row.append(questionAction);
        article.append(row);
      }
      groups.append(article);
    }
    try {
      const currentPacket = politicsReviewPacket(catalog, snapshot, options());
      renderChatReturn(readPoliticsChatReturn(localStorage, currentPacket.batch_id));
    } catch {
      renderChatReturn(null);
    }
    root.dataset.ready = 'true';
  }
  $$('[data-review-filter]').forEach(b => b.addEventListener('click', () => {
    filter = b.dataset.reviewFilter; $$('[data-review-filter]').forEach(x => x.setAttribute('aria-pressed', String(x === b))); render();
  }));
  $('[data-review-subject]').addEventListener('change', render);
  $('[data-review-copy]').addEventListener('click', async event => {
    const snapshot = readPoliticsSnapshot(localStorage); if (snapshot.errors.length) { render(); return; }
    const text = JSON.stringify(politicsReviewPacket(catalog, snapshot, options()), null, 2);
    try { await navigator.clipboard.writeText(text); event.currentTarget.textContent = '已复制'; }
    catch { window.prompt('复制复习学习包', text); }
  });
  $('[data-review-return-apply]')?.addEventListener('click', () => {
    const field = $('[data-review-return-text]');
    const status = $('[data-review-return-status]');
    try {
      const parsed = JSON.parse(field?.value || '');
      if (parsed?.schema === POLITICS_ANALYSIS_BATCH_SCHEMA) {
        const result = applyPoliticsAnalysisEvidenceBatch(localStorage, parsed, { expectedDay: today() });
        if (status) status.textContent = result.appended
          ? `已导入主观题证据 ${result.appended} 条。`
          : '这批主观题证据已经导入过。';
        renderChatReturn(null);
        render();
        return;
      }
      const result = applyPoliticsChatReturn(localStorage, catalog, parsed);
      if (status) status.textContent = result.status === 'idempotent'
        ? '这份返回已经导入过，没有重复创建任何跟进。'
        : '已核对并导入；只保留与这批真实题目绑定的跟进。';
      renderChatReturn(result.value);
    } catch {
      if (status) status.textContent = '未导入：这份返回无法安全核对；原记录没有改动。请重新从当前复习页导出学习包后再试。';
    }
  });
  addEventListener('storage', render); addEventListener('focus', render); render();
}
