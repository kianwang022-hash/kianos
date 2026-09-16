import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(webRoot, '..');
const knowledgeRoot = path.join(repoRoot, 'content/xizong/knowledge/systems');

const args = process.argv.slice(2);
const argValue = (name, fallback = null) => {
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
};
const outArg = argValue('--out', '.qa/xizong-kp-lookup-index.json');
const query = argValue('--query', '').trim().toLowerCase();
const outPath = path.resolve(webRoot, outArg);

function walk(dir) {
  const rows = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) rows.push(...walk(absolute));
    else if (entry.isFile() && entry.name.endsWith('.md')) rows.push(absolute);
  }
  return rows;
}
function scalar(frontmatter, key) {
  const match = frontmatter.match(new RegExp(`^${key}:\\s*["']?([^\\n"']+)["']?\\s*$`, 'm'));
  return match ? match[1].trim() : null;
}
function blobSha(text) {
  const bytes = Buffer.from(text, 'utf8');
  return crypto.createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
}
function cleanSnippet(text) {
  return text
    .replace(/<!--[^]*?-->/g, ' ')
    .replace(/```[^]*?```/g, ' ')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[>*_`|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 420);
}

const records = [];
for (const absolutePath of walk(knowledgeRoot)) {
  const text = fs.readFileSync(absolutePath, 'utf8');
  const relativePath = path.relative(repoRoot, absolutePath).split(path.sep).join('/');
  const frontmatterMatch = text.match(/^---\s*\n([\s\S]*?)\n---/);
  const frontmatter = frontmatterMatch?.[1] || '';
  const systemId = scalar(frontmatter, 'system_id');
  const blockId = scalar(frontmatter, 'block_id');
  const blockTitle = scalar(frontmatter, 'title') || path.basename(absolutePath, '.md');
  const knowledgeBlobSha = blobSha(text);
  const marker = /<!--\s*kianos:kp id="([^"]+)"\s*-->\s*\n(?:\s*\n)*(#{2,4})\s+([^\n]+)/g;
  const matches = [...text.matchAll(marker)];
  for (let i = 0; i < matches.length; i += 1) {
    const current = matches[i];
    const next = matches[i + 1];
    const bodyStart = current.index + current[0].length;
    const bodyEnd = next ? next.index : Math.min(text.length, bodyStart + 2400);
    records.push({
      kp_id: current[1],
      system_id: systemId,
      block_id: blockId,
      block_title: blockTitle,
      kp_title: current[3].trim(),
      knowledge_path: relativePath,
      knowledge_blob_sha: knowledgeBlobSha,
      exact_snippet: cleanSnippet(text.slice(bodyStart, bodyEnd))
    });
  }
}

records.sort((a, b) => a.kp_id.localeCompare(b.kp_id));
const payload = {
  schema: 'kianos.xizong.kp_lookup_index.v1',
  semantic_authority: false,
  purpose: 'Derived review acceleration only. Exact Mapping still requires Chat review against Current Knowledge.',
  source_root: 'content/xizong/knowledge/systems',
  record_count: records.length,
  records
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, `${JSON.stringify(payload)}\n`);

if (query) {
  const tokens = query.split(/\s+/).filter(Boolean);
  const hits = records
    .map((record) => {
      const haystack = `${record.kp_id} ${record.system_id || ''} ${record.block_id || ''} ${record.block_title} ${record.kp_title} ${record.exact_snippet}`.toLowerCase();
      const score = tokens.reduce((sum, token) => sum + (haystack.includes(token) ? 1 : 0), 0);
      return { score, record };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.record.kp_id.localeCompare(b.record.kp_id))
    .slice(0, 20)
    .map(({ record }) => record);
  console.log(JSON.stringify({ query, hits }, null, 2));
}

console.log(`XIZONG_KP_LOOKUP_INDEX_OK records=${records.length} out=${path.relative(webRoot, outPath)}`);
