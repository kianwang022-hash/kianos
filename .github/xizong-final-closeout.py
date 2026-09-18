from pathlib import Path
import json
root=Path('.')
p=root/'static-web/src/components/XizongRecallEvidenceBridge.astro';s=p.read_text()
s=s.replace("    const saveEvidence = (value) => { try { localStorage.setItem(evidenceKey, JSON.stringify(value)); } catch {} };", """    const pauseForEvidence = () => {
      root.dataset.xizongStateBlocked = 'true'; root.inert = true;
      if (!document.querySelector('[data-xizong-evidence-save-error]')) {
        const notice = document.createElement('p'); notice.dataset.xizongEvidenceSaveError = '';
        notice.setAttribute('role', 'alert');
        notice.textContent = '本次 Recall 未能保存，未推进学习状态；之前记录仍保留。请先备份或释放本机空间，再重新打开。';
        root.before(notice);
      }
    };
    const saveEvidence = (value) => {
      try { localStorage.setItem(evidenceKey, JSON.stringify(value)); return true; }
      catch { pauseForEvidence(); return false; }
    };""")
s=s.replace("if (!kpSet.has(kpId) || !rating) return;", "if (!kpSet.has(kpId) || !rating) return false;").replace('      saveEvidence(ext);','      return saveEvidence(ext);').replace('    saveEvidence(existing);','    if (!saveEvidence(existing)) return;')
s=s.replace('// BlockV6 owns rating/state. This bridge only appends the observation so repeated\n    // Recall attempts are preserved without keeping the retired After Learn UI mounted.', '// Persist the observation during capture, before BlockV6 can advance. A failed\n    // write leaves both the previous evidence and learner position intact.')
s=s.replace("      if (!kpId || !['unknown', 'fuzzy', 'known', 'mastered'].includes(rating) || currentStudy?.learned?.[kpId] !== true || card?.querySelector('[data-kp-answer]')?.hidden !== false) return;\n      appendRecall(kpId, rating, 'USER_RECALL_ATTEMPT');\n    });", """      if (root.inert || root.dataset.xizongStateBlocked === 'true' || currentStudy?.stage !== 'kp_recall' || card?.hidden || card?.dataset.ratingCommitted === 'true') return;
      if (!kpId || !['unknown', 'fuzzy', 'known', 'mastered'].includes(rating) || currentStudy?.learned?.[kpId] !== true || card?.querySelector('[data-kp-answer]')?.hidden !== false) return;
      if (!appendRecall(kpId, rating, 'USER_RECALL_ATTEMPT')) {
        event.preventDefault(); event.stopImmediatePropagation();
      }
    }, true);""")
p.write_text(s)
p=root/'static-web/src/components/XizongStudyEnhancer.astro';s=p.read_text()
s=s.replace('      const study = readStudy();\n      const ext = readJson(extensionKey, {})', '      const study = readStudy();\n      const currentPersonal = readJson(personalKey, {}) || {};\n      const memory = normalizeXizongMemoryState(readJson(XIZONG_MEMORY_STORAGE_KEY, null));\n      const ext = readJson(extensionKey, {})',1)
s=s.replace("        prompt: kp.prompt || '',\n        learned:","        prompt: kp.prompt || '',\n        prompt_override: String(memory.promptOverrides?.[kp.kpId] || ''),\n        marks: Array.isArray(currentPersonal?.kp?.[kp.kpId]?.marks) ? currentPersonal.kp[kp.kpId].marks : [],\n        learned:",1)
s=s.replace("note: String(personal?.kp?.[kp.kpId]?.comment || '')", "note: String(currentPersonal?.kp?.[kp.kpId]?.comment || '')",1)
s=s.replace('\n      const memory = normalizeXizongMemoryState(readJson(XIZONG_MEMORY_STORAGE_KEY, null));\n      const blockCardIds', '\n      const blockCardIds',1)
s=s.replace('            mode: packetMeta.sourceContactMode', '            confirmed_segments: Array.isArray(study.sourceContactEvidence) ? study.sourceContactEvidence : [],\n            mode: packetMeta.sourceContactMode',1)
s=s.replace("    packetButton?.addEventListener('click', async () => {", """    // One subject-owned packet builder serves both copy and the visible download control.
    root.addEventListener('kianos:xizong-request-study-packet', (event) => {
      if (root.inert || root.dataset.xizongStateBlocked === 'true') return;
      if (typeof event.detail?.accept === 'function') event.detail.accept(buildStudyPacket());
    });

    packetButton?.addEventListener('click', async () => {""",1)
p.write_text(s)
p=root/'static-web/src/components/XizongKpLearnInteraction.astro';s=p.read_text();start=s.index('        const study = readStudy();',s.index('      const downloadPacket'));end=s.index('        const blob = new Blob',start)
s=s[:start]+"""        let packet = null;
        root.dispatchEvent(new CustomEvent('kianos:xizong-request-study-packet', {
          detail: { accept: (value) => { packet = value; } }
        }));
        if (!packet) {
          window.alert('完整学习包暂未就绪，未导出不完整数据。请重新打开当前学习页。');
          return;
        }
"""+s[end:];p.write_text(s)
p=root/'static-web/src/components/XizongPracticeWorkbench.astro';s=p.read_text();assert 'practice/data/${year}.json`' in s;s=s.replace('practice/data/${year}.json`','practice/data/${year}.json/`');p.write_text(s)
p=Path('static-web/scripts/test-xizong-final-independent.mjs');s=p.read_text()
fixture='''---
import Base from '../layouts/Base.astro';
import XizongBlockV6 from '../components/XizongBlockV6.astro';
import XizongLearnerObjectBridge from '../components/XizongLearnerObjectBridge.astro';
import XizongKpLearnInteraction from '../components/XizongKpLearnInteraction.astro';
import XizongBlockWorkspaceShell from '../components/XizongBlockWorkspaceShell.astro';
import XizongRuntimeStageGuard from '../components/XizongRuntimeStageGuard.astro';
import XizongRecallEvidenceBridge from '../components/XizongRecallEvidenceBridge.astro';
import {loadXizongSemanticBlock} from '../lib/xizongSemanticAdapter.mjs';
import {buildXizongLearnerObject} from '../lib/xizongLearnerObject.mjs';
import '../styles/xizong-block-workspace.css';
const mode='__MODE__';
const semantic=loadXizongSemanticBlock(mode==='C'?'hematology-immunity-infection':'digestive-metabolic-endocrine-tumor',mode==='C'?'hematology-h01':'D1').block;
const groupFor=(i)=>semantic.logicGroups.find(g=>g.kpOrdinals.includes(i));
const kps=Array.from({length:semantic.kpCount},(_,i)=>({kpId:`audit-${mode}-kp${i+1}`,displayId:`KP${i+1}`,title:`合成测试对象 ${i+1}`,groupId:groupFor(i+1).groupId,prompt:'合成提示',detailMarkdown:'合成 Core，只供测试。',detailHtml:'<p>合成 Core，只供测试。</p>',sourceLocator:'SYNTHETIC_SOURCE_LOCATOR'}));
const groups=semantic.logicGroups.map(g=>({...g,start:Math.min(...g.kpOrdinals),end:Math.max(...g.kpOrdinals),kpIds:g.kpOrdinals.map(i=>kps[i-1].kpId)}));
const block={objectId:`xizong:audit-${mode}`,blockId:`audit-${mode}`,systemId:'circulation',systemTitle:'合成验收',systemCanonicalId:'A1',label:'合成',title:'非学习内容',centerQuestion:'合成测试',sourceHash:'synthetic',sourcePath:'synthetic',kpCount:kps.length,kpRecords:kps,logicGroups:groups,sourceContact:semantic.sourceContact,
 ttsx:{checkpoints:mode==='B'?[{checkpointId:'synthetic-bound-1',logicGroupId:groups[0].groupId,sourceSegmentId:`source:${groups[0].groupId}`,label:'合成已审核边界',questionRows:[{questionId:'synthetic-lecture-1',title:'仅验证边界，不是真实题目',sourcePageLabel:'SYNTHETIC'}]}]:[]}};
const learnerObject=buildXizongLearnerObject({block});
---
<Base title="隔离合成测试" active="xizong" showLead={false}>
<XizongBlockV6 block={block}/><XizongLearnerObjectBridge learnerObject={learnerObject}/><XizongKpLearnInteraction/><XizongBlockWorkspaceShell/>
<XizongRuntimeStageGuard system={{blocks:[]}} block={block}/><XizongRecallEvidenceBridge block={block}/>
</Base>
'''
fixture_decl="\nconst fixturePaths=['B','C'].map(mode=>{const f=path.resolve(`src/pages/audit-source-${mode.toLowerCase()}.astro`);if(fs.existsSync(f))throw Error('Fixture collision');fs.writeFileSync(f,"+json.dumps(fixture,ensure_ascii=False)+".replace('__MODE__',mode));return f;});\n"
s=s.replace("const {chromium}=await import('playwright');",fixture_decl+"const {chromium}=await import('playwright');")
s=s.replace('}finally{await browser?.close();server.kill();','}finally{await browser?.close();server.kill();for(const f of fixturePaths)fs.rmSync(f,{force:true});')
unit=r'''
await test('Current mirror sync updates assets but preserves separately stored private checkpoint',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'xizong-sync-audit-'));const seed=path.join(dir,'seed'),remote=path.join(dir,'remote.git'),mirror=path.join(dir,'mirror'),privateDir=path.join(dir,'private');
 const git=(cwd,...args)=>execFileSync('git',args,{cwd,encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
 try{fs.mkdirSync(seed);git(seed,'init','-b','main');git(seed,'config','user.name','Synthetic Audit');git(seed,'config','user.email','synthetic@example.invalid');fs.mkdirSync(path.join(seed,'static-web/scripts'),{recursive:true});fs.copyFileSync('scripts/kianos-current-sync.mjs',path.join(seed,'static-web/scripts/kianos-current-sync.mjs'));fs.writeFileSync(path.join(seed,'asset.txt'),'old');git(seed,'add','.');git(seed,'commit','-m','synthetic baseline');git(dir,'clone','--bare',seed,remote);git(dir,'clone',remote,mirror);fs.writeFileSync(path.join(mirror,'.git/kianos-current-mirror'),'synthetic dedicated mirror');
 const packet=buildPrivateLearnerCheckpoint({studyDay:'2026-09-19',subjects:{xizong:{synthetic:true,sentinel:'preserved'}}});diskWrite(packet,privateDir);const before=fs.readFileSync(path.join(privateDir,'latest.json'),'utf8');fs.writeFileSync(path.join(seed,'asset.txt'),'new');git(seed,'add','.');git(seed,'commit','-m','synthetic content update');git(seed,'push',remote,'main');
 execFileSync(process.execPath,[path.join(mirror,'static-web/scripts/kianos-current-sync.mjs')],{env:{...process.env,KIANOS_SYNC_ONCE:'1',KIANOS_SKIP_ASTRO:'1',KIANOS_PRIVATE_DIR:privateDir},encoding:'utf8',timeout:15000});assert.equal(fs.readFileSync(path.join(mirror,'asset.txt'),'utf8'),'new');assert.equal(fs.readFileSync(path.join(privateDir,'latest.json'),'utf8'),before);return {sync:'real sync script, isolated git remote',automaticSubjectCapture:'not implied'};
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
'''
s=s.replace(fixture_decl,unit+fixture_decl)
browser=r'''
 await test('Shared consumer honors C block contact and B segment contact with bound TTSX',async()=>{const {c,page}=await context();try{
 await visit(page,'/audit-source-c/');await page.locator('[data-stage-next="logic_group"]').click();await page.locator('[data-source-contact-done]').click();
 const ck='kianos-xizong-astro-v2:xizong:audit-C';let st=await state(page,ck);assert.equal(Object.keys(st.learned).length,13);assert.equal(st.sourceContactEvidence.length,1);
 for(let i=0;i<2;i++){const old=await state(page,ck);await page.locator('[data-kp-recall-card]:not([hidden]) [data-kp-reveal]').click();await page.locator('[data-kp-recall-card]:not([hidden]) [data-rating="known"]').click();await page.waitForFunction(({k,x})=>JSON.parse(localStorage.getItem(k)).kpIndex!==x,{k:ck,x:old.kpIndex});}
 st=await state(page,ck);assert.equal(st.stage,'kp_recall');assert.equal(st.groupIndex,1);assert.equal(st.sourceContactEvidence.length,1);
 await visit(page,'/audit-source-b/');await page.locator('[data-stage-next="logic_group"]').click();assert.equal(await page.locator('[data-study-stage="ttsx_checkpoint"]').isVisible(),false);
 await page.locator('[data-group-lecture-done]').click();const bk='kianos-xizong-astro-v2:xizong:audit-B';st=await state(page,bk);assert.equal(st.stage,'ttsx_checkpoint');const count=loadXizongSemanticBlock('digestive-metabolic-endocrine-tumor','D1').block.logicGroups[0].kpCount;
 assert.equal(Object.keys(st.learned).length,count);assert.equal(st.sourceContactEvidence[0].kp_ids.length,count);await page.locator('[data-ttsx-done]').click();assert.equal((await state(page,bk)).stage,'kp_recall');assert.ok(Object.values((await state(page,bk)).ttsxEvidence).some(x=>x.completedAt));
 const attempts=await page.evaluate(()=>Object.keys(localStorage).filter(k=>k.includes('question-sweep')));assert.equal(attempts.length,0);return {C:'One cumulative contact, no LG bounce',B:'One exact segment; no question Attempt',synthetic:true,readinessNotPromoted:true};
 }finally{await c.close();}});
 await test('Recall write failure preserves previous evidence and refuses progression',async()=>{const {c,page}=await context();try{await beginRecall(page);const originalStudy=await state(page,studyKey),original=await state(page,evKey);await page.evaluate(k=>{const original=Storage.prototype.setItem;Storage.prototype.setItem=function(key,value){if(key===k)throw new DOMException('synthetic quota','QuotaExceededError');return original.call(this,key,value);};},evKey);await page.keyboard.press('Space');await page.keyboard.press('2');await page.waitForTimeout(200);assert.deepEqual((await state(page,studyKey)).ratings,originalStudy.ratings);assert.deepEqual((await state(page,evKey)).evidenceHistory,original.evidenceHistory);assert.equal(await page.locator('[data-xizong-v6-block]').evaluate(n=>n.inert),true);}finally{await c.close();}});
 await test('Visible packet download uses full owned v3 history and exact resume',async()=>{const {c,page}=await context();try{await visit(page,'/xizong/circulation/b01/');await page.locator('[data-stage-next="logic_group"]').click();const kpId='circulation-b01-kp01';await page.evaluate(({evKey,kpId})=>{const ext=JSON.parse(localStorage.getItem(evKey)||'{}');ext.evidenceHistory=[{type:'KP_RECALL',kp_id:kpId,rating:'fuzzy',at:'2026-09-19T01:00:00Z',evidence_origin:'SYNTHETIC_AUDIT'}];localStorage.setItem(evKey,JSON.stringify(ext));localStorage.setItem('kianos-xizong-personal-v1:xizong:circulation-b01',JSON.stringify({kp:{[kpId]:{comment:'synthetic note',marks:[{kind:'weak',surface:'PROMPT',text:'synthetic marked fragment'}]}}}));},{evKey,kpId});const downloaded=page.waitForEvent('download');await page.locator('.xzKpPacketButton').click();const d=await downloaded;const packet=JSON.parse(fs.readFileSync(await d.path(),'utf8'));assert.equal(packet.schema,'kianos.xizong.study_packet.v3');assert.equal(packet.learning_state.current_stage,'source_contact');assert.equal(packet.learning_state.resume.kp_id,kpId);assert.equal(packet.block_evidence_history[0].evidence_origin,'SYNTHETIC_AUDIT');assert.equal(packet.kp_evidence.find(k=>k.kp_id===kpId).note,'synthetic note');assert.equal(packet.kp_evidence.find(k=>k.kp_id===kpId).marks.length,1);return {transport:'visible button -> single subject packet builder',typedReturn:'separate blocker'};}finally{await c.close();}});
 await test('Year bank endpoint used by Chat and retained Practice is live',async()=>{const {c,page}=await context();try{for(const year of [2005,2007,2016,2017,2026]){const response=await page.request.get(`${base}/xizong/practice/data/${year}.json/`);assert.equal(response.status(),200);const data=await response.json();assert.equal(data.question_count,loadXizongWholePaper(year).questions.length);}}finally{await c.close();}});
 await test('No missing image is silently presented as usable canonical Core support',async()=>{const {c,page}=await context();try{await beginRecall(page);await page.keyboard.press('Space');const images=await page.locator('[data-kp-recall-card]:not([hidden]) [data-kp-answer] img').evaluateAll(nodes=>nodes.map(n=>({src:n.getAttribute('src'),alt:n.alt,loaded:n.complete&&n.naturalWidth>0})));fs.writeFileSync(path.join(out,'core-image-observation.json'),JSON.stringify(images,null,2));assert.ok(images.every(n=>n.loaded),JSON.stringify(images.filter(n=>!n.loaded)));return images;}finally{await c.close();}});
'''
anchor=" await test('Current Mac-wide heterogeneous visible geometry and environment evidence'"
assert anchor in s;s=s.replace(anchor,browser+anchor)
p.write_text(s)
print('Final bounded repairs and new adversarial probes applied; known shared blockers remain failures.')
