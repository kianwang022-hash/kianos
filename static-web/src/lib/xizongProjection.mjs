function headingRows(markdown) {
  const rows = []; let fence = null; let offset = 0;
  for (const line of String(markdown).split('\n')) {
    const token = line.match(/^ {0,3}(`{3,}|~{3,})/);
    if (token) {
      if (!fence) fence = token[1];
      else if (token[1][0] === fence[0] && token[1].length >= fence.length && line.trim() === token[1]) fence = null;
    } else if (!fence) {
      const heading = line.match(/^(#{2,4})\s+(.+)$/);
      if (heading) rows.push({index: offset, level: heading[1].length, title: heading[2].trim()});
    }
    offset += line.length + 1;
  }
  return rows;
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
