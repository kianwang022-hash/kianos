import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { inspectXizongContent, formatXizongInspection, assertContentIdentity, assertInspectionSupportCoverage } from './inspect-xizong-content.mjs';

const repo = process.env.KIANOS_REPO_ROOT || path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const status = () => execFileSync('git',['-C',repo,'status','--porcelain'],{encoding:'utf8'});
const before = status();
let checks = 0;
const check = (ok,label) => { assert.ok(ok,label); checks++; };
const b1 = await inspectXizongContent({systemId:'circulation',blockRef:'b01'});
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
const invalid=spawnSync(process.execPath,[cli,'--unknown'],{encoding:'utf8'});
check(invalid.status===2,'unknown CLI options fail explicitly');
// Group/Block supports must be visible in the human inspection, not only
// buried in learnerObject JSON or accidentally counted as KP-owned records.
const respiratory=await inspectXizongContent({systemId:'respiratory',blockRef:'r01'});
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

check(status()===before,'inspection did not mutate repository');
console.log(`PASS ${checks} Xizong content-inspection checks; native B1/B6 + B/D1 + A2/R1/R3; 7 Content and 7 scope-corruption cases, no browser/learner-state writes.`);
