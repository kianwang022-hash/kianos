import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(webRoot, '..');
const bRoot = path.join(repoRoot, 'content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor');
const system = JSON.parse(fs.readFileSync(path.join(bRoot, 'system.json'), 'utf8'));

const groups = [
  ['d-d1-d23', 'D', 23],
  ['m-m1-m10', 'M', 10],
  ['g-g1-g5', 'G', 5],
];
const expectedOrders = groups.flatMap(([, prefix, count]) => Array.from({ length: count }, (_, i) => `${prefix}${i + 1}`));

function fm(text, key) {
  const match = text.match(new RegExp(`^${key}:\\s*([^\\n]+)$`, 'm'));
  return match ? match[1].trim().replace(/^['"]|['"]$/g, '') : null;
}

function inferOrder(text, filename) {
  const order = fm(text, 'order');
  if (order && /^[DMG]\d{1,2}$/i.test(order)) return order.toUpperCase();
  const blockId = fm(text, 'block_id');
  if (blockId) {
    const direct = blockId.match(/^([DMG])(\d{1,2})$/i);
    if (direct) return `${direct[1].toUpperCase()}${Number(direct[2])}`;
    const normalized = blockId.match(/(?:^|-)([dmg])(\d{1,2})$/i);
    if (normalized) return `${normalized[1].toUpperCase()}${Number(normalized[2])}`;
  }
  const fromName = filename.match(/(?:^|_)([DMG])(\d{1,2})(?:_|\b)/i);
  return fromName ? `${fromName[1].toUpperCase()}${Number(fromName[2])}` : null;
}

function headings(text) {
  return [...text.matchAll(/^(#{1,4})\s+(.+)$/gm)].map((m) => ({
    index: m.index || 0,
    level: m[1].length,
    title: String(m[2] || '').trim(),
  }));
}

function centerQuestion(text) {
  const patterns = [
    /^>\s*\*\*中心问题\*\*[：:]\s*(.+)$/m,
    /^>\s*\*\*中心问题[：:]\*\*\s*(.+)$/m,
    /^>\s*\*\*中心问题\*\*[：:]?\s*(.+)$/m,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return match[1].trim();
  }
  return '';
}

function section(text, titlePattern) {
  const hs = headings(text);
  const hit = hs.find((h) => titlePattern.test(h.title));
  if (!hit) return '';
  const end = hs.find((h) => h.index > hit.index && h.level <= hit.level)?.index ?? text.length;
  return text.slice(hit.index, end).trim();
}

function sentenceRecovery(text) {
  const sec = section(text, /一句话恢复/);
  if (!sec) return '';
  const lines = sec.split('\n').slice(1).map((x) => x.trim()).filter(Boolean);
  const quoted = lines.find((x) => x.startsWith('>'));
  return (quoted || lines[0] || '').replace(/^>\s*/, '').replace(/^\*\*|\*\*$/g, '').trim();
}

function compact(text, max = 900) {
  return String(text || '').replace(/\n{3,}/g, '\n\n').trim().slice(0, max);
}

function semanticParent(allHeadings, kpIndex) {
  const prior = allHeadings.filter((h) => h.index < kpIndex && !/^KP\d+[｜|]/.test(h.title));
  const preferred = [...prior].reverse().find((h) =>
    /^(?:Unit\b|单元\b|模块\b|支路\b|Part\b|阶段\b)/i.test(h.title) ||
    /Framework|机制|诊断|治疗|并发症|整合|代谢|肿瘤|激素|肝|胆|胰|胃|肠|食管|核酸|DNA|RNA|蛋白|分子/.test(h.title)
  );
  return preferred || prior.at(-1) || null;
}

const blocks = [];
for (const [dir] of groups) {
  const dirPath = path.join(bRoot, dir);
  for (const filename of fs.readdirSync(dirPath).filter((name) => name.endsWith('.md')).sort()) {
    const full = path.join(dirPath, filename);
    const text = fs.readFileSync(full, 'utf8');
    const order = inferOrder(text, filename);
    const hs = headings(text);
    const kps = [...text.matchAll(/^(#{2,4})\s+KP(\d+)[｜|]\s*(.+)$/gm)].map((m) => ({
      index: m.index || 0,
      ordinal: Number(m[2]),
      title: String(m[3] || '').trim(),
    }));

    const proposed = [];
    for (const kp of kps) {
      const parent = semanticParent(hs, kp.index);
      const key = parent?.title || 'Opening / ungrouped';
      const last = proposed.at(-1);
      if (last && last.source_heading === key) {
        last.end = kp.ordinal;
        last.kps.push({ ordinal: kp.ordinal, title: kp.title });
      } else {
        proposed.push({
          source_heading: key,
          source_heading_level: parent?.level || null,
          start: kp.ordinal,
          end: kp.ordinal,
          kps: [{ ordinal: kp.ordinal, title: kp.title }],
        });
      }
    }

    blocks.push({
      order,
      path: path.relative(repoRoot, full).split(path.sep).join('/'),
      title: fm(text, 'title'),
      kp_count: kps.length,
      center_question: centerQuestion(text),
      one_sentence_recovery: sentenceRecovery(text),
      first_pass_flow: compact(section(text, /第一轮固定流程|第一轮.*流程/), 1200),
      defer_boundary: compact(section(text, /当前后置|后置|Defer/), 1200),
      source_boundary: compact(section(text, /Source Boundary|SOURCE_BOUNDARY|正式范围与边界/), 1200),
      proposed_logic_groups: proposed,
      semantic_heading_inventory: hs
        .filter((h) => !/^KP\d+[｜|]/.test(h.title))
        .map((h) => ({ level: h.level, title: h.title })),
    });
  }
}

blocks.sort((a, b) => expectedOrders.indexOf(a.order) - expectedOrders.indexOf(b.order));
const issues = [];
for (const block of blocks) {
  if (!block.center_question) issues.push(`${block.order}:CENTER_QUESTION_MISSING`);
  if (!block.proposed_logic_groups.length) issues.push(`${block.order}:NO_GROUPS`);
  const flattened = block.proposed_logic_groups.flatMap((g) => Array.from({ length: g.end - g.start + 1 }, (_, i) => g.start + i));
  const expected = Array.from({ length: block.kp_count }, (_, i) => i + 1);
  if (flattened.length !== expected.length || flattened.some((n, i) => n !== expected[i])) issues.push(`${block.order}:GROUP_COVERAGE_INVALID`);
}

const report = {
  schema: 'kianos.xizong.b_learning_structure_probe.v1',
  mode: 'REPORT_ONLY_NOT_ACCEPTANCE',
  system_id: system.system_id,
  canonical_id: system.canonical_id,
  block_count: blocks.length,
  kp_count: blocks.reduce((sum, b) => sum + b.kp_count, 0),
  proposed_logic_group_count: blocks.reduce((sum, b) => sum + b.proposed_logic_groups.length, 0),
  issues,
  caution: 'Proposed groups are machine-extracted semantic candidates from Current Block headings. They are not accepted Learning Truth until audited for causal continuity, group size and learner usefulness.',
  blocks,
};

const output = `${JSON.stringify(report, null, 2)}\n`;
if (process.env.B_LEARNING_REPORT_PATH) {
  const out = path.resolve(webRoot, process.env.B_LEARNING_REPORT_PATH);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, output, 'utf8');
  console.log(`B Learning report written: ${path.relative(webRoot, out)}`);
}
console.log(`B Learning structure probe | Blocks=${report.block_count} | KPs=${report.kp_count} | ProposedGroups=${report.proposed_logic_group_count} | Issues=${issues.length} | Mode=REPORT_ONLY`);
