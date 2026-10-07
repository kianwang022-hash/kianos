// View-only adaptation of the escaped HTML emitted by renderPreparedMemoryCue.
// Never feed this back into a descriptor, revision witness, or stored card.
// Authored newlines, circled list markers and explicit rectangular pipe tables
// supply grouping boundaries;
// no medical content, sentence boundaries, or new answer structure is inferred.
const circledItem = /(?=[①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳])/u;

function answerLine(line) {
  if (!line) return '';
  const group = line.match(/^([^：\r\n]+：)([①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳][\s\S]*)$/u);
  if (group) {
    return `<section data-memory-answer-group><p><strong>${group[1]}</strong></p><ul>`
      + group[2].split(circledItem).map(item => `<li>${item}</li>`).join('')
      + '</ul></section>';
  }
  return `<p>${line}</p>`;
}

// This consumes only already-escaped text from the existing prepared-answer
// envelope. No Markdown evaluation, link expansion or medical grouping inference.
function pipeCells(line) {
  const text = line.trim();
  if (!text.startsWith('|') || !text.endsWith('|') || /[\\`]/u.test(text)) return null;
  const cells = text.slice(1, -1).split('|').map(cell => cell.trim());
  return cells.length >= 2 ? cells : null;
}

function authoredPipeTable(lines, start, headerLine = lines[start]) {
  const header = pipeCells(headerLine);
  const separator = pipeCells(lines[start + 1] || '');
  if (!header || !separator || header.length !== separator.length
    || header.some(cell => !cell) || !separator.every(cell => /^:?-{3,}:?$/u.test(cell))) return null;
  const rows = [];
  let end = start + 2;
  while (end < lines.length && lines[end].trim().startsWith('|')) {
    const cells = pipeCells(lines[end]);
    // A malformed/unsupported row leaves the whole authored table as text.
    if (!cells || cells.length !== header.length || cells.every(cell => /^:?-{3,}:?$/u.test(cell))) return null;
    rows.push(cells);
    end++;
  }
  if (!rows.length) return null;
  return { end, html: '<div data-memory-answer-table><table><thead><tr>'
    + header.map(cell => `<th scope="col">${cell}</th>`).join('')
    + '</tr></thead><tbody>'
    + rows.map(row => '<tr>' + row.map(cell => `<td>${cell}</td>`).join('') + '</tr>').join('')
    + '</tbody></table></div>' };
}

function preparedAnswerBody(text) {
  const parts = text.split(/(\r\n|\r|\n)/);
  const lines = parts.filter((_, index) => index % 2 === 0);
  const breaks = parts.filter((_, index) => index % 2 === 1);
  let html = '';
  let fence = null;
  for (let i = 0; i < lines.length;) {
    const boundary = lines[i].match(/^ {0,3}(`{3,}|~{3,})(.*)$/u);
    if (boundary) {
      if (!fence) fence = boundary[1];
      else if (boundary[1][0] === fence[0] && boundary[1].length >= fence.length && !boundary[2].trim()) fence = null;
      html += answerLine(lines[i]) + (breaks[i] || '');
      i++;
      continue;
    }
    let prefix = '';
    let table = fence ? null : authoredPipeTable(lines, i);
    if (!table && !fence) {
      const pipe = lines[i].indexOf('|');
      const possiblePrefix = pipe > 0 ? lines[i].slice(0, pipe) : '';
      // Some reviewed answers introduce an explicit authored table with a
      // short label on the same line. Recognize only a colon-terminated prefix
      // plus an otherwise valid rectangular table; malformed cases stay text.
      if (pipe > 0 && /[：:]\s*$/u.test(possiblePrefix)) {
        table = authoredPipeTable(lines, i, lines[i].slice(pipe));
        if (table) prefix = possiblePrefix;
      }
    }
    if (table) {
      if (prefix) html += answerLine(prefix);
      html += table.html + (breaks[table.end - 1] || '');
      i = table.end;
    } else {
      html += answerLine(lines[i]) + (breaks[i] || '');
      i++;
    }
  }
  return html;
}

export function preparedMemoryPresentationHtml(value) {
  const html = String(value || '');
  // Fail closed for legacy owner-context, already formatted answers, and any
  // future renderer shape. The matching body contains only escaped text.
  const answer = html.match(/^(<section data-prepared-memory="[^"]+">)<p>([^<]*)<\/p>/);
  if (!answer) return html;
  const body = preparedAnswerBody(answer[2]);
  const presented = answer[1] + `<div data-memory-prepared-answer>${body}</div>` + html.slice(answer[0].length);
  // These exact renderer labels own audit provenance only. In particular,
  // answer, scope, source-conflict policy and aids are never folded. Reuse the
  // first existing label as the summary so the full text/order stays exact.
  return presented.replace(/(?:<p><strong>(?:来源（保留记录，非本次原文核验）：|来源引用：)<\/strong>[^<]*<\/p>)+/gu, records => {
    const first = records.match(/^<p>(<strong>[^<]+<\/strong>)([^<]*)<\/p>/u);
    return `<details data-memory-provenance><summary>${first[1]}</summary><p>${first[2]}</p>`
      + records.slice(first[0].length) + '</details>';
  });
}
