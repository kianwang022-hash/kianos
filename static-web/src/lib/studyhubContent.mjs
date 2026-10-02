// Presentation adapter only. Canonical prose/relationships remain in StudyHub.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { Marked } from 'marked';

export const STUDYHUB_SOURCE = Object.freeze({ repository: 'https://github.com/kianwang022-hash/StudyHub', revision: 'e02970bf4a4743b9ceba194219e57f8f092fa31a' });
export const STUDYHUB_CACHE = fileURLToPath(new URL('../../.cache/studyhub/' + STUDYHUB_SOURCE.revision + '/', import.meta.url));
const repository = STUDYHUB_SOURCE.repository;
const escape = (s) => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const digest = (s) => crypto.createHash('sha256').update(s).digest('hex');
export const sourceHref = (file, revision = 'main') => `${repository}/blob/${revision}/${file.split('/').map(encodeURIComponent).join('/')}`;
export const readerHref = (file, base = '/') => `${base}studyhub/${file.replace(/\.md$/i, '').split('/').map(encodeURIComponent).join('/')}/`;
export function resolveSourceLink(from, href) {
  if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(href)) return null;
  const [raw, fragment = ''] = href.split('#');
  let target;
  try { target = raw ? path.posix.normalize(path.posix.join(path.posix.dirname(from), decodeURIComponent(raw))) : from; } catch { return null; }
  if (target.startsWith('../') || target.startsWith('/') || !/\.md$/i.test(target)) return null;
  return { file: target, fragment };
}
const markdownLinks = (markdown) => [...markdown.matchAll(/\[([^\]]+)\]\(([^\s)]+)(?:\s+"[^"]*")?\)/g)].map(m => ({ label: m[1], href: m[2] }));

// The adopted world map is the only admission owner. Body references remain
// source links unless independently adopted; only declared Logic is a dependency.
export function studyhubDependencies(file, markdown) {
  const admitted = file === 'WORLD_MAP.md'
    ? ['13 zones', 'Current W5 Direction assets'].map(title => markdown.split('## ' + title + '\n')[1]?.split('\n## ')[0] || '').join('\n')
    : [...markdown.matchAll(/^(?:Direction )?Logic:\s*.+$/gm)].map(m => m[0]).join('\n');
  return [...new Set(markdownLinks(admitted).map(link => resolveSourceLink(file, link.href)?.file)
    .filter(target => target?.startsWith('assets/') && !/\/README\.md$/.test(target)))];
}

export function loadStudyhub(root = process.env.STUDYHUB_SOURCE_DIR || STUDYHUB_CACHE, { mode = process.env.KIANOS_STUDYHUB_MODE || 'public' } = {}) {
  if (!['public', 'private'].includes(mode)) throw new Error('STUDYHUB_MODE_INVALID');
  // Public builds never inspect a nearby private cache, configured source or Git credentials.
  if (mode === 'public') return { docs: new Map(), zones: [], directions: [], revision: '', available: false, mode };
  if (!root || !fs.existsSync(path.join(root, 'WORLD_MAP.md'))) throw new Error('STUDYHUB_SOURCE_MISSING');
  root = fs.realpathSync(root);
  const git = args => execFileSync('git', ['-C', root, ...args], {encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim();
  let gitRoot, revision;
  try { gitRoot = fs.realpathSync(git(['rev-parse', '--show-toplevel'])); revision = git(['rev-parse', 'HEAD']); }
  catch { throw new Error('STUDYHUB_VERIFIED_GIT_SOURCE_REQUIRED'); }
  if (gitRoot !== root) throw new Error('STUDYHUB_VERIFIED_GIT_SOURCE_REQUIRED');
  if (revision !== STUDYHUB_SOURCE.revision) throw new Error('STUDYHUB_SOURCE_REVISION_MISMATCH');
  if (git(['status', '--porcelain', '--untracked-files=no'])) throw new Error('STUDYHUB_SOURCE_DIRTY');
  const blobs = new Map(git(['ls-tree', '-rz', revision, '--', 'WORLD_MAP.md', 'assets']).split('\0').filter(Boolean).map(row => {
    const [metadata, file] = row.split('\t');
    return [file, metadata.split(' ')[2]];
  }));
  // Export manifests are not trust roots. Every admitted byte is bound to the
  // actual pinned Git tree, even if stat/assume-unchanged hides a dirty file.
  const library = assembleStudyhub(file => {
    const full = path.resolve(root, file);
    if (!full.startsWith(root + path.sep) || !fs.existsSync(full)) throw new Error('STUDYHUB_ADOPTED_SOURCE_MISSING: ' + file);
    const real = fs.realpathSync(full);
    if (!real.startsWith(root + path.sep)) throw new Error('STUDYHUB_SOURCE_OUTSIDE_ROOT: ' + file);
    const bytes = fs.readFileSync(real);
    const blob = crypto.createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
    if (!blobs.has(file) || blob !== blobs.get(file)) throw new Error('STUDYHUB_SOURCE_BYTES_CHANGED: ' + file);
    return bytes.toString('utf8');
  }, revision);
  return { ...library, mode };
}

// Pure presentation adapter. Synthetic tests call this directly; production
// admission always passes through the verified Git loader above.
export function assembleStudyhub(readSource, revision) {
  const docs = new Map();
  const queue = ['WORLD_MAP.md'];
  while (queue.length) {
    const file = queue.shift();
    if (docs.has(file)) continue;
    const markdown = readSource(file);
    if (typeof markdown !== 'string') throw new Error('STUDYHUB_ADOPTED_SOURCE_MISSING: ' + file);
    const title = markdown.match(/^#\s+(.+)$/m)?.[1] || path.basename(file, '.md');
    docs.set(file, { file, title, markdown, hash: digest(markdown), source: sourceHref(file, revision) });
    queue.push(...studyhubDependencies(file, markdown).filter(file => !docs.has(file)));
  }
  const map = docs.get('WORLD_MAP.md').markdown;
  const zones = map.split('\n').filter(line => /^\|\s*\d+\./.test(line)).map(line => {
    const [, title, description, links] = line.split('|');
    return { title: title.trim(), description: description.trim(), links: markdownLinks(links).map(l => ({...l, file:resolveSourceLink('WORLD_MAP.md', l.href)?.file})).filter(l => l.file) };
  });
  const directionSection = map.match(/## Current W5 Direction assets\n([\s\S]*?)(?=\n## |$)/)?.[1] || '';
  const directions = markdownLinks(directionSection).map(l => ({...l, file:resolveSourceLink('WORLD_MAP.md', l.href)?.file})).filter(l => l.file);
  return { docs, zones, directions, revision, available: true };
}

export function renderStudyhub(doc, library, base = '/') {
  const headings = [], used = new Map();
  const unique = (s) => { const count = used.get(s) || 0; used.set(s, count + 1); return count ? `${s}-${count}` : s; };
  const slug = (s) => s.replace(/<[^>]*>/g,'').toLowerCase().replace(/[^\p{L}\p{N}_\-\s]/gu,'').trim().replace(/\s/g,'-');
  function linkInfo(href) {
    const resolved = resolveSourceLink(doc.file, href);
    if (resolved) {
      const {file,fragment} = resolved;
      return { href: (library.docs.has(file) ? readerHref(file, base) : sourceHref(file,library.revision)) + (fragment ? '#'+fragment : ''), local: library.docs.has(file) };
    }
    if (/^(https?:|mailto:)/i.test(href)) return {href,local:false};
    return {href:'#',local:false};
  }
  const parser = new Marked({gfm:true, breaks:false, renderer:{
    heading({tokens, depth, text}) {
      const id = unique(slug(text));
      if (depth > 1 && depth < 4) headings.push({id,title:text.replace(/[*`]/g,''),depth});
      return `<h${depth} id="${escape(id)}" data-sh-block>${this.parser.parseInline(tokens)}</h${depth}>\n`;
    },
    paragraph({tokens, text}) {
      return `<p id="${unique('sh-p-'+digest(text).slice(0,12))}" data-sh-block>${this.parser.parseInline(tokens)}</p>\n`;
    },
    link({href, tokens}) {
      const info=linkInfo(href);
      return `<a href="${escape(info.href)}" ${info.local?'data-sh-link':''}>${this.parser.parseInline(tokens)}</a>${info.local ? `<button type="button" class="shPreviewLink" data-sh-preview="${escape(info.href)}" aria-label="展开链接的原文">展开原文</button>`:''}`;
    },
    image({href,text}) { const safe=/^https?:\/\//i.test(href) ? href : ''; return safe ? `<img src="${escape(safe)}" alt="${escape(text)}" loading="lazy" />` : `<span>${escape(text)}</span>`; },
    html({text}) {
      // Escape the ENTIRE token first, including every incomplete '<'. Only
      // reconstruct the exact inert markup vocabulary used by canonical sources;
      // arbitrary raw HTML, attributes, hrefs and events are never admitted.
      return escape(text)
        .replace(/&lt;(\/?(?:details|summary))&gt;/g, (_, tag) => '<' + tag + '>')
        .replace(/&lt;a id=&quot;([A-Za-z][A-Za-z0-9_-]*)&quot;&gt;/g, (_, id) => '<a id="' + id + '">')
        .replace(/&lt;\/a&gt;/g, '</a>');
    }
  }});
  // Fold only source housekeeping before the first narrative paragraph. Every byte of
  // authored prose still goes through the renderer; the raw Markdown is downloadable.
  const metadata = doc.markdown.match(/^(# [^\n]+\n\s*\n)((?:Status:|Created:|Updated:|Revised:|Role:)[\s\S]*?)(?=\n\s*\n)/);
  let markdown = doc.markdown;
  if(metadata) markdown=markdown.replace(metadata[0],`${metadata[1]}<details>\n<summary>文章说明与范围</summary>\n\n${metadata[2]}\n\n</details>`);
  let html=parser.parse(markdown);
  if(metadata)html=html.replace('<summary>文章说明与范围</summary>','<summary data-sh-ui>文章说明与范围</summary>');
  const logicLink=doc.markdown.match(/^(?:Direction )?Logic:\s*\[[^\]]*\]\(([^)]+)\)/m)?.[1];
  const logicFile=logicLink && resolveSourceLink(doc.file,logicLink)?.file;
  const logic=logicFile && library.docs.get(logicFile);
  const anchors=[...doc.markdown.matchAll(/<a id="([^"]+)"\s*><\/a>/g)].map(m=>m[1]);
  const logicNodes = logic ? [...logic.markdown.matchAll(/^([A-Z]\d+) ([^\n]+)\n([^\n]+)$/gm)].map(m=>({code:m[1],label:m[2],description:m[3],id:anchors.find(id=>id.toLowerCase().endsWith(m[1].toLowerCase()))})).filter(n=>n.id) : [];
  return {...doc,html,headings,logic,logicNodes};
}
