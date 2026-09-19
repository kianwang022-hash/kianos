// Temporary source files only. Never publish this synthetic harness as learner Content.
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'../..');
const pages=path.join(root,'static-web/src/pages');
const fixtureIndex=path.join(root,'tools/english-final/.fixture-files.json');
if(process.argv.includes('--clean')){
 if(fs.existsSync(fixtureIndex)){for(const file of JSON.parse(fs.readFileSync(fixtureIndex,'utf8'))){if(file.startsWith(pages+path.sep)&&path.basename(file).startsWith('audit-synthetic-'))fs.rmSync(file,{force:true});}fs.rmSync(fixtureIndex);}
 process.exit(0);
}
const made=[];
const write=(relative,text)=>{const p=path.join(pages,relative);fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,text);made.push(p);};
const words='This is a synthetic text about a community workshop. Participants choose useful tools, explain their decisions, and compare the results. The exercise tests reading without revealing or consuming a real examination passage.';
const q=(n,offset=1)=>Array.from({length:n},(_,i)=>({id:`q${i}`,ordinal:offset+i,prompt:`Synthetic item ${i+1}: which statement is supported?`,options:{A:'A supported statement',B:'A stronger unsupported claim',C:'An unrelated detail',D:'A reversed relationship'},answer:''}));
const snapshots=[];
function pageBody(imports,body,object){return `---\nimport Base from '../../layouts/Base.astro';\n${imports}\nconst item=${JSON.stringify(object)};\n---\n<Base title="Synthetic independent audit" objectId={item.objectId||item.id} sourceHash={item.sourceHash||item.sourceHashes?.renderedObject} active="reading"><EnglishExamTaskBridge task={item.task} objectId={item.objectId||item.id}/>${body}</Base>\n`;}
const bridge="import EnglishExamTaskBridge from '../../components/EnglishExamTaskBridge.astro';";
for(let i=0;i<4;i++){
 const id=`audit-synthetic-reading-${i}`;const item={task:'reading_a',objectId:id,title:'Synthetic Reading',paperId:'audit-synthetic-paper',section:'reading_part_a',paragraphs:Array.from({length:6},(_,i)=>({id:`p${i}`,text:words})),questions:q(5),navigation:{},sourceHashes:{renderedObject:`synthetic-reading-${i}`},sourcePaths:{}};
 write(`reading/${id}.astro`,pageBody(`${bridge}\nimport ReadingWorkspace from '../../components/ReadingWorkspace.astro';\nimport ReadingAnswerGate from '../../components/ReadingAnswerGate.astro';\nimport ReadingPassageHandoff from '../../components/ReadingPassageHandoff.astro';\nimport ObjectiveTransferClaims from '../../components/ObjectiveTransferClaims.astro';\nimport '../../styles/reading.css';\nimport '../../styles/english-reading-vertical.css';`, '<ReadingWorkspace reading={item}/><ReadingAnswerGate/><ReadingPassageHandoff/><ObjectiveTransferClaims task="reading_a"/>',item));
 snapshots.push({task:item.task,object_id:id,source_hash:item.sourceHashes.renderedObject,task_snapshot:item,question_ids:item.questions.map(x=>x.id),max_points:10});
}
const cloze={task:'cloze',objectId:'audit-synthetic-cloze',title:'Synthetic Cloze',material:[{text:Array.from({length:20},(_,i)=>`We compare ____${i+1}____ choices in context.`).join(' ')}],context:{},questions:q(20),sourceHashes:{renderedObject:'synthetic-cloze'}};
write('cloze/audit-synthetic-cloze.astro',pageBody(`${bridge}\nimport ClozeWorkspace from '../../components/ClozeWorkspace.astro';\nimport ObjectiveAnswerGate from '../../components/ObjectiveAnswerGate.astro';\nimport ObjectiveTransferClaims from '../../components/ObjectiveTransferClaims.astro';`, '<ClozeWorkspace item={item}/><ObjectiveAnswerGate task="cloze" answerRoute="cloze-answer"/><ObjectiveTransferClaims task="cloze"/>',cloze));
snapshots.unshift({task:'cloze',object_id:cloze.objectId,source_hash:'synthetic-cloze',question_ids:cloze.questions.map(x=>x.id),task_snapshot:cloze,max_points:10});
for(const form of ['gap_matching','heading_matching','ordering','comment_matching']){
 const id=`audit-synthetic-partb-${form}`;const item={task:'reading_b',objectId:id,title:'Synthetic Part B',material:[{text:words},{text:words}],candidates:'ABCDEFG'.split('').map((label,i)=>({label,text:`${label}. Synthetic candidate ${i+1}. ${words}`})),questions:q(5,41).map(x=>({...x,options:{}})),context:{directions:'Match the whole set using each candidate at most once.',taskForm:form,formLabel:form,candidateUsePolicy:'single_use',orderingSkeleton:['A','41','42','D','43','44','45'],fixedGivens:form==='ordering'?['A','D']:[]},sourceHashes:{renderedObject:`synthetic-${form}`}};
 write(`reading-b/${id}.astro`,pageBody(`${bridge}\nimport ReadingBWorkspace from '../../components/ReadingBWorkspace.astro';\nimport ObjectiveAnswerGate from '../../components/ObjectiveAnswerGate.astro';\nimport ObjectiveTransferClaims from '../../components/ObjectiveTransferClaims.astro';`, '<ReadingBWorkspace item={item}/><ObjectiveAnswerGate task="reading_b" answerRoute="reading-b-answer"/><ObjectiveTransferClaims task="reading_b"/>',item));
 if(form==='ordering')snapshots.push({task:'reading_b',object_id:id,source_hash:item.sourceHashes.renderedObject,question_ids:item.questions.map(x=>x.id),task_snapshot:item,max_points:10});
}
const tr={task:'translation',objectId:'audit-synthetic-translation',title:'Synthetic Translation',paperId:'audit-synthetic-paper',material:[{text:words},{text:words}],prompts:Array.from({length:5},(_,i)=>({id:`q${i}`,ordinal:46+i,sourceText:`The workshop may help some learners when they use the tools carefully. Sentence ${i+1}.`})),context:{},navigation:{},sourceHashes:{renderedObject:'synthetic-translation'}};
write('translation/audit-synthetic-translation.astro',pageBody(`${bridge}\nimport TranslationWorkspace from '../../components/TranslationWorkspace.astro';\nimport TranslationEvidenceGuard from '../../components/TranslationEvidenceGuard.astro';\nimport TranslationPersistenceGuard from '../../components/TranslationPersistenceGuard.astro';`, '<TranslationWorkspace translation={item} reference={{}}/><TranslationEvidenceGuard/><TranslationPersistenceGuard/>',tr));
snapshots.push({task:'translation',object_id:tr.objectId,source_hash:'synthetic-translation',question_ids:tr.prompts.map(x=>x.id),task_snapshot:tr,max_points:10});
write('audit-assets/audit-synthetic-visual.svg.js',`export function GET(){return new Response('<svg xmlns="http://www.w3.org/2000/svg" width="240" height="120"><rect width="240" height="120" fill="#eee"/><text x="20" y="65">SYNTHETIC IMAGE TEST</text></svg>',{headers:{'content-type':'image/svg+xml'}});}`);
for(const kind of ['small','big']){
 const task={task:'writing',id:`audit-synthetic-writing-${kind}`,sourceKind:'synthetic',kind,title:`Synthetic ${kind} writing`,targetWords:kind==='small'?100:180,sourceHash:`synthetic-writing-${kind}`,learnerTask:{directions:'Write a complete text explaining the workshop and giving useful details.',visual_scenario:kind==='big'?'Two students have the same tools but use them differently.':null,images:kind==='big'?[{asset_path:'audit-assets/audit-synthetic-visual.svg',alt:'Synthetic image only'}]:[]},planningPrompt:'Optional notes',draftPrompt:'Write independently.'};
 const body=pageBody(`${bridge}\nimport WritingWorkspace from '../../components/WritingWorkspace.astro';\nimport WritingEvidencePanel from '../../components/WritingEvidencePanel.astro';`, '<WritingWorkspace task={item}/><WritingEvidencePanel task={item}/>',task);
 write(`writing/${task.id}.astro`,body);write(`english-exam-writing/${task.id}.astro`,body);
 snapshots.push({task:'writing',object_id:task.id,source_hash:task.sourceHash,task_snapshot:task,question_ids:[],writing_kind:kind,max_points:kind==='small'?10:20});
}
const paper={schema:'kianos.english.exam-paper.v1',paper_id:'audit-synthetic-paper',year:0,duration_minutes:180,total_points:100,objective_max_points:60,productive_max_points:40,default_task_order:['cloze','reading_a','reading_b','translation','writing'],steps:snapshots.map((s,i)=>({...s,step_id:`${s.task}:${s.object_id}`,label:`Synthetic ${s.task} ${i}`}))};
let exam=fs.readFileSync(path.join(pages,'english-exam/[id].astro'),'utf8');
const start=exam.indexOf('import {');const end=exam.indexOf('const payload');
exam=exam.slice(0,start)+`const paper=${JSON.stringify(paper)};\n`+exam.slice(end);
write('english-exam/audit-synthetic-paper.astro',exam);
// Test-only answer endpoints: synthetics only and a marker not included in clean task HTML.
for(const step of paper.steps.filter(s=>['cloze','reading_a','reading_b'].includes(s.task))){
 const route={reading_a:'reading-answer',cloze:'cloze-answer',reading_b:'reading-b-answer'}[step.task];
 const answers=Object.fromEntries(step.question_ids.map((id,i)=>[id,step.task==='reading_b'?'BCEFG'[i]:'A']));
 write(`${route}/${step.object_id}.json.js`,`export function GET(){return new Response(${JSON.stringify(JSON.stringify({schema:'synthetic-answer',task:step.task,objectId:step.object_id,answers}))},{headers:{'content-type':'application/json'}});}`);
}
const answer={schema:'kianos.english.exam-answer.v1',paper_id:paper.paper_id,steps:Object.fromEntries(paper.steps.filter(s=>['cloze','reading_a','reading_b'].includes(s.task)).map(s=>[s.step_id,{task:s.task,object_id:s.object_id,source_hash:s.source_hash,answers:Object.fromEntries(s.question_ids.map((id,i)=>[id,s.task==='reading_b'?'BCEFG'[i]:'A']))}]))};
write('english-exam-answer/audit-synthetic-paper.json.js',`export function GET(){return new Response(${JSON.stringify(JSON.stringify(answer))},{headers:{'content-type':'application/json'}});}`);
fs.writeFileSync(path.join(root,'tools/english-final/.fixture-files.json'),JSON.stringify(made));

// Capability-gate proof uses a synthetic prompt, not an actual true-exam prompt.
const gateTask={task:'writing',id:'audit-synthetic-writing-gated',sourceKind:'synthetic',kind:'small',title:'Synthetic gated entry',targetWords:100,sourceHash:'synthetic-gated',learnerTask:{directions:'Invite a friend to a synthetic workshop.'}};
write('writing/audit-synthetic-writing-gated.astro',pageBody(`${bridge}\nimport WritingWorkspace from '../../components/WritingWorkspace.astro';\nimport WritingProtectedExamGate from '../../components/WritingProtectedExamGate.astro';`,'<WritingProtectedExamGate task={item}><WritingWorkspace task={item}/></WritingProtectedExamGate>',gateTask));
fs.writeFileSync(path.join(root,'tools/english-final/.fixture-files.json'),JSON.stringify(made));

console.log('Prepared',made.length,'temporary synthetic routes. No true-exam material.');
