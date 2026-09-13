import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(webRoot, '..');
const bRoot = path.join(repoRoot, 'content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor');
const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');

const groups = [
  { dir: 'd-d1-d23', prefix: 'D', expectedCount: 23 },
  { dir: 'm-m1-m10', prefix: 'M', expectedCount: 10 },
  { dir: 'g-g1-g5', prefix: 'G', expectedCount: 5 },
];

function frontmatterValue(text, key) {
  const match = text.match(new RegExp(`^${key}:\\s*([^\\n]+)$`, 'm'));
  return match ? match[1].trim().replace(/^['"]|['"]$/g, '') : null;
}

function inferOrder(text, filename) {
  const explicitOrder = frontmatterValue(text, 'order');
  if (explicitOrder && /^[DMG]\d{1,2}$/i.test(explicitOrder)) return explicitOrder.toUpperCase();

  const blockId = frontmatterValue(text, 'block_id');
  if (blockId) {
    const direct = blockId.match(/^([DMG])(\d{1,2})$/i);
    if (direct) return `${direct[1].toUpperCase()}${Number(direct[2])}`;
    const normalized = blockId.match(/(?:^|-)([dmg])(\d{1,2})$/i);
    if (normalized) return `${normalized[1].toUpperCase()}${Number(normalized[2])}`;
  }

  const fromName = filename.match(/(?:^|_)([DMG])(\d{1,2})(?:_|\b)/i);
  if (fromName) return `${fromName[1].toUpperCase()}${Number(fromName[2])}`;
  return null;
}

function numericAssignment(text, key) {
  const match = text.match(new RegExp(`\\b${key}\\s*=\\s*(\\d+)`, 'i'));
  return match ? Number(match[1]) : null;
}

function numericFrontmatter(text, key) {
  const raw = frontmatterValue(text, key);
  return raw && /^\d+$/.test(raw) ? Number(raw) : null;
}

const blocks = [];
const allKpIds = [];
const unexpectedFiles = [];

for (const group of groups) {
  const dirPath = path.join(bRoot, group.dir);
  const files = fs.readdirSync(dirPath).filter((name) => name.endsWith('.md')).sort();
  for (const filename of files) {
    const fullPath = path.join(dirPath, filename);
    const relativePath = path.relative(repoRoot, fullPath).split(path.sep).join('/');
    const text = fs.readFileSync(fullPath, 'utf8');
    const order = inferOrder(text, filename);
    const kpIds = [...text.matchAll(/<!--\s*kianos:kp\s+id="([^"]+)"\s*-->/g)].map((match) => match[1]);
    const kpHeadingCount = [...text.matchAll(/^##\s+KP\d+/gm)].length;
    const declaredKpCount = numericFrontmatter(text, 'kp_count');
    const outlineTotal = numericAssignment(text, 'outline_total');
    const outlineMapped = numericAssignment(text, 'mapped');
    const outlineUnmapped = numericAssignment(text, 'unmapped');
    const outlineMissing = numericAssignment(text, 'missing');
    const outlineDuplicatePrimary = numericAssignment(text, 'duplicate_primary');
    const embeddedTotal = numericFrontmatter(text, 'embedded_questions_total') ?? numericFrontmatter(text, 'embedded_questions_primary');
    const embeddedAccounted = numericFrontmatter(text, 'embedded_questions_accounted');
    const unmappedEmbedded = numericFrontmatter(text, 'unmapped_embedded_questions');

    allKpIds.push(...kpIds);
    if (!order) unexpectedFiles.push(relativePath);

    blocks.push({
      order,
      group: group.dir,
      path: relativePath,
      title: frontmatterValue(text, 'title'),
      system_id: frontmatterValue(text, 'system_id'),
      block_id: frontmatterValue(text, 'block_id'),
      status: frontmatterValue(text, 'status'),
      type: frontmatterValue(text, 'type'),
      source_fields: {
        primary_source: frontmatterValue(text, 'primary_source'),
        outline_primary: frontmatterValue(text, 'outline_primary'),
        coverage_source: frontmatterValue(text, 'coverage_source'),
      },
      kp: {
        marker_count: kpIds.length,
        heading_count: kpHeadingCount,
        declared_count: declaredKpCount,
        marker_heading_delta: kpIds.length - kpHeadingCount,
        declared_marker_delta: declaredKpCount == null ? null : declaredKpCount - kpIds.length,
      },
      outline_ledger: {
        total: outlineTotal,
        mapped: outlineMapped,
        unmapped: outlineUnmapped,
        missing: outlineMissing,
        duplicate_primary: outlineDuplicatePrimary,
      },
      embedded_questions: {
        total: embeddedTotal,
        accounted: embeddedAccounted,
        unmapped: unmappedEmbedded,
      },
      content_sha256: sha256(text),
    });
  }
}

blocks.sort((a, b) => {
  const groupRank = { D: 0, M: 1, G: 2 };
  const ap = a.order?.[0] || 'Z';
  const bp = b.order?.[0] || 'Z';
  return (groupRank[ap] ?? 9) - (groupRank[bp] ?? 9) || Number(a.order?.slice(1) || 999) - Number(b.order?.slice(1) || 999);
});

const expectedOrders = groups.flatMap(({ prefix, expectedCount }) =>
  Array.from({ length: expectedCount }, (_, index) => `${prefix}${index + 1}`)
);
const actualOrders = blocks.map((block) => block.order).filter(Boolean);
const missingOrders = expectedOrders.filter((order) => !actualOrders.includes(order));
const duplicateOrders = [...new Set(actualOrders.filter((order, index) => actualOrders.indexOf(order) !== index))];
const duplicateKpIds = [...new Set(allKpIds.filter((id, index) => allKpIds.indexOf(id) !== index))];
const blocksWithKpMismatch = blocks.filter((block) =>
  block.kp.marker_heading_delta !== 0 || (block.kp.declared_marker_delta != null && block.kp.declared_marker_delta !== 0)
).map((block) => ({ order: block.order, path: block.path, kp: block.kp }));
const systemIdVariants = [...new Set(blocks.map((block) => block.system_id).filter(Boolean))].sort();
const blockIdVariants = blocks.map((block) => ({ order: block.order, block_id: block.block_id, path: block.path }));
const sourceCoverageSignals = {
  outline_ledgers_present: blocks.filter((block) => block.outline_ledger.total != null).length,
  embedded_ledgers_present: blocks.filter((block) => block.embedded_questions.total != null).length,
  blocks_with_primary_source: blocks.filter((block) => Boolean(block.source_fields.primary_source)).length,
  blocks_with_outline_primary: blocks.filter((block) => Boolean(block.source_fields.outline_primary)).length,
  blocks_with_coverage_source: blocks.filter((block) => Boolean(block.source_fields.coverage_source)).length,
};

const inventoryLines = blocks.map((block) => `${block.order}|${block.path}|${block.content_sha256}`);
const report = {
  schema: 'kianos.xizong.b_core_inventory_probe.v1',
  mode: 'REPORT_ONLY_NOT_ACCEPTANCE',
  root: path.relative(repoRoot, bRoot).split(path.sep).join('/'),
  expected_block_count: 38,
  actual_block_count: blocks.length,
  expected_orders: expectedOrders,
  missing_orders: missingOrders,
  duplicate_orders: duplicateOrders,
  unexpected_files: unexpectedFiles,
  kp_total_markers: allKpIds.length,
  kp_unique_markers: new Set(allKpIds).size,
  duplicate_kp_ids: duplicateKpIds,
  blocks_with_kp_count_mismatch: blocksWithKpMismatch,
  system_id_variants: systemIdVariants,
  block_id_inventory: blockIdVariants,
  source_coverage_signals: sourceCoverageSignals,
  content_inventory_sha256: sha256(`${inventoryLines.join('\n')}\n`),
  blocks,
};

const serialized = `${JSON.stringify(report, null, 2)}\n`;
if (process.env.B_CORE_REPORT_PATH) {
  const outputPath = path.resolve(webRoot, process.env.B_CORE_REPORT_PATH);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, serialized, 'utf8');
  console.log(`B Core report written: ${path.relative(webRoot, outputPath)}`);
}

console.log('B_CORE_INVENTORY_REPORT_BEGIN');
console.log(JSON.stringify(report));
console.log('B_CORE_INVENTORY_REPORT_END');
console.log(`B Core probe complete | Blocks=${report.actual_block_count}/38 | KP=${report.kp_total_markers} | UniqueKP=${report.kp_unique_markers} | MissingBlocks=${report.missing_orders.length} | DuplicateKP=${report.duplicate_kp_ids.length} | Mode=REPORT_ONLY`);
