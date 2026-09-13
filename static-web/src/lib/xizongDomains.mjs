import fs from 'node:fs';
import path from 'node:path';
import { listProjectableXizongSystems } from './xizong.mjs';

const repoRoot = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(process.cwd(), '..');

const KNOWLEDGE_ROOT = 'content/xizong/knowledge';
const OWNER_MANIFEST = `${KNOWLEDGE_ROOT}/manifest.json`;

const DISPLAY = {
  A: { title: '心肺肾', note: 'A 因重要性与体量拆为 A1 / A2 / A3；直接进入子 System，跨系统压缩按需出现。' },
  B: { title: '消化 · 代谢 · 内分泌 · 肿瘤' },
  C: { title: '血液 · 免疫 · 感染' },
  D: { title: '神经 · 感觉 · 运动 · 骨科' },
  E: { title: '生殖 · 乳腺' },
  F: { title: '其余临床整合' }
};

function absolute(relativePath) {
  return path.join(repoRoot, relativePath);
}

function readManifest() {
  const manifest = JSON.parse(fs.readFileSync(absolute(OWNER_MANIFEST), 'utf8'));
  if (manifest?.status !== 'CURRENT') throw new Error('CURRENT_XIZONG_OWNER_MANIFEST_INVALID');
  if (!manifest?.macro_domain_taxonomy?.domains) throw new Error('CURRENT_XIZONG_MACRO_DOMAIN_TAXONOMY_MISSING');
  return manifest;
}

function ownerPrefix(ownerPath) {
  return `${KNOWLEDGE_ROOT}/${String(ownerPath || '').replace(/^\/+/, '').replace(/\/+$/, '')}/`;
}

export function listXizongMacroDomainProjection() {
  const manifest = readManifest();
  const systems = listProjectableXizongSystems();
  const assigned = new Set();

  const domains = Object.entries(manifest.macro_domain_taxonomy.domains).map(([domainId, domain]) => {
    const ownerPrefixes = (domain?.system_owners || []).map(ownerPrefix);
    const projectableSystems = systems.filter((system) => ownerPrefixes.some((prefix) => system.sourcePath.startsWith(prefix)));

    for (const system of projectableSystems) {
      if (assigned.has(system.systemId)) throw new Error(`CURRENT_XIZONG_MACRO_DOMAIN_DUPLICATE_SYSTEM:${system.systemId}`);
      assigned.add(system.systemId);
    }

    const blockCount = projectableSystems.reduce((sum, system) => sum + system.blocks.length, 0);
    const kpCount = projectableSystems.reduce((sum, system) => sum + system.blocks.reduce((inner, block) => inner + block.kpCount, 0), 0);
    const display = DISPLAY[domainId] || { title: String(domain?.label || domainId) };

    return {
      domainId,
      canonicalLabel: String(domain?.label || domainId),
      title: display.title,
      note: display.note || '',
      systems: projectableSystems,
      projectable: projectableSystems.length > 0,
      decomposed: projectableSystems.length > 1,
      blockCount,
      kpCount
    };
  });

  if (assigned.size !== systems.length) {
    const missing = systems.filter((system) => !assigned.has(system.systemId)).map((system) => system.canonicalId).join(',');
    throw new Error(`CURRENT_XIZONG_MACRO_DOMAIN_PROJECTION_COVERAGE_MISMATCH:${missing}`);
  }

  return domains;
}
