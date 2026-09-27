import fs from 'node:fs';
import path from 'node:path';

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
    .replace(/^\s*(?:\*\*)?(?:Routing|路由)(?:\*\*)?[：:].*$/gmi, '')
    .replace(/\bMI-G\b/g, '主干')
    .replace(/\bMI-D\b/g, '精确记忆')
    .replace(/\bDetailed Expansion\b/g, '展开')
    .replace(/当前\s*System Guide\b/gi, '当前学习主线')
    .replace(/\bCurrent System Guide\b/g, '当前学习主线')
    .replace(/\bSystem Guide\b/g, '学习主线')
    .replace(/\bCurrent Study\b/g, '当前学习')
    .replace(/\bMicro Primary\b/g, '本块直接学习')
    .replace(/最低\s*Primary\b/g, '最低必学部分')
    .replace(/正确\s*Primary\b/g, '正确归属')
    .replace(/上游\s*Primary\b/g, '上游归属')
    .replace(/真实\s*owner\b/gi, '对应知识位置')
    .replace(/\bowner\s+Recall\b/gi, '对应位置回忆')
    .replace(/\bStudy\b/g, '学习')
    .replace(/CURRENT_SHARED_FIELDS_AND_IDENTITY_SUPPORT/g, '学习支持')
    .replace(/FIRST_PASS_LECTURE_PROBE/g, '一轮讲义配套题')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function projectLearnerText(value) {
  return learnerLabels(String(value || ''));
}

export function projectBlockLearn(markdown) {
  const withoutDeprecatedLoop = removeNestedSection(markdown, (title) => /第一轮固定流程/.test(title));
  return learnerLabels(withoutDeprecatedLoop);
}

function stripMissingRelativeImages(markdown, sourcePath = '') {
  const source = String(sourcePath || '').trim();
  if (!source) return String(markdown);
  const repoRoot = process.env.KIANOS_REPO_ROOT
    ? path.resolve(process.env.KIANOS_REPO_ROOT)
    : path.resolve(process.cwd(), '..');
  const sourceDir = path.dirname(path.resolve(repoRoot, source));
  return String(markdown).replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (full, _alt, rawTarget) => {
    const target = String(rawTarget || '').trim().replace(/^<|>$/g, '');
    if (!target || /^(?:[a-z]+:|\/|#)/i.test(target)) return full;
    const cleanTarget = target.split(/\s+["']/)[0];
    const candidate = path.resolve(sourceDir, cleanTarget);
    return fs.existsSync(candidate) ? full : '';
  });
}

export function projectKpCore(markdown, { sourcePath = '' } = {}) {
  return learnerLabels(stripMissingRelativeImages(markdown, sourcePath));
}

export function projectVisualGate(markdown) {
  return learnerLabels(markdown);
}
