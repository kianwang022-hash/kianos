// View-only adaptation of the escaped HTML emitted by renderPreparedMemoryCue.
// Never feed this back into a descriptor, revision witness, or stored card.
// Authored newlines and circled list markers are the only grouping boundaries;
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

export function preparedMemoryPresentationHtml(value) {
  const html = String(value || '');
  // Fail closed for legacy owner-context, already formatted answers, and any
  // future renderer shape. The matching body contains only escaped text.
  const answer = html.match(/^(<section data-prepared-memory="[^"]+">)<p>([^<]*)<\/p>/);
  if (!answer) return html;
  const body = answer[2].split(/(\r\n|\r|\n)/).map((part, index) => index % 2 ? part : answerLine(part)).join('');
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
