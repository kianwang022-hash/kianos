import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { inspectXizongContent, formatXizongInspection, formatXizongModelFrame, assertContentIdentity, assertInspectionSupportCoverage } from './inspect-xizong-content.mjs';

const repo = process.env.KIANOS_REPO_ROOT || path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const status = () => execFileSync('git',['-C',repo,'status','--porcelain'],{encoding:'utf8'});
const before = status();
let checks = 0;
const check = (ok,label) => { assert.ok(ok,label); checks++; };
const b1 = await inspectXizongContent({systemId:'circulation',blockRef:'b01'});
const modelB1 = formatXizongModelFrame(b1);
check(modelB1.includes('主路：①充盈／周期 → ②SV／CO → ③动脉储器／阻力 → ④微循环交换 → ⑤静脉回收与再次充盈。'),'model frame retains native flow');
check(modelB1.includes('并行供养：③主动脉分出冠脉 → ⑥供养心肌 → 维持下一搏。'),'model frame retains coronary branch');
check(b1.canonicalBlock.kpRecords.every(k => modelB1.includes(k.title+'〔'+k.prompt+'〕')),'model frame shows all 32 original full titles/Prompts in their pre-existing direct or side-reference positions');
check(!modelB1.includes('kianos:model') && !modelB1.includes('{{kp:'),'model frame strips internal token syntax');
check(formatXizongModelFrame(b1)===modelB1,'model frame is deterministic for identical canonical inputs');
const tamperedB1=structuredClone(b1);
tamperedB1.canonicalBlock.kpRecords[0].prompt+=' corrupted';
assert.throws(()=>formatXizongModelFrame(tamperedB1),/XIZONG_MODEL_FRAME_/);checks++;
check(b1.summary.kpCount===32 && b1.summary.logicGroupCount===7,'native B1 topology');
check(b1.trace.length===32,'whole Block inspection');
check(b1.summary.medicalVisualKpCount===6 && b1.summary.medicalVisualGroupCount===3,'KP and LG MedicalVisual both retained');
check(b1.canonicalBlock.blockLearnMarkdown && b1.learnerObject.blockPreentry,'full Block content not reduced to KP table');
check(b1.learnerObject.slots.kpRecallContext && b1.learnerObject.sourceContact,'all native slots/source policy retained');
check(b1.basis.witnesses.every(w=>w.gitBlob && w.headBlob),'input witnesses exist; dirty inputs are not silently called main');
const selected = await inspectXizongContent({systemId:'circulation',blockRef:'b01',kpId:'circulation-b01-kp24'});
check(selected.trace.length===1 && selected.selectedKp.identity.kpId==='circulation-b01-kp24','exact KP selection');
const raw = fs.readFileSync(path.join(repo,b1.basis.owners.canonicalContent),'utf8');
// Independent, bounded raw-owner oracle for the reported A1 case, not a second runtime parser.
const section = raw.slice(raw.indexOf('## KP24'),raw.indexOf('## KP25'));
const rawPrompt = section.match(/^>\s*\*\*主提示\*\*[：:]\s*(.+)$/m)?.[1];
check(Boolean(rawPrompt) && rawPrompt===selected.trace[0].prompt.text,'raw Markdown → default resolved Prompt');
check(selected.trace[0].supports.some(x=>x.family==='medicalvisual' && x.native.kind==='VISUAL'),'MedicalVisual alias preserves native wire type');
check(selected.trace[0].supports.filter(x=>x.family==='medicalvisual').every(x=>x.native.displayPolicy.timing==='POST_REVEAL' && x.native.answerBearing),'MedicalVisual protection preserved');
check(selected.trace[0].supports.some(x=>x.family==='attention' && x.native.semanticRole==='BOUNDARY'),'boundary retained');
check(selected.proof.effectiveDisplayedPrompt==='UNKNOWN' && selected.proof.personalPromptOverride==='NOT_READ','no personal/browser claims');
check(selected.proof.sourceQualityAndCompleteness==='NOT_AUDITED','no false Source quality acceptance');
check(selected.trace[0].supports.every(x=>x.ownerPath),'reported KP support owners resolve');
const kp23=b1.learnerObject.kps.find(k=>k.identity.displayId==='KP23');
check(kp23.identity.title.includes('CVP') && kp23.prompt.canonical!==rawPrompt,'KP23 and KP24 remain distinct');
check(b1.trace.find(k=>k.identity.displayId==='KP09').supports.some(x=>x.family==='connection' && x.ownerPath.endsWith('shared-fields.json')),'connection writer owner is traceable');
const human=formatXizongInspection(selected);
check(human.includes(rawPrompt) && human.includes(selected.selectedKp.core.markdown),'human selected view retains exact text and full Core');
check(human.includes('MedicalVisual') && human.includes('UNKNOWN'),'human view separates terminology and proof boundaries');
const repeat=await inspectXizongContent({systemId:'circulation',blockRef:'b01'});
check(JSON.stringify(b1)===JSON.stringify(repeat),'deterministic repeated inspection');
await assert.rejects(()=>inspectXizongContent({systemId:'circulation',blockRef:'b01',kpId:'KP24'}),/EXACT_KP_NOT_FOUND/); checks++;
await assert.rejects(()=>inspectXizongContent({systemId:'circulation',blockRef:'b01',kpId:'circulation-b02-kp24'}),/EXACT_KP_NOT_FOUND/); checks++;
for (const mutate of [
  o=>{o.kps[0].prompt.canonical+=' unexpected rewrite';},
  o=>{o.kps[0].core.markdown='lossy Core';},
  o=>{o.kps[0].source.locator='wrong Source';},
  o=>{o.kps[0].outline.locator='wrong Outline';},
  o=>{o.kps.pop();},
  o=>{o.kps.push(structuredClone(o.kps[0]));}
]) {
  const bad=structuredClone(b1.learnerObject); mutate(bad);
  assert.throws(()=>assertContentIdentity(b1.canonicalBlock,bad,raw)); checks++;
}
assert.throws(()=>assertContentIdentity(b1.canonicalBlock,b1.learnerObject,''),/PROMPT_NOT_IN_RAW_OWNER/);checks++;
const b=await inspectXizongContent({systemId:'digestive-metabolic-endocrine-tumor',blockRef:'D1'});
check(b.summary.identity.blockId==='D1' && b.semanticBlock.sourceContact.mode==='WHOLE_LOGIC_GROUP','heterogeneous B Learning mode preserved');
check(b.trace.length===b.canonicalBlock.kpRecords.length,'not a circulation-specific inspector');
const cli=fileURLToPath(new URL('./inspect-xizong-content.mjs',import.meta.url));
const run=spawnSync(process.execPath,[cli,'circulation','b01','circulation-b01-kp24','--json'],{cwd:'/tmp',env:{...process.env,KIANOS_REPO_ROOT:repo},encoding:'utf8',maxBuffer:32*1024*1024});
check(run.status===0 && JSON.parse(run.stdout).requestedKpId==='circulation-b01-kp24','CLI works outside repository cwd and /tmp symlink');
const modelCli=spawnSync(process.execPath,[cli,'circulation','b01','--model'],{cwd:'/tmp',env:{...process.env,KIANOS_REPO_ROOT:repo},encoding:'utf8',maxBuffer:32*1024*1024});
check(modelCli.status===0 && modelCli.stdout.trim()===modelB1,'content-only model CLI resolves identical Current canonical frame');
// A1's accepted models use h1 and h2 headings. Exercise the real Current
// consumer for every Block, including the h1 case that previously failed.
let a1KpCount=b1.canonicalBlock.kpRecords.length;
for (let n=2;n<=12;n++) {
  const ref=`b${String(n).padStart(2,'0')}`;
  const current=await inspectXizongContent({systemId:'circulation',blockRef:ref});
  const source=fs.readFileSync(path.join(repo,current.canonicalBlock.sourcePath),'utf8');
  const authored=source.match(/同一模型上的自然节点〔完整 Prompt〕[^\n]*\n[\s\S]*?```text\n([\s\S]*?)\n```/)?.[1];
  const rendered=formatXizongModelFrame(current);
  check(Boolean(authored) && rendered.endsWith(authored),`${ref}: consumer preserves the authored medical model byte for byte`);
  const annotations=[...authored.matchAll(/〈([^〈〉\n]*?〔[^〔〕\n]+〕)〉/g)].map(m=>m[1]);
  const expected=current.canonicalBlock.kpRecords.map(k=>k.title+'〔'+k.prompt+'〕');
  check(annotations.length===expected.length && expected.every(text=>annotations.filter(a=>a===text).length===1),`${ref}: every original full title/Prompt occupies one authored node`);
  const medicine=authored.replace(/〈[^〈〉\n]*?〔[^〔〕\n]+〕〉/g,'');
  check(!/[〈〉〔〕]/.test(medicine),`${ref}: all Prompt annotations can be hidden without leaving annotation fragments`);
  const wrong=structuredClone(current);wrong.canonicalBlock.kpRecords[0].prompt+=' invalid';
  assert.throws(()=>formatXizongModelFrame(wrong),/XIZONG_MODEL_FRAME_/);checks++;
  a1KpCount+=expected.length;
}
check(a1KpCount===312,'all 12 A1 models retain all 312 canonical KPs');
const h1Cli=spawnSync(process.execPath,[cli,'circulation','b12','--model'],{cwd:'/tmp',env:{...process.env,KIANOS_REPO_ROOT:repo},encoding:'utf8',maxBuffer:32*1024*1024});
check(h1Cli.status===0 && h1Cli.stdout.includes('① 最高优先级门：有无有效脉搏？'),'actual CLI accepts the h1 canonical model and preserves its first decision');
const invalid=spawnSync(process.execPath,[cli,'--unknown'],{encoding:'utf8'});
check(invalid.status===2,'unknown CLI options fail explicitly');
// Group/Block supports must be visible in the human inspection, not only
// buried in learnerObject JSON or accidentally counted as KP-owned records.
const respiratory=await inspectXizongContent({systemId:'respiratory',blockRef:'r01'});
const modelR1 = formatXizongModelFrame(respiratory);
check(respiratory.canonicalBlock.kpRecords.every(k => modelR1.includes(k.title+'〔'+k.prompt+'〕')),'R1 natural model uses exact canonical title and full Prompt, even when model text abbreviated it');
const rawR1=fs.readFileSync(path.join(repo,respiratory.canonicalBlock.sourcePath),'utf8');
const authoredR1=rawR1.match(/同一模型上的自然节点〔完整 Prompt〕[\s\S]*?```text\n([\s\S]*?)\n```/)[1];
check(modelR1.endsWith(authoredR1),'R1 frame reads exact same authored causal model, not a rewritten KP table');
check((authoredR1.match(/〈/g)||[]).length===15,'R1 exactly 15 Current in-model full Prompt annotations');
const unannotatedR1=authoredR1.replace(/〈[^〈〉\n]*?〔[^〔〕\n]+〕〉/g,'');
check(!/[〈〉〔〕]/.test(unannotatedR1),'R1 model remains independent with every Prompt hidden');
check([
 '膈肌、肋间外肌 → 胸廓容积↑',
 '胸膜腔内压更负 → 跨肺压↑ → 肺扩张、肺容积↑',
 '肺泡内压暂低于大气压（直接动力）→ 空气经传导气道流入肺泡',
 '肺泡内压暂高于大气压 → 空气流出',
 '肺组织弹性 + 肺泡表面张力',
 '口径减小 → 气道阻力↑',
 'VE = VT × f',
 'TLC 低于正常下限'
].every(s=>unannotatedR1.includes(s)),'R1 independent model retains physiology, load and diagnostic measurement boundaries');
check(
 unannotatedR1.indexOf('① 通气机械电影')<unannotatedR1.indexOf('② 同一口气的两类负荷')
 && unannotatedR1.indexOf('② 同一口气的两类负荷')<unannotatedR1.indexOf('③ 同一机制的测量读数'),
 'R1 puts mechanism first and marks measurement as observation, not causal upstream'
);
const tamperedR1=structuredClone(respiratory);
tamperedR1.canonicalBlock.kpRecords[0].prompt='unrelated-unique-invalid';
assert.throws(()=>formatXizongModelFrame(tamperedR1),/XIZONG_MODEL_FRAME_/);checks++;
const d8=await inspectXizongContent({systemId:'digestive-metabolic-endocrine-tumor',blockRef:'D8'});
const modelD8=formatXizongModelFrame(d8);
check(d8.canonicalBlock.kpRecords.every(k => modelD8.includes(k.title+'〔'+k.prompt+'〕')),'B D8 natural model resolves all exact full Prompts without inferring order');
const rawD8=fs.readFileSync(path.join(repo,d8.canonicalBlock.sourcePath),'utf8');
const authoredD8=rawD8.match(/同一模型上的自然节点〔完整 Prompt〕[\s\S]*?```text\n([\s\S]*?)\n```/)[1];
check(modelD8.endsWith(authoredD8),'D8 frame copies the authored medical model without deleting labels or moving relations');
check((authoredD8.match(/〈/g)||[]).length===25,'D8 retains all canonical annotations, not a selective example');
const unannotatedD8=authoredD8.replace(/〈[^〈〉\n]*?〔[^〔〕\n]+〕〉/g,'');
check(!unannotatedD8.includes('〔') && !unannotatedD8.includes('KP'),'removing annotations leaves medicine, not a KP checklist');
for (const relation of [
  'β细胞受到破坏 → 分泌来源不足 → 胰岛素绝对缺乏',
  '→ β细胞增加分泌代偿',
  '→ 渗透性利尿 → 多尿、失水 → 口渴、多饮',
  '草酰乙酸不足、TCA 入口受限',
  'DKA / HHS 在这里是对照分支',
  '明显低钾优先补钾',
  '不能拿 C肽替代糖尿病的血糖诊断标准',
  '回到④读证据、回到⑤调整'
]) check(unannotatedD8.includes(relation),'D8 annotation-free mechanism/condition remains: '+relation);
check(unannotatedD8.includes('不以“曾经发生急性危象”为前提'),'D8 does not turn acute crisis into a prerequisite for chronic damage');
check(unannotatedD8.includes('原图缺口不因这张图而关闭'),'Source/Visual gaps are not silently accepted');
const d8BadTitle=structuredClone(d8);d8BadTitle.canonicalBlock.kpRecords[0].title+=' wrong';
assert.throws(()=>formatXizongModelFrame(d8BadTitle),/INLINE_TITLE_PROMPT_NOT_EXACT/);checks++;
const d8BadPrompt=structuredClone(d8);d8BadPrompt.canonicalBlock.kpRecords[0].prompt+=' wrong';
assert.throws(()=>formatXizongModelFrame(d8BadPrompt),/INLINE_TITLE_PROMPT_NOT_EXACT/);checks++;
const d8Ambiguous=structuredClone(d8);d8Ambiguous.canonicalBlock.kpRecords.push(structuredClone(d8Ambiguous.canonicalBlock.kpRecords[0]));
assert.throws(()=>formatXizongModelFrame(d8Ambiguous),/INLINE_TITLE_PROMPT_NOT_EXACT/);checks++;

let reviewedRespiratoryKps=0;
for (const [ref,count] of [['r02',16],['r03',21]]) {
  const current=await inspectXizongContent({systemId:'respiratory',blockRef:ref});
  const source=fs.readFileSync(path.join(repo,current.canonicalBlock.sourcePath),'utf8');
  const authored=source.match(/同一模型上的自然节点〔完整 Prompt〕[^\n]*\n[\s\S]*?```text\n([\s\S]*?)\n```/)?.[1];
  const rendered=formatXizongModelFrame(current);
  check(Boolean(authored) && rendered.endsWith(authored),`${ref}: current consumer returns the complete authored gas-pathway model`);
  const annotations=[...authored.matchAll(/〈([^〈〉\n]*?〔[^〔〕\n]+〕)〉/g)].map(m=>m[1]);
  const expected=current.canonicalBlock.kpRecords.map(k=>k.title+'〔'+k.prompt+'〕');
  check(expected.length===count && annotations.length===count && expected.every(text=>annotations.filter(a=>a===text).length===1),`${ref}: original full titles and Prompts remain attached to authored nodes`);
  check(!/[〈〉〔〕]/.test(authored.replace(/〈[^〈〉\n]*?〔[^〔〕\n]+〕〉/g,'')),`${ref}: hiding all annotations leaves only the medical model`);
  const wrong=structuredClone(current);wrong.canonicalBlock.kpRecords[0].prompt+=' invalid';
  assert.throws(()=>formatXizongModelFrame(wrong),/XIZONG_MODEL_FRAME_/);checks++;
  reviewedRespiratoryKps+=expected.length;
}
check(reviewedRespiratoryKps===37,'both reviewed A2 models retain all 37 canonical KPs');
const r2Cli=spawnSync(process.execPath,[cli,'respiratory','r02','--model'],{cwd:'/tmp',env:{...process.env,KIANOS_REPO_ROOT:repo},encoding:'utf8',maxBuffer:32*1024*1024});
check(r2Cli.status===0 && r2Cli.stdout.includes('肺泡通气VA持续更新肺泡气，肺血流Q同时带来静脉血'),'actual R2 model CLI preserves the parallel entry without a browser');

check(Array.isArray(respiratory.logicGroupTrace),'group support trace exists');
const lg4=respiratory.logicGroupTrace.find(g=>g.identity.logicGroupId==='respiratory-r01-lg04');
check(lg4.supports.some(s=>s.id==='a2-r01-obstruction-to-r03'&&s.family==='connection'),'R1 reviewed LG relation is inspectable');
check(lg4.supports.find(s=>s.id==='a2-r01-obstruction-to-r03').ownerPath.endsWith('a2-respiratory-pathways.json'),'group relation cites its pathway owner');
check(lg4.supports.some(s=>s.family==='extension'&&s.ownerPath.endsWith('a2-respiratory-extensions.json')),'group extension cites its manifest');
check(respiratory.summary.outgoingKpCount===0&&respiratory.summary.outgoingGroupCount===2,'group edges not counted as KP edges');
const lg1=respiratory.logicGroupTrace.find(g=>g.identity.logicGroupId==='respiratory-r01-lg01');
check(lg1.supports.some(s=>s.family==='medicalvisual'&&s.sourceAssetBindings.length>0),'group MedicalVisual source bindings retained');
const groupReport=formatXizongInspection(respiratory);
check(groupReport.includes('a2-r01-obstruction-to-r03')&&groupReport.includes('respiratory-r01-lg04-ventilation-pattern-comparison'),'human Block view exposes existing LG relation/extension');
check(JSON.stringify(lg4.slots)===JSON.stringify(respiratory.learnerObject.logicGroups[3].slots),'native group timing slots copied unchanged');
const r3=await inspectXizongContent({systemId:'respiratory',blockRef:'r03'});
check(r3.logicGroupTrace.some(g=>g.supports.some(s=>s.id==='a2-r01-obstruction-to-r03'&&s.native.direction==='incoming')),'same relation resolves at group target');
const targetBlock=await inspectXizongContent({systemId:'circulation',blockRef:'b06'});
check(targetBlock.blockTrace.supports.some(s=>s.family==='connection'&&s.id==='b01-c06-coronary-supply-demand-to-b6'),'Block-level incoming relation is not invisible to inspect');
check(targetBlock.blockTrace.supports.filter(s=>s.family==='connection').every(s=>s.ownerPath.endsWith('shared-fields.json')),'Block incoming owner is shared relation owner');
check(targetBlock.summary.incomingKpCount===0&&targetBlock.summary.incomingBlockCount>0,'Block edges are distinct from KP edges');
check(formatXizongInspection(targetBlock).includes('b01-c06-coronary-supply-demand-to-b6'),'human view shows Block incoming');
const exactResp=await inspectXizongContent({systemId:'respiratory',blockRef:'r01',kpId:'respiratory-r01-kp15'});
check(formatXizongInspection(exactResp).includes('a2-r01-obstruction-to-r03'),'exact KP inspection keeps its parent-group context');
check(!respiratory.trace.some(k=>k.supports.some(s=>s.id==='a2-r01-obstruction-to-r03')),'no reparenting LG relation onto a KP');
check(respiratory.proof.servedWebsite==='NOT_OBSERVED'&&respiratory.proof.sourceQualityAndCompleteness==='NOT_AUDITED','scope completeness is not a Website/medical quality claim');

for (const mutate of [
  r=>{r.logicGroupTrace[3].supports.pop();},
  r=>{r.logicGroupTrace.pop();},
  r=>{r.logicGroupTrace[3].kpIds=['respiratory-r01-kp01'];},
  r=>{r.logicGroupTrace[3].supports[0].family='precision';},
  r=>{r.logicGroupTrace[3].slots={};},
  r=>{r.trace[0].supports.push(structuredClone(r.logicGroupTrace[3].supports[0]));}
]) {
  const bad=structuredClone(respiratory);mutate(bad);
  assert.throws(()=>assertInspectionSupportCoverage(bad));checks++;
}
check(b1.blockTrace.supports.find(s=>s.native.raw?.source==='ATTENTION_STOP_LINE')?.ownerPath===b1.basis.owners.learning,'explicit stop line cites declared Learning owner, not medical Markdown');
const missingBlock=structuredClone(targetBlock);missingBlock.blockTrace.supports.pop();
assert.throws(()=>assertInspectionSupportCoverage(missingBlock));checks++;

// Normal learning consumes the rules and Current content, not this audit report.
const learningRoute = fs.readFileSync(path.join(repo, 'content/xizong/knowledge/learner/README.md'), 'utf8');
const b1Route = learningRoute.split('### Accepted B1 teaching basis')[1]?.split('### Accepted B2 teaching basis')[0] || '';
const a1Route = learningRoute.split('### Accepted B2 teaching basis')[1]?.split('### Accepted A2 Respiratory teaching basis')[0] || '';
check(a1Route.includes('canonical B2 Block') && a1Route.includes('canonical A1 Block') && a1Route.includes('同一模型上的自然节点〔完整 Prompt〕'),'B2–B12 learning routes select the current canonical models');
check(a1Route.includes('current canonical/support owners controlling facts and conditions') && a1Route.includes('Only the existing [A1 cue admission]'),'retained teaching explanations do not replace current facts or Memory admission');
const r1Route = learningRoute.split('### Accepted A2 Respiratory teaching basis')[1]?.split('### Accepted A3 Urinary teaching basis')[0] || '';
check(r1Route.includes('respiratory-r01') && r1Route.includes('canonical R1 Block §1A') && r1Route.includes('preparatory reading order'), 'normal R1 learning consumes one canonical causal model, not an independently ordered KP tree');
check(r1Route.includes('respiratory-r02 and respiratory-r03') && r1Route.includes('R2 canonical Block') && r1Route.includes('R3 canonical Block') && r1Route.includes('same model for first teaching and compressed review'), 'normal R2/R3 teaching and review select their current canonical models');
const entryRoute = learningRoute.split('## Chat-led Block reading entry')[1]?.split('## Teaching basis resolution')[0] || '';
check(entryRoute.includes('§0, §4') && entryRoute.includes('§5 and §13') && entryRoute.includes('Lecture Replacement Contract'), 'normal entry restores the existing teaching/interaction rules');
check(!/node\s+.*inspect-xizong-content/.test(learningRoute), 'normal entry has no executable inspection prerequisite');
check(b1Route.includes('kianos:model adopted-model') && b1Route.includes('Block1_正常机械循环_学习阅读版_v7_最终执行版.md'), 'B1 reads its current canonical model section');
check(!/\]\([^\n)]*b01-teaching\.md/.test(b1Route), 'B1 does not route back to a preserved historical teaching file');
check(b1Route.includes('mission') && b1Route.includes('mental_model') && b1Route.includes('cross_block_bridges') && b1Route.includes('blocks.circulation-b01'), 'normal B1 preserves System position and local learning purpose');
check(b1Route.includes('开 Block｜先给循环系统一副机械骨架') && b1Route.includes('folded review layout is not first-learning order'), 'first learning restores the adopted opening before local detail');
check(b1.learnerObject.model.markdown.includes('开 Block｜先给循环系统一副机械骨架') && b1.learnerObject.model.markdown.includes('并行供养'), 'referenced opening and parallel branch exist in the live model');
check(entryRoute.includes('“继续”') && entryRoute.includes('“有教案吗／没有设定吗”') && entryRoute.includes('not asking Kian to restate'), 'continuation and settings questions consume existing context');
check(b1Route.includes('side-reference KPs') && b1Route.includes('not all replaced') && b1Route.includes('原图门禁'), 'review does not equate Precision-card count with full Block coverage');
const routerLinks = [...learningRoute.matchAll(/\]\(([^)]+)\)/g)].map(m => m[1]).filter(url => !/^[a-z]+:/i.test(url));
check(routerLinks.every(url => fs.existsSync(path.resolve(repo, 'content/xizong/knowledge/learner', decodeURI(url.split('#')[0])))), 'every local content-routing target exists');

check(status()===before,'inspection did not mutate repository');
console.log(`PASS ${checks} Xizong content-inspection checks; native A1 B1–B12 + B/D1/D8 + A2/R1–R3; exact models and negative identity/scope cases, no browser/learner-state writes.`);
