import { readLexicalLedger, writeLexicalLedger } from './lexicalEvidence.mjs';
import { readLexicalChatState } from './lexicalChatState.mjs';

export function showLexicalStateError() {
  let notice = document.querySelector('[data-lexical-state-error]');
  if (!notice) {
    notice = document.createElement('p');
    notice.setAttribute('data-lexical-state-error', '');
    notice.setAttribute('role', 'alert');
    (document.querySelector('main') || document.body).prepend(notice);
  }
  notice.textContent = '词汇记录暂时无法安全读取或保存，原记录已保留。词汇练习已暂停，其他科目仍可使用。请告诉 Chat「词汇记录无法读取」。';
  document.querySelectorAll('[data-lexical-repair-count],[data-lexical-repair-word-count]').forEach(node => { node.textContent = '—'; });
  document.querySelectorAll('[data-vocab-repair],[data-vocab-route],[data-vocab-undo],[data-challenge-choice],[data-challenge-continue],[data-challenge-question-issue],[data-challenge-chat-paste-start],[data-challenge-import],[data-lexical-copy-return]').forEach(node => { node.disabled = true; });
  document.querySelector('[data-vocab-challenge-runtime]')?.setAttribute('data-challenge-active', 'false');
}

export function readBrowserLexicalLedger() {
  try { return readLexicalLedger(window.localStorage); }
  catch (error) { showLexicalStateError(); throw error; }
}

export function writeBrowserLexicalLedger(ledger) {
  try { writeLexicalLedger(window.localStorage, ledger); }
  catch (error) { showLexicalStateError(); throw error; }
}

export function lexicalBrowserStateReadable() {
  try {
    readBrowserLexicalLedger();
    if (readLexicalChatState(window.localStorage).status === 'unreadable') throw new Error('LEXICAL_STATE_UNREADABLE');
    return true;
  } catch { showLexicalStateError(); return false; }
}
