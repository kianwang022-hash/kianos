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

export function loadStudyhub(root = process.env.STUDYHUB_SOURCE_DIR || STUDYHUB_CACHE) {
  const docs = new Map();
  if (!root || !fs.existsSync(path.join(root, 'WORLD_MAP.md'))) {
    if (process.env.NODE_ENV === 'production') throw new Error('STUDYHUB_SOURCE_MISSING: run node scripts/sync-studyhub-source.mjs before the production build');
    return { docs, zones: [], directions: [], revision: '', available: false };
  }
  root = fs.realpathSync(root);
  let revision = '';
  let manifest;
  try { manifest = JSON.parse(fs.readFileSync(path.join(root, 'source.json'), 'utf8')); revision = manifest.revision; } catch {}
  try { revision ||= execFileSync('git', ['-C', root, 'rev-parse', 'HEAD'], {encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim(); } catch {}
  if (revision !== STUDYHUB_SOURCE.revision) throw new Error('STUDYHUB_SOURCE_REVISION_MISMATCH: expected ' + STUDYHUB_SOURCE.revision);
  if (fs.existsSync(path.join(root, '.git')) && execFileSync('git', ['-C', root, 'status', '--porcelain', '--untracked-files=no'], {encoding:'utf8'}).trim()) throw new Error('STUDYHUB_SOURCE_DIRTY');
  const queue = ['WORLD_MAP.md'];
  while (queue.length) {
    const file = queue.shift();
    if (docs.has(file)) continue;
    const full = path.resolve(root, file);
    if (!full.startsWith(root + path.sep) || !fs.existsSync(full)) throw new Error('STUDYHUB_ADOPTED_SOURCE_MISSING: ' + file);
    const real = fs.realpathSync(full);
    if (!real.startsWith(root + path.sep)) throw new Error('STUDYHUB_SOURCE_OUTSIDE_ROOT: ' + file);
    const markdown = fs.readFileSync(real, 'utf8');
    if (manifest) {
      if (!manifest.files?.[file]) throw new Error('STUDYHUB_SOURCE_HASH_MISSING: ' + file);
      const bytes = Buffer.from(markdown);
      const blob = crypto.createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
      if (blob !== manifest.files[file]) throw new Error('STUDYHUB_SOURCE_BYTES_CHANGED: ' + file);
    }
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
      // Preserve semantic raw Markdown containers/anchors; no executable HTML.
      return text.replace(/<[^>]*>/g, tag => {
        const match=tag.match(/^<(\/?)\s*(details|summary|a|br|sub|sup|kbd)\b([^>]*)>/i);
        if(!match) return escape(tag);
        const [,close,name,attrs]=match;
        if(close) return `</${name.toLowerCase()}>`;
        const id=attrs.match(/\bid\s*=\s*["']([^"']+)["']/i)?.[1];
        const href=attrs.match(/\bhref\s*=\s*["']([^"']+)["']/i)?.[1];
        return `<${name.toLowerCase()}${id?' id="'+escape(id)+'"':''}${href?' href="'+escape(linkInfo(href).href)+'"':''}>`;
      });
    }
  }});
  // Fold only source housekeeping before the first narrative paragraph. Every byte of
  // authored prose still goes through the renderer; the raw Markdown is downloadable.
  const metadata = doc.markdown.match(/^(# [^\n]+\n\s*\n)((?:Status:|Created:|Updated:|Revised:|Role:)[\s\S]*?)(?=\n\s*\n)/);
  let markdown = doc.markdown;
  if(metadata) markdown=markdown.replace(metadata[0],`${metadata[1]}<details class="shSourceMeta">\n<summary>文章说明与范围</summary>\n\n${metadata[2]}\n\n</details>`);
  const html=parser.parse(markdown);
  const logicLink=doc.markdown.match(/^(?:Direction )?Logic:\s*\[[^\]]*\]\(([^)]+)\)/m)?.[1];
  const logicFile=logicLink && resolveSourceLink(doc.file,logicLink)?.file;
  const logic=logicFile && library.docs.get(logicFile);
  const anchors=[...doc.markdown.matchAll(/<a id="([^"]+)"\s*><\/a>/g)].map(m=>m[1]);
  const logicNodes = logic ? [...logic.markdown.matchAll(/^([A-Z]\d+) ([^\n]+)\n([^\n]+)$/gm)].map(m=>({code:m[1],label:m[2],description:m[3],id:anchors.find(id=>id.toLowerCase().endsWith(m[1].toLowerCase()))})).filter(n=>n.id) : [];
  return {...doc,html,headings,logic,logicNodes};
}
