import {inspectEnglishAttempt, saveEnglishAttempt, taskMetadata} from './englishLearnerEvidence.mjs';

export function initClozeRuntime(root,{prepareAnswers=null}={}){
  if(!(root instanceof HTMLElement))return null;
  if(root.dataset.clozeRuntimeInitialized==='true')return null;
  root.dataset.clozeRuntimeInitialized='true';
  const baseStorageKey=root.getAttribute('data-objective-storage-key')||'';
  const examSessionId=new URLSearchParams(location.search).get('exam_session')||'';
  const objectId=root.getAttribute('data-objective-object')||'';
  const storageKey=examSessionId
    ? `kianos-english-exam-task-v1:${examSessionId}:cloze:${objectId}`
    : baseStorageKey;
  const rows=[...root.querySelectorAll('[data-objective-question]')];
  const jumps=[...root.querySelectorAll('[data-cloze-jump]')];
  const uncertainButton=root.querySelector('[data-cloze-uncertain]');
  const submit=root.querySelector('[data-objective-submit]');
  let active=0;

  const normalizeAnswer=value=>Array.isArray(value)
    ? value.map(String)
    : value===null||value===undefined||value===''?[]:[String(value)];
  const idOf=row=>row.getAttribute('data-objective-question')||'';
  const now=()=>new Date().toISOString();
  const blankState=()=>({
    schema:'kianos.english.cloze_attempt.v1',objectId:root.getAttribute('data-objective-object')||'',
    startedAt:now(),submittedAt:null,submitted:false,answers:{},uncertain:[],trajectory:{},results:{}
  });
  const metadata=taskMetadata(root,'cloze',objectId);
  const inspected=inspectEnglishAttempt(localStorage,storageKey,metadata,{sessionId:examSessionId,root});
  const read=()=>{
    try{return inspected?.objectId===root.getAttribute('data-objective-object')?{...blankState(),...inspected}:blankState();}
    catch{return blankState();}
  };
  let state=read();
  const save=()=>saveEnglishAttempt(localStorage,storageKey,state,metadata,{sessionId:examSessionId,root});
  save();

  const formalOf=row=>{
    try{return normalizeAnswer(JSON.parse(row.getAttribute('data-answer')||'""'));}
    catch{return [];}
  };
  const render=()=>{
    rows.forEach((row,index)=>{
      row.hidden=false;row.classList.toggle('is-current',index===active);
      const id=idOf(row);
      row.querySelectorAll('[data-cloze-option]').forEach(button=>{
        const value=button.getAttribute('data-value')||'';
        button.classList.toggle('selected',state.answers?.[id]===value);
        button.toggleAttribute('disabled',Boolean(state.submitted));
        button.classList.remove('result-correct','result-wrong');
        if(state.submitted){
          const formal=formalOf(row);
          button.classList.toggle('result-correct',formal.includes(value));
          button.classList.toggle('result-wrong',state.answers?.[id]===value&&!formal.includes(value));
        }
      });
      const formalLine=row.querySelector('[data-objective-formal]');
      if(formalLine instanceof HTMLElement){
        formalLine.hidden=!state.submitted;
        const strong=formalLine.querySelector('strong');if(strong)strong.textContent=formalOf(row).join(', ')||'—';
      }
    });
    jumps.forEach((jump,index)=>{
      const id=idOf(rows[index]);
      jump.classList.toggle('active',index===active);
      jump.classList.toggle('answered',Boolean(state.answers?.[id]));
      jump.classList.toggle('uncertain',(state.uncertain||[]).includes(id));
      jump.classList.toggle('wrong',state.submitted&&['wrong','unanswered'].includes(state.results?.[id]));
    });
    const id=idOf(rows[active]);
    if(uncertainButton instanceof HTMLButtonElement){
      uncertainButton.classList.toggle('active',(state.uncertain||[]).includes(id));
      uncertainButton.disabled=Boolean(state.submitted);
    }
    const label=root.querySelector('[data-cloze-active-label]');if(label)label.textContent=`Blank ${active+1}`;
    const progress=root.querySelector('[data-cloze-progress]');if(progress)progress.textContent=`${active+1} / ${rows.length}`;
    const count=Object.values(state.answers||{}).filter(Boolean).length;
    const countNode=root.querySelector('[data-cloze-answer-count]');if(countNode)countNode.textContent=`${count} / ${rows.length} answered`;
    root.querySelector('[data-cloze-prev]')?.toggleAttribute('disabled',active<=0);
    root.querySelector('[data-cloze-next]')?.toggleAttribute('disabled',active>=rows.length-1);
    if(submit instanceof HTMLButtonElement)submit.hidden=Boolean(state.submitted);
    const result=root.querySelector('[data-objective-result-summary]');
    if(result instanceof HTMLElement){
      result.hidden=!state.submitted;
      if(state.submitted){
        const score=Object.values(state.results||{}).filter(value=>value==='correct').length;
        const scoreNode=result.querySelector('[data-objective-score]');const note=result.querySelector('[data-objective-result-note]');
        if(scoreNode)scoreNode.textContent=`${score} / ${rows.length}`;
        if(note)note.textContent=score===rows.length&&!(state.uncertain||[]).length
          ? 'Clean pass · 不强制复盘。'
          : '整篇进入 review；先看共同根因，再决定局部 repair。';
      }
    }
  };

  rows.forEach((row,index)=>{
    const focusRow=()=>{if(active!==index){active=index;render();}};
    row.addEventListener('pointerdown',focusRow);row.addEventListener('focusin',focusRow);
    row.querySelectorAll('[data-cloze-option]').forEach(button=>button.addEventListener('click',()=>{
      if(state.submitted)return;active=rows.indexOf(row);const id=idOf(row);const answer=button.getAttribute('data-value')||'';
      state.answers[id]=answer;state.trajectory[id]||=[];
      const last=state.trajectory[id][state.trajectory[id].length-1]?.answer;
      if(last!==answer)state.trajectory[id].push({answer,at:now()});save();render();
    }));
  });
  uncertainButton?.addEventListener('click',()=>{
    if(state.submitted)return;const id=idOf(rows[active]);const uncertain=new Set(state.uncertain||[]);
    uncertain.has(id)?uncertain.delete(id):uncertain.add(id);state.uncertain=[...uncertain];save();render();
  });
  root.querySelector('[data-cloze-prev]')?.addEventListener('click',()=>{active=Math.max(0,active-1);render();rows[active]?.scrollIntoView({block:'nearest'});});
  root.querySelector('[data-cloze-next]')?.addEventListener('click',()=>{active=Math.min(rows.length-1,active+1);render();rows[active]?.scrollIntoView({block:'nearest'});});
  jumps.forEach((jump,index)=>jump.addEventListener('click',()=>{active=index;render();rows[active]?.scrollIntoView({block:'nearest'});}));

  submit?.addEventListener('click',async()=>{
    if(state.submitted)return;
    if(root.getAttribute('data-objective-answers-ready')!=='true'&&typeof prepareAnswers==='function'){
      if(submit instanceof HTMLButtonElement)submit.disabled=true;
      let ready=false;
      try{ready=await prepareAnswers({root,rows,objectId});}finally{if(submit instanceof HTMLButtonElement)submit.disabled=false;}
      if(!ready)return;
    }
    if(root.getAttribute('data-objective-answers-ready')!=='true')return;
    const results={};
    rows.forEach(row=>{
      const id=idOf(row),selected=String(state.answers?.[id]||''),formal=formalOf(row);
      results[id]=!selected?'unanswered':formal.includes(selected)?'correct':'wrong';
    });
    state.results=results;state.submitted=true;state.submittedAt=now();save();render();
    root.dispatchEvent(new CustomEvent('kianos:objective-submitted',{bubbles:true}));
  });

  render();
  if(state.submitted)root.dispatchEvent(new CustomEvent('kianos:objective-submitted',{bubbles:true}));
  return {render,getState:()=>state};
}
