import { readPoliticsSnapshot, selectPoliticsReview, resolvePoliticsContinue, politicsReviewPacket } from './politicsPracticeState.mjs';
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
  function render() {
    const snapshot = readPoliticsSnapshot(localStorage), review = selectPoliticsReview(catalog, snapshot, options());
    const error = $('[data-review-error]'); error.hidden = !snapshot.errors.length;
    error.textContent = '本机记录没有完整读出，暂不显示任务数，也不覆盖原记录。请恢复存储后刷新。';
    $('[data-review-copy]').disabled = !!snapshot.errors.length;
    const resume = resolvePoliticsContinue(catalog, snapshot, base);
    $('[data-review-resume]').hidden = !resume || !!snapshot.errors.length;
    if (resume) { $('[data-review-resume-title]').textContent = resume.title; $('[data-review-resume-detail]').textContent = resume.detail; $('[data-review-resume-link]').href = resume.href; }
    $('[data-review-action]').hidden = !review.problemIds.length || !!snapshot.errors.length;
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
      if (group.items.some(i => i.needsReview)) actions.append(link(`${base}politics/practice/?review=problems&unit=${encodeURIComponent(group.key)}${filter === 'today' ? `&reviewDay=${today()}` : ''}`, '', '复习本单元 →'));
      header.append(heading, actions); article.append(header);
      for (const item of group.items) {
        const row = make('div', 'reviewQuestionRow'); row.dataset.reviewQuestion = item.id;
        const identity = make('div', 'reviewQuestionIdentity'); identity.append(make('strong', '', `第 ${item.number} 题`), make('span', '', item.type === 'single' ? '单选' : '多选'));
        const detail = make('div', 'reviewQuestionDetail'); const signals = make('div', 'reviewSignals');
        if (item.needsReview) signals.append(make('span', '', outcomes[item.outcome]));
        if (item.discussion) signals.append(make('span', '', '留给讨论'));
        detail.append(signals); if (item.note) detail.append(make('p', '', item.note)); if (item.cause) detail.append(make('small', '', `我的原因记录：${item.cause}`));
        row.append(identity, detail, link(`${base}politics/practice/?question=${encodeURIComponent(item.id)}`, '', '打开这道题 →')); article.append(row);
      }
      groups.append(article);
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
  addEventListener('storage', render); addEventListener('focus', render); render();
}
