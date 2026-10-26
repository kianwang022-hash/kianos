import { validateCurrentLexicalTarget } from './lexicalEnglishEvidence.mjs';

// Presentation of explicit Content decisions only. No text, frequency or POS inference.
export function lexicalAttentionLayer(object) {
  const disposition = object?.disposition;
  if (disposition == null || disposition === 'DEFAULT_DEPTH') return 'main';
  if (disposition === 'RECOGNITION_EXPANSION') return 'recognition';
  if (disposition === 'EXPLORE_ONLY') return 'reference';
  throw new Error(`LEXICAL_UNKNOWN_ATTENTION_DISPOSITION:${disposition}`);
}
export const isDefaultLexicalObject = object => lexicalAttentionLayer(object) === 'main';

// [hidden] alone does not exclude descendants of a closed native details element.
export function lexicalTargetIsVisible(button) {
  if (button.closest('[hidden]')) return false;
  for (let parent = button.parentElement; parent; parent = parent.parentElement) {
    if (parent.tagName === 'DETAILS' && !parent.hasAttribute('open')) {
      const summary = parent.querySelector('summary');
      if (!summary?.contains(button)) return false;
    }
  }
  return true;
}

export function resolveLexicalAttentionTargets(targets, descriptor) {
  const resolved = [], unresolved = [];
  for (const target of targets) {
    try { resolved.push(validateCurrentLexicalTarget(target, descriptor)); }
    catch (error) { unresolved.push({ target, reason: error.message }); }
  }
  return { resolved, unresolved };
}

// Reparent original nodes, never clone targets or change their identity/event contract.
export function initializeLexicalAttention(root, mode) {
  const groups = [...root.querySelectorAll('[data-vocab-attention-layer]')];
  groups.forEach(group => {
    const layer = group.getAttribute('data-vocab-attention-layer');
    group.hidden = layer === 'reference' && mode === 'study';
    if (mode === 'lookup') group.setAttribute('open', '');
  });
  root.querySelectorAll('[data-vocab-learning-unit]').forEach(unit => {
    unit.hidden = mode === 'study' && unit.closest('[data-vocab-attention-layer]')?.getAttribute('data-vocab-attention-layer') === 'reference';
  });
  if (mode !== 'repair') return { render() {} };
  const document = root.ownerDocument;
  const body = root.querySelector('[data-vocab-body]');
  const core = root.querySelector('.lexicalCoreHeadline');
  const focus = document.createElement('section');
  focus.className = 'lexicalRepairFocus';
  focus.setAttribute('data-vocab-repair-focus', '');
  focus.innerHTML = '<header>已选 Repair 目标</header><p data-vocab-repair-empty>当前没有可精确定位的已选目标。</p><div data-vocab-repair-focused-objects></div><p data-vocab-repair-unresolved hidden></p>';
  const other = document.createElement('details');
  other.className = 'lexicalAttentionLayer lexicalRepairOther';
  other.setAttribute('data-vocab-repair-other', '');
  other.innerHTML = '<summary>查看／选择其他义项 <small>展开不增加复习；只有具体 + 才加入 Repair</small></summary>';
  body.before(focus, other);
  if (core) other.append(core);
  other.append(body);
  const focused = focus.querySelector('[data-vocab-repair-focused-objects]');
  const units = [...other.querySelectorAll('[data-vocab-target-row]')]
    .map(unit => {
      const anchor = document.createComment('lexical-attention-origin');
      const parent = unit.parentElement;
      const parentSense = parent.closest('.lexicalSenseRow');
      const context = parentSense?.querySelector('.lexicalSenseMeaning>p')?.textContent || '';
      unit.before(anchor);
      const wrapper = document.createElement('div');
      wrapper.setAttribute('data-vocab-repair-focus-unit', '');
      if (context) {
        const label = document.createElement('p');
        label.className = 'lexicalRepairTargetContext';
        label.textContent = context;
        wrapper.append(label);
      }
      const content = document.createElement(['UL', 'OL'].includes(parent.tagName) ? parent.tagName.toLowerCase() : 'div');
      content.className = parent.className;
      wrapper.append(content);
      const layer = unit.closest('[data-vocab-attention-layer]')?.getAttribute('data-vocab-attention-layer') || 'main';
      wrapper.setAttribute('data-vocab-original-layer', layer);
      const ownButtons = [...unit.querySelectorAll('[data-vocab-repair]')]
        .filter(button => button.closest('[data-vocab-target-row]') === unit);
      return { unit, anchor, wrapper, content, ownButtons };
    });
  return {
    render(targets, descriptor) {
      const result = resolveLexicalAttentionTargets(targets, descriptor);
      const matches = button => result.resolved.some(target =>
        target.target_kind === button.getAttribute('data-target-kind') &&
        (target.target_id ? target.target_id === button.getAttribute('data-target-id')
          : target.target_locator === button.getAttribute('data-target-locator')));
      const selected = units.filter(entry => entry.ownButtons.some(matches));
      // A selected child alone moves without exposing sibling targets. Outermost
      // selected objects retain their complete context and identity exactly once.
      const focusedUnits = selected.filter(entry => !selected.some(parent =>
        parent !== entry && parent.unit.contains(entry.anchor)));
      for (const entry of units) {
        if (focusedUnits.includes(entry)) continue;
        if (entry.unit.previousSibling !== entry.anchor) entry.anchor.after(entry.unit);
        entry.wrapper.remove();
      }
      for (const { unit, wrapper, content } of focusedUnits) {
        if (unit.parentElement !== content) content.append(unit);
        if (wrapper.parentElement !== focused) focused.append(wrapper);
      }
      const count = focusedUnits.length;
      focus.querySelector('[data-vocab-repair-empty]').hidden = count > 0;
      const notice = focus.querySelector('[data-vocab-repair-unresolved]');
      notice.hidden = result.unresolved.length === 0;
      notice.textContent = result.unresolved.length
        ? `${result.unresolved.length} 个历史目标当前无法精确定位；原记录保留，未用其他义项代替。` : '';
    }
  };
}
