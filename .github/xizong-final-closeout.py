from pathlib import Path
p=Path('static-web/src/components/XizongPracticeWorkbench.astro');s=p.read_text()
s=s.replace('          <button type="button" data-start-next-round>按计划开始下一批</button>', '          {scopeKind === \'SYSTEM\' && <a data-post-system-recall hidden>题后系统重建 →</a>}\n          <button type="button" data-start-next-round>按计划开始下一批</button>')
s=s.replace("      const phase = sweepState.round?.studyPhase || 'FIRST_PASS';\n      if (nextPhaseSelect)", """      const postRecall = root.querySelector('[data-post-system-recall]');
      if (postRecall instanceof HTMLAnchorElement) {
        const roundId = String(sweepState.round?.id || '');
        postRecall.hidden = data.scopeKind !== 'SYSTEM' || !activeQuestions.length || !roundId;
        postRecall.href = `${data.base}xizong/${initialSystemId}/recall/?after_round=${encodeURIComponent(roundId)}`;
      }
      const phase = sweepState.round?.studyPhase || 'FIRST_PASS';
      if (nextPhaseSelect)""")
p.write_text(s)
p=Path('static-web/src/components/XizongSystemExitRuntime.astro');s=p.read_text()
s=s.replace("    let recallState = readJson(recallKey, { completedAt: null });", """    let recallState = readJson(recallKey, { completedAt: null });
    const requestedRound = new URLSearchParams(location.search).get('after_round') || '';
    const sweepState = readJson(`kianos:xizong:system-question-sweep:${systemId}:v1`, {});
    const afterRoundId = requestedRound && requestedRound === sweepState?.round?.id ? requestedRound : '';
    root.dataset.systemRecallCommitted = 'false';
    root.dataset.systemRecallEventId = globalThis.crypto?.randomUUID?.() || `system-recall-${Date.now()}`;""")
s=s.replace("    const openRecall = () => {", """    const openRecall = () => {
      root.dataset.systemRecallCommitted = 'false';
      root.dataset.systemRecallEventId = globalThis.crypto?.randomUUID?.() || `system-recall-${Date.now()}`;""")
s=s.replace("    complete?.addEventListener('click', () => {\n      recallState = { completedAt:new Date().toISOString() };\n      if (!writeJson(recallKey, recallState)) {", """    complete?.addEventListener('click', () => {
      if (root.inert || root.hidden || workspace?.hidden || reveal?.hidden !== false || root.dataset.systemRecallCommitted === 'true') return;
      const nextState = { ...recallState, completedAt:new Date().toISOString(), afterRoundId: afterRoundId || null };
      if (!writeJson(recallKey, nextState)) {""")
s=s.replace("      render();\n      handoff?.scrollIntoView", "      recallState = nextState;\n      root.dataset.systemRecallCommitted = 'true';\n      render();\n      handoff?.scrollIntoView",1)
s=s.replace("    render();\n  });", "    render();\n    if (afterRoundId && recallState.afterRoundId !== afterRoundId) openRecall();\n  });")
p.write_text(s)
p=Path('static-web/src/components/XizongSystemEvidenceGuard.astro');s=p.read_text()
s=s.replace("        ledger.events = [...(Array.isArray(ledger.events) ? ledger.events : []), { at: new Date().toISOString(), ...event }];\n        writeJson(ledgerKey, ledger);", """        const prior = Array.isArray(ledger.events) ? ledger.events : [];
        if (event.event_id && prior.some((row) => row.event_id === event.event_id)) return true;
        ledger.events = [...prior, { at: new Date().toISOString(), ...event }];
        return writeJson(ledgerKey, ledger);""")
old="""        window.setTimeout(() => {
          const { answered, total } = activeQuestionCounts();
          const phase = answered === 0 ? 'PRE_QUESTION'
            : total > 0 && answered >= total ? 'POST_QUESTION'
            : 'MID_SWEEP';
          append({ type: 'SYSTEM_RECALL', phase, answered_questions: answered, active_questions: total });
        }, 0);
      });"""
new="""        if (root.inert || root.hidden || root.querySelector('[data-recall-workspace]')?.hidden || root.querySelector('[data-recall-reveal]')?.hidden !== false || root.dataset.systemRecallCommitted === 'true') {
          event.preventDefault(); event.stopImmediatePropagation(); return;
        }
        const { answered, total } = activeQuestionCounts();
        const phase = answered === 0 ? 'PRE_QUESTION'
          : total > 0 && answered >= total ? 'POST_QUESTION' : 'MID_SWEEP';
        if (!append({ event_id: root.dataset.systemRecallEventId || '', type: 'SYSTEM_RECALL', phase, answered_questions: answered, active_questions: total })) {
          event.preventDefault(); event.stopImmediatePropagation(); root.inert = true;
          const notice = document.createElement('p'); notice.setAttribute('role','alert');
          notice.textContent = '本次 System Recall 证据未能保存，未记录完成；请先备份或释放空间再恢复。'; root.before(notice);
        }
      }, true);"""
assert old in s;s=s.replace(old,new);p.write_text(s)
p=Path('static-web/scripts/test-xizong-final-independent.mjs');s=p.read_text()
a="await test('No missing image is silently presented as usable canonical Core support'"
b="await test('A1 B1 KP03 original referenced image assets are available'"
s=s.replace(a,b)
start=s.index(b);end=s.index(" await test('Current Mac",start);v=s[start:end]
v=v.replace("await beginRecall(page);await page.keyboard.press('Space');", "await beginRecall(page);await page.keyboard.press('ArrowRight');await page.keyboard.press('ArrowRight');await page.keyboard.press('Space');")
v=v.replace("assert.ok(images.every(n=>n.loaded)","await page.screenshot({path:path.join(out,'a1-b1-kp03-image-gap.png')});assert.ok(images.length>0,'Image probe must not be vacuous');assert.ok(images.every(n=>n.loaded)")
s=s[:start]+v+s[end:]
extra=r'''
 await test('Valid legacy repair reaches Memory without mastery or source evidence rewrite',async()=>{const {c,page}=await context();try{await visit(page,'/xizong/');await page.evaluate(()=>{localStorage.setItem('kianos:xizong:system-recall:circulation:v1',JSON.stringify({completedAt:new Date().toISOString()}));localStorage.setItem('kianos:xizong:full-paper-holdout-years:v1','[]');});await visit(page,'/xizong/practice/circulation/');const q=loadXizongSystemQuestionSweep(loadXizongSystem('circulation')).questions.find(q=>q.relation?.primaryKpId);assert.ok(q);const k='kianos:xizong:system-question-sweep:circulation:v1';await page.evaluate(({q,k})=>localStorage.setItem(k,JSON.stringify({results:{[q.questionId]:{status:'wrong',selected:['A'],attemptId:'synthetic-wrong'}}})),{q,k});const before=await state(page,k);await page.locator('[data-xizong-repair-return] summary').click();await page.locator('[data-plan-text]').fill(JSON.stringify({plan:[{question_id:q.questionId,action:'synthetic minimal repair',reason:'synthetic boundary',priority:'high'}]}));await page.locator('[data-apply-plan]').click();let memory=await state(page,XIZONG_MEMORY_STORAGE_KEY);assert.equal(memory.repairTasks.filter(x=>x.status!=='DONE').length,1);await page.locator('[data-apply-plan]').click();assert.equal((await state(page,XIZONG_MEMORY_STORAGE_KEY)).repairTasks.filter(x=>x.status!=='DONE').length,1);await visit(page,'/xizong/memory/');await page.locator('[data-memory-view="REPAIR"]').click();assert.equal(await page.locator('[data-memory-repair-card]').isVisible(),true);await page.screenshot({path:path.join(out,'memory-repair.png')});assert.ok((await page.locator('[data-repair-return-link]').getAttribute('href')).includes('/xizong/practice/circulation/'));await page.locator('[data-repair-complete]').click();assert.ok((await state(page,XIZONG_MEMORY_STORAGE_KEY)).repairTasks.every(x=>x.status==='DONE'));assert.deepEqual(await state(page,k),before);return {legacyRepair:'local preserved path',typedExactInterruptedReturn:'not claimed'};}finally{await c.close();}});
 await test('Completed System sweep releases short post-question Recall without automatic phase promotion',async()=>{const {c,page}=await context();try{const sys=loadXizongSystem('circulation');const qs=loadXizongSystemQuestionSweep(sys).questions;const seeds=Object.fromEntries(sys.blocks.map(b=>{const block=loadXizongBlock('circulation',b.slug);return [`kianos-xizong-astro-v2:xizong:${b.blockId}`,JSON.stringify({completed:true,blockRecallDone:true,learned:Object.fromEntries(block.kpRecords.map(k=>[k.kpId,true])),ratings:Object.fromEntries(block.kpRecords.map(k=>[k.kpId,'known']))})];}));seeds['kianos:xizong:system-recall:circulation:v1']=JSON.stringify({completedAt:'2026-09-19T01:00:00Z'});seeds['kianos:xizong:full-paper-holdout-years:v1']='[2026]';seeds['kianos:xizong:system-question-sweep:circulation:v1']=JSON.stringify({results:Object.fromEntries(qs.filter(q=>q.year!==2026).map(q=>[q.questionId,{status:'stable',selected:String(q.correctAnswer).match(/[A-E]/g)||[]}]))});await visit(page,'/xizong/');await page.evaluate(seed=>{for(const[k,v]of Object.entries(seed))localStorage.setItem(k,v);},seeds);await visit(page,'/xizong/practice/circulation/');const link=page.locator('[data-post-system-recall]');assert.equal(await link.isVisible(),true);const old=await state(page,'kianos:xizong:system-question-sweep:circulation:v1');await link.click();await page.waitForLoadState('networkidle');assert.equal(await page.locator('[data-recall-front]').isVisible(),true);await page.locator('[data-reveal-recall]').click();await page.locator('[data-complete-recall]').click();await page.waitForTimeout(100);const after=await state(page,'kianos:xizong:system-recall:circulation:v1');assert.equal(after.afterRoundId,old.round.id);const ledger=await state(page,'kianos:xizong:system-evidence:circulation:v1');assert.equal(ledger.events.at(-1).phase,'POST_QUESTION');await page.reload({waitUntil:'networkidle'});assert.equal(await page.locator('[data-practice-handoff]').isVisible(),true);assert.equal((await state(page,'kianos:xizong:system-evidence:circulation:v1')).events.length,ledger.events.length);assert.equal((await state(page,'kianos:xizong:system-question-sweep:circulation:v1')).round.studyPhase,old.round.studyPhase);}finally{await c.close();}});
'''
anchor=" await test('Current Mac-wide heterogeneous visible geometry and environment evidence'"
s=s.replace(anchor,extra+anchor)
p.write_text(s)
print('Post-question reconstruction restored; image and legacy Return probes strengthened.')
