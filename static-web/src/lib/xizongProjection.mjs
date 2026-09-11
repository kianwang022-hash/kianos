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
  return learnerLabels(markdown);
}

export function projectVisualGate(markdown) {
  return learnerLabels(markdown);
}
