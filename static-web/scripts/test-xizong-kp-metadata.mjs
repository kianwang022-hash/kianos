import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const self=fileURLToPath(import.meta.url),root=path.resolve(path.dirname(self),'../..');

// Independent raw-author oracle: strip only the *outer* documented Markdown
// wrapper, then read the exact authored field. Do not invent/rewrite Prompt text.
function rawField(body,label) {
  const values=[];
  for(const line of body.split(/\r?\n/)) {
    let text=line.match(/^\s{0,4}>\s*(.*)$/)?.[1]?.trim();
    if(!text)continue;
    let value;
    const prefix=`**${label}**`;
    if(text.startsWith(prefix))value=text.slice(prefix.length).replace(/^[：:]\s*/, '');
    else if(text.startsWith(`**${label}：**`)||text.startsWith(`**${label}:**`))value=text.slice(label.length+5);
    else if(text.startsWith('**')&&text.endsWith('**')) {
      text=text.slice(2,-2);
      if(text.startsWith(label+'：')||text.startsWith(label+':'))value=text.slice(label.length+1);
    }
    if(value!==undefined&&value.trim())values.push(value.trim());
  }
  if(new Set(values).size>1)return {conflictingAuthoredValues:[...new Set(values)]};
  return values[0]??null;
}

function kpBodies(text) {
  const headings=[...text.matchAll(/^\s{0,4}(#{1,6})\s+(.+)$/gm)],out=new Map();
  for(let i=0;i<headings.length;i++) {
    const h=headings[i],m=h[2].match(/^KP(\d+)[｜|]/);if(!m)continue;
    const next=headings.slice(i+1).find(x=>x[1].length<=h[1].length);
    out.set(Number(m[1]),text.slice(h.index+h[0].length,next?.index??text.length));
  }
  return out;
}

async function fixture(kind) {
  const read=fs.readFileSync.bind(fs);
  fs.readFileSync=(file,...args)=>{
    const text=read(file,...args);
    if(String(file).endsWith('/血液系统_H1_造血CBC_Ret与骨髓诊断语言_学习阅读版_v1_最终执行版.md')){
      const prompt='召回轴1｜边界2｜//串联：正式owner';
      const forms={outside:`> **主提示**：${prompt}`,colon:`> **主提示：** ${prompt}`,whole:`> **主提示：${prompt}**`,duplicate:`> **主提示**：${prompt}\n> **主提示：${prompt}**`,conflict:`> **主提示**：${prompt}\n> **主提示：different**`,missing:'',locators:`> **主提示：${prompt}**\n> **讲义定位：Lecture P128**\n> **Outline：U010**`};
      return String(text).replace(/^> \*\*主提示：三系3任务[^\n]+$/m,forms[kind]);
    }
    return text;
  };
  try {
    const {loadXizongBlock}=await import('../src/lib/xizong.mjs');
    const k=loadXizongBlock('hematology-immunity-infection','h01').kpRecords[0];
    console.log(JSON.stringify({prompt:k.prompt,source:k.sourceLocator,outline:k.outlineLocator,diagnostics:k.contentDiagnostics||[]}));
  } catch(e){console.log(JSON.stringify({error:String(e.message)}));}
}

export async function assertXizongKpMetadata({scanOnly=false}={}) {
  const {listProjectableXizongSystems,loadXizongBlock}=await import('../src/lib/xizong.mjs');
  const report={blocks:0,kps:0,declared:{prompt:0,sourceLocator:0,outlineLocator:0},gaps:[],conflicts:[],promptAbsentInOwner:[],bySystem:{}};
  for(const s of listProjectableXizongSystems())for(const summary of s.blocks) {
    const b=loadXizongBlock(s.systemId,summary.blockId),raw=fs.readFileSync(path.join(root,b.sourcePath),'utf8'),sections=kpBodies(raw);
    report.blocks++;
    for(const kp of b.kpRecords){
      report.kps++;const body=sections.get(kp.ordinal);assert.notEqual(body,undefined,kp.kpId+': raw section');
      let expected;try{expected={prompt:rawField(body,'主提示'),sourceLocator:rawField(body,'讲义定位 →')??rawField(body,'讲义定位'),outlineLocator:rawField(body,'Outline →')??rawField(body,'Outline')};}catch(e){throw new Error(kp.kpId+':'+e.message);}
      if(expected.prompt===null)report.promptAbsentInOwner.push({kp:kp.kpId,owner:b.sourcePath});
      for(const [field,value] of Object.entries(expected))if(value!==null){
        report.declared[field]++;
        if(typeof value==='object'){if(!scanOnly)assert.ok(kp.contentDiagnostics?.some(d=>d.label==='主提示'&&d.resolution==='CONTENT_REVIEW_REQUIRED'),kp.kpId+': authored conflict must be explicit');report.conflicts.push({kp:kp.kpId,owner:b.sourcePath,field,values:value.conflictingAuthoredValues,currentValue:kp[field]});continue;}
        if(kp[field]!==value){report.gaps.push({system:s.systemId,kp:kp.kpId,field,expected:value,actual:kp[field]});report.bySystem[s.systemId]=(report.bySystem[s.systemId]||0)+1;}
      }
    }
  }
  if(scanOnly)return report;
  assert.deepEqual(report.gaps,[],'every unambiguous authored metadata field reaches the canonical reader');
  for(const kind of ['outside','colon','whole','duplicate','conflict','missing','locators']) {
    const result=JSON.parse(execFileSync(process.execPath,[self,'--fixture',kind],{encoding:'utf8',timeout:20000,cwd:path.join(root,'static-web'),env:{...process.env,KIANOS_XIZONG_BUILD_CACHE:'0',KIANOS_REPO_ROOT:root}}));
    if(kind==='conflict'){assert.equal(result.prompt,'召回轴1｜边界2｜//串联：正式owner','existing effective text preserved pending Content review');assert.equal(result.diagnostics[0]?.resolution,'CONTENT_REVIEW_REQUIRED');}
    else if(kind==='missing')assert.equal(result.prompt,'','no Prompt invented when no owner text');
    else{
      assert.equal(result.prompt,'召回轴1｜边界2｜//串联：正式owner',kind);
      if(kind==='locators'){assert.equal(result.source,'Lecture P128');assert.equal(result.outline,'U010');}
    }
  }
  console.log(`Xizong raw-owner metadata PASS: ${report.blocks} Blocks/${report.kps} KP; ${JSON.stringify(report.declared)}; 7 native format/absence fixtures; ${report.conflicts.length} pre-existing authored conflicts remain explicit and unresolved.`);
  return report;
}
if(process.argv[2]==='--fixture')await fixture(process.argv[3]);
else if(process.argv[2]==='--scan')console.log(JSON.stringify(await assertXizongKpMetadata({scanOnly:true}),null,2));
else if(process.argv[1]&&fs.realpathSync(process.argv[1])===fs.realpathSync(self))await assertXizongKpMetadata();
