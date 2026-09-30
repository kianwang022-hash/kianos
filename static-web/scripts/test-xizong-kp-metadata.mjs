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
    const text=line.match(/^\s{0,4}>\s*(.*)$/)?.[1]?.trim();
    if(!text || !/^\*\*(?:主提示|讲义定位(?: →)?|Outline(?: →)?)(?:\*\*|[：:])/.test(text))continue;
    // Independent token boundaries, rather than the native field regexes.
    const tokens=[...text.matchAll(/(?:^|[｜|]\s*)\*\*(主提示|讲义定位(?: →)?|Outline(?: →)?)(\*\*[：:]?|[：:]\*\*|[：:])/g)];
    for(let i=0;i<tokens.length;i++) {
      const token=tokens[i];if(token[1]!==label)continue;
      let value=text.slice(token.index+token[0].length,tokens[i+1]?.index??text.length).trim();
      if(/^[：:]$/.test(token[2])&&value.endsWith('**'))value=value.slice(0,-2).trim();
      if(value)values.push(value);
    }
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
      Object.assign(forms, {
        inline:`> **讲义定位 →** Lecture P128｜**主提示：${prompt}**`,
        inlineOutside:`> **讲义定位：** Lecture P128 | **主提示**：${prompt}`,
        inlineColon:`> **讲义定位：Lecture P128**｜**主提示：** ${prompt}`,
        inlineThree:`> **讲义定位 →** Lecture P128｜**Outline：U010**｜**主提示：${prompt}**`,
        inlinePromptFirst:`> **主提示：${prompt}**｜**讲义定位：Lecture P128**｜**Outline →** U010`,
        inlineConflict:`> **讲义定位 →** Lecture P128｜**主提示：different**\n> **主提示**：${prompt}`,
        inlineConflictNoWinner:`> **讲义定位 →** Lecture P128｜**主提示：first**\n> **Outline：U010**｜**主提示：second**`,
        inlineDuplicate:`> **讲义定位 →** Lecture P128｜**主提示：${prompt}**\n> **主提示：${prompt}**`,
        unrelatedQuote:`> 这是正文引用，不是元数据｜**主提示：not metadata**`,
        literalCode:`> **主提示**：保留\`x｜**Outline：代码示例**\`｜最后1`,
        internalBold:`> **主提示**：轴1｜**关键术语**｜最后1`
      });
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
  assert.deepEqual(report.promptAbsentInOwner,[],'every current raw KP has an authored Prompt; absent extraction is not coverage');
  const formats=['outside','colon','whole','duplicate','conflict','missing','locators',
    'inline','inlineOutside','inlineColon','inlineThree','inlinePromptFirst','inlineConflict','inlineConflictNoWinner','inlineDuplicate','unrelatedQuote','literalCode','internalBold'];
  for(const kind of formats) {
    const result=JSON.parse(execFileSync(process.execPath,[self,'--fixture',kind],{encoding:'utf8',timeout:20000,cwd:path.join(root,'static-web'),env:{...process.env,KIANOS_XIZONG_BUILD_CACHE:'0',KIANOS_REPO_ROOT:root}}));
    if(['conflict','inlineConflict'].includes(kind)){
      assert.equal(result.prompt,'召回轴1｜边界2｜//串联：正式owner','existing effective text preserved pending Content review');
      assert.equal(result.diagnostics[0]?.resolution,'CONTENT_REVIEW_REQUIRED');
    } else if(kind==='inlineConflictNoWinner') {
      assert.equal(result.prompt,'','no new winner for ambiguous newly readable values');
      assert.equal(result.diagnostics[0]?.resolution,'CONTENT_REVIEW_REQUIRED');
    } else if(['missing','unrelatedQuote'].includes(kind))assert.equal(result.prompt,'','no Prompt invented without a declaration');
    else if(kind==='literalCode')assert.equal(result.prompt,'保留`x｜**Outline：代码示例**`｜最后1');
    else if(kind==='internalBold')assert.equal(result.prompt,'轴1｜**关键术语**｜最后1');
    else{
      assert.equal(result.prompt,'召回轴1｜边界2｜//串联：正式owner',kind);
      if(kind==='locators'||kind.startsWith('inline'))assert.equal(result.source,'Lecture P128',kind+' source');
      if(['locators','inlineThree','inlinePromptFirst'].includes(kind))assert.equal(result.outline,'U010',kind+' outline');
    }
  }
  console.log(`Xizong raw-owner metadata PASS: ${report.blocks} Blocks/${report.kps} KP; ${JSON.stringify(report.declared)}; ${formats.length} native format/absence/conflict fixtures; ${report.conflicts.length} pre-existing authored conflicts remain explicit and unresolved.`);
  return report;
}
if(process.argv[2]==='--fixture')await fixture(process.argv[3]);
else if(process.argv[2]==='--scan')console.log(JSON.stringify(await assertXizongKpMetadata({scanOnly:true}),null,2));
else if(process.argv[1]&&fs.realpathSync(process.argv[1])===fs.realpathSync(self))await assertXizongKpMetadata();
