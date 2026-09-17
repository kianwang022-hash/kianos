import { safeProductHref } from './examDemand.mjs';
import { resolveXizongHomeResume } from './xizongHomeResumeClient.mjs';
import { resolvePoliticsHomeResume } from './politicsHomeResumeClient.mjs';

function fallbackProjection(row, base) {
  const href = safeProductHref(row.dataset.fallbackHref, base) || row.dataset.subjectHref || base;
  return {
    subject: row.dataset.homeResumeSubject,
    href,
    title: row.dataset.fallbackTitle || '继续学习',
    meta: row.dataset.fallbackMeta || '进入学科工作台',
    attention: ''
  };
}

function resumePayload(row) {
  const node = row.querySelector('[data-home-resume-payload]');
  if (!node) return null;
  try { return JSON.parse(node.textContent || 'null'); }
  catch { return null; }
}

function resolveEnglishResume(row, base) {
  // English owns highest-value task selection. Until the English lane exports a pure
  // resolver, Home intentionally falls back to the English workbench rather than
  // duplicating English priority semantics here.
  return fallbackProjection(row, base);
}

export function resolveHomeResume({ subject, storage, row, base, payload = null }) {
  const fallback = fallbackProjection(row, base);
  if (subject === 'xizong') return resolveXizongHomeResume(storage, fallback, base);
  if (subject === 'politics') return resolvePoliticsHomeResume(storage, fallback, base, payload);
  if (subject === 'english') return resolveEnglishResume(row, base);
  return fallback;
}

export function initHomeResumeSurfaces(root = document) {
  const page = root.querySelector?.('[data-home-workbench]');
  if (!(page instanceof HTMLElement)) return;
  const base = page.dataset.base || '/';
  const payloadBySubject = new Map();
  page.querySelectorAll('[data-home-resume-subject]').forEach((row) => {
    if (!(row instanceof HTMLElement)) return;
    payloadBySubject.set(row.dataset.homeResumeSubject || '', resumePayload(row));
    row.querySelector('[data-home-resume-payload]')?.remove();
  });

  const render = () => {
    page.querySelectorAll('[data-home-resume-subject]').forEach((row) => {
      if (!(row instanceof HTMLElement)) return;
      const subject = row.dataset.homeResumeSubject;
      const projection = resolveHomeResume({
        subject,
        storage: localStorage,
        row,
        base,
        payload: payloadBySubject.get(subject || '') || null
      });
      const link = row.querySelector('[data-home-resume-link]');
      const title = row.querySelector('[data-home-resume-title]');
      const meta = row.querySelector('[data-home-resume-meta]');
      const attention = row.querySelector('[data-home-resume-attention]');
      if (link instanceof HTMLAnchorElement) link.href = projection.href;
      if (title) title.textContent = projection.title;
      if (meta) meta.textContent = projection.meta;
      if (attention) {
        attention.textContent = projection.attention || '';
        attention.hidden = !projection.attention;
      }
    });
    window.dispatchEvent(new CustomEvent('kianos:home-resume-ready'));
  };

  render();
  window.addEventListener('storage', render);
  window.addEventListener('focus', render);
}
