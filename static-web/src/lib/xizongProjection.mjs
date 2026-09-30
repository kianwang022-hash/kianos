function headingRows(markdown) {
  return [...String(markdown).matchAll(/^(#{2,4})\s+(.+)$/gm)].map((match) => ({
    index: match.index || 0,
    level: match[1].length,
    title: String(match[2] || '').trim()
  }));
}

function removeNestedSection(markdown, predicate) {
  let output = String(markdown);
  while (true) {
    const headings = headingRows(output);
    const target = headings.find((heading) => predicate(heading.title));
    if (!target) return output.trim();
    const end = headings.find((heading) => heading.index > target.index && heading.level <= target.level)?.index ?? output.length;
    output = `${output.slice(0, target.index)}${output.slice(end)}`;
  }
}

function learnerLabels(markdown) {
  return String(markdown)
    .replace(/\bMI-G\b/g, '主干')
    .replace(/\bMI-D\b/g, '精确记忆')
    .replace(/CURRENT_SHARED_FIELDS_AND_IDENTITY_SUPPORT/g, 'Current 学习支持')
    .replace(/FIRST_PASS_LECTURE_PROBE/g, '一轮讲义配套题')
    .trim();
}

export function projectBlockLearn(markdown) {
  const withoutDeprecatedLoop = removeNestedSection(markdown, (title) => /第一轮固定流程/.test(title));
  return learnerLabels(withoutDeprecatedLoop);
}

export function projectKpCore(markdown) {
  // Canonical sections can retain the next KP's identity comment before its
  // heading. Four-space owner indentation turns that comment (and Routing)
  // into a visible code block. Change presentation only: keep the raw Core
  // and its revision witness, Routing meaning, and authored code examples.
  let fence = null;
  const input = String(markdown).split(/\r?\n/);
  const identityRow = line => /^\s*<!--\s*kianos:kp\s+id=["'][^"']+["']\s*-->\s*$/.test(line);
  const lines = input.flatMap((line, index) => {
    const boundary = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
    if (boundary) {
      if (!fence) fence = boundary[1];
      else if (boundary[1][0] === fence[0] && boundary[1].length >= fence.length && !boundary[2].trim()) fence = null;
      return [line];
    }
    if (fence) return [line];
    if (identityRow(line)) return [];
    // A separator immediately introducing the next identity belongs to that
    // next section. Do not touch other dividers or indented medical examples.
    if (/^ {4}---\s*$/.test(line) && identityRow(input.slice(index + 1).find(row => row.trim()) || '')) return [];
    return [line.replace(/^ {4}(?=\*\*Routing\*\*[：:])/, '')];
  });
  return learnerLabels(lines.join('\n'));
}

export function projectVisualGate(markdown) {
  return learnerLabels(markdown);
}
