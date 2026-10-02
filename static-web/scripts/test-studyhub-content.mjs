import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { marked } from 'marked';
import { parseFragment } from 'parse5';
import { loadStudyhub, renderStudyhub, resolveSourceLink, STUDYHUB_SOURCE, STUDYHUB_CACHE } from '../src/lib/studyhubContent.mjs';
const library=loadStudyhub();
assert.ok(library.available,'Set STUDYHUB_SOURCE_DIR to an authorized StudyHub checkout/snapshot');
function visibleText(html, adapted=false){
  const walk=node=>{
    if(adapted&&node.tagName==='button')return '';
    if(adapted&&node.tagName==='summary'&&node.childNodes?.[0]?.value==='文章说明与范围')return '';
    return node.nodeName==='#text'?node.value:(node.childNodes||[]).map(walk).join(' ');
  };
  return walk(parseFragment(html)).replace(/\s+/g,' ').trim();
}
for(const doc of library.docs.values()){
  const rendered=renderStudyhub(doc,library);
  assert.equal(visibleText(rendered.html,true),visibleText(marked.parse(doc.markdown)),doc.file+': full authored text/provenance preserved');
  for(const match of doc.markdown.matchAll(/<a id="([^"]+)"/g)) assert.ok(rendered.html.includes(`id="${match[1]}"`),match[1]);
}
const sourceRoot=process.env.STUDYHUB_SOURCE_DIR || STUDYHUB_CACHE;
const manifest=path.join(sourceRoot,'source.json');
if(fs.existsSync(manifest))for(const [file,sha]of Object.entries(JSON.parse(fs.readFileSync(manifest)).files)){
  const raw=fs.readFileSync(path.join(sourceRoot,file));
  const actual=crypto.createHash('sha1').update(`blob ${raw.length}\0`).update(raw).digest('hex');
  assert.equal(actual,sha,'Git source bytes unchanged: '+file);
}
assert.equal(resolveSourceLink('assets/a.md','../../private.md'),null);
assert.equal(resolveSourceLink('assets/a.md','javascript:alert(1)'),null);
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'studyhub-adapter-'));
try{
  fs.mkdirSync(path.join(temp,'assets'));
  const writeManifest=()=>{
    const files={};
    for(const file of ['WORLD_MAP.md', ...fs.readdirSync(path.join(temp,'assets')).map(f=>'assets/'+f)]) {
      const bytes=fs.readFileSync(path.join(temp,file));
      files[file]=crypto.createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
    }
    fs.writeFileSync(path.join(temp,'source.json'),JSON.stringify({revision:STUDYHUB_SOURCE.revision,files}));
  };
  fs.writeFileSync(path.join(temp,'WORLD_MAP.md'),'# Map\n\n## 13 zones\n\n| 1. Example | scope | [Read](assets/unseen.md) |\n\n## Other research\n\n[Not adopted](assets/research.md)\n');
  fs.writeFileSync(path.join(temp,'assets/unseen.md'),'# Unseen title\n\nLogic: [Background](background.md#existing)\n\nA newly added article. [Further research](research.md).\n');
  fs.writeFileSync(path.join(temp,'assets/background.md'),'# Background\n\n<a id="existing"></a>\n\nAn existing paragraph.\n');
  fs.writeFileSync(path.join(temp,'assets/research.md'),'# Research outside world adoption\n');
  writeManifest();
  const next=loadStudyhub(temp);assert.equal(next.docs.size,3);assert.equal(next.zones[0].links[0].file,'assets/unseen.md');
  assert.ok(!next.docs.has('assets/research.md'),'body research and unadopted map sections do not enter reader');
  const html=renderStudyhub(next.docs.get('assets/unseen.md'),next).html;
  assert.ok(html.includes('/studyhub/assets/background/#existing'));
  assert.ok(html.includes(STUDYHUB_SOURCE.repository+'/blob/'+STUDYHUB_SOURCE.revision+'/assets/research.md'));
  fs.appendFileSync(path.join(temp,'assets/unseen.md'),'Corrupt cache');
  assert.throws(()=>loadStudyhub(temp),/STUDYHUB_SOURCE_BYTES_CHANGED/);
  fs.unlinkSync(path.join(temp,'assets/background.md'));
  writeManifest();
  assert.throws(()=>loadStudyhub(temp),/STUDYHUB_ADOPTED_SOURCE_MISSING/);
  const missing={...next,docs:new Map([['assets/unseen.md',next.docs.get('assets/unseen.md')]])};
  const degraded=renderStudyhub(missing.docs.get('assets/unseen.md'),missing).html;
  assert.ok(degraded.includes(STUDYHUB_SOURCE.repository+'/blob/'+STUDYHUB_SOURCE.revision+'/assets/background.md#existing'));
  assert.ok(!degraded.includes('data-sh-preview'));
  const hostile={file:'assets/unseen.md',title:'Escaping',markdown:'# Title\n\n[bad](javascript:alert(1))\n\n<script>alert(1)</script>\n'};
  const safe=renderStudyhub(hostile,next).html;assert.ok(!safe.includes('href="javascript:'));assert.ok(!safe.includes('<script>'));
}finally{fs.rmSync(temp,{recursive:true,force:true});}
console.log(JSON.stringify({pass:true,documents:library.docs.size,zones:library.zones.length,directions:library.directions.length,proof:'all authored text/anchors and Git source bytes; adopted article auto-routing and bounded dependencies; corrupt/missing source fails; external fallback and HTML safety'}));
