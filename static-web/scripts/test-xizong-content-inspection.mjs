import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { inspectXizongContent, formatXizongInspection, assertContentIdentity } from './inspect-xizong-content.mjs';

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
check(status()===before,'inspection did not mutate repository');
console.log(`PASS ${checks} Xizong content-inspection checks; native B1 + B/D1, 7 deliberate corruption cases, no browser/learner-state writes.`);
