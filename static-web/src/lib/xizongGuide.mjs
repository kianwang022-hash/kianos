import fs from 'node:fs';
import path from 'node:path';
import { marked } from 'marked';

const repoRoot = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(process.cwd(), '..');

const BINDINGS_PATH = 'content/xizong/knowledge/learner/guide-bindings.json';

function absolute(relativePath) {
  return path.join(repoRoot, relativePath);
}

function text(value) {
  return String(value || '').trim();
}

function sectionRole(title) {
  const value = text(title);
  if (/先搞懂|到底在解决什么|不是.*目录/.test(value)) return 'MISSION';
  if (/母模型|脑内主链|一张.*模型|一张.*主链/.test(value)) return 'MODEL';
  if (/坐标|区分/.test(value)) return 'COORDINATES';
  if (/Failure|故障|疾病先按|按第一故障/.test(value)) return 'FAILURE';
  if (/Block.*排|Block.*分|路线|怎样从正常链/.test(value)) return 'ROUTE';
  if (/进入一个 Block|进入.*Block.*怎么|怎么接/.test(value)) return 'HANDOFF';
  if (/Memory|MI-G|MI-D|Framework 与 Memory/.test(value)) return 'MEMORY';
  if (/最终希望|应该能做什么|完成.*应该/.test(value)) return 'OUTCOME';
  return 'EXPLANATION';
}

function parseSections(markdown) {
  const source = String(markdown || '');
  const matches = [...source.matchAll(/^##\s+(.+)$/gm)];
  return matches.map((match, index) => {
    const start = (match.index || 0) + match[0].length;
    const end = matches[index + 1]?.index ?? source.length;
    const title = text(match[1]);
    const body = source.slice(start, end).trim();
    return {
      id: `guide-section-${index + 1}`,
      title,
      role: sectionRole(title),
      html: marked.parse(body)
    };
  }).filter((section) => {
    if (!section.html) return false;
    if (/^Authority boundary$/i.test(section.title)) return false;
    if (/Historical migration receipt/i.test(section.title)) return false;
    return true;
  });
}

export function loadXizongBeginnerGuide(system) {
  if (!system?.systemId) return null;
  if (!fs.existsSync(absolute(BINDINGS_PATH))) return null;

  const bindings = JSON.parse(fs.readFileSync(absolute(BINDINGS_PATH), 'utf8'));
  const binding = bindings?.bindings?.[system.systemId];
  if (!binding?.guide_path) return null;
  if (binding?.canonical_id && binding.canonical_id !== system.canonicalId) {
    throw new Error(`CURRENT_XIZONG_GUIDE_BINDING_IDENTITY_MISMATCH:${system.systemId}`);
  }

  const guidePath = String(binding.guide_path);
  if (!fs.existsSync(absolute(guidePath))) {
    throw new Error(`CURRENT_XIZONG_GUIDE_FILE_MISSING:${system.systemId}`);
  }

  const markdown = fs.readFileSync(absolute(guidePath), 'utf8');
  if (!/^Status:\s*\*\*CURRENT\*\*/m.test(markdown)) {
    throw new Error(`CURRENT_XIZONG_GUIDE_STATUS_INVALID:${system.systemId}`);
  }
  if (!/^Role:\s*\*\*BEGINNER_EXPLANATION_ONLY\*\*/m.test(markdown)) {
    throw new Error(`CURRENT_XIZONG_GUIDE_ROLE_INVALID:${system.systemId}`);
  }

  const sections = parseSections(markdown);
  if (!sections.length) throw new Error(`CURRENT_XIZONG_GUIDE_EMPTY:${system.systemId}`);

  return {
    schema: 'kianos.xizong.beginner_guide_projection.v1',
    systemId: system.systemId,
    canonicalId: system.canonicalId,
    title: `${system.canonicalId} ${system.title} · Beginner Guide`,
    role: 'BEGINNER_EXPLANATION_ONLY',
    sourcePath: guidePath,
    sections
  };
}
