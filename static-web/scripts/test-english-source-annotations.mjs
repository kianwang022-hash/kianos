import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import vm from 'node:vm';
import * as L from '../src/lib/englishLearnerEvidence.mjs';
import {buildEnglishEvidencePacket} from '../src/lib/englishSessionControl.mjs';
import {englishSourceModel,englishSourceSelection,englishSourceRanges,markEnglishSourceFallback,clearEnglishSourceMarks} from '../src/lib/englishSourceSelection.mjs';

// Synthetic text and memory storage only. No server, browser, private records or bank.
class Storage {
 constructor(){this.map=new Map();this.failKey=null;}
 get length(){return this.map.size;}key(i){return [...this.map.keys()][i]??null;}
 getItem(key){return this.map.get(key)??null;}
 setItem(key,value){if(this.failKey===key){this.failKey=null;throw new Error('synthetic quota');}this.map.set(key,String(value));}
 removeItem(key){this.map.delete(key);}
}
const prefixes={reading_a:'kianos-reading-attempt-v1:',cloze:'kianos-cloze-attempt-v1:',reading_b:'kianos-reading-b-attempt-v1:'};
const now=Date.parse('2026-10-25T10:00:00Z'),day='2026-10-25';
const initial={objectId:'fixture',startedAt:new Date(now).toISOString(),submitted:false,submittedAt:null,
 answers:{q1:'A'},uncertain:['q1'],trajectory:{q1:[{answer:'B',at:new Date(now).toISOString()},{answer:'A',at:new Date(now+1).toISOString()}]},results:{},futureField:{keep:true}};
function fixture(task){
 const text='  Repeat. Repeat. 🧭  ____1____\nExact spacing.  ';
 const snapshot={questions:[{id:'q1',ordinal:1,prompt:'Synthetic only',options:{A:'one',B:'two'}}]};
 if(task==='reading_a')snapshot.paragraphs=[{text},{text:'Second paragraph.'}];
 else snapshot.material=[{text},{text:'Second paragraph.'}];
 if(task==='reading_b'){snapshot.context={taskForm:'ordering'};snapshot.candidates=[{label:'A',text:'Candidate A. Repeat.'},{label:'B',text:'Candidate B. Repeat.'}];}
 const meta={task,object_id:'fixture',source_hash:'fixture-source-v1',snapshot};
 const storage=new Storage(),key=prefixes[task]+meta.object_id,state=structuredClone(initial);
 L.saveEnglishAttempt(storage,key,state,meta,{now});
 return {storage,key,state,meta,text,source:L.englishObjectiveSourceBlocks(snapshot,task).map(row=>row.text).join('\n\n')};
}
const frozen=state=>Object.fromEntries(['answers','uncertain','trajectory','results','submitted','submittedAt','firstEvidenceMeta','futureField','binding'].map(key=>[key,state[key]]));

for(const task of Object.keys(prefixes))test(`${task}: exact positions, replace/remove, stale form save, checkpoint and packets`,()=>{
 const {storage,key,state,meta,source}=fixture(task),catalog=[{task,object_id:meta.object_id,source_hash:meta.source_hash}];
 const first={start:2,end:9,text:'Repeat.',source_locator:task==='reading_a'?'block:1':'material:1'};
 const before=frozen(state),exposure=storage.getItem(L.ENGLISH_MATERIAL_EXPOSURE_KEY);
 const write=change=>L.updateEnglishObjectiveSourceSpan(storage,meta,{...change,now:now+1000});
 write({span:first,intent:'HIGHLIGHT'});write({span:first,intent:'HIGHLIGHT'});
 write({span:{...first,start:10,end:17},intent:'HIGHLIGHT'});
 write({span:first});
 let saved=JSON.parse(storage.getItem(key));
 assert.equal(saved.discussionSpans.length,3,'same text at separate positions and separate intents is distinct');
 assert.deepEqual(frozen(saved),before,'marking cannot change native work, first evidence or binding');
 assert.equal(storage.getItem(L.ENGLISH_MATERIAL_EXPOSURE_KEY),exposure,'marking is not assistance or exposure');
 L.saveEnglishAttempt(storage,key,state,meta,{now:now+2000});
 assert.equal(state.discussionSpans.length,3,'older form state cannot erase newly saved marks');
 const id=state.discussionSpans[0].span_id,created=state.discussionSpans[0].created_at;
 const start=source.indexOf('Second');
 write({replaceId:id,intent:'HIGHLIGHT',span:{start,end:start+6,text:'Second',source_locator:task==='reading_a'?'block:2':'material:2'}});
 saved=JSON.parse(storage.getItem(key));
 assert.equal(saved.discussionSpans[0].span_id,id);assert.equal(saved.discussionSpans[0].created_at,created);
 assert.equal(saved.discussionSpans[0].text,'Second');
 L.saveEnglishAttempt(storage,key,state,meta,{now:now+3000});
 assert.equal(state.discussionSpans[0].text,'Second','stale form cannot undo a replacement');
 write({removeId:id});L.saveEnglishAttempt(storage,key,state,meta,{now:now+4000});
 assert.equal(state.discussionSpans.length,2,'stale form cannot resurrect a removed mark');
 write({clearIntent:'HIGHLIGHT'});
 saved=JSON.parse(storage.getItem(key));assert.equal(saved.discussionSpans.length,1);assert.equal(saved.discussionSpans[0].intent,'DISCUSSION_CONTEXT');
 write({span:first,intent:'HIGHLIGHT'});
 const checkpoint=L.exportEnglishCheckpoint(storage),restored=new Storage();L.restoreEnglishCheckpoint(restored,checkpoint);
 assert.equal(restored.getItem(key),storage.getItem(key),'refresh/re-entry uses the exact persisted native record');
 const packet=buildEnglishEvidencePacket(restored,{day,catalog}),row=packet.inventory.find(row=>row.object_id==='fixture');
 assert.equal(row.highlight_spans[0].text,'Repeat.');assert.equal(row.highlight_spans[0].start,2);
 assert.equal(row.discussion_spans.length,1);assert.equal(row.submitted,false);
 assert.equal(row.highlight_spans[0].intent,'HIGHLIGHT');assert.equal(row.discussion_spans[0].intent,'DISCUSSION_CONTEXT');
 const raw=restored.getItem(key);
 for(const wrongCatalog of [[],[{...catalog[0],source_hash:'new-source'}]]){
  const stale=buildEnglishEvidencePacket(restored,{day,catalog:wrongCatalog}).inventory[0];
  assert.deepEqual(stale.highlight_spans,[]);assert.deepEqual(stale.discussion_spans,[]);
 }
 assert.throws(()=>L.updateEnglishObjectiveSourceSpan(restored,{...meta,source_hash:'changed'},{span:first}),/CURRENT_CHANGED/);
 assert.equal(restored.getItem(key),raw,'source mismatch never migrates or rewrites old evidence');
 const submitted=JSON.parse(raw);submitted.submitted=true;submitted.submittedAt=new Date(now+5000).toISOString();submitted.results={q1:'wrong'};
 L.saveEnglishAttempt(restored,key,submitted,meta,{now:now+5000});
 const frozenSubmitted=frozen(submitted);
 L.updateEnglishObjectiveSourceSpan(restored,meta,{removeId:submitted.discussionSpans[0].span_id});
 assert.deepEqual(frozen(JSON.parse(restored.getItem(key))),frozenSubmitted,'post-submit annotation cannot rewrite answers or grading');
 const safeBefore=restored.getItem(key);restored.failKey=key;
 assert.throws(()=>L.updateEnglishObjectiveSourceSpan(restored,meta,{clear:true}),/synthetic quota/);
 assert.equal(restored.getItem(key),safeBefore,'failed save leaves exact record intact');
 for(const span of [{...first,text:'wrong'}, {...first,start:10}, {...first,end:900}, {...first,start:-1}]){
  assert.throws(()=>L.updateEnglishObjectiveSourceSpan(restored,meta,{span}),/SPAN_INVALID/);assert.equal(restored.getItem(key),safeBefore);
 }
 assert.throws(()=>L.updateEnglishObjectiveSourceSpan(restored,meta,{replaceId:'removed',span:first}),/CHANGED_RESELECT/);
});

test('old Reading A discussion rows and old attempts retain compatibility; long source is not silently truncated',()=>{
 const {storage,key,meta}=fixture('reading_a');
 L.updateEnglishReadingDiscussion(storage,meta,{span:{start:2,end:9,text:'Repeat.'},now});
 assert.equal(L.englishReadingDiscussionSpans(JSON.parse(storage.getItem(key)),meta.source_hash)[0].intent,'DISCUSSION_CONTEXT');
 const legacy=new Storage();legacy.setItem(key,JSON.stringify(initial));const raw=legacy.getItem(key);
 assert.throws(()=>L.updateEnglishReadingDiscussion(legacy,meta,{clear:true}),/LEGACY_SOURCE_UNVERIFIED/);assert.equal(legacy.getItem(key),raw);
 const long=fixture('cloze');long.meta.snapshot.material=[{text:'Keep  exact spacing 🧭.\n'.repeat(80)}];
 const fresh=new Storage(),state=structuredClone(initial);L.saveEnglishAttempt(fresh,long.key,state,long.meta,{now});
 const text=long.meta.snapshot.material[0].text;
 L.updateEnglishObjectiveSourceSpan(fresh,long.meta,{intent:'HIGHLIGHT',span:{start:0,end:text.length,text}});
 assert.equal(L.englishObjectiveSourceSpans(JSON.parse(fresh.getItem(long.key)),long.meta.source_hash)[0].text,text);
});

test('Part B ordering-only candidate text has its own stable coordinates, independent of labels and counters',()=>{
 const snapshot={material:[],candidates:[{label:'A',text:'Same.'},{label:'B',text:'Same.'}]};
 const blocks=L.englishObjectiveSourceBlocks(snapshot,'reading_b');
 assert.deepEqual(blocks.map(row=>[row.locator,row.start,row.end]),[['candidate:A',0,5],['candidate:B',7,12]]);
 const storage=new Storage(),meta={task:'reading_b',object_id:'ordering',source_hash:'order-v1',snapshot};
 L.saveEnglishAttempt(storage,prefixes.reading_b+'ordering',structuredClone(initial),meta,{now});
 L.updateEnglishObjectiveSourceSpan(storage,meta,{intent:'HIGHLIGHT',span:{start:7,end:12,text:'Same.',source_locator:'candidate:B'}});
 assert.equal(L.englishObjectiveSourceSpans(JSON.parse(storage.getItem(prefixes.reading_b+'ordering')),'order-v1')[0].source_locator,'candidate:B');
});

for(const task of ['cloze','reading_b'])test(`${task}: fresh annotations on old submitted work survive the recent-eight Packet window`,()=>{
 const {storage,key,state,meta}=fixture(task),catalog=[{task,object_id:'fixture',source_hash:meta.source_hash}];
 state.submitted=true;state.submittedAt=new Date(now+1000).toISOString();state.results={q1:'wrong'};
 L.saveEnglishAttempt(storage,key,state,meta,{now:now+1000});
 for(let i=0;i<9;i++){
  const row=structuredClone(state),id='newer-'+i;row.binding.object_id=id;row.binding.attempt_id=id;
  row.submittedAt=new Date(now+2000+i*1000).toISOString();
  storage.setItem(prefixes[task]+id,JSON.stringify(row));catalog.push({...catalog[0],object_id:id});
 }
 assert.equal(buildEnglishEvidencePacket(storage,{day,catalog}).inventory.some(row=>row.object_id==='fixture'),false);
 L.updateEnglishObjectiveSourceSpan(storage,meta,{span:{start:2,end:9,text:'Repeat.'},intent:'HIGHLIGHT',now:now+60000});
 const row=buildEnglishEvidencePacket(storage,{day,catalog}).inventory.find(row=>row.object_id==='fixture');
 assert.equal(row.highlight_spans.length,1);assert.equal(row.problem_count,1);
});

// Small DOM adapter fixtures exercise the production coordinate/range/fallback code.
class Node {
 constructor(doc,text=null){this.ownerDocument=doc;this.value=text;this.childNodes=[];this.parent=null;this.attrs={};}
 get textContent(){return this.value??this.childNodes.map(node=>node.textContent).join('');}
 contains(node){return this===node||this.childNodes.some(child=>child.contains(node));}
 append(...nodes){for(const node of nodes){if(node.fragment){this.append(...node.childNodes);continue;}node.parent=this;this.childNodes.push(node);}}
 replaceWith(...nodes){const list=this.parent.childNodes,index=list.indexOf(this);list.splice(index,1,...nodes.flatMap(node=>node.fragment?node.childNodes:[node]));for(const node of list)node.parent=this.parent;}
 setAttribute(key,value){this.attrs[key]=value;}
 normalize(){}
 querySelectorAll(){return this.childNodes.flatMap(node=>[...(node.attrs['data-reading-discussion-mark']!==undefined?[node]:[]),...node.querySelectorAll()]);}
}
class Doc {
 createElement(){return new Node(this);}createTextNode(text){return new Node(this,text);}createDocumentFragment(){const n=new Node(this);n.fragment=true;return n;}
 createTreeWalker(root){const nodes=[];const walk=node=>{if(node.value!==null)nodes.push(node);else node.childNodes.forEach(walk);};walk(root);let i=0;return {nextNode:()=>nodes[i++]||null};}
 createRange(){return {selectNodeContents(node){this.root=node;},setStart(node,offset){this.startContainer=node;this.startOffset=offset;},setEnd(node,offset){this.endContainer=node;this.endOffset=offset;},toString(){
  if(this.root){const walker=this.root.ownerDocument.createTreeWalker(this.root);let text='',node;while((node=walker.nextNode())){if(node===this.endContainer)return text+node.textContent.slice(0,this.endOffset);text+=node.textContent;}return text;}
  assert.equal(this.startContainer,this.endContainer,'restored ranges must stay inside source blocks');return this.startContainer.textContent.slice(this.startOffset,this.endOffset);
 }};}
}
test('production DOM adapter reanchors repeated/cross-block text and fallback overlaps without changing source',()=>{
 const previous=globalThis.NodeFilter;globalThis.NodeFilter={SHOW_TEXT:4};
 try{
  const doc=new Doc(),p=doc.createElement(),a=doc.createElement(),b=doc.createElement(),root=doc.createElement();
  p.append(doc.createTextNode('Repeat. Repeat. 🧭'));a.append(doc.createTextNode('Candidate A.'));b.append(doc.createTextNode('Candidate B.'));
  root.append(p,a,b);root.querySelectorAll=selector=>selector==='[data-objective-material-block]'?[p]:selector==='[data-objective-candidate] > span'?[a,b]:Node.prototype.querySelectorAll.call(root,selector);
  const meta={task:'reading_b',snapshot:{material:[{text:p.textContent}],candidates:[{label:'A',text:a.textContent},{label:'B',text:b.textContent}]}};
  let model=englishSourceModel(root,meta);
  const range=doc.createRange();range.setStart(p.childNodes[0],8);range.setEnd(b.childNodes[0],9);
  const span={...englishSourceSelection(model,range),intent:'HIGHLIGHT'};
  assert.equal(span.start,8);assert.equal(span.text,model.text.slice(8,span.end));assert.equal(span.source_locator,'material:1');
  const ranges=englishSourceRanges(model,span);assert.equal(ranges.length,3);
  assert.deepEqual(ranges.map(range=>range.toString()),['Repeat. 🧭','Candidate A.','Candidate']);
  const original=root.textContent;
  markEnglishSourceFallback(model,[span,{start:0,end:12,text:model.text.slice(0,12),intent:'DISCUSSION_CONTEXT'}]);
  assert.equal(root.textContent,original,'fallback wrapping preserves source bytes');
  model=englishSourceModel(root,meta);assert.equal(englishSourceRanges(model,span).length,3,'wrapped source still resolves');
  clearEnglishSourceMarks(root);assert.equal(root.textContent,original);assert.equal(root.querySelectorAll('marks').length,0);
  meta.snapshot.candidates[0].text='changed source';model=englishSourceModel(root,meta);
  assert.deepEqual(englishSourceRanges(model,{...span,text:model.text.slice(span.start,span.end)}),[],'DOM/source mismatch fails closed');
 }finally{globalThis.NodeFilter=previous;}
});

for(const task of ['cloze','reading_b'])test(`${task}: actual whole-task packet carries exact marks separately from Uncertain and retains outcomes`,()=>{
 const {storage,key,state,meta,source}=fixture(task);
 const span={start:2,end:9,text:'Repeat.',source_locator:'material:1'};
 L.updateEnglishObjectiveSourceSpan(storage,meta,{span,intent:'HIGHLIGHT',now});L.updateEnglishObjectiveSourceSpan(storage,meta,{span,now});
 L.saveEnglishAttempt(storage,key,state,meta,{now});state.submitted=true;state.submittedAt=new Date(now+5000).toISOString();state.results={q1:'wrong'};L.saveEnglishAttempt(storage,key,state,meta,{now:now+5000});
 const component=fs.readFileSync(new URL('../src/components/ObjectiveHandoff.astro',import.meta.url),'utf8');
 assert.match(component,/import\s*\{englishObjectiveAnnotationSections\}/,'production import is required');
 const code=component.slice(component.indexOf('    const itemContext ='),component.indexOf('    const sync ='));
 const leaf=text=>({textContent:text}),question={getAttribute:key=>key==='data-objective-question'?'q1':'',querySelector:()=>leaf('Synthetic prompt'),querySelectorAll:()=>[leaf('A. one'),leaf('B. two')]};
 const root={getAttribute:key=>key==='data-english-source-hash'?meta.source_hash:'ordering',querySelector:()=>null,querySelectorAll:selector=>selector==='[data-objective-material-block]'?meta.snapshot.material.map(row=>leaf(row.text)):selector==='[data-objective-candidate]'?(meta.snapshot.candidates||[]).map(row=>({querySelector:selector=>leaf(selector==='b'?row.label:row.text)})):[]};
 const context={root,task,objectId:meta.object_id,questions:()=>[question],idOf:()=> 'q1',displayLabelOf:()=> 'Item 1',problemIds:()=>['q1'],activeClaimsFor:()=>[],recentClosedClaimsFor:()=>[],formalOf:()=>['B'],formatDuration:value=>String(value),englishObjectiveAnnotationSections:L.englishObjectiveAnnotationSections};
 const packetContext={...context,attempt:state};vm.runInNewContext(code+'\nglobalThis.packet=buildPacket(attempt);',packetContext);
 const packet=packetContext.packet.text;
 assert.match(packet,/SAVED HIGHLIGHTS/);assert.match(packet,/SAVED DISCUSSION CONTEXT/);
 assert.match(packet,/"intent": "HIGHLIGHT"/);assert.match(packet,/"intent": "DISCUSSION_CONTEXT"/);
 assert.match(packet,/"start": 2/);assert.match(packet,/not answer uncertainty/);
 assert.match(packet,/Uncertain: Item 1/);assert.match(packet,/my A · formal B · uncertain yes · path B → A/);
 assert.ok(packet.includes(meta.source_hash));assert.ok(packet.includes(state.binding.attempt_id));
 assert.ok(packet.includes(meta.snapshot.material.map(row=>row.text).join('\n\n')),'whole-task packet preserves exact material whitespace');
 assert.equal(source.slice(2,9),'Repeat.');
});

test('both Reading A highlight entry points use the shared durable owner',()=>{
 const bridge=fs.readFileSync(new URL('../src/components/EnglishLexicalLookupBridge.astro',import.meta.url),'utf8');
 const runtime=fs.readFileSync(new URL('../src/lib/readingRuntime.mjs',import.meta.url),'utf8');
 const handoff=fs.readFileSync(new URL('../src/components/ReadingPassageHandoff.astro',import.meta.url),'utf8');
 assert.match(bridge,/activeSelection\?\.taskId\)\{persistSelection\('HIGHLIGHT'\)/);
 assert.match(bridge,/add\?\.addEventListener\('click',[\s\S]*?persistSelection\('HIGHLIGHT'\)/);
 assert.doesNotMatch(runtime,/highlight\.add|kianos-reading-session-highlight/);
 assert.match(handoff,/lines\.push\(\.\.\.englishObjectiveAnnotationSections\(attempt,sourceHash\)\)/);
});
